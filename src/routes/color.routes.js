const express=require("express");

const router=express.Router();

const {

    getColors

}=require("../controllers/color.controller");

router.get("/",getColors);

module.exports=router;