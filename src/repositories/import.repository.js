const prisma = require("../config/prisma");

// ==========================
// CATEGORÍA
// ==========================
const findCategory = (name) => {
  return prisma.category.findFirst({
    where: {
      name: {
        equals: String(name).trim(),
        mode: "insensitive"
      }
    }
  });
};

const createCategory = (data) => {
  return prisma.category.create({
    data: {
      ...data,
      name: String(data.name).trim(),
      code: String(data.code).trim().toUpperCase()
    }
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
        mode: "insensitive"
      }
    }
  });
};

const createBrand = (data) => {
  return prisma.brand.create({
    data: {
      ...data,
      name: String(data.name).trim(),
      code: String(data.code).trim().toUpperCase()
    }
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
        mode: "insensitive"
      }
    }
  });
};

const createColor = (data) => {
  return prisma.color.create({
    data: {
      name: String(data.name).trim(),
      code: String(data.code || data.name).trim().toUpperCase()
    }
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
        mode: "insensitive"
      }
    }
  });
};

const createSize = (data) => {
  return prisma.size.create({
    data: {
      name: String(data.name).trim(),
      code: String(data.code || data.name).trim().toUpperCase(),
      order: Number(data.order) || 1
    }
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
        mode: "insensitive"
      }
    }
  });
};

// C:\Dev\PosRetail\backend\src\repositories\import.repository.js

const createProduct = (productData) => {
  return prisma.product.create({
    data: productData
  });
};

// ==========================
// VARIANTE
// ==========================
const findVariant = (productId, colorId, sizeId) => {
  return prisma.productVariant.findFirst({
    where: {
      productId,
      colorId, // 🟢 Eliminado '|| null'
      sizeId   // 🟢 Eliminado '|| null'
    }
  });
};

const findVariantBySku = (sku) => {
  return prisma.productVariant.findUnique({
    where: {
      sku: String(sku).trim()
    }
  });
};

const createVariant = (data) => {
  return prisma.productVariant.create({
    data: {
      productId: data.productId,
      colorId: data.colorId, // 🟢 Eliminado '|| null'
      sizeId: data.sizeId,   // 🟢 Eliminado '|| null'
      sku: String(data.sku).trim(),
      barcode: data.barcode ? String(data.barcode).trim() : null,
      supplierSku: data.supplierSku ? String(data.supplierSku).trim() : null,
      cost: Number(data.cost) || 0,
      price: Number(data.price) || 0,
      active: data.active ?? true
    }
  });
};

const updateVariant = (id, data) => {
  return prisma.productVariant.update({
    where: { id },
    data
  });
};

// ==========================
// INVENTARIO
// ==========================
const createInventory = (data) => {
  return prisma.inventory.create({
    data
  });
};

const findInventory = (variantId, storeId) => {
  return prisma.inventory.findFirst({
    where: {
      productVariantId: variantId,
      storeId
    }
  });
};

const updateInventory = (id, stock) => {
  return prisma.inventory.update({
    where: { id },
    data: { stock: Number(stock) || 0 }
  });
};

// ==========================
// SECUENCIAS Y CATÁLOGOS ALL
// ==========================
const getSequence = () => {
  return prisma.sequence.findFirst();
};

const updateSequence = (id, data) => {
  return prisma.sequence.update({
    where: { id },
    data
  });
};

const getAllCategories = () => prisma.category.findMany();
const getAllBrands = () => prisma.brand.findMany();
const getAllColors = () => prisma.color.findMany();
const getAllSizes = () => prisma.size.findMany();

const getAllProducts = (companyId) => {
  return prisma.product.findMany({
    where: { companyId }
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
  getAllVariants
};