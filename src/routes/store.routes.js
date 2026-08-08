const router = require("express").Router();

const controller = require("../controllers/store.controller");


router.get("/", controller.getStores);


module.exports = router;