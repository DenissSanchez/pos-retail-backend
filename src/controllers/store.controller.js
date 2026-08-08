const repository = require("../repositories/store.repository");


const getStores = async(req,res)=>{

    try{

        const stores = await repository.getStores();

        res.json(stores);


    }catch(error){

        console.error(error);

        res.status(500).json({

            message:"Error obteniendo tiendas"

        });

    }

};


module.exports={

    getStores

};