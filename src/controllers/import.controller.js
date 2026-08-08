const service = require("../services/import.service");

const importProducts = async (req, res) => {
    console.log("¡SÍ LLEGARON LOS DATOS AL BACKEND!", req.body);

    try {
        // Parseo seguro de 'rows'
        let rows = req.body.rows;
        if (typeof rows === "string" && rows !== "undefined") {
            try {
                rows = JSON.parse(rows);
            } catch (e) {
                rows = [];
            }
        }

        // Parseo seguro de 'options'
        let options = {};
        if (typeof req.body.options === "string" && req.body.options !== "undefined") {
            try {
                options = JSON.parse(req.body.options);
            } catch (e) {
                options = {};
            }
        } else if (typeof req.body.options === "object" && req.body.options !== null) {
            options = req.body.options;
        }

        const uploadedFile = req.file;

        console.log("📄 Archivo recibido:", uploadedFile?.originalname);
        console.log("📁 Guardado en:", uploadedFile?.path);
        console.log("📥 Filas recibidas:", Array.isArray(rows) ? rows.length : 0);

        if (!rows || !Array.isArray(rows)) {
            return res.status(400).json({
                success: false,
                message: "No se recibieron filas válidas."
            });
        }

        const result = await service.importProducts(
            rows,
            {
                createCatalogs: true,
                updatePrices: true,
                updateCosts: true,
                updateSupplierSku: true,
                updateStock: true,
                ...(options || {})
            },
            uploadedFile
        );

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("❌ ERROR EN IMPORTACIÓN:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno.",
            error: error.message
        });
    }
};

const previewProducts = async (req, res) => {
    try {
        const { rows } = req.body;

        if (!rows || !Array.isArray(rows)) {
            return res.status(400).json({
                success: false,
                message: "No se recibieron filas."
            });
        }

        const result = await service.previewImport(rows);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error interno.",
            error: error.message
        });
    }
};

module.exports = {
    importProducts,
    previewProducts
};