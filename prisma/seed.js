const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando datos base iniciales...');

  // 1. Empresa
  const company = await prisma.company.create({
    data: {
      name: 'Casa Orquidia',
    },
  });

  // 2. Sucursal (Usando el ID que tenías en la app)
  const store = await prisma.store.create({
    data: {
      id: 'f554ccd8-7a9c-45bc-85e0-b928bcea5c45',
      code: 'SUC-01',
      name: 'Sucursal Principal',
      companyId: company.id,
    },
  });

  // 3. Caja (Register)
  const register = await prisma.register.create({
    data: {
      code: 'CAJA-01',
      name: 'Caja Principal',
      storeId: store.id,
    },
  });

  // 4. Rol y Usuario Administrador
  const role = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrador del Sistema',
    },
  });

  const user = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Casa Orquidia',
      email: 'admin@casaorquidia.com',
      password: 'admin_password_hash', // Cambiar por tu hash si usas bcrypt
      roleId: role.id,
    },
  });

  // 5. Sesión Activa (Para permitir ventas inmediatas)
  await prisma.session.create({
    data: {
      id: '935ac1c1-677e-4ccb-9ebf-d1349c50984b', // El ID que usabas en Sales.jsx
      registerId: register.id,
      userId: user.id,
      initialCash: 1000.00,
      isOpen: true,
    },
  });

  console.log('✅ Base de datos restaurada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });