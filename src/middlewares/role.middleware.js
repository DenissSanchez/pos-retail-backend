// backend/src/middlewares/role.middleware.js

/**
 * Middleware para restringir endpoints solo a administradores.
 * Espera recibir el rol del usuario en la cabecera 'x-user-role'.
 */
const verifyAdmin = (req, res, next) => {
  // Leemos el rol desde los headers enviándolos desde el cliente
  const userRole = req.headers["x-user-role"] || req.headers["role"];

  if (!userRole) {
    return res.status(401).json({
      message: "No se proporcionó información de rol en la petición.",
    });
  }

  const normalizedRole = userRole.toString().toUpperCase();

  // Si no es ADMIN, bloqueamos el acceso
  if (normalizedRole !== "ADMIN" && normalizedRole !== "ADMINISTRADOR") {
    return res.status(403).json({
      message: "Acceso denegado: Se requieren permisos de Administrador.",
    });
  }

  next();
};

module.exports = { verifyAdmin };