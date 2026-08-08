const repository = require("../repositories/sequence.repository");

const nextProductSku = async () => {

  const sequence = await repository.get();

  const number = sequence.nextProductSku;

  await repository.update({
    nextProductSku: number + 1,
  });

  return `PRD-${String(number).padStart(6, "0")}`;
};

const nextBarcode = async () => {

  const sequence = await repository.get();

  const number = sequence.nextBarcode;

  await repository.update({
    nextBarcode: number + 1,
  });

  return `750${String(number).padStart(9, "0")}`;
};

module.exports = {
  nextProductSku,
  nextBarcode,
};