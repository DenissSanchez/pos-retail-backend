const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
    __dirname,
    "../../uploads/imports"
);

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {
        recursive: true
    });

}

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, uploadDir);

    },

    filename(req, file, cb) {

        const extension = path.extname(file.originalname);

        const timestamp = Date.now();

        cb(

            null,

            `${timestamp}${extension}`

        );

    }

});

module.exports = multer({

    storage

});