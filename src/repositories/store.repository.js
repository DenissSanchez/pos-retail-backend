const prisma = require("../config/prisma");


const getStores = () => {

    return prisma.store.findMany({

        where:{
            active:true
        },

        orderBy:{
            name:"asc"
        }

    });

};


module.exports = {

    getStores

};