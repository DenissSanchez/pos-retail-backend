const prisma = require("../config/prisma");


// Obtener todos los productos
const getAllProducts = async () => {

    return await prisma.product.findMany({

        include: {

            category: true,

            brand: true,

            variants: {

                include: {

                    color: true,

                    size: true,

                    inventory: {

                        include: {

                            store: true

                        }

                    }

                }

            }

        }

    });

};


// Obtener producto por ID
const getProductById = (id) => {


    return prisma.product.findUnique({

        where: {
            id
        },

        include: {

            brand: true,

            category: true,

            variants: {

                include: {

                    color: true,

                    size: true,

                    inventory: {

                        include: {

                            store: true

                        }

                    }

                }

            }

        }

    });


};



// Actualizar producto
const updateProduct = (id, data) => {


    return prisma.product.update({

        where:{
            id
        },

        data

    });


};



// Actualizar variante
const updateVariant = (id,data)=>{


    return prisma.productVariant.update({

        where:{
            id
        },

        data

    });


};



// Crear producto
const createProduct = (data)=>{


    return prisma.product.create({

        data

    });


};




// Crear variante
const createVariant = (data)=>{


    return prisma.productVariant.create({

        data:{


            productId:data.productId,


            colorId:data.colorId,


            sizeId:data.sizeId,


            sku:data.sku,


            barcode:data.barcode,


            cost:Number(data.cost),


            price:Number(data.price),



            inventory:{


                create:{


                    stock:Number(data.stock),


                    store:{


                        connect:{


                            id:data.storeId


                        }


                    }


                }


            }


        },


        include:{


            color:true,


            size:true,


            inventory:{


                include:{


                    store:true


                }


            }


        }


    });


};



// Buscar último SKU
const getLastSku = async(prefix)=>{


    return prisma.productVariant.findFirst({

        where:{


            sku:{


                startsWith:prefix


            }


        },


        orderBy:{


            sku:"desc"


        }


    });


};



module.exports={


    updateProduct,

    updateVariant,

    createVariant,

    getProductById,

    getAllProducts,

    createProduct,

    getLastSku


};