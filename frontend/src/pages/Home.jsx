import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, QrCode, Users, Search, Shield, Zap, ArrowRight,
  Library, Sparkles, TrendingUp, CheckCircle, Star,
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { bookApi, categoryApi } from '../api/endpoints';
import { getUploadUrl, handleBookCoverError } from '../utils/helpers';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booksError, setBooksError] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);
  const [totalBuku, setTotalBuku] = useState(0);

  const loadHomeData = async () => {
    setLoading(true);
    setBooksError(false);
    setCategoriesError(false);
    const [booksResult, categoriesResult] = await Promise.allSettled([
      bookApi.list({ limit: 10 }),
      categoryApi.list(),
    ]);

    if (booksResult.status === 'fulfilled') {
      setBooks(booksResult.value.data.data || []);
      setTotalBuku(Number(booksResult.value.data.pagination?.total) || 0);
    } else {
      setBooks([]);
      setTotalBuku(0);
      setBooksError(true);
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value.data.data || []);
    } else {
      setCategories([]);
      setCategoriesError(true);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const totalKategori = categories.length;

  const features = [
    { icon: QrCode, title: 'Peminjaman via QR Code', desc: 'Scan kartu anggota & buku. Cepat, akurat, tanpa antri panjang.' },
    { icon: Search, title: 'Katalog Digital Lengkap', desc: 'Cari buku dari mana saja. Filter kategori, penulis, atau tahun.' },
    { icon: Zap, title: 'Proses Instan', desc: 'Pengajuan pinjam tercatat real-time. Denda terhitung otomatis.' },
    { icon: Users, title: 'Multi-Role System', desc: 'Admin, Pustakawan, dan Anggota punya akses yang berbeda.' },
    { icon: Shield, title: 'Aman & Terpercaya', desc: 'Autentikasi JWT. Data terenkripsi.' },
    { icon: TrendingUp, title: 'Dashboard & Laporan', desc: 'Pantau statistik dengan grafik real-time.' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-950 via-primary-950 to-dark-900 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-700/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/15 rounded-full text-xs font-bold text-primary-300 mb-6 border border-primary-500/20">
              <Sparkles size={14} /> Sistem Perpustakaan Digital Modern
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 font-display">
              Pinjam Buku <br />
              <span className="text-primary-400">Cukup Scan QR</span>
            </h1>
            <p className="text-dark-300 text-lg mb-8 max-w-lg leading-relaxed">
              PerpusKu menghadirkan pengalaman meminjam buku yang cepat, mudah, dan modern.
              Akses katalog digital 24/7 dan kartu anggota digital.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary text-base px-7 py-3.5">
                Daftar Gratis <ArrowRight size={18} />
              </Link>
              <Link to="/catalog" className="inline-flex items-center gap-2 px-7 py-3.5 bg-dark-800 hover:bg-dark-700 text-white rounded-xl font-semibold border border-dark-700 transition">
                <Library size={18} /> Lihat Katalog
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-dark-800">
              <div>
                <p className="text-3xl font-extrabold text-primary-400">
                  {loading ? '...' : booksError ? '-' : `${totalBuku}+`}
                </p>
                <p className="text-xs text-dark-400 mt-1 uppercase font-semibold">Koleksi Buku</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary-400">
                  {loading ? '...' : categoriesError ? '-' : totalKategori}
                </p>
                <p className="text-xs text-dark-400 mt-1 uppercase font-semibold">Kategori</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary-400">24/7</p>
                <p className="text-xs text-dark-400 mt-1 uppercase font-semibold">Akses Online</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="bg-dark-900/60 backdrop-blur border border-dark-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-violet">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white font-display">PerpusKu Digital</p>
                  <p className="text-xs text-dark-400">Perpustakaan Modern</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold">LIVE</span>
              </div>

              <div className="space-y-2.5">
                {(books.slice(0, 4)).map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl">
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-dark-800 flex-shrink-0">
                      {b.cover ? (
                        <img src={getUploadUrl(b.cover)} onError={handleBookCoverError} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-400"><BookOpen size={16} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{b.judul}</p>
                      <p className="text-xs text-dark-400 truncate">{b.penulis}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${b.stok_tersedia > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {b.stok_tersedia > 0 ? 'Tersedia' : 'Dipinjam'}
                    </span>
                  </div>
                ))}
                {loading && books.length === 0 && (
                  <p className="text-center text-dark-500 text-sm py-4">Memuat koleksi buku...</p>
                )}
                {!loading && booksError && (
                  <div className="py-5 text-center">
                    <p className="text-sm text-rose-300">Koleksi belum dapat dimuat. Pastikan server aktif.</p>
                    <button type="button" onClick={loadHomeData} className="mt-3 text-sm font-semibold text-primary-300 hover:text-primary-200">
                      Coba lagi
                    </button>
                  </div>
                )}
                {!loading && !booksError && books.length === 0 && (
                  <p className="text-center text-dark-500 text-sm py-4">Belum ada buku di katalog.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="py-24 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <span className="pill bg-primary-500/15 text-primary-300 mb-4">Fitur Unggulan</span>
            <h2 className="section-title mb-4">Kenapa Memilih <span className="text-primary-400">PerpusKu</span>?</h2>
            <p className="section-subtitle">Kami menghadirkan pengalaman perpustakaan yang lebih efisien dengan teknologi modern.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-7 hover:border-primary-500/40 hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-5 shadow-violet">
                  <f.icon size={26} className="text-white" />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg font-display">{f.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section id="kategori" className="py-24 bg-dark-900/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <span className="pill bg-primary-500/15 text-primary-300 mb-4">Kategori</span>
            <h2 className="section-title mb-4">Jelajahi Berbagai Kategori</h2>
            <p className="section-subtitle">Temukan buku favoritmu dari berbagai kategori yang tersedia.</p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center">
              <p className="text-dark-500">
                {loading ? 'Memuat kategori...' : categoriesError ? 'Kategori belum dapat dimuat.' : 'Belum ada kategori.'}
              </p>
              {!loading && categoriesError && (
                <button type="button" onClick={loadHomeData} className="mt-3 text-sm font-semibold text-primary-300 hover:text-primary-200">
                  Coba lagi
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/catalog?kategori=${c.id}`}
                  className="group bg-dark-900/60 border border-dark-800 hover:border-primary-500 hover:-translate-y-2 rounded-2xl p-6 text-center transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-3 shadow-violet group-hover:scale-110 transition">
                    <BookOpen size={26} className="text-white" />
                  </div>
                  <p className="font-bold text-sm text-white mb-1 font-display">{c.nama_kategori}</p>
                  <p className="text-xs text-primary-400 font-semibold">{c.books_count} buku</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KATALOG */}
      <section id="katalog" className="py-24 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="pill bg-primary-500/15 text-primary-300 mb-4">Katalog</span>
              <h2 className="section-title mb-2">Koleksi Buku Terbaru</h2>
              <p className="text-dark-400">Beberapa buku pilihan dari koleksi kami.</p>
            </div>
            <Link to="/catalog" className="group inline-flex items-center gap-2 text-primary-400 font-bold hover:text-primary-300">
              Lihat Semua <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-dark-900/60 rounded-2xl border border-dark-800">
                  <div className="aspect-[3/4] skeleton"></div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 bg-dark-900/40 rounded-2xl border border-dark-800">
              <BookOpen size={48} className="mx-auto mb-3 text-dark-500" />
              <p className="text-dark-400">Belum ada buku</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {books.slice(0, 10).map((b) => (
                <Link key={b.id} to="/login" className="group">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-dark-900 relative shadow-lg group-hover:shadow-violet transition-all group-hover:-translate-y-2 duration-300">
                    {b.cover ? (
                      <img src={getUploadUrl(b.cover)} onError={handleBookCoverError} alt={b.judul} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-500"><BookOpen size={40} /></div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded">{b.kategori}</span>
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-sm text-white line-clamp-2">{b.judul}</p>
                    <p className="text-xs text-dark-400 truncate mt-1">{b.penulis}</p>
                    <button className="mt-3 w-full py-2 bg-primary-500/15 hover:bg-primary-500 text-primary-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                      Pinjam Buku <ArrowRight size={12} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-5 font-display">Siap Mulai Meminjam Buku?</h2>
          <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg">Daftar sekarang dan nikmati kemudahan akses ke ratusan koleksi buku digital kami.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-dark-900/60 text-primary-700 rounded-xl font-bold hover:-translate-y-0.5 transition shadow-xl">
              Daftar Gratis Sekarang <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-900/50 backdrop-blur hover:bg-primary-900 text-white rounded-xl font-semibold border border-white/20 transition">
              Sudah Punya Akun? Login
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}