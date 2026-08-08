const prisma = require("../config/prisma");

const getSizes = () => {

    return prisma.size.findMany({

        where: {

            active: true

        },

        orderBy: {

            order: "asc"

        }

    });

};

module.exports = {

    getSizes

};