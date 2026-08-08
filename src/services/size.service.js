const repository = require("../repositories/size.repository");

const getSizes = () => {

    return repository.getSizes();

};

module.exports = {

    getSizes

};