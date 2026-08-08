const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/open-session", authController.openSession);
router.post("/close-session", authController.closeSession);

module.exports = router;