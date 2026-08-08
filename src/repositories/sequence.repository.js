const prisma = require("../config/prisma");

const get = () => {
  return prisma.sequence.findUnique({
    where: {
      id: "global",
    },
  });
};

const update = (data) => {
  return prisma.sequence.update({
    where: {
      id: "global",
    },
    data,
  });
};

module.exports = {
  get,
  update,
};