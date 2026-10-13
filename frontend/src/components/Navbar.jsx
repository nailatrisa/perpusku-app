import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/user/catalog?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className="h-20 bg-dark-950 border-b border-dark-800 flex items-center justify-between gap-3 px-4 lg:px-6 sticky top-0 z-20">
      {/* Left: Menu btn */}
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMenuClick} className="lg:hidden text-dark-300 p-2 hover:bg-dark-800 rounded-xl transition">
          <Menu size={22} />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-md w-full hidden sm:block">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari buku, penulis, atau kategori..."
            className="w-full pl-11 pr-4 py-2.5 bg-dark-900/60 border border-dark-800 rounded-xl text-sm text-dark-100 placeholder:text-dark-500 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition"
          />
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="relative w-10 h-10 rounded-xl bg-dark-900/60 hover:bg-dark-800 flex items-center justify-center transition">
          <Bell size={18} className="text-dark-300" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs font-bold flex items-center justify-center">3</span>
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-3 ml-2 border-l border-dark-800">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-violet">
            {getInitials(user?.name)}
          </div>
          <ChevronDown size={16} className="text-dark-400 hidden md:block" />
        </div>
      </div>
    </header>
  );
}