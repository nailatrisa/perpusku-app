import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Filter, ArrowLeft, X, SlidersHorizontal, Grid3x3, List, RefreshCw } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { bookApi, categoryApi } from '../api/endpoints';
import { getUploadUrl } from '../utils/helpers';

export default function PublicCatalog() {
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [search, setSearch] = useState(params.get('search') || '');
  const [categoryId, setCategoryId] = useState(params.get('kategori') || '');
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 });

  const fetchData = async (page = 1) => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await bookApi.list({
        search: params.get('search') || '',
        category_id: params.get('kategori') || '',
        page,
        limit: 16,
      });
      setBooks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryApi.list()
      .then((res) => {
        setCategories(res.data.data);
        setCategoryError(false);
      })
      .catch((err) => {
        console.error(err);
        setCategoryError(true);
      });
  }, []);

  useEffect(() => {
    setSearch(params.get('search') || '');
    setCategoryId(params.get('kategori') || '');
    fetchData(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [params]);

  const handleFilter = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (categoryId) newParams.kategori = categoryId;
    setParams(newParams);
  };

  const handleCategoryClick = (id) => {
    setCategoryId(id.toString());
    const newParams = {};
    if (search) newParams.search = search;
    if (id) newParams.kategori = id.toString();
    setParams(newParams);
  };

  const handleClearFilter = () => {
    setSearch('');
    setCategoryId('');
    setParams({});
  };

  const activeCategory = categories.find((c) => c.id.toString() === (params.get('kategori') || ''));
  const hasFilter = params.get('search') || params.get('kategori');

  return (
    <div className="min-h-screen bg-dark-900/40">
      <PublicNavbar />

      {/* HEADER */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-coral-400 mb-5 transition font-semibold">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 font-display">
            Katalog <span className="gradient-text-gold">Buku</span>
          </h1>
          <p className="text-blue-100/90 text-lg">
            {activeCategory
              ? `Menampilkan kategori: ${activeCategory.nama_kategori}`
              : 'Jelajahi semua koleksi buku PerpusKu'}
          </p>
        </div>
      </section>

      {/* FILTER */}
      <section className="sticky top-16 z-30 glass border-b border-dark-700/60 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="text"
                placeholder="Cari judul atau penulis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-11 py-3"
              />
            </div>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryClick(e.target.value)}
              className="input md:w-56 py-3 font-semibold"
            >
              <option value=""> Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nama_kategori}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary px-6">
              <SlidersHorizontal size={16} /> Terapkan
            </button>
            {hasFilter && (
              <button type="button" onClick={handleClearFilter} className="btn-secondary">
                <X size={16} /> Reset
              </button>
            )}
          </form>

          {/* Category Pills */}
          {categoryError ? (
            <p className="mt-3 text-sm text-amber-300">Daftar kategori belum dapat dimuat.</p>
          ) : categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mb-1">
              <button
                onClick={() => handleCategoryClick('')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  !categoryId ? 'bg-primary-500 text-white shadow-violet' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                Semua
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryId === c.id.toString() ? 'bg-primary-500 text-white shadow-violet' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  {c.nama_kategori}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HASIL */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {!loading && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-dark-300">
                Menampilkan <b className="text-primary-300">{books.length}</b> dari{' '}
                <b className="text-primary-300">{pagination.total}</b> buku
                {activeCategory && <> di kategori <b className="text-primary-300">{activeCategory.nama_kategori}</b></>}
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-dark-900/60 rounded-2xl overflow-hidden shadow-soft">
                  <div className="aspect-[3/4] skeleton"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-16 skeleton rounded"></div>
                    <div className="h-4 w-full skeleton rounded"></div>
                    <div className="h-3 w-2/3 skeleton rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-16 bg-dark-900/60 rounded-3xl border border-rose-500/20 shadow-soft">
              <BookOpen size={44} className="mx-auto mb-4 text-rose-300" />
              <p className="text-xl font-bold text-white mb-2 font-display">Katalog belum dapat dimuat</p>
              <p className="text-sm text-dark-400 mb-6">Pastikan server PerpusKu aktif, lalu coba lagi.</p>
              <button type="button" onClick={() => fetchData(1)} className="btn-primary">
                <RefreshCw size={16} /> Coba lagi
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-24 bg-dark-900/60 rounded-3xl shadow-soft">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-dark-800 flex items-center justify-center">
                <BookOpen size={48} className="text-dark-500" />
              </div>
              <p className="text-xl font-bold text-white mb-2 font-display">Tidak ada buku ditemukan</p>
              <p className="text-sm text-dark-400 mb-6">Coba ubah filter atau kata kunci pencarian</p>
              <button onClick={handleClearFilter} className="btn-primary">
                <X size={16} /> Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {books.map((b, i) => (
                <Link
                  key={b.id}
                  to="/login"
                  className="group bg-dark-900/60 rounded-2xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-900 to-slate-700 overflow-hidden relative">
                    {b.cover ? (
                      <img src={getUploadUrl(b.cover)} alt={b.judul} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-3 right-3">
                      {b.stok_tersedia > 0 ? (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">Tersedia</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-500 text-white rounded-full text-xs font-bold shadow-lg">Habis</span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0">
                      <span className="block text-center py-2.5 bg-primary-500 text-white rounded-xl text-xs font-bold">
                        Login untuk Pinjam
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="badge bg-primary-500/15 text-primary-300 text-xs">{b.kategori}</span>
                    <h3 className="font-bold text-sm text-white mt-2 line-clamp-2 min-h-[2.5rem] font-display">{b.judul}</h3>
                    <p className="text-xs text-dark-400 mt-1 truncate">{b.penulis}</p>
                    <div className="mt-3 pt-3 border-t border-dark-800 flex items-center justify-between">
                      <span className="text-xs text-dark-500 font-semibold">{b.tahun_terbit || '-'}</span>
                      <span className="text-xs text-dark-500 font-mono">{b.lokasi_rak || ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pagination.total_pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setParams({ ...Object.fromEntries(params), page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="px-5 py-2.5 bg-dark-900/60 border border-dark-700 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-dark-900/40 transition shadow-sm"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(pagination.total_pages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setParams({ ...Object.fromEntries(params), page: p })}
                  className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${
                    p === pagination.page
                      ? 'bg-slate-900 text-white shadow-lg scale-105'
                      : 'bg-dark-900/60 border border-dark-700 text-dark-300 hover:bg-dark-900/40 shadow-sm'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setParams({ ...Object.fromEntries(params), page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.total_pages}
                className="px-5 py-2.5 bg-dark-900/60 border border-dark-700 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-dark-900/40 transition shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}