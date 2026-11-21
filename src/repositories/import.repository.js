const prisma = require("../config/prisma");

// ==========================
// CATEGORÍA
// ==========================
const findCategory = (name) => {
  return prisma.category.findFirst({
    where: {
      name: {
        equals: String(name).trim(),
        mode: "insensitive",
      },
    },
  });
};

const createCategory = (data) => {
  return prisma.category.create({
    data: {
      ...data,
      name: String(data.name).trim(),
      code: String(data.code).trim().toUpperCase(),
    },
  });
};

// ==========================
// MARCA
// ==========================
const findBrand = (name) => {
  return prisma.brand.findFirst({
    where: {
      name: {
        equals: String(name).trim(),
        mode: "insensitive",
      },
    },
  });
};

const createBrand = (data) => {
  return prisma.brand.create({
    data: {
      ...data,
      name: String(data.name).trim(),
      code: String(data.code).trim().toUpperCase(),
    },
  });
};

// ==========================
// COLOR
// ==========================
const findColor = (name) => {
  return prisma.color.findFirst({
    where: {
      name: {
        equals: String(name).trim(),
        mode: "insensitive",
      },
    },
  });
};

const createColor = (data) => {
  return prisma.color.create({
    data: {
      name: String(data.name).trim(),
      code: String(data.code || data.name).trim().toUpperCase(),
    },
  });
};

// ==========================
// TALLA
// ==========================
const findSize = (name) => {
  return prisma.size.findFirst({
    where: {
      name: {
        equals: String(name).trim(),
        mode: "insensitive",
      },
    },
  });
};

const createSize = (data) => {
  return prisma.size.create({
    data: {
      name: String(data.name).trim(),
      code: String(data.code || data.name).trim().toUpperCase(),
      order: Number(data.order) || 1,
    },
  });
};

// ==========================
// PRODUCTO
// ==========================
const findProduct = (companyId, name) => {
  return prisma.product.findFirst({
    where: {
      companyId,
      name: {
        equals: String(name).trim(),
        mode: "insensitive",
      },
    },
  });
};

const createProduct = (productData) => {
  return prisma.product.create({
    data: productData,
  });
};

// ==========================
// VARIANTE
// ==========================
const findVariant = (productId, colorId, sizeId) => {
  return prisma.productVariant.findFirst({
    where: {
      productId,
      colorId,
      sizeId,
    },
  });
};

const findVariantBySku = (sku) => {
  return prisma.productVariant.findUnique({
    where: {
      sku: String(sku).trim(),
    },
  });
};

const createVariant = (data) => {
  return prisma.productVariant.create({
    data: {
      productId: data.productId,
      colorId: data.colorId,
      sizeId: data.sizeId,
      sku: String(data.sku).trim(),
      barcode: data.barcode ? String(data.barcode).trim() : null,
      supplierSku: data.supplierSku ? String(data.supplierSku).trim() : null,
      cost: Number(data.cost) || 0,
      price: Number(data.price) || 0,
      active: data.active ?? true,
    },
  });
};

const updateVariant = (id, data) => {
  return prisma.productVariant.update({
    where: { id },
    data,
  });
};

// ==========================
// INVENTARIO
// ==========================
const createInventory = (data) => {
  const productVariantId =
    data.productVariantId || data.variant?.connect?.id;
  const storeId = data.storeId || data.store?.connect?.id;
  const stock = Number(data.stock) || 0;

  return prisma.inventory.create({
    data: {
      productVariantId,
      storeId,
      stock,
      ...(data.minimumStock !== undefined ? { minimumStock: Number(data.minimumStock) || 0 } : {}),
      ...(data.maximumStock !== undefined ? { maximumStock: data.maximumStock } : {}),
    },
  });
};

const findInventory = (variantId, storeId) => {
  return prisma.inventory.findFirst({
    where: {
      productVariantId: variantId,
      storeId,
    },
  });
};

const updateInventory = (id, stock) => {
  return prisma.inventory.update({
    where: { id },
    data: { stock: Number(stock) || 0 },
  });
};

// ==========================
// SECUENCIAS Y CATÁLOGOS ALL
// ==========================
const getSequence = () => {
  return prisma.sequence.findFirst();
};

const updateSequence = (id, data) => {
  const safeData = {};

  if (data.nextProductSku !== undefined && Number.isFinite(Number(data.nextProductSku))) {
    safeData.nextProductSku = Number(data.nextProductSku);
  }
  if (data.nextBarcode !== undefined && Number.isFinite(Number(data.nextBarcode))) {
    safeData.nextBarcode = Number(data.nextBarcode);
  }
  if (data.nextSaleNumber !== undefined && Number.isFinite(Number(data.nextSaleNumber))) {
    safeData.nextSaleNumber = Number(data.nextSaleNumber);
  }
  if (data.nextPurchaseNumber !== undefined && Number.isFinite(Number(data.nextPurchaseNumber))) {
    safeData.nextPurchaseNumber = Number(data.nextPurchaseNumber);
  }
  if (data.nextTransferNumber !== undefined && Number.isFinite(Number(data.nextTransferNumber))) {
    safeData.nextTransferNumber = Number(data.nextTransferNumber);
  }

  return prisma.sequence.update({
    where: { id },
    data: safeData,
  });
};

const getAllCategories = () => prisma.category.findMany();
const getAllBrands = () => prisma.brand.findMany();
const getAllColors = () => prisma.color.findMany();
const getAllSizes = () => prisma.size.findMany();

const getAllProducts = (companyId) => {
  return prisma.product.findMany({
    where: { companyId },
  });
};

const getAllVariants = () => prisma.productVariant.findMany();

module.exports = {
  findCategory,
  createCategory,
  findBrand,
  createBrand,
  findColor,
  createColor,
  findSize,
  createSize,
  findProduct,
  createProduct,
  findVariant,
  findVariantBySku,
  createVariant,
  updateVariant,
  createInventory,
  findInventory,
  updateInventory,
  getSequence,
  updateSequence,
  getAllCategories,
  getAllBrands,
  getAllColors,
  getAllSizes,
  getAllProducts,
  getAllVariants,
};