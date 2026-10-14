const db = require('../config/database');
const { catat } = require('../utils/activityLog');

exports.index = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('fines').join('users', 'fines.user_id', 'users.id')
      .join('loans', 'fines.loan_id', 'loans.id')
      .join('books', 'loans.book_id', 'books.id')
      .select('fines.*', 'users.name as user_name', 'users.no_kartu_anggota', 'books.judul as book_judul', 'loans.tanggal_kembali');

    if (status) query = query.where('fines.status_bayar', status);
    if (search) query = query.where('users.name', 'like', `%${search}%`);

    const totalQ = query.clone().clearSelect().clearOrder().count('fines.id as total').first();
    const total = (await totalQ).total;
    const fines = await query.orderBy('fines.created_at', 'desc').limit(limit).offset(offset);

    const belumBayar = await db('fines').where('status_bayar', 'belum_bayar').sum('jumlah_denda as total').first();
    const sudahBayar = await db('fines').where('status_bayar', 'sudah_bayar').sum('jumlah_denda as total').first();

    res.json({
      success: true, data: fines,
      summary: { total_belum: Number(belumBayar.total || 0), total_sudah: Number(sudahBayar.total || 0) },
      pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

exports.bayar = async (req, res, next) => {
  try {
    const fine = await db('fines').where({ id: req.params.id }).first();
    if (!fine) return res.status(404).json({ success: false, message: 'Denda tidak ditemukan.' });
    if (fine.status_bayar === 'sudah_bayar') return res.status(400).json({ success: false, message: 'Denda sudah lunas.' });

    await db('fines').where({ id: req.params.id }).update({
      status_bayar: 'sudah_bayar', tanggal_bayar: new Date(), updated_at: new Date(),
    });
    await catat(req.user.id, 'bayar_denda', `Konfirmasi bayar denda #${fine.id}`, req.ip);
    res.json({ success: true, message: 'Denda ditandai lunas.' });
  } catch (err) { next(err); }
};