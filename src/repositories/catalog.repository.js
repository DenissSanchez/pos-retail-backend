const prisma = require("../config/prisma");

const getBrands = () => {

    return prisma.brand.findMany({

        orderBy: {

            name: "asc"

        }

    });

};

const getCategories = () => {

    return prisma.category.findMany({

        orderBy: {

            name: "asc"

        }

    });

};

module.exports = {

    getBrands,

    getCategories

};