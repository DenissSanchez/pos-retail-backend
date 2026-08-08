const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");

router.get("/", inventoryController.getInventory);

router.delete(
    "/clear-all",
    inventoryController.clearAllCatalog
);

router.put(
    "/:id",
    inventoryController.updateInventory
);

router.get(
    "/imports",
    inventoryController.getImportHistory
);

module.exports = router;