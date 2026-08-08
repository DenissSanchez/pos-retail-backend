const prisma = require("../config/prisma");

const findVariantForPOS = async (code, storeId) => {
  return await prisma.productVariant.findFirst({
    where: {
      active: true,
      OR: [
        { barcode: code },
        { sku: code },
        { supplierBarcode: code },
        { supplierSku: code }
      ]
    },
    include: {
      product: {
        select: {
          name: true,
          brand: { select: { name: true } },
          category: { select: { name: true } }
        }
      },
      color: { select: { name: true, hexCode: true } },
      size: { select: { name: true } },
      inventory: {
        where: { storeId },
        select: { stock: true }
      }
    }
  });
};

/**
 * Busca si la sesión/caja dada existe y está abierta.
 */
const findActiveSession = async (sessionId) => {
  return await prisma.session.findFirst({
    where: {
      id: sessionId,
      isOpen: true
    },
    include: {
      register: {
        select: { storeId: true }
      }
    }
  });
};

/**
 * Procesa la venta, descuenta inventario y actualiza la secuencia en una SOLA transacción atómica.
 */
const processSaleTransaction = async ({
  sessionId,
  storeId,
  items,
  paymentMethod,
  reference,
  subtotal,
  discount,
  total,
  paidCash = 0,
  paidCard = 0,
  paidTransfer = 0,
  changeGiven = 0
}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener todos los registros de inventario involucrados de una sola query (Evita N+1)
    const variantIds = items.map((item) => item.productVariantId);
    
    const inventories = await tx.inventory.findMany({
      where: {
        storeId,
        productVariantId: { in: variantIds }
      }
    });

    // Mapa para rápida consulta O(1)
    const inventoryMap = new Map(
      inventories.map((inv) => [inv.productVariantId, inv])
    );

    // 2. Validar stock y descontar en paralelo
    const updatePromises = items.map(async (item) => {
      const inventory = inventoryMap.get(item.productVariantId);

      if (!inventory || inventory.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para una de las variantes seleccionadas. Disponible: ${
            inventory ? inventory.stock : 0
          }`
        );
      }

      // Restar stock
      return tx.inventory.update({
        where: { id: inventory.id },
        data: {
          stock: { decrement: item.quantity }
        }
      });
    });

    // Esperar a que se actualicen todos los inventarios de la venta
    await Promise.all(updatePromises);

    // 3. Crear la Venta y sus SaleItems
    const sale = await tx.sale.create({
      data: {
        sessionId,
        subtotal,
        discount,
        total,
        paymentMethod,
        paidCash,
        paidCard,
        paidTransfer,
        changeGiven,
        reference,
        items: {
          create: items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            subtotal: item.subtotal || item.quantity * item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true } },
                color: { select: { name: true } },
                size: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    // 4. Actualizar la secuencia del folio de forma atómica
    // NOTA: Si usas ID fijo o único para la secuencia (ej: id: 1), asegúrate de usarlo aquí
    const updatedSequence = await tx.sequence.updateMany({
      data: { nextSaleNumber: { increment: 1 } }
    });

    if (updatedSequence.count === 0) {
      throw new Error("No se pudo encontrar o actualizar la secuencia de folios.");
    }

    return sale;
  });
};

const getSalesByDateRange = async (startDate, endDate, limit = null) => {
  return await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    take: limit || undefined,
    include: {
      session: {
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      },
      items: {
        include: {
          variant: {
            select: {
              cost: true // Requerido para calcular la ganancia real
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

// ==========================================
// SUCURSALES: Activar y Desactivar
// ==========================================
const updateStoreStatus = async (storeId, active) => {
  return await prisma.store.update({
    where: { id: storeId },
    data: { active: Boolean(active) }
  });
};

// ==========================================
// USUARIOS: Activar y Desactivar
// ==========================================
const updateUserStatus = async (userId, active) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { active: Boolean(active) }
  });
};

module.exports = {
  findVariantForPOS,
  findActiveSession,
  processSaleTransaction,
  getSalesByDateRange,
  updateStoreStatus,
  updateUserStatus
};