const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Helper interno para acumular ventas por método de pago con fallback seguro.
 */
const calculateSalesBreakdown = (sales = []) => {
  let salesCash = 0;
  let salesCard = 0;
  let salesTransfer = 0;
  let salesMixed = 0;

  sales.forEach((sale) => {
    const method = (sale.paymentMethod || "").toUpperCase();
    const total = parseFloat(sale.total || 0);

    const rawCash = parseFloat(sale.paidCash || 0);
    const rawCard = parseFloat(sale.paidCard || 0);
    const rawTransfer = parseFloat(sale.paidTransfer || 0);

    const cashPart =
      rawCash > 0 ? rawCash : method === "EFECTIVO" ? total : 0;
    const cardPart =
      rawCard > 0 ? rawCard : method === "TARJETA" ? total : 0;
    const transferPart =
      rawTransfer > 0 ? rawTransfer : method === "TRANSFERENCIA" ? total : 0;

    salesCash += cashPart;
    salesCard += cardPart;
    salesTransfer += transferPart;

    if (method === "MIXTO") {
      salesMixed += total;
    }
  });

  const totalSales = sales.reduce((acc, sale) => acc + parseFloat(sale.total || 0), 0);

  return {
    salesCash,
    salesCard,
    salesTransfer,
    salesMixed,
    totalSales,
    totalTransactions: sales.length,
  };
};

/**
 * Abre una nueva sesión de caja.
 */
const openSession = async ({ registerId, userId, initialCash }) => {
  // 1. Validar que no haya una caja abierta para este usuario o esta caja
  const activeSession = await prisma.session.findFirst({
    where: {
      registerId,
      isOpen: true,
    },
  });

  if (activeSession) {
    throw new Error("Ya existe una sesión de caja abierta para esta caja.");
  }

  // 2. Crear la nueva sesión
  const session = await prisma.session.create({
    data: {
      registerId,
      userId,
      initialCash,
      isOpen: true,
    },
    include: {
      register: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return session;
};

/**
 * Obtiene la sesión activa actual del usuario o caja.
 */
const getActiveSession = async ({ userId, registerId }) => {
  const whereCondition = { isOpen: true };

  if (registerId) {
    whereCondition.registerId = registerId;
  } else if (userId) {
    whereCondition.userId = userId;
  }

  const session = await prisma.session.findFirst({
    where: whereCondition,
    include: {
      register: {
        include: { store: true },
      },
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return session;
};

/**
 * Calcula el resumen de ventas del turno actual desglosado por método de pago.
 */
const getSessionSummary = async (sessionId) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      sales: true,
    },
  });

  if (!session) {
    throw new Error("No se encontró la sesión de caja especificada.");
  }

  const breakdown = calculateSalesBreakdown(session.sales);
  const initialCash = parseFloat(session.initialCash || 0);

  // El efectivo esperado en el cajón físico es: Fondo Inicial + Todo el efectivo recibido
  const expectedCash = initialCash + breakdown.salesCash;

  return {
    sessionId: session.id,
    openedAt: session.openedAt,
    initialCash,
    salesCash: breakdown.salesCash,
    salesCard: breakdown.salesCard,
    salesTransfer: breakdown.salesTransfer,
    salesMixed: breakdown.salesMixed,
    totalSales: breakdown.totalSales,
    expectedCash,
    totalTransactions: breakdown.totalTransactions,
  };
};

/**
 * Realiza el cierre de la sesión de caja (Arqueo).
 */
const closeSession = async ({ sessionId, finalCash, notes }) => {
  // 1. Obtener los totales actuales del turno
  const summary = await getSessionSummary(sessionId);

  const initialCash = parseFloat(summary.initialCash);
  const salesCash = parseFloat(summary.salesCash);
  const expectedCash = initialCash + salesCash;
  const actualFinalCash = parseFloat(finalCash);

  // Diferencia = Lo que contó el cajero - Lo que debía haber
  const difference = actualFinalCash - expectedCash;

  // 2. Actualizar la sesión marcándola como cerrada
  const closedSession = await prisma.session.update({
    where: { id: sessionId },
    data: {
      closedAt: new Date(),
      finalCash: actualFinalCash,
      expectedCash: expectedCash,
      difference: difference,
      notes: notes || null,
      isOpen: false,
    },
    include: {
      register: true,
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return {
    ...closedSession,
    salesCash: summary.salesCash,
    salesCard: summary.salesCard,
    salesTransfer: summary.salesTransfer,
    salesMixed: summary.salesMixed,
    totalSales: summary.totalSales,
  };
};

/**
 * Consulta el historial de cierres de caja (para Administradores/Reportes).
 */
const getSessionHistory = async ({ storeId, startDate, endDate }) => {
  const whereCondition = { isOpen: false };

  if (storeId) {
    whereCondition.register = { storeId };
  }

  if (startDate || endDate) {
    whereCondition.closedAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereCondition.closedAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.closedAt.lte = end;
    }
  }

  const history = await prisma.session.findMany({
    where: whereCondition,
    include: {
      register: {
        include: { store: true },
      },
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      sales: true,
    },
    orderBy: {
      closedAt: "desc",
    },
  });

  // Mapear cada sesión agregando sus totales desglosados correctamente
  const formattedHistory = history.map((session) => {
    const breakdown = calculateSalesBreakdown(session.sales);

    return {
      ...session,
      salesCash: breakdown.salesCash,
      salesCard: breakdown.salesCard,
      salesTransfer: breakdown.salesTransfer,
      salesMixed: breakdown.salesMixed,
      totalSales: breakdown.totalSales,
      totalTransactions: breakdown.totalTransactions,
    };
  });

  return formattedHistory;
};

module.exports = {
  openSession,
  getActiveSession,
  getSessionSummary,
  closeSession,
  getSessionHistory,
};