const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AuthRepository {
  // Buscar usuario por email con sus tiendas y cajas
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        stores: {
          include: {
            store: {
              include: {
                registers: true
              }
            }
          }
        }
      }
    });
  }

  // Buscar si hay una sesión/turno activo en la caja
  async findActiveSession(registerId) {
    return await prisma.session.findFirst({
      where: {
        registerId,
        isOpen: true
      }
    });
  }

  // Buscar sesión por su ID (para validar antes del cierre)
  async findSessionById(sessionId) {
    return await prisma.session.findUnique({
      where: { id: sessionId }
    });
  }

  // Crear una nueva sesión de caja
  async createSession(data) {
    return await prisma.session.create({
      data: {
        registerId: data.registerId,
        userId: data.userId,
        initialCash: data.initialCash,
        isOpen: true
      }
    });
  }

  // Obtener sumatorias de ventas para el arqueo de caja
  async getSessionTotals(sessionId) {
    const aggregate = await prisma.sale.aggregate({
      where: { sessionId },
      _sum: {
        subtotal: true,
        discount: true,
        total: true,
        paidCash: true,
        paidCard: true,
        paidTransfer: true,
        changeGiven: true
      },
      _count: {
        id: true
      }
    });

    return {
      salesCount: aggregate._count.id || 0,
      subtotal: Number(aggregate._sum.subtotal || 0),
      totalDiscounts: Number(aggregate._sum.discount || 0),
      totalSales: Number(aggregate._sum.total || 0),
      paidCash: Number(aggregate._sum.paidCash || 0),
      paidCard: Number(aggregate._sum.paidCard || 0),
      paidTransfer: Number(aggregate._sum.paidTransfer || 0),
      changeGiven: Number(aggregate._sum.changeGiven || 0)
    };
  }

  // Cerrar sesión/turno de caja guardando el arqueo en los campos de Prisma
  async closeSession({ sessionId, finalCash, expectedCash, cashDifference, notes }) {
    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        finalCash: parseFloat(finalCash || 0),
        expectedCash: expectedCash,
        difference: cashDifference, // Mapeado al campo 'difference' de tu schema
        notes: notes || null,
        closedAt: new Date(),
        isOpen: false
      }
    });
  }
}

module.exports = new AuthRepository();