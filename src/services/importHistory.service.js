const repository = require("../repositories/importHistory.repository");

const saveImportHistory = async ({
  fileName,
  filePath,
  fileSize,
  mimeType,
  summary,
  rows,
  durationMs
}) => {

  const history = await repository.createImport({
    fileName,
    filePath: filePath || null,
    fileSize: fileSize ? parseInt(fileSize, 10) : null,
    mimeType: mimeType || null,

    totalRows: summary.totalRows,
    importedRows: summary.totalRows - summary.errors,
    newProducts: summary.newProducts,
    newVariants: summary.newVariants,
    updatedRows: summary.updates,
    errorRows: summary.errors,
    durationMs,

    status: summary.errors > 0
      ? "COMPLETADA CON ERRORES"
      : "COMPLETADA"
  });

  if (rows && rows.length > 0) {
    await repository.createDetails(
      rows.map((row, index) => ({
        importId: history.id,
        rowNumber: index + 1,
        product: row.Producto ?? null,
        brand: row.Marca ?? null,
        category: row.Categoria ?? null,
        color: row.Color ?? null,
        size: row.Talla ? String(row.Talla) : null,
        sku: row.sku ?? null,
        status: row.status,
        message: row.message ?? null
      }))
    );
  }

  return history;
};

const getHistory = () => {
  return repository.getHistory();
};

const getById = (id) => {
  return repository.getById(id);
};
const getFileById = (id) => {

    return repository.getFileById(id);

};

const deleteImport = (id) => {

    return repository.deleteImport(id);

};

module.exports = {
  saveImportHistory,
  getHistory,
  getById,
  getFileById,
  deleteImport
};