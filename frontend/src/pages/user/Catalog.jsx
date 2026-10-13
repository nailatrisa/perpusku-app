import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Library } from 'lucide-react';
import { bookApi, categoryApi } from '../../api/endpoints';
import { getUploadUrl } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category_id: '' });
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await bookApi.list({ ...filters, page, limit: 12 });
      setBooks(res.data.data);
      setPagination({ page: res.data.pagination.page, total_pages: res.data.pagination.total_pages });
    } catch (err) {
      toast.error('Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data.data)).catch(() => {});
    fetchData(1);
  }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchData(1); };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Library size={26} /> Katalog Buku
        </h2>
        <p className="text-emerald-50 text-sm mt-1">Temukan buku favoritmu</p>
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input type="text" placeholder="Cari judul atau penulis..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input pl-10" />
        </div>
        <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })} className="input sm:w-48">
          <option value="">Semua Kategori</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.nama_kategori}</option>))}
        </select>
        <button type="submit" className="btn-primary"><Search size={16} /> Cari</button>
      </form>

      {loading ? <Loading /> : (
        <>
          {books.length === 0 ? (
            <div className="card p-12 text-center text-dark-500">
              <BookOpen size={48} className="mx-auto mb-2 opacity-50" />
              <p>Belum ada buku</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((b) => (
                <Link key={b.id} to={`/user/catalog/${b.id}`} className="bg-dark-900/60 rounded-xl shadow-sm border hover:shadow-lg transition overflow-hidden group">
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
                    {b.cover ? (
                      <img src={getUploadUrl(b.cover)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white"><BookOpen size={48} /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-white text-sm line-clamp-2 min-h-[2.5rem]">{b.judul}</p>
                    <p className="text-xs text-dark-400 mt-1">{b.penulis}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="badge bg-blue-50 text-blue-700 text-xs">{b.kategori}</span>
                      {b.stok_tersedia > 0 ? (
                        <span className="text-xs text-emerald-600 font-semibold">✓ {b.stok_tersedia}</span>
                      ) : (
                        <span className="text-xs text-rose-600 font-semibold">Habis</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pagination.total_pages > 1 && (
            <div className="card p-4 flex items-center justify-between">
              <p className="text-xs text-dark-400">Halaman {pagination.page} dari {pagination.total_pages}</p>
              <div className="flex gap-1">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => fetchData(p)}
                    className={`w-8 h-8 rounded text-xs font-semibold transition ${p === pagination.page ? 'bg-slate-900 text-white' : 'bg-dark-900/60 border text-dark-300 hover:bg-dark-800'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}