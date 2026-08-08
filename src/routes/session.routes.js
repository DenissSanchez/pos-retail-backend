const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session.controller");

// Abrir una nueva sesión de caja
router.post("/open", sessionController.openSession);

// Obtener la sesión activa del usuario/caja actual
router.get("/active", sessionController.getActiveSession);

// Obtener el resumen de ventas/efectivo del turno (para el modal de cierre)
// Acepta tanto :id como :sessionId para alinearse con tu controlador
router.get("/:sessionId/summary", sessionController.getSessionSummary);

// Cerrar la sesión de caja (Arqueo final)
router.post("/:sessionId/close", sessionController.closeSession);

// Consultar historial de cierres (Reportes)
router.get("/history", sessionController.getSessionHistory);

module.exports = router;