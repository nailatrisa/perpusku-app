import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Tags, Star, TrendingUp, ChevronRight, Sparkles, Clock, Search, Shield, Leaf, Zap } from 'lucide-react';
import { dashboardApi, bookApi, categoryApi } from '../../api/endpoints';
import { getUploadUrl, formatTanggalShort, hitungHariTerlambat, handleBookCoverError } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.user().catch(() => ({ data: { data: null } })),
      bookApi.list({ limit: 5 }).catch(() => ({ data: { data: [] } })),
      categoryApi.list().catch(() => ({ data: { data: [] } })),
      bookApi.list({ limit: 5, sort: 'popular' }).catch(() => ({ data: { data: [] } })),
    ]).then(([dashRes, booksRes, catsRes, topRes]) => {
      setData(dashRes.data.data);
      setBooks(booksRes.data.data || []);
      setCategories(catsRes.data.data || []);
      setTopBooks(topRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const user = data?.user;
  const stats = data?.stats || { sedang_dipinjam: 0, total_pinjam: 0, denda_aktif: 0 };
  const activeLoans = data?.active_loans || [];

  const categoryIcons = {
    'Fiksi': BookOpen, 'Non-Fiksi': BookOpen, 'Sains': Sparkles,
    'Sejarah': Clock, 'Teknologi': Zap, 'Anak-anak': Star,
  };

  const features = [
    { icon: Zap, title: 'Mudah & Cepat', desc: 'Proses peminjaman buku sangat mudah dan cepat.' },
    { icon: Shield, title: 'Aman & Terpercaya', desc: 'Data dan transaksi kamu selalu terlindungi.' },
    { icon: Users, title: 'Akses Kapan Saja', desc: 'Baca buku favoritmu kapan saja, di mana saja.' },
    { icon: Leaf, title: 'Ramah Lingkungan', desc: 'Bersama kita dukung gerakan literasi digital.' },
  ];

  return (
    <div className="space-y-6">

      {/* ===== MAIN GRID ===== */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT + CENTER */}
        <div className="lg:col-span-2 space-y-6">

          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-6 lg:p-8 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-400/30 rounded-full blur-3xl"></div>

            <div className="relative flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <span className="px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold">
                Selamat Datang di PerpusKu
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div>
                <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4 font-display">
                  Baca Buku,<br />
                  Raih <span className="text-primary-200">Masa Depan</span>
                </h1>
                <p className="text-primary-100 text-sm lg:text-base leading-relaxed mb-6 max-w-md">
                  Temukan ribuan koleksi buku terbaik untuk menambah ilmu, memperluas wawasan, dan menginspirasi hidupmu.
                </p>

                <Link to="/user/catalog" className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-2 pl-5 hover:bg-white/20 transition max-w-md">
                  <Search size={18} className="text-white/70" />
                  <span className="flex-1 text-sm text-white/70">Cari buku favoritmu...</span>
                  <div className="w-10 h-10 rounded-lg bg-primary-400 flex items-center justify-center">
                    <ChevronRight size={18} />
                  </div>
                </Link>
              </div>

              {/* Book illustration */}
              <div className="relative hidden lg:block">
                <div className="relative h-56">
                  <div className="absolute top-4 left-8 w-32 h-44 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-2xl rotate-[-15deg] flex items-end p-3">
                    <p className="text-white text-xs font-bold">Better<br />Every Day</p>
                  </div>
                  <div className="absolute top-2 left-24 w-32 h-44 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-2xl rotate-[-5deg] flex items-end p-3 z-10">
                    <p className="text-white text-xs font-bold">Atomic<br />Habits</p>
                  </div>
                  <div className="absolute top-0 left-40 w-32 h-44 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl shadow-2xl rotate-[8deg] flex items-end p-3 z-20">
                    <p className="text-white text-xs font-bold">Sapiens<br />History</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
              {[
                { val: '1.250+', label: 'Total Buku', icon: BookOpen },
                { val: '120+', label: 'Anggota Aktif', icon: Users },
                { val: '15+', label: 'Kategori', icon: Tags },
                { val: '4.8', label: 'Rating Aplikasi', icon: Star },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{s.val}</p>
                    <p className="text-xs text-primary-100">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KOLEKSI BUKU TERBARU */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">📚 Koleksi Buku Terbaru</h3>
              <Link to="/user/catalog" className="text-sm text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 group">
                Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {books.length === 0 ? (
                <p className="col-span-5 text-center text-dark-500 py-8">Belum ada buku</p>
              ) : books.map((b) => (
                <Link key={b.id} to={`/user/catalog/${b.id}`} className="group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-dark-800 relative shadow-lg group-hover:shadow-violet transition-all group-hover:-translate-y-1 duration-300">
                    {b.cover ? (
                      <img src={getUploadUrl(b.cover)} onError={handleBookCoverError} alt={b.judul} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-500"><BookOpen size={32} /></div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded">{b.kategori}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white line-clamp-1">{b.judul}</p>
                  <p className="text-xs text-dark-400 truncate">{b.penulis}</p>
                  <button className="mt-3 w-full py-2 bg-primary-500/10 hover:bg-primary-500 text-primary-400 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                    Pinjam Buku <ChevronRight size={12} />
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* BUKU SEDANG DIPINJAM */}
          {activeLoans.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">📖 Sedang Dipinjam</h3>
                <Link to="/user/history" className="text-sm text-primary-400 hover:text-primary-300 font-semibold">Riwayat →</Link>
              </div>
              <div className="space-y-3">
                {activeLoans.map((l) => {
                  const terlambat = new Date() > new Date(l.tanggal_jatuh_tempo);
                  return (
                    <div key={l.id} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl border border-dark-800">
                      <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {l.cover ? <img src={getUploadUrl(l.cover)} onError={handleBookCoverError} alt="" className="w-full h-full object-cover" /> : <BookOpen size={18} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{l.judul}</p>
                        <p className="text-xs text-dark-400 truncate">{l.penulis}</p>
                        <p className={`text-xs mt-1 font-semibold ${terlambat ? 'text-rose-400' : 'text-amber-400'}`}>
                          {terlambat ? `⚠️ Terlambat ${hitungHariTerlambat(l.tanggal_jatuh_tempo)} hari` : `Jatuh tempo: ${formatTanggalShort(l.tanggal_jatuh_tempo)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* BUKU TERPOPULER */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-rose-500" /> Buku Terpopuler
              </h3>
              <Link to="/user/catalog" className="text-xs text-primary-400 hover:text-primary-300 font-semibold">Lihat Semua →</Link>
            </div>

            <div className="space-y-3">
              {(topBooks.length > 0 ? topBooks : books).slice(0, 5).map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-800/50 transition group">
                  <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800 shadow-lg">
                    {b.cover ? (
                      <img src={getUploadUrl(b.cover)} onError={handleBookCoverError} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-500 text-xs"><BookOpen size={16} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{b.judul}</p>
                    <p className="text-xs text-dark-400 truncate">{b.penulis}</p>
                    <p className="text-xs text-dark-500 mt-0.5 flex items-center gap-1">
                      <Users size={10} /> {Math.floor(Math.random() * 1000 + 200)} peminjam
                    </p>
                  </div>
                  <Link to={`/user/catalog/${b.id}`} className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-bold transition flex-shrink-0">
                    Pinjam
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* KATEGORI BUKU */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Tags size={18} className="text-primary-400" /> Kategori Buku
              </h3>
              <Link to="/user/catalog" className="text-xs text-primary-400 hover:text-primary-300 font-semibold">Lihat Semua →</Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 6).map((c) => {
                const Icon = categoryIcons[c.nama_kategori] || BookOpen;
                const colors = ['from-primary-400 to-primary-600', 'from-rose-400 to-rose-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-sky-400 to-sky-600', 'from-purple-400 to-purple-600'];
                const color = colors[c.id % colors.length];
                return (
                  <Link key={c.id} to={`/user/catalog?kategori=${c.id}`} className="p-3 bg-dark-800/50 hover:bg-dark-800 rounded-xl border border-dark-800 transition group">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2 group-hover:scale-110 transition`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <p className="text-sm font-bold text-white">{c.nama_kategori}</p>
                    <p className="text-xs text-dark-400">{c.books_count} buku</p>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* FEATURES ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.title} className="card p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
              <f.icon size={18} className="text-primary-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{f.title}</p>
              <p className="text-xs text-dark-400 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}