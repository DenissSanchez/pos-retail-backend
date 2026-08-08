const express = require("express");
const cors = require("cors"); // 1. Importa CORS
const path = require("path");

const app = express();

// 2. CONFIGURA CORS ANTES DE LAS RUTAS
// Esto le da permiso explícito a tu frontend (puerto 5173) para conectarse
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // 👈 ¡Agregado PATCH!
  credentials: true
}));

// 3. Permite leer JSON en el body
app.use(express.json());

// Permite acceder a los archivos subidos
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// Tus rutas existentes
const productRoutes = require("./routes/product.routes");
const importRoutes = require("./routes/import.routes");
const catalogRoutes = require("./routes/catalog.routes");
const colorRoutes = require("./routes/color.routes");
const sizeRoutes = require("./routes/size.routes");
const storeRoutes = require("./routes/store.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const importHistoryRoutes = require(
  "./routes/importHistory.routes"
);
const saleRoutes = require('./routes/sale.routes');
const reportRoutes = require('./routes/report.routes');
const settingsRoutes = require('./routes/settings.routes');
const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes'); // 👈 Importas session.routes

app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes); // 👈 Registras el prefijo /api/sessions
// Registro de rutas en Express
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/import", importRoutes);
app.use("/api/import-history", importHistoryRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/sizes", sizeRoutes);

module.exports = app;