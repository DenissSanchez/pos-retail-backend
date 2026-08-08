const repository = require("../repositories/color.repository");

const getColors = () => {

    return repository.getColors();

};

module.exports = {

    getColors

};