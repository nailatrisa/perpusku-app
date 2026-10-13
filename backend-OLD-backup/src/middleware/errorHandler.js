function notFound(req, res) {
  return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.', data: null });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);
  return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.', data: null });
}

module.exports = { notFound, errorHandler };