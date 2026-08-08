const express = require("express");

const controller = require(
    "../controllers/importHistory.controller"
);

const router = express.Router();

router.get(
    "/",
    controller.getHistory
);

router.get(
    "/:id",
    controller.getHistoryById
);

// 👇 NUEVA RUTA
router.get(
    "/:id/download",
    controller.downloadFile
);

router.delete(
    "/:id",
    controller.deleteImport
);

module.exports = router;