const repository = require("../repositories/category.repository");

const getAll = () => repository.findAll();

const create = (data) => repository.create(data);

const update = (id, data) => repository.update(id, data);

const remove = (id) => repository.remove(id);

module.exports = {
  getAll,
  create,
  update,
  remove,
};