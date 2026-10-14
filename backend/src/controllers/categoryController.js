const db = require('../config/database');
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.index = async (req, res, next) => {
  try {
    const categories = await db('categories')
      .select('categories.*')
      .select(db.raw('(SELECT COUNT(*) FROM books WHERE books.category_id = categories.id) as books_count'))
      .orderBy('nama_kategori');
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

exports.store = async (req, res, next) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    if (!nama_kategori) return res.status(422).json({ success: false, message: 'Nama kategori wajib diisi.' });

    const [id] = await db('categories').insert({
      nama_kategori, slug: slugify(nama_kategori), deskripsi,
    });
    const cat = await db('categories').where({ id }).first();
    res.status(201).json({ success: true, message: 'Kategori ditambahkan.', data: cat });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_kategori, deskripsi } = req.body;
    await db('categories').where({ id }).update({
      nama_kategori, slug: slugify(nama_kategori), deskripsi, updated_at: new Date(),
    });
    const cat = await db('categories').where({ id }).first();
    res.json({ success: true, message: 'Kategori diupdate.', data: cat });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const count = await db('books').where({ category_id: id }).count('id as c').first();
    if (count.c > 0) return res.status(400).json({ success: false, message: 'Kategori masih memiliki buku.' });

    await db('categories').where({ id }).del();
    res.json({ success: true, message: 'Kategori dihapus.' });
  } catch (err) { next(err); }
};