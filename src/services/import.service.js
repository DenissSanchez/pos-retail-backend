const repository = require("../repositories/import.repository");
const prisma = require("../config/prisma");
const historyService = require("./importHistory.service");

const {
  generateSku,
  generateBarcode
} = require("../utils/code-generator");

const COMPANY_ID = "10bb76dc-ab50-4a5f-9a95-b11444ecca9e";

const normalize = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim().toUpperCase();
};

const parseSafeNumber = (value, fallback = 0, isInteger = false) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }
  const cleaned = String(value).replace(/[$,\s]/g, "");
  const parsed = isInteger ? parseInt(cleaned, 10) : parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

const buildVariantKey = (productId, colorId, sizeId) => {
  return `${productId}-${colorId || "NULL"}-${sizeId || "NULL"}`;
};

const getHighestBarcodeNumber = async () => {
  const lastVariant = await prisma.productVariant.findFirst({
    where: { barcode: { startsWith: "75000" } },
    orderBy: { barcode: "desc" },
    select: { barcode: true }
  });

  if (!lastVariant || !lastVariant.barcode) {
    return 0;
  }

  const numericPart = parseInt(lastVariant.barcode, 10);
  return isNaN(numericPart) ? 0 : numericPart;
};

const previewImport = async (rows, options = {}) => {
  const summary = {
    totalRows: rows.length,
    validRows: 0,
    errors: 0,
    newProducts: 0,
    newVariants: 0,
    updates: 0
  };

  const preview = [];

  const products = await repository.getAllProducts(COMPANY_ID);
  const colors = await repository.getAllColors();
  const sizes = await repository.getAllSizes();
  const variants = await repository.getAllVariants();

  const productMap = new Map();
  const colorMap = new Map();
  const sizeMap = new Map();
  const variantMap = new Map();

  products.forEach(product => {
    productMap.set(normalize(product.name), product);
  });

  colors.forEach(color => {
    colorMap.set(normalize(color.name), color);
  });

  sizes.forEach(size => {
    sizeMap.set(normalize(size.name), size);
  });

  variants.forEach(variant => {
    variantMap.set(
      buildVariantKey(variant.productId, variant.colorId, variant.sizeId),
      variant
    );
  });

  for (const row of rows) {
    if (!row.Producto || !row.Categoria || !row.Marca) {
      summary.errors++;
      preview.push({
        ...row,
        status: "ERROR",
        message: "Faltan columnas obligatorias (Producto, Categoría o Marca)."
      });
      continue;
    }

    const errors = [];
    const warnings = [];

    if (row.Precio !== undefined && row.Precio !== "" && isNaN(Number(row.Precio))) {
      errors.push("Precio inválido");
    }
    if (row.Costo !== undefined && row.Costo !== "" && isNaN(Number(row.Costo))) {
      errors.push("Costo inválido");
    }
    if (row.Existencia !== undefined && row.Existencia !== "" && isNaN(Number(row.Existencia))) {
      errors.push("Existencia inválida");
    }
    if (Number(row.Precio) < 0) errors.push("Precio negativo");
    if (Number(row.Costo) < 0) errors.push("Costo negativo");
    if (Number(row.Existencia) < 0) errors.push("Existencia negativa");

    if (Number(row.Precio) && Number(row.Costo) && Number(row.Precio) < Number(row.Costo)) {
      warnings.push("Precio menor al costo");
    }

    const normProductName = normalize(row.Producto);
    let product = productMap.get(normProductName);

    if (!product) {
      summary.validRows++;
      summary.newProducts++;

      const tempProduct = { id: `TEMP_${normProductName}`, name: row.Producto };
      productMap.set(normProductName, tempProduct);

      preview.push({
        ...row,
        status: "NEW_PRODUCT",
        errors,
        warnings
      });
      continue;
    }

    let colorId = null;
    const colorName = row.Color ? row.Color : "SIN COLOR";
    const color = colorMap.get(normalize(colorName));
    if (color) {
      colorId = color.id;
    } else {
      colorId = `TEMP_COLOR_${normalize(colorName)}`;
      colorMap.set(normalize(colorName), { id: colorId, name: colorName });
    }

    let sizeId = null;
    const sizeName = row.Talla !== undefined && row.Talla !== null && String(row.Talla).trim() !== ""
      ? String(row.Talla).trim()
      : "SIN TALLA";
    const size = sizeMap.get(normalize(sizeName));
    if (size) {
      sizeId = size.id;
    } else {
      sizeId = `TEMP_SIZE_${normalize(sizeName)}`;
      sizeMap.set(normalize(sizeName), { id: sizeId, name: sizeName });
    }

    const key = buildVariantKey(product.id, colorId, sizeId);

    if (variantMap.has(key)) {
      summary.updates++;
      preview.push({
        ...row,
        status: "UPDATE",
        errors,
        warnings
      });
    } else {
      summary.newVariants++;
      variantMap.set(key, { id: "TEMP_VARIANT" });
      preview.push({
        ...row,
        status: "NEW_VARIANT",
        errors,
        warnings
      });
    }

    summary.validRows++;
  }

  return {
    summary,
    rows: preview
  };
};

