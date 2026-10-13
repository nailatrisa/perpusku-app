import { Link } from 'react-router-dom';
import { Home, BookOpen, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-dark-900/60 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center mb-5">
          <SearchX size={48} />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-dark-400 mb-6">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>

        <div className="flex flex-col gap-2">
          <Link to="/" className="btn-primary w-full py-3">
            <Home size={18} /> Ke Beranda
          </Link>
          <Link to="/user/catalog" className="btn-secondary w-full py-3">
            <BookOpen size={18} /> Lihat Katalog Buku
          </Link>
        </div>

        <p className="text-xs text-dark-500 mt-6">
          (c) {new Date().getFullYear()} PerpusKu
        </p>
      </div>
    </div>
  );
}