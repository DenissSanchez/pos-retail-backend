const { Router } = require("express");
const controller = require("../controllers/sale.controller");

const router = Router();

// 1. RUTAS GET (Consultas específicas)
// GET /api/sales/dashboard
router.get("/dashboard", controller.getDashboardStats);

// GET /api/sales/search?code=123456&storeId=uuid-tienda
router.get("/search", controller.searchProduct);

// 2. RUTAS POST (Creación y Cobro)
// POST /api/sales
router.post("/", controller.createSale);

// POST /api/sales/checkout
router.post("/checkout", controller.createSale);

module.exports = router;