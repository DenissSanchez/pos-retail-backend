const prisma = require("../config/prisma");

async function main() {

  const exists = await prisma.sequence.findUnique({
    where: {
      id: "global",
    },
  });

  if (exists) {
    console.log("Sequence ya existe");
    return;
  }

  await prisma.sequence.create({
    data: {
      id: "global",
    },
  });

  console.log("Sequence creada");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });