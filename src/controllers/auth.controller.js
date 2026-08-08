const authService = require("../services/auth.service");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.openSession = async (req, res) => {
  try {
    const { registerId, userId, initialCash } = req.body;
    const session = await authService.openSession(registerId, userId, initialCash);
    res.json({ message: "Sesión de caja activa", session });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// En tu auth.controller.js

exports.closeSession = async (req, res) => {
  try {
    const { sessionId, finalCash, notes } = req.body;
    
    // Pasamos notes al servicio
    const result = await authService.closeSession(sessionId, finalCash, notes);

    res.json({
      message: "Caja cerrada con éxito",
      session: result.closedSession,
      summary: result.summary // 👈 Importante para mostrar el reporte en el frontend
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Agregar este método en auth.controller.js
exports.getSessionSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await authRepository.findSessionById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    const totals = await authRepository.getSessionTotals(sessionId);
    const initialCash = Number(session.initialCash || 0);
    const netCashSales = totals.paidCash - totals.changeGiven;
    const expectedCash = initialCash + netCashSales;

    res.json({
      initialCash,
      paidCash: totals.paidCash,
      paidCard: totals.paidCard,
      paidTransfer: totals.paidTransfer,
      totalSales: totals.totalSales,
      totalDiscounts: totals.totalDiscounts,
      salesCount: totals.salesCount,
      netCashSales,
      expectedCash
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};