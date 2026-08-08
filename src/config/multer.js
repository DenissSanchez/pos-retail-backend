const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Carpeta donde se guardarán los Excel
const uploadPath = path.join(__dirname, "../../uploads/imports");

// Si no existe la carpeta la crea
if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, {
        recursive: true
    });

}

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, uploadPath);

    },

    filename(req, file, cb) {

        const extension = path.extname(file.originalname);

        const timestamp = Date.now();

        cb(
            null,
            `import_${timestamp}${extension}`
        );

    }

});

module.exports = multer({

    storage,

    fileFilter(req, file, cb) {

        const allowed = [

            ".xlsx",
            ".xls"

        ];

        const extension = path.extname(
            file.originalname
        ).toLowerCase();

        if (!allowed.includes(extension)) {

            return cb(
                new Error("Solo se permiten archivos Excel.")
            );

        }

        cb(null, true);

    }

});