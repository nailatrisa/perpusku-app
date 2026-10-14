const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET belum dikonfigurasi.');
  }

  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.', data: null });
    }

    const user = await db('users').where({ email }).first();
    if (!user || user.status === 'nonaktif' || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.', data: null });
    }

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: { user: publicUser(user), token: createToken(user) },
    });
  } catch (error) {
    return next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const confirmation = String(req.body.password_confirmation || '');
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.', data: null });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid.', data: null });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.', data: null });
    }
    if (confirmation && password !== confirmation) {
      return res.status(400).json({ success: false, message: 'Konfirmasi password tidak cocok.', data: null });
    }
    if (await db('users').where({ email }).first()) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.', data: null });
    }

    const [id] = await db('users').insert({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: 'masyarakat',
      nik: String(req.body.nik || '').trim() || null,
      no_telepon: String(req.body.no_telepon || '').trim() || null,
      alamat: String(req.body.alamat || '').trim() || null,
      no_kartu_anggota: `PK-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      status: 'aktif',
      created_at: new Date(),
      updated_at: new Date(),
    });
    const user = await db('users').where({ id }).first();

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      data: { user: publicUser(user), token: createToken(user) },
    });
  } catch (error) {
    return next(error);
  }
};

exports.me = (req, res) => res.json({
  success: true,
  message: 'Data pengguna berhasil dimuat.',
  data: { user: publicUser(req.user) },
});

exports.logout = (req, res) => res.json({
  success: true,
  message: 'Logout berhasil.',
  data: null,
});
