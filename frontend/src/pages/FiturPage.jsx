import { Link } from 'react-router-dom';
import { QrCode, Search, Shield, Zap, Users, TrendingUp, ArrowLeft, ArrowRight } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

export default function FiturPage() {
  const features = [
    { icon: QrCode, title: 'Peminjaman via QR Code', desc: 'Scan kartu anggota dan buku. Proses cepat dan akurat dalam 5 detik.' },
    { icon: Search, title: 'Katalog Digital Lengkap', desc: 'Cari buku dengan filter kategori, penulis, tahun, atau kata kunci.' },
    { icon: Zap, title: 'Proses Instan', desc: 'Pengajuan pinjam tercatat real-time. Denda terhitung otomatis.' },
    { icon: Users, title: 'Multi-Role System', desc: 'Admin, Pustakawan, dan Anggota punya akses yang berbeda.' },
    { icon: Shield, title: 'Aman dan Terpercaya', desc: 'Autentikasi JWT. Password ter-hash dengan bcrypt.' },
    { icon: TrendingUp, title: 'Dashboard dan Laporan', desc: 'Pantau statistik peminjaman, denda, dan buku populer real-time.' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <PublicNavbar />

      <section className="bg-gradient-to-br from-dark-950 via-primary-950 to-dark-900 text-white py-16 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-primary-400 mb-5 font-semibold">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 font-display">
            Fitur <span className="text-primary-400">PerpusKu</span>
          </h1>
          <p className="text-dark-300 text-lg">Semua yang Anda butuhkan untuk perpustakaan digital modern</p>
        </div>
      </section>

      <section className="py-16 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
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

          <div className="mt-16 bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl p-10 text-center text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 font-display">Siap Mencoba?</h3>
            <p className="text-primary-100 mb-6">Daftar sekarang dan rasakan kemudahannya.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-dark-900/60 text-primary-700 rounded-xl font-bold hover:-translate-y-0.5 transition shadow-xl">
              Daftar Gratis <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}