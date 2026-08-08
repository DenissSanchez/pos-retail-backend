const service = require("../services/catalog.service");

const getBrands = async (req, res) => {

    try {

        const data = await service.getBrands();

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Error obteniendo marcas"

        });

    }

};

const getCategories = async (req, res) => {

    try {

        const data = await service.getCategories();

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Error obteniendo categorías"

        });

    }

};

module.exports = {

    getBrands,

    getCategories

};