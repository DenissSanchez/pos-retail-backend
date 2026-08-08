// C:\Dev\PosRetail\backend\src\controllers\sale.controller.js

const saleService = require("../services/sale.service");

const searchProduct = async (req, res) => {
  try {
    const { code, storeId } = req.query;
    const product = await saleService.findProductByCode(code, storeId);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message || "Error al buscar producto"
    });
  }
};

const createSale = async (req, res) => {
  try {
    // 1. Extraemos los campos del body (incluyendo los nuevos datos de pago mixto y descuentos)
    const { 
      sessionId, 
      items, 
      paymentMethod, 
      payments, 
      globalDiscount, 
      reference 
    } = req.body;

    // 2. Normalizamos los valores recibidos
    const normalizedMethod = paymentMethod ? String(paymentMethod).trim().toUpperCase() : "";
    const cleanReference = reference ? String(reference).trim() : "";

    // 3. 🔒 Validación de Folio/Referencia
    // Si es TARJETA, TRANSFERENCIA o si es MIXTO y se ingresó dinero en tarjeta/transferencia
    const hasCardOrTransferInMixed = normalizedMethod === "MIXTO" && 
      (Number(payments?.card || 0) > 0 || Number(payments?.transfer || 0) > 0);

    if (["TARJETA", "TRANSFERENCIA"].includes(normalizedMethod) || hasCardOrTransferInMixed) {
      if (!cleanReference) {
        return res.status(400).json({
          success: false,
          message: `El número de folio/referencia es obligatorio cuando se paga con tarjeta o transferencia.`
        });
      }

      const is12Digits = /^\d{12}$/.test(cleanReference);
      if (!is12Digits) {
        return res.status(400).json({
          success: false,
          message: "El folio o número de referencia debe contener exactamente 12 dígitos numéricos."
        });
      }
    }

    // 4. Enviamos los datos completos al servicio
    const sale = await saleService.createSale({
      sessionId,
      items,
      paymentMethod: normalizedMethod,
      payments, // { cash, card, transfer }
      globalDiscount,
      reference: cleanReference || null
    });

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error("Error en venta:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error al procesar la venta"
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await saleService.getDashboardStats();
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al consultar las ventas del dashboard"
    });
  }
};

module.exports = {
  searchProduct,
  createSale,
  getDashboardStats
};