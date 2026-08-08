const bcrypt = require('bcryptjs');
const settingsRepository = require('../repositories/settings.repository');

// ==========================================
// 1. 🏢 EMPRESA, BRANDING Y TICKETS
// ==========================================

const getCompanySettings = async (req, res) => {
  try {
    const config = await settingsRepository.getCompanyConfig();
    if (!config) {
      return res.status(404).json({ message: 'No se encontró la configuración de la empresa.' });
    }
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener la configuración', error: error.message });
  }
};

const updateCompanySettings = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Recibe todos los campos requeridos para branding, fiscal, redes y tickets
    const updated = await settingsRepository.updateCompanyConfig(companyId, req.body);
    return res.json({ message: 'Configuración de empresa actualizada correctamente', data: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar la empresa', error: error.message });
  }
};

// ==========================================
// 2. 🏪 GESTIÓN DE SUCURSALES Y CAJAS
// ==========================================

const getStores = async (req, res) => {
  try {
    const stores = await settingsRepository.getAllStores();
    return res.json(stores);
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar sucursales', error: error.message });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, address, phone, ticketFooter, companyId } = req.body;
    if (!name || !companyId) {
      return res.status(400).json({ message: 'El nombre y la empresa son obligatorios.' });
    }

    const newStore = await settingsRepository.createStore({ name, address, phone, ticketFooter, companyId });
    return res.status(201).json({ message: 'Sucursal creada exitosamente', store: newStore });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la sucursal', error: error.message });
  }
};

const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const updatedStore = await settingsRepository.updateStore(storeId, req.body);
    return res.json({ message: 'Sucursal actualizada', store: updatedStore });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar la sucursal', error: error.message });
  }
};

const toggleStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { active } = req.body;
    const updatedStore = await settingsRepository.updateStoreStatus(storeId, active);
    return res.json({ message: 'Estado de sucursal actualizado', store: updatedStore });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar estado de la sucursal', error: error.message });
  }
};

// --- Gestión de Cajas Registradoras por Sucursal ---
const addRegisterToStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre de la caja es obligatorio.' });
    }

    const newRegister = await settingsRepository.createRegister({ storeId, name, code });
    return res.status(201).json({ message: 'Caja registrada con éxito', register: newRegister });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la caja', error: error.message });
  }
};

// ==========================================
// 3. 👥 USUARIOS Y CUENTAS DE PERSONAL
// ==========================================

const getUsers = async (req, res) => {
  try {
    const users = await settingsRepository.getAllUsers();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

const createNewUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, roleId, stores } = req.body;

    if (!firstName || !lastName || !email || !password || !roleId) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await settingsRepository.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roleId,
      stores: stores || [],
    });

    return res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await settingsRepository.updateUserPassword(userId, hashedPassword);

    return res.json({ message: 'Contraseña reseteada exitosamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al resetear la contraseña', error: error.message });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const { active } = req.body;

    const updatedUser = await settingsRepository.updateUserStatus(userId, active);
    return res.json({ message: 'Estado del usuario actualizado', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar estado del usuario', error: error.message });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const sessions = await settingsRepository.getActiveShiftSessions();
    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ message: 'Error al consultar sesiones activas', error: error.message });
  }
};

// ==========================================
// 4. 🔑 ROLES Y MATRIZ DE PERMISOS
// ==========================================

const getRolesAndPermissions = async (req, res) => {
  try {
    const roles = await settingsRepository.getAllRolesWithPermissions();
    const allPermissions = await settingsRepository.getAllAvailablePermissions();
    return res.json({ roles, availablePermissions: allPermissions });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener roles y permisos', error: error.message });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions, requiresApprovalForDiscount, requiresApprovalForCancel } = req.body;

    const updatedRole = await settingsRepository.updateRolePermissions(roleId, {
      permissions,
      requiresApprovalForDiscount,
      requiresApprovalForCancel,
    });

    return res.json({ message: 'Permisos del rol actualizados correctamente', role: updatedRole });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar permisos', error: error.message });
  }
};

// ==========================================
// 5. 💳 MÉTODOS DE PAGO Y COMISIONES
// ==========================================

const getPaymentMethods = async (req, res) => {
  try {
    const methods = await settingsRepository.getPaymentMethods();
    return res.json(methods);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener métodos de pago', error: error.message });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const { enabled, cardCommissionPercentage, applyCommissionToCustomer } = req.body;

    const updatedMethod = await settingsRepository.updatePaymentMethod(methodId, {
      enabled,
      cardCommissionPercentage,
      applyCommissionToCustomer,
    });

    return res.json({ message: 'Método de pago actualizado', data: updatedMethod });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar método de pago', error: error.message });
  }
};

module.exports = {
  // 1. Empresa y Ticket
  getCompanySettings,
  updateCompanySettings,
  // 2. Sucursales y Cajas
  getStores,
  createStore,
  updateStore,
  toggleStoreStatus,
  addRegisterToStore,
  // 3. Usuarios
  getUsers,
  createNewUser,
  resetUserPassword,
  toggleUserActive,
  getActiveSessions,
  // 4. Roles y Permisos
  getRolesAndPermissions,
  updateRolePermissions,
  // 5. Métodos de Pago
  getPaymentMethods,
  updatePaymentMethod,
};