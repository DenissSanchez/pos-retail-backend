const prisma = require("../config/prisma");

// 1. Obtener todas las existencias con información de la variante y producto
const getAllInventory = () => {
    return prisma.inventory.findMany({
        include: {
            variant: {
                include: {
                    product: {
                        include: {
                            category: true,
                            brand: true
                        }
                    },
                    color: true,
                    size: true
                }
            }
        }
    });
};

// 2. Actualizar stock (o directamente sobreescribir)
const updateInventory = (id, data) => {
    return prisma.inventory.update({
        where: { id },
        data
    });
};

// Elimina primero el inventario, luego las variantes y finalmente los productos
// inventory.repository.js
const deleteAllCatalog = async () => {
  return await prisma.$transaction([
    // 1. Borrar detalle de ventas y ventas (Productos vendidos)
    prisma.saleItem.deleteMany({}),
    prisma.sale.deleteMany({}),

    // 2. Borrar transferencias y compras (Movimientos de inventario)
    prisma.transferItem.deleteMany({}),
    prisma.transfer.deleteMany({}),
    prisma.purchaseItem.deleteMany({}),
    prisma.purchase.deleteMany({}),

    // 3. Borrar historial de importaciones
    prisma.importHistoryDetail.deleteMany({}),
    prisma.importHistory.deleteMany({}),

    // 4. Borrar Inventario y Variantes
    prisma.inventory.deleteMany({}),
    prisma.productVariant.deleteMany({}),

    // 5. Borrar Productos
    prisma.product.deleteMany({}),

    // 6. Opcional: Borrar catálogos asociados a productos
    prisma.category.deleteMany({}),
    prisma.brand.deleteMany({}),
    prisma.color.deleteMany({}),
    prisma.size.deleteMany({}),
  ]);
};

const getImportHistory = async () => {

    return prisma.importHistory.findMany({

        orderBy: {
            createdAt: "desc"
        },

        include: {
            details: true
        }

    });

};

module.exports = {
    getAllInventory,
    updateInventory,
    deleteAllCatalog,
    getImportHistory
};

