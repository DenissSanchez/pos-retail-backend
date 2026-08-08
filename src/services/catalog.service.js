const repository = require("../repositories/catalog.repository");

const getBrands = () => {

    return repository.getBrands();

};

const getCategories = () => {

    return repository.getCategories();

};

module.exports = {

    getBrands,

    getCategories

};