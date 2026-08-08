const sessionService = require("../services/session.service");

exports.openSession = async (req, res) => {
  try {
    const { registerId, initialCash } = req.body;
    const userId = req.user?.id || req.body.userId || req.headers["x-user-id"];

    if (!registerId || initialCash === undefined || initialCash === null) {
      return res.status(400).json({
        message: "El ID de la caja (registerId) y el monto inicial (initialCash) son obligatorios.",
      });
    }

    const session = await sessionService.openSession({
      registerId,
      userId,
      initialCash: parseFloat(initialCash),
    });

    return res.status(201).json({
      message: "Caja abierta exitosamente",
      session,
    });
  } catch (error) {
    console.error("Error al abrir caja:", error);
    return res.status(400).json({ message: error.message || "Error al abrir la caja" });
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const userId = req.user?.id || req.headers["x-user-id"];
    const { registerId } = req.query;

    const session = await sessionService.getActiveSession({ userId, registerId });

    if (!session) {
      return res.status(200).json({
        isOpen: false,
        message: "No hay una sesión de caja abierta actualmente.",
        session: null,
      });
    }

    return res.status(200).json({
      isOpen: true,
      session,
    });
  } catch (error) {
    console.error("Error al obtener sesión activa:", error);
    return res.status(500).json({ message: "Error al consultar estado de la caja" });
  }
};

exports.getSessionSummary = async (req, res) => {
  try {
    // Si en las rutas usas router.get('/:id/summary', ...), usa req.params.id o ajusta req.params.sessionId
    const sessionId = req.params.sessionId || req.params.id;

    const summary = await sessionService.getSessionSummary(sessionId);

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error al obtener resumen de sesión:", error);
    return res.status(400).json({ message: error.message || "Error al generar resumen de caja" });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    const { finalCash, notes } = req.body;

    if (finalCash === undefined || finalCash === null) {
      return res.status(400).json({
        message: "El efectivo contado físicamente (finalCash) es obligatorio.",
      });
    }

    const closedSession = await sessionService.closeSession({
      sessionId,
      finalCash: parseFloat(finalCash),
      notes,
    });

    return res.status(200).json({
      message: "Caja cerrada exitosamente",
      session: closedSession,
    });
  } catch (error) {
    console.error("Error al cerrar caja:", error);
    return res.status(400).json({ message: error.message || "Error al realizar el cierre de caja" });
  }
};

exports.getSessionHistory = async (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.query;

    const history = await sessionService.getSessionHistory({
      storeId,
      startDate,
      endDate,
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error al consultar historial de cajas:", error);
    return res.status(500).json({ message: "Error al obtener el historial de cierres" });
  }
};