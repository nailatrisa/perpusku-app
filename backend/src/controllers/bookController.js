const db = require('../config/database');
const { generateQrCode } = require('../utils/helpers');
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 7);

exports.index = async (req, res, next) => {
  try {
    const { search, category_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('books').join('categories', 'books.category_id', 'categories.id')
      .select('books.*', 'categories.nama_kategori as kategori');

    if (search) {
      query = query.where(function () {
        this.where('books.judul', 'like', `%${search}%`)
          .orWhere('books.penulis', 'like', `%${search}%`)
          .orWhere('books.isbn', 'like', `%${search}%`);
      });
    }
    if (category_id) query = query.where('books.category_id', category_id);

    const totalQuery = query.clone().clearSelect().clearOrder().count('books.id as total').first();
    const total = (await totalQuery).total;

    const books = await query.orderBy('books.created_at', 'desc').limit(limit).offset(offset);

    res.json({
      success: true,
      data: books,
      pagination: { page: Number(page), limit: Number(limit), total, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

exports.show = async (req, res, next) => {
  try {
    const book = await db('books')
      .join('categories', 'books.category_id', 'categories.id')
      .select('books.*', 'categories.nama_kategori as kategori')
      .where('books.id', req.params.id).first();
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
    res.json({ success: true, data: book });
  } catch (err) { next(err); }
};

exports.store = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) data.cover = `covers/${req.file.filename}`;

    const stok_total = parseInt(data.stok_total) || 1;
    const [id] = await db('books').insert({
      ...data,
      slug: slugify(data.judul),
      stok_total,
      stok_tersedia: stok_total,
      qr_code: generateQrCode('BK'),
    });
    const book = await db('books').where({ id }).first();
    res.status(201).json({ success: true, message: 'Buku ditambahkan.', data: book });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (req.file) data.cover = `covers/${req.file.filename}`;

    const book = await db('books').where({ id }).first();
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    if (data.stok_total) {
      const selisih = parseInt(data.stok_total) - book.stok_total;
      data.stok_total = parseInt(data.stok_total);
      data.stok_tersedia = Math.max(0, book.stok_tersedia + selisih);
    }

    await db('books').where({ id }).update({ ...data, updated_at: new Date() });
    const updated = await db('books').where({ id }).first();
    res.json({ success: true, message: 'Buku diupdate.', data: updated });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const active = await db('loans').where({ book_id: id, status: 'dipinjam' }).count('id as c').first();
    if (active.c > 0) return res.status(400).json({ success: false, message: 'Buku sedang dipinjam.' });

    await db('books').where({ id }).del();
    res.json({ success: true, message: 'Buku dihapus.' });
  } catch (err) { next(err); }
};