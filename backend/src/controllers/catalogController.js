const db = require('../config/database');

function paginationFrom(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 15));
  return { page, limit, offset: (page - 1) * limit };
}

function bookQuery() {
  return db('books')
    .leftJoin('categories', 'books.category_id', 'categories.id')
    .select('books.*', 'categories.nama_kategori');
}

exports.listBooks = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginationFrom(req.query);
    const query = bookQuery();
    const search = String(req.query.search || '').trim();
    const categoryId = String(req.query.category_id || '').trim();

    if (search) {
      query.where((builder) => builder
        .where('books.judul', 'like', `%${search}%`)
        .orWhere('books.penulis', 'like', `%${search}%`));
    }
    if (categoryId) query.where('books.category_id', categoryId);

    const [{ total }] = await query.clone().clearSelect().count({ total: 'books.id' });
    if (req.query.sort === 'popular') {
      query.leftJoin(
        db('loans').select('book_id').count('* as loan_count').groupBy('book_id').as('loan_stats'),
        'loan_stats.book_id',
        'books.id',
      ).orderBy('loan_stats.loan_count', 'desc');
    } else {
      query.orderBy('books.created_at', 'desc');
    }

    const books = await query.limit(limit).offset(offset);
    return res.json({
      success: true,
      message: 'Daftar buku berhasil dimuat.',
      data: books,
      pagination: { page, limit, total: Number(total), total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

exports.showBook = async (req, res, next) => {
  try {
    const book = await bookQuery().where('books.id', req.params.id).first();
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.', data: null });
    }
    return res.json({ success: true, message: 'Detail buku berhasil dimuat.', data: book });
  } catch (error) {
    return next(error);
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    const counts = db('books')
      .select('category_id')
      .count('* as books_count')
      .groupBy('category_id')
      .as('book_counts');
    const categories = await db('categories')
      .leftJoin(counts, 'book_counts.category_id', 'categories.id')
      .select('categories.*', db.raw('COALESCE(book_counts.books_count, 0) as books_count'))
      .orderBy('categories.nama_kategori');

    return res.json({ success: true, message: 'Daftar kategori berhasil dimuat.', data: categories });
  } catch (error) {
    return next(error);
  }
};
