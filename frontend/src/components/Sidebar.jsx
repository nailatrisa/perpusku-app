import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Tags, Users, FileText, ListChecks, Database,
  QrCode, HandCoins, HandHelping, Library, History, IdCard, LogOut, X, Settings, User,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm('Yakin ingin logout?')) return;
    await logout();
    navigate('/login');
  };

  const menus = {
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/books', label: 'Buku', icon: BookOpen },
      { to: '/admin/categories', label: 'Kategori', icon: Tags },
      { to: '/admin/users', label: 'Anggota', icon: Users },
      { to: '/admin/reports', label: 'Laporan', icon: FileText },
      { to: '/admin/activity-logs', label: 'Log Aktivitas', icon: ListChecks },
      { to: '/admin/backups', label: 'Backup', icon: Database },
    ],
    pustakawan: [
      { to: '/pustakawan/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/pustakawan/scan', label: 'Scan QR', icon: QrCode },
      { to: '/pustakawan/loans', label: 'Peminjaman', icon: HandHelping },
      { to: '/pustakawan/fines', label: 'Denda', icon: HandCoins },
    ],
    masyarakat: [
      { to: '/user/dashboard', label: 'Beranda', icon: LayoutDashboard },
      { to: '/user/catalog', label: 'Koleksi Buku', icon: Library },
      { to: '/user/history', label: 'Riwayat', icon: History },
      { to: '/user/card', label: 'Kartu Anggota', icon: IdCard },
    ],
  };

  const currentMenus = menus[user?.role] || [];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm" onClick={onClose} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-950 border-r border-dark-800 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-dark-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-violet">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-white font-display tracking-tight">
              Perpus<span className="text-primary-400">Ku</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-dark-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {currentMenus.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-dark-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-sm font-semibold transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}