import { NavLink } from 'react-router-dom';
import {
  BookOpen, CheckCircle, HandCoins, HandHelping, LayoutDashboard, QrCode, RotateCcw,
} from 'lucide-react';

const librarianMenu = [
  { to: '/pustakawan/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pustakawan/scan', label: 'Scan QR', icon: QrCode },
  { to: '/pustakawan/persetujuan', label: 'Persetujuan', icon: CheckCircle },
  { to: '/pustakawan/loans', label: 'Peminjaman', icon: HandHelping },
  { to: '/pustakawan/pengembalian', label: 'Pengembalian', icon: RotateCcw },
  { to: '/pustakawan/fines', label: 'Denda', icon: HandCoins },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-full flex-col border-b border-dark-800 bg-dark-950 px-4 py-5 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6 flex items-center gap-3 px-2 md:mb-10">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-500 text-white"><BookOpen size={20} /></span>
        <span className="font-display text-xl font-extrabold text-white">Perpus<span className="text-primary-400">Ku</span></span>
      </div>
      <p className="mb-2 px-3 text-[10px] font-bold tracking-[.16em] text-dark-500">PUSTAKAWAN</p>
      <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
        {librarianMenu.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto hidden border-t border-dark-800 px-3 pt-4 text-xs text-dark-500 md:block">Perpustakaan Digital</div>
    </aside>
  );
}