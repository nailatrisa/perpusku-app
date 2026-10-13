import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white pt-16 pb-6 mt-16 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-coral-500/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        {/* Newsletter */}
        <div className="mb-14 p-8 bg-white/5 backdrop-blur rounded-3xl border border-white/10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Dapatkan Update Buku Terbaru</h3>
            <p className="text-blue-200 text-sm">Berlangganan newsletter untuk info koleksi baru & promo menarik.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="email@contoh.com"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-300 outline-none focus:border-coral-400 focus:bg-white/15 transition"
            />
            <button className="btn-accent px-5">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* BRAND */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center">
                <BookOpen size={22} className="text-slate-900" />
              </div>
              <span className="text-xl font-extrabold font-display">
                Perpus<span className="text-coral-500">Ku</span>
              </span>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed mb-5">
              Sistem Perpustakaan Digital - Pinjam buku cukup scan QR Code, kapan saja dan di mana saja.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Facebook, color: 'hover:bg-blue-600' },
                { icon: Instagram, color: 'hover:bg-pink-600' },
                { icon: Twitter, color: 'hover:bg-sky-500' },
                { icon: Youtube, color: 'hover:bg-red-600' },
              ].map(({ icon: Icon, color }, i) => (
                <a key={i} href="#" className={`w-10 h-10 rounded-xl bg-white/10 hover:scale-110 flex items-center justify-center transition-all ${color}`}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* MENU */}
          <div>
            <h3 className="font-bold mb-5 text-coral-500 font-display uppercase text-sm tracking-wider">Menu</h3>
            <ul className="space-y-3 text-sm text-blue-200">
              <li><Link to="/" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">Beranda</Link></li>
              <li><Link to="/catalog" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">Katalog Buku</Link></li>
              <li><Link to="/#kategori" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">Kategori</Link></li>
              <li><Link to="/#fitur" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">Fitur</Link></li>
            </ul>
          </div>

          {/* LAYANAN */}
          <div>
            <h3 className="font-bold mb-5 text-coral-500 font-display uppercase text-sm tracking-wider">Layanan</h3>
            <ul className="space-y-3 text-sm text-blue-200">
              <li><Link to="/register" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">Daftar Anggota</Link></li>
              <li><Link to="/login" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">Login Anggota</Link></li>
              <li><a href="#" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">Cara Peminjaman</a></li>
              <li><a href="#" className="hover:text-coral-400 transition inline-flex items-center gap-1 hover:translate-x-1">FAQ</a></li>
            </ul>
          </div>

          {/* KONTAK */}
          <div>
            <h3 className="font-bold mb-5 text-coral-500 font-display uppercase text-sm tracking-wider">Kontak</h3>
            <ul className="space-y-4 text-sm text-blue-200">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-coral-500" />
                </div>
                <span className="pt-1">Jl. Pendidikan No. 1, Jakarta Pusat 10110</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-coral-500" />
                </div>
                <span>(021) 1234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-coral-500" />
                </div>
                <span>info@perpusku.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-200">
          <p>(c) {new Date().getFullYear()} <b className="text-coral-500">PerpusKu</b>. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-coral-400 transition">Kebijakan Privasi</a>
            <a href="#" className="hover:text-coral-400 transition">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-coral-400 transition">Bantuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}