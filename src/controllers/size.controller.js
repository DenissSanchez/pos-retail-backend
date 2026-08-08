const service=require("../services/size.service");

const getSizes=async(req,res)=>{

    try{

        const sizes=await service.getSizes();

        res.json(sizes);

    }catch(error){

        console.error(error);

        res.status(500).json({

            message:"Error obteniendo tallas"

        });

    }

};

module.exports={

    getSizes

};