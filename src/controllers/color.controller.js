const service = require("../services/color.service");

const getColors = async (req,res)=>{

    try{

        const colors = await service.getColors();

        res.json(colors);

    }catch(error){

        console.error(error);

        res.status(500).json({

            message:"Error obteniendo colores"

        });

    }

};

module.exports={

    getColors

};