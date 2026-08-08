const prisma = require("../config/prisma");

const findAll = () => {
  return prisma.category.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

const create = (data) => {
  return prisma.category.create({
    data,
  });
};

const update = (id, data) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

const remove = (id) => {
  return prisma.category.update({
    where: { id },
    data: {
      active: false,
    },
  });
};

module.exports = {
  findAll,
  create,
  update,
  remove,
};