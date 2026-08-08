const router = require("express").Router();

const controller = require("../controllers/import.controller");

const upload = require("../config/multer");

router.post(
    "/products",
    upload.single("file"),
    controller.importProducts
);

router.post(
    "/preview",
    controller.previewProducts
);

module.exports = router;