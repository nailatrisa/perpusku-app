const db = require('../config/database');
const { generateKodePinjam, hitungDenda } = require('../utils/helpers');
const { catat } = require('../utils/activityLog');

exports.scanUser = async (req, res, next) => {
  try {
    const { qr_code } = req.body;
    const user = await db('users').where(function () {
      this.where('qr_code', qr_code).orWhere('no_kartu_anggota', qr_code).orWhere('nik', qr_code);
    }).first();
    if (!user) return res.status(404).json({ success: false, message: 'Kartu anggota tidak valid.' });
    if (user.status !== 'aktif') return res.status(403).json({ success: false, message: 'Akun tidak aktif.' });
    const activeLoans = await db('loans').join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'books.judul').where('loans.user_id', user.id).where('loans.status', 'dipinjam');
    const totalDenda = activeLoans.reduce((sum, l) => sum + hitungDenda(l.tanggal_jatuh_tempo), 0);
    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, no_kartu: user.no_kartu_anggota, email: user.email, role: user.role },
        active_loans: activeLoans.map((l) => ({
          id: l.id, kode: l.kode_pinjam, judul: l.judul,
          jatuh_tempo: l.tanggal_jatuh_tempo,
          terlambat: new Date() > new Date(l.tanggal_jatuh_tempo),
          denda: hitungDenda(l.tanggal_jatuh_tempo),
          pernah_diperpanjang: !!l.pernah_diperpanjang,
        })),
        total_denda: totalDenda,
      },
    });
  } catch (err) { next(err); }
};

exports.scanBook = async (req, res, next) => {
  try {
    const { qr_code } = req.body;
    const book = await db('books').join('categories', 'books.category_id', 'categories.id')
      .select('books.*', 'categories.nama_kategori as kategori').where('books.qr_code', qr_code).first();
    if (!book) return res.status(404).json({ success: false, message: 'QR buku tidak valid.' });
    if (book.stok_tersedia <= 0) return res.status(400).json({ success: false, message: 'Stok buku habis.' });
    res.json({ success: true, data: { book: { id: book.id, judul: book.judul, penulis: book.penulis, kategori: book.kategori, stok: book.stok_tersedia, cover: book.cover } } });
  } catch (err) { next(err); }
};

exports.store = async (req, res, next) => {
  try {
    const { user_id, book_id, durasi = 7 } = req.body;
    const user = await db('users').where({ id: user_id }).first();
    const book = await db('books').where({ id: book_id }).first();
    if (!user || !book) return res.status(404).json({ success: false, message: 'User atau buku tidak ditemukan.' });
    if (book.stok_tersedia <= 0) return res.status(400).json({ success: false, message: 'Stok habis.' });
    const activeCount = await db('loans').where({ user_id, status: 'dipinjam' }).count('id as c').first();
    if (activeCount.c >= 3) return res.status(400).json({ success: false, message: 'Maksimal 3 buku sedang dipinjam.' });
    const sudahAda = await db('loans').where({ user_id, book_id, status: 'dipinjam' }).first();
    if (sudahAda) return res.status(400).json({ success: false, message: 'Buku ini sedang dipinjam user.' });
    const tglPinjam = new Date();
    const tglJatuhTempo = new Date();
    tglJatuhTempo.setDate(tglJatuhTempo.getDate() + parseInt(durasi));
    await db.transaction(async (trx) => {
      await trx('loans').insert({
        user_id, book_id, kode_pinjam: generateKodePinjam(),
        tanggal_pinjam: tglPinjam, tanggal_jatuh_tempo: tglJatuhTempo,
        status: 'dipinjam', petugas_id: req.user.id,
      });
      await trx('books').where({ id: book_id }).decrement('stok_tersedia', 1);
    });
    await catat(req.user.id, 'pinjam_buku', 'Pinjam: ' + book.judul, req.ip);
    res.json({ success: true, message: 'Peminjaman berhasil diproses.' });
  } catch (err) { next(err); }
};

