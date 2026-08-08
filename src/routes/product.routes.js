const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/role.middleware");

const {
    getProducts,
    getProductById,
    updateProduct,
    updateVariant,
    createVariant,
    createProduct,
    generateSku
} = require("../controllers/product.controller");

router.post("/", verifyAdmin, createProduct);

router.post("/variant", verifyAdmin, createVariant);

router.post("/generate-sku", verifyAdmin, generateSku);

router.put("/variant/:id", verifyAdmin, updateVariant);

router.put("/:id", verifyAdmin, updateProduct);

router.get("/:id", getProductById);

router.get("/", getProducts);

module.exports = router;