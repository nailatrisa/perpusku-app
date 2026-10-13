const db = require('../config/database');
const { catat } = require('../utils/activityLog');

function paginationFrom(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 15));
  return { page, limit, offset: (page - 1) * limit };
}

exports.pendingList = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginationFrom(req.query);
    const base = db('loans')
      .join('users', 'loans.user_id', 'users.id')
      .join('books', 'loans.book_id', 'books.id')
      .where('loans.status', 'pending');
    const [{ total }] = await base.clone().count({ total: 'loans.id' });
    const loans = await base.clone()
      .select(
        'loans.*',
        'users.name as user_name',
        'users.no_kartu_anggota',
        'users.email as user_email',
        'books.judul as book_judul',
        'books.penulis as book_penulis',
        'books.cover as book_cover',
      )
      .orderBy('loans.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return res.json({
      success: true,
      message: 'Daftar pengajuan berhasil dimuat.',
      data: loans,
      pagination: { page, limit, total: Number(total), total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const result = await db.transaction(async (trx) => {
      const loan = await trx('loans').where({ id: req.params.id }).forUpdate().first();
      if (!loan) return { status: 404, message: 'Pengajuan tidak ditemukan.' };
      if (loan.status !== 'pending') return { status: 409, message: 'Pengajuan ini sudah diproses.' };

      const book = await trx('books').where({ id: loan.book_id }).forUpdate().first();
      if (!book || Number(book.stok_tersedia) < 1) {
        return { status: 409, message: 'Stok buku tidak tersedia.' };
      }

      const affected = await trx('books')
        .where('id', loan.book_id)
        .where('stok_tersedia', '>', 0)
        .decrement('stok_tersedia', 1);
      if (!affected) return { status: 409, message: 'Stok buku tidak tersedia.' };

      await trx('loans').where({ id: loan.id, status: 'pending' }).update({
        status: 'dipinjam',
        approved_by: req.user.id,
        approved_at: new Date(),
        petugas_id: req.user.id,
        catatan: 'Disetujui oleh petugas',
        updated_at: new Date(),
      });
      return { status: 200, loanId: loan.id, bookTitle: book.judul };
    });

    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message, data: null });
    }

    await catat(req.user.id, 'approve_pinjam', `Setujui loan #${result.loanId}: ${result.bookTitle}`, req.ip);
    return res.json({ success: true, message: 'Peminjaman disetujui.', data: { id: result.loanId, status: 'dipinjam' } });
  } catch (error) {
    return next(error);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const reason = String(req.body.reason || '').trim();
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Alasan penolakan wajib diisi.', data: null });
    }

    const result = await db.transaction(async (trx) => {
      const loan = await trx('loans').where({ id: req.params.id }).forUpdate().first();
      if (!loan) return { status: 404, message: 'Pengajuan tidak ditemukan.' };
      if (loan.status !== 'pending') return { status: 409, message: 'Pengajuan ini sudah diproses.' };

      await trx('loans').where({ id: loan.id, status: 'pending' }).update({
        status: 'ditolak',
        rejected_reason: reason,
        approved_by: req.user.id,
        approved_at: new Date(),
        updated_at: new Date(),
      });
      return { status: 200, loanId: loan.id };
    });

    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message, data: null });
    }

    await catat(req.user.id, 'reject_pinjam', `Tolak loan #${result.loanId}: ${reason}`, req.ip);
    return res.json({ success: true, message: 'Pengajuan ditolak.', data: { id: result.loanId, status: 'ditolak', reason } });
  } catch (error) {
    return next(error);
  }
};

exports.returns = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginationFrom(req.query);
    const base = db('loans')
      .join('users', 'loans.user_id', 'users.id')
      .join('books', 'loans.book_id', 'books.id')
      .whereIn('loans.status', ['dikembalikan', 'terlambat']);
    const search = String(req.query.search || '').trim();
    if (search) {
      base.where((builder) => builder
        .where('loans.kode_pinjam', 'like', `%${search}%`)
        .orWhere('users.name', 'like', `%${search}%`)
        .orWhere('books.judul', 'like', `%${search}%`));
    }

    const [{ total }] = await base.clone().count({ total: 'loans.id' });
    const loans = await base.clone()
      .select(
        'loans.*',
        'users.name as user_name',
        'users.no_kartu_anggota',
        'books.judul as book_judul',
      )
      .orderBy('loans.tanggal_kembali', 'desc')
      .limit(limit)
      .offset(offset);

    return res.json({
      success: true,
      message: 'Riwayat pengembalian berhasil dimuat.',
      data: loans,
      pagination: { page, limit, total: Number(total), total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};