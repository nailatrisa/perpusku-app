const db = require('../config/database');
const { hitungDenda } = require('../utils/helpers');

exports.admin = async (req, res, next) => {
  try {
    const total_buku = (await db('books').count('id as c').first()).c;
    const total_anggota = (await db('users').where('role', 'masyarakat').count('id as c').first()).c;
    const sedang_dipinjam = (await db('loans').where('status', 'dipinjam').count('id as c').first()).c;
    const total_denda = (await db('loans').sum('denda as s').first()).s || 0;

    // Chart 7 hari terakhir
    const labels = [], data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const tgl = d.toISOString().slice(0, 10);
      labels.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
      const c = (await db('loans').whereRaw('DATE(created_at) = ?', [tgl]).count('id as c').first()).c;
      data.push(c);
    }

    const stok_menipis = await db('books').where('stok_tersedia', '<', 3).orderBy('stok_tersedia').limit(5);
    const recent_loans = await db('loans').join('users', 'loans.user_id', 'users.id').join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'users.name as user_name', 'books.judul as book_judul').orderBy('loans.created_at', 'desc').limit(5);
    const top_books = await db('books')
      .select('books.*')
      .select(db.raw('(SELECT COUNT(*) FROM loans WHERE loans.book_id = books.id) as loans_count'))
      .orderBy('loans_count', 'desc').limit(5);

    res.json({ success: true, data: { stats: { total_buku, total_anggota, sedang_dipinjam, total_denda }, chart: { labels, data }, stok_menipis, recent_loans, top_books } });
  } catch (err) { next(err); }
};

exports.pustakawan = async (req, res, next) => {
  try {
    const total_buku = (await db('books').count('id as c').first()).c;
    const sedang_dipinjam = (await db('loans').where('status', 'dipinjam').count('id as c').first()).c;
    const terlambat = (await db('loans').where('status', 'dipinjam').whereRaw('tanggal_jatuh_tempo < CURDATE()').count('id as c').first()).c;
    const hari_ini = (await db('loans').whereRaw('DATE(created_at) = CURDATE()').count('id as c').first()).c;

    const labels = [], data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const tgl = d.toISOString().slice(0, 10);
      labels.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
      data.push((await db('loans').whereRaw('DATE(created_at) = ?', [tgl]).count('id as c').first()).c);
    }

    const terlambat_list = await db('loans').join('users', 'loans.user_id', 'users.id').join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'users.name as user_name', 'users.no_kartu_anggota', 'books.judul as book_judul')
      .where('loans.status', 'dipinjam').whereRaw('loans.tanggal_jatuh_tempo < CURDATE()')
      .orderBy('loans.tanggal_jatuh_tempo').limit(10);

    res.json({ success: true, data: { stats: { total_buku, sedang_dipinjam, terlambat, hari_ini }, chart: { labels, data }, terlambat_list } });
  } catch (err) { next(err); }
};

exports.user = async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    delete user.password;

    const sedang_dipinjam = (await db('loans').where({ user_id: user.id, status: 'dipinjam' }).count('id as c').first()).c;
    const total_pinjam = (await db('loans').where({ user_id: user.id }).count('id as c').first()).c;

    const dendaRow = await db('loans').where({ user_id: user.id, status: 'dipinjam' }).whereRaw('tanggal_jatuh_tempo < CURDATE()').sum('denda as s').first();
    const denda_aktif = dendaRow.s || 0;

    const active_loans = await db('loans').join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'books.judul', 'books.penulis', 'books.cover').where('loans.user_id', user.id).where('loans.status', 'dipinjam')
      .orderBy('loans.tanggal_jatuh_tempo');

    const rekomendasi = await db('books').join('categories', 'books.category_id', 'categories.id')
      .select('books.*', 'categories.nama_kategori as kategori').where('books.stok_tersedia', '>', 0).orderByRaw('RAND()').limit(6);

    res.json({ success: true, data: { user, stats: { sedang_dipinjam, total_pinjam, denda_aktif }, active_loans, rekomendasi } });
  } catch (err) { next(err); }
};