exports.requestBorrow = async (req, res, next) => {
  try {
    const { book_id } = req.body;
    const book = await db('books').where({ id: book_id }).first();
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
    if (book.stok_tersedia <= 0) return res.status(400).json({ success: false, message: 'Stok habis.' });
    const activeCount = await db('loans').where({ user_id: req.user.id, status: 'dipinjam' }).count('id as c').first();
    if (activeCount.c >= 3) return res.status(400).json({ success: false, message: 'Maksimal 3 buku aktif.' });
    const sudahAda = await db('loans').where({ user_id: req.user.id, book_id, status: 'dipinjam' }).first();
    if (sudahAda) return res.status(400).json({ success: false, message: 'Buku ini sedang Anda pinjam.' });
    const pendingAda = await db('loans').where({ user_id: req.user.id, book_id, status: 'pending' }).first();
    if (pendingAda) return res.status(400).json({ success: false, message: 'Anda sudah mengajukan pinjam buku ini.' });
    const tglPinjam = new Date();
    const tglJatuhTempo = new Date();
    tglJatuhTempo.setDate(tglJatuhTempo.getDate() + 7);
    await db('loans').insert({
      user_id: req.user.id, book_id, kode_pinjam: generateKodePinjam(),
      tanggal_pinjam: tglPinjam, tanggal_jatuh_tempo: tglJatuhTempo,
      status: 'pending', catatan: 'Menunggu persetujuan petugas',
    });
    await catat(req.user.id, 'request_pinjam', 'Request: ' + book.judul, req.ip);
    res.json({ success: true, message: 'Pengajuan dikirim. Tunggu persetujuan petugas.' });
  } catch (err) { next(err); }
};

exports.pendingList = async (req, res, next) => {
  try {
    const loans = await db('loans')
      .join('users', 'loans.user_id', 'users.id')
      .join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'users.name as user_name', 'users.no_kartu_anggota', 'users.email as user_email', 'books.judul as book_judul', 'books.penulis as book_penulis', 'books.cover as book_cover')
      .where('loans.status', 'pending')
      .orderBy('loans.created_at', 'desc');
    res.json({ success: true, data: loans });
  } catch (err) { next(err); }
};

exports.approve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loan = await db('loans').where({ id }).first();
    if (!loan) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    if (loan.status !== 'pending') return res.status(400).json({ success: false, message: 'Hanya pending yang bisa disetujui.' });
    const book = await db('books').where({ id: loan.book_id }).first();
    if (book.stok_tersedia <= 0) return res.status(400).json({ success: false, message: 'Stok buku habis.' });
    await db.transaction(async (trx) => {
      await trx('loans').where({ id }).update({
        status: 'dipinjam', approved_by: req.user.id, approved_at: new Date(),
        petugas_id: req.user.id, catatan: 'Disetujui oleh petugas',
      });
      await trx('books').where({ id: loan.book_id }).decrement('stok_tersedia', 1);
    });
    await catat(req.user.id, 'approve_pinjam', 'Setujui loan #' + id, req.ip);
    res.json({ success: true, message: 'Peminjaman disetujui.' });
  } catch (err) { next(err); }
};

exports.reject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const loan = await db('loans').where({ id }).first();
    if (!loan) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    if (loan.status !== 'pending') return res.status(400).json({ success: false, message: 'Hanya pending yang bisa ditolak.' });
    await db('loans').where({ id }).update({
      status: 'ditolak', rejected_reason: reason || 'Tidak ada alasan',
      approved_by: req.user.id, approved_at: new Date(),
    });
    await catat(req.user.id, 'reject_pinjam', 'Tolak loan #' + id, req.ip);
    res.json({ success: true, message: 'Peminjaman ditolak.' });
  } catch (err) { next(err); }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { loan_id } = req.body;
    const loan = await db('loans').where({ id: loan_id }).first();
    if (!loan) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    if (loan.status === 'dikembalikan') return res.status(400).json({ success: false, message: 'Buku sudah dikembalikan.' });
    if (loan.status === 'pending') return res.status(400).json({ success: false, message: 'Peminjaman belum disetujui.' });
    const denda = hitungDenda(loan.tanggal_jatuh_tempo);
    await db.transaction(async (trx) => {
      await trx('loans').where({ id: loan_id }).update({
        tanggal_kembali: new Date(), status: 'dikembalikan', denda, updated_at: new Date(),
      });
      await trx('books').where({ id: loan.book_id }).increment('stok_tersedia', 1);
      if (denda > 0) {
        await trx('fines').insert({ loan_id, user_id: loan.user_id, jumlah_denda: denda, status_bayar: 'belum_bayar' });
      }
    });
    await catat(req.user.id, 'kembalikan_buku', 'Kembalikan loan #' + loan_id, req.ip);
    res.json({ success: true, message: 'Buku dikembalikan.', data: { denda } });
  } catch (err) { next(err); }
};

exports.perpanjang = async (req, res, next) => {
  try {
    const { loan_id } = req.body;
    const loan = await db('loans').where({ id: loan_id }).first();
    if (!loan) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    if (loan.status !== 'dipinjam') return res.status(400).json({ success: false, message: 'Hanya peminjaman aktif.' });
    if (loan.pernah_diperpanjang) return res.status(400).json({ success: false, message: 'Sudah pernah diperpanjang.' });
    const newDate = new Date(loan.tanggal_jatuh_tempo);
    newDate.setDate(newDate.getDate() + 7);
    await db('loans').where({ id: loan_id }).update({ tanggal_jatuh_tempo: newDate, pernah_diperpanjang: true });
    await catat(req.user.id, 'perpanjang', 'Perpanjang loan #' + loan_id, req.ip);
    res.json({ success: true, message: 'Peminjaman diperpanjang 7 hari.' });
  } catch (err) { next(err); }
};

