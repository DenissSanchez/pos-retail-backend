const prisma = require("../config/prisma");

const getColors = () => {

    return prisma.color.findMany({

        where: {

            active: true

        },

        orderBy: {

            name: "asc"

        }

    });

};

module.exports = {

    getColors

};