const importProducts = async (
  rows,
  options = {},
  fileData = null
) => {
  const startTime = Date.now();
  const detailRows = [];

  const summary = {
    totalRows: rows.length,
    newProducts: 0,
    newVariants: 0,
    updates: 0,
    errors: 0
  };

  const opts = {
    createCatalogs: true,
    updatePrices: true,
    updateCosts: true,
    updateSupplierSku: true,
    updateStock: true,
    ...options
  };

  console.log("📥 FILAS RECIBIDAS EN EL BACKEND:", rows.length);

  let imported = 0;

  // Obtenemos TODAS las sucursales para compartir el inventario entre ellas
  const stores = await prisma.store.findMany();

  if (!stores || stores.length === 0) {
    throw new Error("No se encontró ninguna sucursal configurada en la base de datos.");
  }

  // Obtenemos secuencia y el barcode máximo de la BD
  let sequence = await repository.getSequence();
  let highestBarcodeInDb = await getHighestBarcodeNumber();

  let currentSeq = sequence ? (sequence.nextBarcode || sequence.nextProductSku || 1) : 1;

  if (highestBarcodeInDb > 0) {
    const numericSuffix = highestBarcodeInDb % 10000;
    if (numericSuffix >= currentSeq) {
      currentSeq = numericSuffix;
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    console.log(`\n--- PROCESANDO FILA ${i + 1} de ${rows.length}: ${row.Producto} (${row.Color || "Sin Color"} / ${row.Talla || "Sin Talla"})`);

    if (!row.Producto || !row.Categoria || !row.Marca) {
      console.log(`⚠️ Fila ${i + 1} omitida por faltar campos obligatorios.`);
      summary.errors++;
      detailRows.push({
        ...row,
        status: "ERROR",
        message: "Faltan campos obligatorios"
      });
      continue;
    }

    try {
      // 1. CATEGORÍA
      const categoryName = String(row.Categoria).trim();
      let category = await repository.findCategory(categoryName);

      if (!category) {
        console.log(`➕ Creando categoría: ${categoryName}`);
        category = await repository.createCategory({
          name: categoryName,
          code: categoryName.substring(0, 5).toUpperCase()
        });
      }

      // 2. MARCA
      const brandName = String(row.Marca).trim();
      let brand = await repository.findBrand(brandName);

      if (!brand) {
        console.log(`➕ Creando marca: ${brandName}`);
        brand = await repository.createBrand({
          name: brandName,
          code: brandName.substring(0, 5).toUpperCase()
        });
      }

      // 3. PRODUCTO PADRE
      const productName = String(row.Producto).trim();
      let product = await repository.findProduct(COMPANY_ID, productName);

      if (!product) {
        console.log(`➕ Creando producto padre: ${productName}`);
        product = await repository.createProduct({
          companyId: COMPANY_ID,
          categoryId: category.id,
          brandId: brand.id,
          name: productName,
          description: "",
          image: null
        });
        summary.newProducts++;
      }

      // 4. COLOR
      const colorName = row.Color && String(row.Color).trim() !== ""
        ? String(row.Color).trim()
        : "SIN COLOR";
      let color = await repository.findColor(colorName);

      if (!color) {
        console.log(`➕ Creando color: ${colorName}`);
        color = await repository.createColor({
          name: colorName,
          code: colorName.substring(0, 10).toUpperCase()
        });
      }

      // 5. TALLA
      const sizeName = row.Talla !== undefined && row.Talla !== null && String(row.Talla).trim() !== ""
        ? String(row.Talla).trim()
        : "SIN TALLA";
      let size = await repository.findSize(sizeName);

      if (!size) {
        console.log(`➕ Creando talla: ${sizeName}`);
        size = await repository.createSize({
          name: sizeName,
          code: sizeName.substring(0, 10).toUpperCase(),
          order: 1
        });
      }

      const parsedPrice = parseSafeNumber(row.Precio, 0, false);
      const parsedCost = parseSafeNumber(row.Costo, 0, false);
      const cleanSupplierSku = row.SKUProveedor && String(row.SKUProveedor).trim() !== ""
        ? String(row.SKUProveedor).trim()
        : null;

      // 6. BUSCAR O CREAR VARIANTE
      let variant = await repository.findVariant(product.id, color.id, size.id);

      if (!variant) {
        currentSeq++;

        const formattedSeq = String(currentSeq).padStart(4, "0");
        const sku = `PRD-${brand.code}-${formattedSeq}`;
        const barcode = `75000000${formattedSeq}`;

        const variantDataToInsert = {
          productId: product.id,
          colorId: color.id,
          sizeId: size.id,
          sku,
          barcode,
          supplierSku: cleanSupplierSku,
          cost: parsedCost,
          price: parsedPrice,
          active: true
        };

        console.log("📦 OBJETO COMPLETO A CREAR EN PRISMA:", JSON.stringify(variantDataToInsert, null, 2));

        variant = await repository.createVariant(variantDataToInsert);

        imported++;
        summary.newVariants++;

        detailRows.push({
          ...row,
          sku: variant.sku,
          status: "NUEVO",
          message: "Variante creada"
        });

        console.log(`✅ Variante creada exitosamente: ${variant.sku}`);
      } else {
        console.log(`🔄 Variante ya existía (${variant.sku}), actualizando datos...`);
        variant = await repository.updateVariant(variant.id, {
          price: opts.updatePrices ? parsedPrice : variant.price,
          cost: opts.updateCosts ? parsedCost : variant.cost,
          supplierSku: opts.updateSupplierSku ? cleanSupplierSku : variant.supplierSku
        });
        imported++;
        summary.updates++;

        detailRows.push({
          ...row,
          sku: variant.sku,
          status: "ACTUALIZADO",
          message: "Variante actualizada"
        });
      }

      // 7. INVENTARIO COMPARTIDO EN TODAS LAS SUCURSALES
      if (opts.updateStock) {
        const stock = parseSafeNumber(row.Existencia, 0, true);

        for (const store of stores) {
          let inventory = await repository.findInventory(variant.id, store.id);

          if (!inventory) {
            await repository.createInventory({
              variant: { connect: { id: variant.id } },
              store: { connect: { id: store.id } },
              stock
            });
            console.log(`📦 Inventario creado para ${variant.sku} en ${store.name || store.id} con stock: ${stock}`);
          } else {
            await repository.updateInventory(inventory.id, stock);
            console.log(`📦 Stock actualizado para ${variant.sku} en ${store.name || store.id} a: ${stock}`);
          }
        }
      }

    } catch (rowError) {
      summary.errors++;
      detailRows.push({
        ...row,
        status: "ERROR",
        message: rowError.message
      });
      console.error(`❌ ERROR EN FILA ${i + 1} (${row.Producto}):`, rowError);
    }
  }

  const durationMs = Date.now() - startTime;

  // ACTUALIZAR SECUENCIA EN BD USANDO LOS CAMPOS CORRECTOS
  if (sequence) {
    await repository.updateSequence(sequence.id, {
      nextBarcode: currentSeq,
      nextProductSku: currentSeq
    });
  }

  console.log("\n======================================");
  console.log("✅ IMPORTACIÓN FINALIZADA");
  console.log(`Filas procesadas con éxito: ${imported}`);
  console.log("======================================");

  try {
    await historyService.saveImportHistory({
      fileName: fileData?.originalname || options.fileName || `Importación ${new Date().toLocaleString()}`,
      filePath: fileData?.path || null,
      fileSize: fileData?.size || null,
      mimeType: fileData?.mimetype || null,
      summary,
      rows: detailRows,
      durationMs
    });
  } catch (historyErr) {
    console.error("⚠️ No se pudo guardar el registro en el historial:", historyErr.message);
  }

  return {
    success: true,
    imported,
    summary,
    sequence: currentSeq
  };
};

module.exports = {
  previewImport,
  importProducts
};