const saleRepository = require("../repositories/sale.repository");

const findProductByCode = async (code, storeId) => {
  if (!code) {
    throw new Error("El código de barras o SKU es requerido.");
  }
  if (!storeId) {
    throw new Error("Se requiere el ID de la sucursal para verificar existencias.");
  }

  const cleanCode = String(code).trim();
  const variant = await saleRepository.findVariantForPOS(cleanCode, storeId);

  if (!variant) {
    throw new Error(`Producto no encontrado con el código: ${cleanCode}`);
  }

  const stock = (variant.inventory && variant.inventory.length > 0) 
    ? variant.inventory[0].stock 
    : 0;

  return {
    variantId: variant.id,
    sku: variant.sku,
    barcode: variant.barcode,
    productName: variant.product.name,
    brand: variant.product.brand?.name || null,
    category: variant.product.category?.name || null,
    color: variant.color.name,
    size: variant.size.name,
    price: Number(variant.price),
    stock
  };
};

const createSale = async ({ 
  sessionId, 
  items, 
  paymentMethod, 
  payments = { cash: 0, card: 0, transfer: 0 },
  globalDiscount = 0,
  reference 
}) => {
  if (!sessionId) {
    throw new Error("Se requiere una sesión de caja activa para vender.");
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("El carrito de compra no tiene productos.");
  }
  if (!paymentMethod) {
    throw new Error("Debe seleccionar un método de pago.");
  }

  // 1. Validar que la caja esté abierta
  const activeSession = await saleRepository.findActiveSession(sessionId);
  if (!activeSession) {
    throw new Error("La sesión de caja no existe o ya se encuentra cerrada.");
  }

  const storeId = activeSession.register.storeId;

  // 2. Calcular subtotal acumulado y procesar descuentos por item
  let rawSubtotal = 0;
  const processedItems = items.map((item) => {
    const qty = parseInt(item.quantity, 10);
    const price = parseFloat(item.price);
    const discount = parseFloat(item.discount || 0);

    if (isNaN(qty) || qty <= 0) {
      throw new Error("La cantidad de un producto debe ser un número mayor a 0.");
    }
    if (isNaN(price) || price < 0) {
      throw new Error("El precio de un producto no es válido.");
    }
    if (isNaN(discount) || discount < 0) {
      throw new Error("El descuento de un producto no es válido.");
    }

    const itemSubtotal = (qty * price) - discount;
    rawSubtotal += itemSubtotal;

    return {
      productVariantId: item.variantId || item.productVariantId,
      quantity: qty,
      price,
      discount,
      subtotal: itemSubtotal
    };
  });

  // 3. Aplicar Descuento Global y calcular el Total Final
  const parsedGlobalDiscount = parseFloat(globalDiscount || 0);
  const calculatedTotal = Math.max(0, rawSubtotal - parsedGlobalDiscount);

  // 4. Validar importes pagados según el método de pago
  let paidCash = parseFloat(payments.cash || 0);
  let paidCard = parseFloat(payments.card || 0);
  let paidTransfer = parseFloat(payments.transfer || 0);

  if (paymentMethod === "EFECTIVO") {
    if (paidCash < calculatedTotal) {
      throw new Error("El monto pagado en efectivo es menor al total de la venta.");
    }
  } else if (paymentMethod === "TARJETA") {
    paidCard = calculatedTotal;
  } else if (paymentMethod === "TRANSFERENCIA") {
    paidTransfer = calculatedTotal;
  } else if (paymentMethod === "MIXTO") {
    const totalPaid = paidCash + paidCard + paidTransfer;
    if (totalPaid < calculatedTotal) {
      throw new Error(`El monto total pagado ($${totalPaid}) es menor al total a pagar ($${calculatedTotal}).`);
    }
  }

  const totalReceived = paidCash + paidCard + paidTransfer;
  const changeGiven = totalReceived > calculatedTotal ? totalReceived - calculatedTotal : 0;

  // 5. Procesar Transacción enviando todos los desgloses al repositorio
  const sale = await saleRepository.processSaleTransaction({
    sessionId,
    storeId,
    items: processedItems,
    paymentMethod,
    subtotal: rawSubtotal,
    discount: parsedGlobalDiscount,
    total: calculatedTotal,
    paidCash,
    paidCard,
    paidTransfer,
    changeGiven,
    reference
  });

  return sale;
};

// 📈 Helper interno para mapear ganancia en una venta
const calculateSaleProfit = (sale) => {
  const totalCost = (sale.items || []).reduce((acc, item) => {
    const itemCost = Number(item.variant?.cost || 0);
    return acc + (itemCost * item.quantity);
  }, 0);

  const totalSales = Number(sale.total || 0);
  const profit = totalSales - totalCost;

  return {
    ...sale,
    totalCost,
    profit
  };
};

const getDashboardStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Para la TABLA del dashboard: solo las 10 MÁS RECIENTES de hoy 🚀
  const rawRecentSales = await saleRepository.getSalesByDateRange(startOfDay, endOfDay, 10);
  const recentSales = rawRecentSales.map(calculateSaleProfit);

  // 2. Para la GRÁFICA: Ventas de los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const rawSalesLastWeek = await saleRepository.getSalesByDateRange(sevenDaysAgo, endOfDay);
  const salesLastWeek = rawSalesLastWeek.map(calculateSaleProfit);

  // 3. Calculamos Totales e Ingreso/Ganancia REALES del día 🎯
  const todaySales = salesLastWeek.filter(sale => new Date(sale.createdAt) >= startOfDay);
  const totalSalesCount = todaySales.length; 
  const totalIncome = todaySales.reduce((acc, sale) => acc + Number(sale.total), 0);
  const totalProfit = todaySales.reduce((acc, sale) => acc + sale.profit, 0);

  // 4. Agrupar ventas por día de la semana para la gráfica [Lun, Mar, Mié, Jue, Vie, Sáb, Dom]
  const weeklySales = [0, 0, 0, 0, 0, 0, 0];
  const dayMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

  salesLastWeek.forEach((sale) => {
    const dayOfWeek = new Date(sale.createdAt).getDay();
    const index = dayMap[dayOfWeek];
    if (index !== undefined) {
      weeklySales[index] += Number(sale.total);
    }
  });

  return {
    summary: {
      totalSalesCount,
      totalIncome,
      totalProfit,
      weeklySales
    },
    sales: recentSales
  };
};

module.exports = {
  findProductByCode,
  createSale,
  getDashboardStats
};