exports.index = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    let query = db('loans').join('users', 'loans.user_id', 'users.id').join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'users.name as user_name', 'users.no_kartu_anggota', 'books.judul as book_judul');
    if (status) query = query.where('loans.status', status);
    if (search) query = query.where(function () {
      this.where('loans.kode_pinjam', 'like', '%' + search + '%')
        .orWhere('users.name', 'like', '%' + search + '%')
        .orWhere('books.judul', 'like', '%' + search + '%');
    });
    const totalQ = query.clone().clearSelect().clearOrder().count('loans.id as total').first();
    const total = (await totalQ).total;
    const loans = await query.orderBy('loans.created_at', 'desc').limit(limit).offset(offset);
    res.json({ success: true, data: loans, pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.myLoans = async (req, res, next) => {
  try {
    const loans = await db('loans')
      .join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'books.judul', 'books.penulis', 'books.cover')
      .where('loans.user_id', req.user.id)
      .orderBy('loans.created_at', 'desc');

    const DENDA_PER_HARI = 2000;
    const now = new Date();

    // Hitung denda dinamis untuk setiap loan
    const enriched = loans.map((l) => {
      let dendaDisplay = parseFloat(l.denda) || 0;
      let hariTerlambat = 0;

      // Kalau masih dipinjam DAN sudah lewat jatuh tempo → hitung denda
      if (l.status === 'dipinjam' && now > new Date(l.tanggal_jatuh_tempo)) {
        hariTerlambat = Math.ceil((now - new Date(l.tanggal_jatuh_tempo)) / (1000 * 60 * 60 * 24));
        dendaDisplay = hariTerlambat * DENDA_PER_HARI;
      }
      // Kalau sudah dikembalikan dan ada denda yang tercatat
      else if (l.status === 'dikembalikan' && l.denda > 0) {
        dendaDisplay = parseFloat(l.denda);
        hariTerlambat = Math.ceil(dendaDisplay / DENDA_PER_HARI);
      }

      return {
        ...l,
        denda_display: dendaDisplay,
        hari_terlambat: hariTerlambat,
        is_terlambat: hariTerlambat > 0,
        bisa_dikembalikan: l.status === 'dipinjam',
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali, status, catatan } = req.body;
    const loan = await db('loans').where({ id }).first();
    if (!loan) return res.status(404).json({ success: false, message: 'Loan tidak ditemukan.' });
    await db('loans').where({ id }).update({
      tanggal_pinjam: tanggal_pinjam || loan.tanggal_pinjam,
      tanggal_jatuh_tempo: tanggal_jatuh_tempo || loan.tanggal_jatuh_tempo,
      tanggal_kembali: tanggal_kembali || loan.tanggal_kembali,
      status: status || loan.status, catatan: catatan || loan.catatan, updated_at: new Date(),
    });
    await catat(req.user.id, 'edit_loan', 'Edit loan #' + id, req.ip);
    res.json({ success: true, message: 'Peminjaman diupdate.' });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loan = await db('loans').where({ id }).first();
    if (!loan) return res.status(404).json({ success: false, message: 'Loan tidak ditemukan.' });
    if (loan.status === 'dipinjam') {
      await db('books').where({ id: loan.book_id }).increment('stok_tersedia', 1);
    }
    await db('fines').where({ loan_id: id }).del();
    await db('loans').where({ id }).del();
    await catat(req.user.id, 'hapus_loan', 'Hapus loan #' + id, req.ip);
    res.json({ success: true, message: 'Peminjaman dihapus.' });
  } catch (err) { next(err); }
};

exports.returns = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    let query = db('loans').join('users', 'loans.user_id', 'users.id').join('books', 'loans.book_id', 'books.id')
      .select('loans.*', 'users.name as user_name', 'users.no_kartu_anggota', 'books.judul as book_judul')
      .whereIn('loans.status', ['dikembalikan', 'terlambat']);
    if (search) query = query.where(function () {
      this.where('loans.kode_pinjam', 'like', '%' + search + '%')
        .orWhere('users.name', 'like', '%' + search + '%')
        .orWhere('books.judul', 'like', '%' + search + '%');
    });
    const totalQ = query.clone().clearSelect().clearOrder().count('loans.id as total').first();
    const total = (await totalQ).total;
    const loans = await query.orderBy('loans.tanggal_kembali', 'desc').limit(limit).offset(offset);
    res.json({ success: true, data: loans, pagination: { page: +page, limit: +limit, total, total_pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};