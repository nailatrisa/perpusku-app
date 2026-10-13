import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { categoryApi } from '../api/endpoints';

export default function KategoriPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.list()
      .then((res) => setCategories(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-950">
      <PublicNavbar />

      <section className="bg-gradient-to-br from-dark-950 via-primary-950 to-dark-900 text-white py-16 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-primary-400 mb-5 font-semibold">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 font-display">
            Semua <span className="text-primary-400">Kategori</span>
          </h1>
          <p className="text-dark-300 text-lg">Jelajahi buku berdasarkan kategori</p>
        </div>
      </section>

      <section className="py-16 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-dark-900/60 rounded-2xl border border-dark-800 p-6 h-40 skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/catalog?kategori=${c.id}`}
                  className="group card p-6 hover:border-primary-500 hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4 shadow-violet group-hover:scale-110 transition">
                    <BookOpen size={26} className="text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1 font-display">{c.nama_kategori}</h3>
                  <p className="text-sm text-dark-400 mb-3">{c.deskripsi || 'Koleksi buku kategori ini'}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-dark-800">
                    <span className="text-xs font-bold text-primary-400">{c.books_count} buku</span>
                    <ChevronRight size={16} className="text-dark-500 group-hover:text-primary-400 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}