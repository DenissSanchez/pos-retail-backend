const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// 1. 🏢 EMPRESA, BRANDING Y TICKETS
// ==========================================

const getCompanyConfig = async () => {
  let company = await prisma.company.findFirst();

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Mi Empresa POS',
        ticketHeader: '¡Gracias por su compra!',
        ticketFooter: 'Vuelva pronto',
        paperWidth: '80mm',
      },
    });
  }

  return company;
};

const updateCompanyConfig = async (companyId, data) => {
  return await prisma.company.update({
    where: { id: companyId },
    data: {
      name: data.name,
      legalName: data.legalName,
      rfc: data.rfc,
      phone: data.phone,
      email: data.email,
      address: data.address,
      website: data.website,
      logo: data.logo,
      ticketHeader: data.ticketHeader,
      ticketFooter: data.ticketFooter,
      autoPrintReceipt: Boolean(data.autoPrintReceipt),
      paperWidth: data.paperWidth,
    },
  });
};

// ==========================================
// 2. 🏪 GESTIÓN DE SUCURSALES Y CAJAS
// ==========================================

const getAllStores = async () => {
  return await prisma.store.findMany({
    include: {
      registers: true,
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
};

const createStore = async (storeData) => {
  const storeCount = await prisma.store.count();
  const storeCode = `SUC-${String(storeCount + 1).padStart(3, '0')}`;

  return await prisma.store.create({
    data: {
      companyId: storeData.companyId,
      name: storeData.name,
      code: storeCode,
      address: storeData.address,
      phone: storeData.phone,
      registers: {
        create: {
          code: 'REG-01',
          name: 'Caja Principal',
        },
      },
    },
    include: { registers: true },
  });
};

const updateStore = async (storeId, data) => {
  return await prisma.store.update({
    where: { id: storeId },
    data: {
      name: data.name,
      address: data.address,
      phone: data.phone,
    },
  });
};

const updateStoreStatus = async (storeId, active) => {
  return await prisma.store.update({
    where: { id: storeId },
    data: { active },
  });
};

const createRegister = async ({ storeId, name, code }) => {
  const registerCount = await prisma.register.count({ where: { storeId } });
  const regCode = code || `REG-${String(registerCount + 1).padStart(2, '0')}`;

  return await prisma.register.create({
    data: { storeId, name, code: regCode },
  });
};

// ==========================================
// 3. 👥 USUARIOS Y CUENTAS DE PERSONAL
// ==========================================

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      active: true,
      lastLogin: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
      stores: {
        select: {
          isDefault: true,
          store: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const createUser = async (userData) => {
  const { stores, ...userFields } = userData;

  return await prisma.user.create({
    data: {
      ...userFields,
      stores: stores && stores.length > 0 ? {
        create: stores.map((storeId, index) => ({
          storeId,
          isDefault: index === 0,
        })),
      } : undefined,
    },
    include: {
      role: true,
      stores: { include: { store: true } },
    },
  });
};

const updateUserPassword = async (userId, hashedPassword) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

const updateUserStatus = async (userId, active) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { active },
  });
};

const getActiveShiftSessions = async () => {
  // Ajustado al modelo 'Session' de tu esquema
  return await prisma.session.findMany({
    where: { isOpen: true },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      register: {
        include: {
          store: { select: { id: true, name: true } },
        },
      },
    },
  });
};

// ==========================================
// 4. 🔑 ROLES Y MATRIZ DE PERMISOS
// ==========================================

const getAllRolesWithPermissions = async () => {
  let roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: 'asc' },
  });

  if (roles.length === 0) {
    await prisma.role.createMany({
      data: [
        { name: 'Administrador', description: 'Acceso total al sistema' },
        { name: 'Encargado de Tienda', description: 'Gestión de tienda e inventarios' },
        { name: 'Cajero', description: 'Ventas y cobros en POS' },
      ],
    });
    roles = await prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });
  }

  return roles;
};

const getAllAvailablePermissions = async () => {
  return [
    { code: 'POS_SELL', name: 'Realizar ventas en POS', module: 'POS' },
    { code: 'POS_DISCOUNT', name: 'Aplicar descuentos a ventas', module: 'POS' },
    { code: 'POS_CANCEL', name: 'Cancelar o anular tickets', module: 'POS' },
    { code: 'SHIFT_OPEN_CLOSE', name: 'Abrir y Cerrar turnos de caja', module: 'Caja' },
    { code: 'INVENTORY_VIEW', name: 'Consultar inventario', module: 'Inventarios' },
    { code: 'INVENTORY_MANAGE', name: 'Crear/Editar productos y stock', module: 'Inventarios' },
    { code: 'SETTINGS_MANAGE', name: 'Acceso a Configuración', module: 'Configuración' },
  ];
};

const updateRolePermissions = async (roleId, data) => {
  // Como 'Role' en el esquema prisma solo tiene 'name' y 'description',
  // actualizamos lo que el esquema sí soporta:
  return await prisma.role.update({
    where: { id: roleId },
    data: {
      description: data.description,
    },
  });
};

// ==========================================
// 5. 💳 MÉTODOS DE PAGO Y COMISIONES
// ==========================================

const getPaymentMethods = async () => {
  // Al ser 'PaymentMethod' un Enum en Prisma, devolvemos la lista predefinida:
  return [
    { code: 'EFECTIVO', name: 'Efectivo', enabled: true },
    { code: 'TARJETA', name: 'Tarjeta Débito/Crédito', enabled: true },
    { code: 'TRANSFERENCIA', name: 'Transferencia Bancaria', enabled: true },
    { code: 'MIXTO', name: 'Pago Mixto', enabled: true },
  ];
};

const updatePaymentMethod = async (methodId, data) => {
  // Retorno dummy para cumplir con la API sin romper la BD
  return { id: methodId, ...data };
};

module.exports = {
  getCompanyConfig,
  updateCompanyConfig,
  getAllStores,
  createStore,
  updateStore,
  updateStoreStatus,
  createRegister,
  getAllUsers,
  createUser,
  updateUserPassword,
  updateUserStatus,
  getActiveShiftSessions,
  getAllRolesWithPermissions,
  getAllAvailablePermissions,
  updateRolePermissions,
  getPaymentMethods,
  updatePaymentMethod,
};