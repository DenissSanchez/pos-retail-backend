const prisma = require("../config/prisma");

const createImport = (data) => {

    return prisma.importHistory.create({
        data
    });

};

const createDetails = (details) => {

    return prisma.importHistoryDetail.createMany({
        data: details
    });

};

const getHistory = () => {

    return prisma.importHistory.findMany({

        orderBy: {
            createdAt: "desc"
        },

        include: {
            details: true
        }

    });

};

const getById = (id) => {

    return prisma.importHistory.findUnique({

        where: { id },

        include: {
            details: true
        }

    });

};

const getFileById = (id) => {

    return prisma.importHistory.findUnique({

        where: {
            id
        },

        select: {

            id: true,
            fileName: true,
            filePath: true,
            mimeType: true

        }

    });

};

const deleteImport = (id) => {

    return prisma.importHistory.delete({

        where: {
            id
        }

    });

};

module.exports = {

    createImport,
    createDetails,
    getHistory,
    getById,
    getFileById,
    deleteImport

};