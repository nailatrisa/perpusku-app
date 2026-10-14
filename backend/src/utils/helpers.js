const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateQrCode = (prefix = 'USR') => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const generateNoKartu = () => {
  const tahun = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9999) + 1;
  return `PKU-${tahun}-${String(random).padStart(4, '0')}`;
};

const generateKodePinjam = () => {
  const tgl = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9999) + 1;
  return `PJM-${tgl}-${String(random).padStart(4, '0')}`;
};

const hitungDenda = (tanggalJatuhTempo) => {
  const DENDA_PER_HARI = 2000;
  const now = new Date();
  const jatuhTempo = new Date(tanggalJatuhTempo);
  if (now <= jatuhTempo) return 0;
  const hari = Math.ceil((now - jatuhTempo) / (1000 * 60 * 60 * 24));
  return hari * DENDA_PER_HARI;
};

const formatResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({ success, message, data });
};

module.exports = {
  generateToken,
  generateQrCode,
  generateNoKartu,
  generateKodePinjam,
  hitungDenda,
  formatResponse,
};