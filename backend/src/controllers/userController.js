const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateQrCode, generateNoKartu } = require('../utils/helpers');

exports.index = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('users').select('id', 'name', 'email', 'role', 'nik', 'no_telepon', 'alamat', 'no_kartu_anggota', 'qr_code', 'status', 'created_at');
    if (search) query = query.where(function () { this.where('name', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`); });
    if (role) query = query.where({ role });

    const totalQ = query.clone().clearSelect().count('id as total').first();
    const total = (await totalQ).total;
    const users = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

    res.json({ success: true, data: users, pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.show = async (req, res, next) => {
  try {
    const user = await db('users')
      .select('id', 'name', 'email', 'role', 'nik', 'no_telepon', 'alamat', 'no_kartu_anggota', 'qr_code', 'status', 'created_at')
      .where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.store = async (req, res, next) => {
  try {
    const { name, email, role, nik, no_telepon, alamat, password } = req.body;
    const existing = await db('users').where({ email }).first();
    if (existing) return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });

    const hash = await bcrypt.hash(password || 'password', 10);
    const data = { name, email, role, nik, no_telepon, alamat, password: hash, status: 'aktif' };

    if (['masyarakat', 'pustakawan'].includes(role)) {
      data.no_kartu_anggota = generateNoKartu();
      data.qr_code = generateQrCode('USR');
    }

    const [id] = await db('users').insert(data);
    const user = await db('users').where({ id }).first();
    delete user.password;
    res.status(201).json({ success: true, message: 'User ditambahkan.', data: user });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    delete data.password;

    if (req.body.password) data.password = await bcrypt.hash(req.body.password, 10);

    await db('users').where({ id }).update({ ...data, updated_at: new Date() });
    const user = await db('users').where({ id }).first();
    delete user.password;
    res.json({ success: true, message: 'User diupdate.', data: user });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri.' });
    }
    const active = await db('loans').where({ user_id: id, status: 'dipinjam' }).count('id as c').first();
    if (active.c > 0) return res.status(400).json({ success: false, message: 'User masih punya pinjaman aktif.' });

    await db('users').where({ id }).del();
    res.json({ success: true, message: 'User dihapus.' });
  } catch (err) { next(err); }
};