const jwt = require('jsonwebtoken');
const db = require('../config/database');

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak tersedia.', data: null });
  }

  let decoded;
  try {
    decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: expired ? 'Token sudah kadaluarsa.' : 'Token tidak valid.',
      data: null,
    });
  }

  try {
    const user = await db('users').where({ id: decoded.id }).first();
    if (!user || user.status === 'nonaktif') {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan atau tidak aktif.', data: null });
    }

    delete user.password;
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { authenticate };