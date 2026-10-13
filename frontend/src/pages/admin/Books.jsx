import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Pencil, Trash2, BookOpen } from 'lucide-react';
import { bookApi, categoryApi } from '../../api/endpoints';
import { getUploadUrl } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category_id: '' });
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  const fetchBooks = async (page = 1) => {
    setLoading(true);
    try {
      const res = await bookApi.list({ ...filters, page, limit: 10 });
      setBooks(res.data.data);
      setPagination({ page: res.data.pagination.page, total_pages: res.data.pagination.total_pages });
    } catch (err) {
      toast.error('Gagal memuat buku');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data.data)).catch(() => {});
    fetchBooks(1);
  }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchBooks(1); };

  const handleDelete = async (id, judul) => {
    if (!confirm(`Hapus buku "${judul}"?`)) return;
    try {
      await bookApi.destroy(id);
      toast.success('Buku berhasil dihapus');
      fetchBooks(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Buku</h2>
          <p className="text-sm text-dark-400">Kelola koleksi buku perpustakaan</p>
        </div>
        <Link to="/admin/books/create" className="btn-primary">
          <Plus size={18} /> Tambah Buku
        </Link>
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input type="text" placeholder="Cari judul, penulis, ISBN..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input pl-10" />
        </div>
        <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })} className="input sm:w-48">
          <option value="">Semua Kategori</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.nama_kategori}</option>))}
        </select>
        <button type="submit" className="btn-primary"><Filter size={16} /> Filter</button>
      </form>

      <div className="card overflow-hidden">
        {loading ? <Loading text="Memuat buku..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-900/40 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200 w-16">Cover</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200">Judul</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200 hidden md:table-cell">Kategori</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200 hidden lg:table-cell">Stok</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200 w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {books.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-dark-500">
                    <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
                    <p>Belum ada buku</p>
                  </td></tr>
                ) : books.map((b) => (
                  <tr key={b.id} className="hover:bg-dark-900/40 transition">
                    <td className="px-4 py-3">
                      {b.cover ? (
                        <img src={getUploadUrl(b.cover)} alt="" className="w-12 h-16 object-cover rounded shadow-sm" />
                      ) : (
                        <div className="w-12 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded flex items-center justify-center text-white">
                          <BookOpen size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white line-clamp-2">{b.judul}</p>
                      <p className="text-xs text-dark-400">{b.penulis} - {b.tahun_terbit || '-'}</p>
                      <p className="text-xs text-dark-500 font-mono">{b.isbn || '-'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge bg-blue-50 text-blue-700">{b.kategori}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      {b.stok_tersedia > 0 ? (
                        <span className="badge bg-emerald-50 text-emerald-700">{b.stok_tersedia} / {b.stok_total}</span>
                      ) : (
                        <span className="badge bg-rose-50 text-rose-700">Habis</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/admin/books/${b.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/admin/books/${b.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(b.id, b.judul)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t bg-dark-900/40 flex items-center justify-between">
            <p className="text-xs text-dark-400">Halaman {pagination.page} dari {pagination.total_pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => fetchBooks(p)}
                  className={`w-8 h-8 rounded text-xs font-semibold transition ${p === pagination.page ? 'bg-slate-900 text-white' : 'bg-dark-900/60 border text-dark-300 hover:bg-dark-800'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}