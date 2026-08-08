const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        status: "OK",
        version: "1.0.0",
        message: "RetailPOS API funcionando correctamente"
    });
});

module.exports = router;