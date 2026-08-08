const service = require("../services/inventory.service");

const getInventory = async (req, res) => {
    try {
        const inventory = await service.getInventory();
        res.json(inventory);
    } catch (error) {
        console.error("ERROR EN OBTENER INVENTARIO:", error);
        res.status(500).json({ message: error.message });
    }
};

const updateInventory = async (req, res) => {
    try {
        const inventory = await service.updateInventory(
            req.params.id,
            req.body
        );
        res.json(inventory);
    } catch (error) {
        console.error("ERROR EN ACTUALIZAR INVENTARIO:", error);
        res.status(500).json({ message: error.message });
    }
};

const clearAllCatalog = async (req, res) => {
    try {
        await service.clearAllCatalog();
        res.json({ message: "Catálogo e inventario eliminados correctamente." });
    } catch (error) {
        console.error("ERROR AL ELIMINAR CATÁLOGO:", error);
        res.status(500).json({ message: error.message });
    }
};

const getImportHistory = async (req, res) => {

    try {

        const history =
            await service.getImportHistory();

        res.json(history);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

};


module.exports = {
    getInventory,
    updateInventory,
    clearAllCatalog,
    getImportHistory
};