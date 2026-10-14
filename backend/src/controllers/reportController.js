const db = require('../config/database');

// ============ LAPORAN PEMINJAMAN ============
exports.loans = async (req, res, next) => {
  try {
    const { dari, sampai, status } = req.query;

    let query = db('loans')
      .join('users', 'loans.user_id', 'users.id')
      .join('books', 'loans.book_id', 'books.id')
      .select(
        'loans.*',
        'users.name as user_name',
        'users.no_kartu_anggota',
        'books.judul as book_judul',
        'books.penulis as book_penulis'
      );

    if (dari) query = query.where('loans.tanggal_pinjam', '>=', dari);
    if (sampai) query = query.where('loans.tanggal_pinjam', '<=', sampai);
    if (status) query = query.where('loans.status', status);

    const loans = await query.orderBy('loans.tanggal_pinjam', 'desc');

    const total = loans.length;
    const total_denda = loans.reduce((sum, l) => sum + (parseFloat(l.denda) || 0), 0);

    res.json({
      success: true,
      data: loans,
      summary: { total, total_denda },
    });
  } catch (err) { next(err); }
};

// ============ LAPORAN BUKU ============
exports.books = async (req, res, next) => {
  try {
    const books = await db('books')
      .join('categories', 'books.category_id', 'categories.id')
      .select('books.*', 'categories.nama_kategori as kategori')
      .orderBy('books.judul');

    const total = books.length;
    const total_stok = books.reduce((sum, b) => sum + (b.stok_total || 0), 0);
    const total_tersedia = books.reduce((sum, b) => sum + (b.stok_tersedia || 0), 0);

    res.json({
      success: true,
      data: books,
      summary: { total, total_stok, total_tersedia },
    });
  } catch (err) { next(err); }
};

// ============ LAPORAN ANGGOTA ============
exports.users = async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = db('users')
      .select('id', 'name', 'email', 'role', 'nik', 'no_kartu_anggota', 'no_telepon', 'alamat', 'status', 'created_at')
      .orderBy('role')
      .orderBy('name');

    if (role) query = query.where('role', role);

    const users = await query;

    const summary = {
      total: users.length,
      admin: users.filter((u) => u.role === 'admin').length,
      pustakawan: users.filter((u) => u.role === 'pustakawan').length,
      masyarakat: users.filter((u) => u.role === 'masyarakat').length,
    };

    res.json({ success: true, data: users, summary });
  } catch (err) { next(err); }
};

// ============ LAPORAN LOG AKTIVITAS ============
exports.activityLogs = async (req, res, next) => {
  try {
    const { user_id, aktivitas, dari, sampai, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('activity_logs')
      .leftJoin('users', 'activity_logs.user_id', 'users.id')
      .select(
        'activity_logs.*',
        'users.name as user_name',
        'users.role as user_role'
      );

    if (user_id) query = query.where('activity_logs.user_id', user_id);
    if (aktivitas) query = query.where('activity_logs.aktivitas', aktivitas);
    if (dari) query = query.whereRaw('DATE(activity_logs.created_at) >= ?', [dari]);
    if (sampai) query = query.whereRaw('DATE(activity_logs.created_at) <= ?', [sampai]);

    const totalQ = query.clone().clearSelect().clearOrder().count('activity_logs.id as total').first();
    const total = (await totalQ).total;

    const logs = await query.orderBy('activity_logs.created_at', 'desc').limit(limit).offset(offset);
    const aktivitasList = await db('activity_logs').distinct().pluck('aktivitas');

    res.json({
      success: true,
      data: logs,
      aktivitas_list: aktivitasList,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) { next(err); }
};