const service=require("../services/product.service");

const getProducts=async(req,res)=>{

    try{

        const products=await service.getProducts();

        res.json(products);

    }catch(error){

        console.error(error);

        res.status(500).json({

            message:"Error obteniendo productos"

        });

    }

};

const getProductById = async (req, res) => {

    try {

        const product = await service.getProductById(req.params.id);

        res.json(product);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Error obteniendo producto"

        });

    }

};

const updateProduct = async (req, res) => {

    try {

        const product = await service.updateProduct(

            req.params.id,

            req.body

        );

        res.json(product);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Error actualizando producto"

        });

    }

};

const updateVariant = async (req, res) => {

    try{

        const variant = await service.updateVariant(

            req.params.id,

            req.body

        );

        res.json(variant);

    }catch(error){

        console.error(error);

        res.status(500).json({

            message:"Error actualizando variante"

        });

    }

};

const createVariant = async (req, res) => {

    try {

        const variant = await service.createVariant(req.body);

        res.status(201).json(variant);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Error creando variante"

        });

    }

};

const createProduct = async (req,res)=>{

    try{

        const product=await service.createProduct(req.body);

        res.status(201).json(product);

    }catch(error){

        console.error(error);

        res.status(500).json({

            message:"Error creando producto"

        });

    }

};

const generateSku = async (req,res)=>{

    try{

        const sku = await service.generateSku(

            req.body.prefix

        );

        res.json({

            sku

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            message:"Error generando SKU"

        });

    }

};

module.exports={
    updateProduct,
    updateVariant,
    getProducts,
    getProductById,
    createVariant,
    createProduct,
    generateSku

};