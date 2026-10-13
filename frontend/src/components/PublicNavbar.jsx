import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PublicNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardLink = {
    admin: '/admin/dashboard',
    pustakawan: '/pustakawan/dashboard',
    masyarakat: '/user/dashboard',
  };

  const menuItems = [
    { to: '/', label: 'Beranda' },
    { to: '/catalog', label: 'Katalog' },
    { to: '/kategori', label: 'Kategori' },
    { to: '/fitur', label: 'Fitur' },
  ];

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-dark-950/95 backdrop-blur border-b border-dark-800 shadow-lg' : 'bg-dark-950 border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-violet">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-white font-display">
              Perpus<span className="text-primary-400">Ku</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-semibold text-dark-300 hover:text-white hover:bg-dark-800/60 rounded-lg transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <button onClick={() => navigate(dashboardLink[user.role])} className="btn-primary text-sm">
                <LayoutDashboard size={16} /> Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  <LogIn size={16} /> Masuk
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  <UserPlus size={16} /> Daftar
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-dark-800">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold text-dark-200 hover:bg-dark-800 rounded-lg"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t border-dark-800 space-y-2">
              {user ? (
                <button onClick={() => { navigate(dashboardLink[user.role]); setOpen(false); }} className="btn-primary w-full text-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full text-sm">
                    <LogIn size={16} /> Masuk
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full text-sm">
                    <UserPlus size={16} /> Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}