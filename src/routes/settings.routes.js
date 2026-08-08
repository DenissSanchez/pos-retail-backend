const { Router } = require('express');
const router = Router();
const settingsController = require('../controllers/settings.controller');
const { verifyAdmin } = require('../middlewares/role.middleware');

router.use(verifyAdmin);
// ==========================================
// 1. 🏢 EMPRESA, BRANDING Y TICKETS
// ==========================================
router.get('/company', settingsController.getCompanySettings);
router.put('/company/:companyId', settingsController.updateCompanySettings);

// ==========================================
// 2. 🏪 GESTIÓN DE SUCURSALES Y CAJAS
// ==========================================
router.get('/stores', settingsController.getStores);
router.post('/stores', settingsController.createStore);
router.put('/stores/:storeId', settingsController.updateStore);
router.patch('/stores/:storeId/status', settingsController.toggleStoreStatus);

// Cajas registradoras por sucursal
router.post('/stores/:storeId/registers', settingsController.addRegisterToStore);

// ==========================================
// 3. 👥 USUARIOS Y CUENTAS DE PERSONAL
// ==========================================
router.get('/users', settingsController.getUsers);
router.post('/users', settingsController.createNewUser);
router.patch('/users/:userId/status', settingsController.toggleUserActive);
router.patch('/users/:userId/reset-password', settingsController.resetUserPassword);

// Sesiones / Turnos de caja activos actualmente
router.get('/users/active-sessions', settingsController.getActiveSessions);

// ==========================================
// 4. 🔑 ROLES Y MATRIZ DE PERMISOS
// ==========================================
router.get('/roles', settingsController.getRolesAndPermissions);
router.put('/roles/:roleId/permissions', settingsController.updateRolePermissions);

// ==========================================
// 5. 💳 MÉTODOS DE PAGO Y COMISIONES
// ==========================================
router.get('/payment-methods', settingsController.getPaymentMethods);
router.put('/payment-methods/:methodId', settingsController.updatePaymentMethod);

module.exports = router;