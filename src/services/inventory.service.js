const repository = require("../repositories/inventory.repository");

const getInventory = async () => {
    return repository.getAllInventory();
};

const updateInventory = async (id, data) => {
    const qty = Number(data.quantity || data.stock || 0);

    // Si especificas tipo de ajuste desde el frontend (ADD o REMOVE)
    if (data.type === "ADD") {
        return repository.updateInventory(id, {
            stock: { increment: qty }
        });
    } else if (data.type === "REMOVE") {
        return repository.updateInventory(id, {
            stock: { decrement: qty }
        });
    }

    // Si viene el número final directo
    return repository.updateInventory(id, {
        stock: Number(data.stock)
    });
};

const clearAllCatalog = async () => {
    return repository.deleteAllCatalog();
};

const getImportHistory = async () => {

    return repository.getImportHistory();

};


module.exports = {
    getInventory,
    updateInventory,
    clearAllCatalog,
    getImportHistory
};