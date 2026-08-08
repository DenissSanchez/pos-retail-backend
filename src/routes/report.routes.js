const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyAdmin } = require("../middlewares/role.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/sales
router.get("/sales", verifyAdmin, async (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.query;

    const whereClause = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        gte: start,
        lte: end,
      };
    }

    if (storeId && storeId !== "undefined" && storeId !== "") {
      whereClause.session = {
        storeId: storeId,
      };
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        session: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(sales);
  } catch (error) {
    console.error("Error al obtener reporte de ventas:", error);
    res.status(500).json({ message: "Error al obtener reporte de ventas", details: error.message });
  }
});

module.exports = router;