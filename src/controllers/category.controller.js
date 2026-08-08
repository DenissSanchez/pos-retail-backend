const service = require("../services/category.service");

const getAll = async (req, res) => {
  try {
    const categories = await service.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las categorías.",
    });
  }
};

const create = async (req, res) => {
  try {
    const category = await service.create(req.body);

    res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una categoría con ese nombre.",
      });
    }

    res.status(500).json({
      message: "Error al crear la categoría.",
    });
  }
};

const update = async (req, res) => {
  try {
    const category = await service.update(req.params.id, req.body);

    res.json(category);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Categoría no encontrada.",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una categoría con ese nombre.",
      });
    }

    res.status(500).json({
      message: "Error al actualizar la categoría.",
    });
  }
};

const remove = async (req, res) => {
  try {
    await service.remove(req.params.id);

    res.json({
      message: "Categoría eliminada correctamente.",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Categoría no encontrada.",
      });
    }

    res.status(500).json({
      message: "Error al eliminar la categoría.",
    });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
};