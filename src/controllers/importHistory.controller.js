const fs = require("fs");

const service = require("../services/importHistory.service");

const getHistory = async (req, res) => {

    try {

        const history = await service.getHistory();

        res.json(history);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

};

const getHistoryById = async (req, res) => {

    try {

        const history = await service.getById(
            req.params.id
        );

        if (!history) {

            return res.status(404).json({
                message: "Importación no encontrada."
            });

        }

        res.json(history);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

};

const downloadFile = async (req, res) => {

    try {

        const history = await service.getById(req.params.id);

        if (!history) {

            return res.status(404).json({
                message: "Importación no encontrada."
            });

        }

        if (!history.filePath) {

            return res.status(404).json({
                message: "Esta importación no tiene un archivo asociado."
            });

        }

        if (!fs.existsSync(history.filePath)) {

            return res.status(404).json({
                message: "El archivo ya no existe en el servidor."
            });

        }

        return res.download(
            history.filePath,
            history.fileName
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });

    }

};

const deleteImport = async (req, res) => {

    try {

        const history = await service.getById(
            req.params.id
        );

        if (!history) {

            return res.status(404).json({
                message: "Importación no encontrada."
            });

        }

        if (
            history.filePath &&
            fs.existsSync(history.filePath)
        ) {

            fs.unlinkSync(history.filePath);

        }

        await service.deleteImport(
            req.params.id
        );

        return res.json({

            message: "Importación eliminada correctamente."

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: error.message

        });

    }

};

module.exports = {

    getHistory,

    getHistoryById,

    downloadFile,

    deleteImport

};