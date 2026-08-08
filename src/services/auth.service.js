const authRepository = require("../repositories/auth.repository");
const bcrypt = require("bcryptjs");

class AuthService {
  async login(email, password) {
    const user = await authRepository.findUserByEmail(email);

    if (!user || !user.active) {
      throw new Error("Usuario no encontrado o inactivo");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Contraseña incorrecta");
    }

    const stores = user.stores.map((us) => us.store);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        stores
      }
    };
  }

  async openSession(registerId, userId, initialCash) {
    let session = await authRepository.findActiveSession(registerId);

    if (!session) {
      session = await authRepository.createSession({
        registerId,
        userId,
        initialCash: parseFloat(initialCash || 0)
      });
    }

    return session;
  }

  async closeSession(sessionId, finalCash, notes = "") {
    if (!sessionId) {
      throw new Error("ID de sesión no proporcionado");
    }

    // 1. Obtener datos de la sesión (para conocer el dinero inicial)
    const session = await authRepository.findSessionById(sessionId);
    if (!session || !session.isOpen) {
      throw new Error("La sesión no existe o ya se encuentra cerrada.");
    }

    // 2. Obtener sumatorias acumuladas en ventas de esta sesión
    const totals = await authRepository.getSessionTotals(sessionId);

    const initialCash = Number(session.initialCash || 0);
    const declaredCash = parseFloat(finalCash || 0);

    // 3. Efectivo neto ingresado por ventas = (Efectivo cobrado - Cambio entregado)
    const netCashSales = totals.paidCash - totals.changeGiven;

    // 4. Lo que DEBE haber físicamente en el cajón de dinero
    const expectedCash = initialCash + netCashSales;

    // 5. Diferencia de efectivo (Sobrante > 0 / Faltante < 0)
    const cashDifference = declaredCash - expectedCash;

    // 6. Registrar cierre en base de datos
    const closedSession = await authRepository.closeSession({
      sessionId,
      finalCash: declaredCash,
      expectedCash,
      cashDifference,
      cardTotal: totals.paidCard,
      transferTotal: totals.paidTransfer,
      discountsTotal: totals.totalDiscounts,
      salesCount: totals.salesCount,
      notes
    });

    // 7. Devolver resumen de arqueo completo para el reporte o modal
    return {
      closedSession,
      summary: {
        initialCash,
        declaredCash,
        expectedCash,
        cashDifference,
        netCashSales,
        cardTotal: totals.paidCard,
        transferTotal: totals.paidTransfer,
        discountsTotal: totals.totalDiscounts,
        totalSalesIncome: totals.totalSales,
        salesCount: totals.salesCount
      }
    };
  }
}

module.exports = new AuthService();