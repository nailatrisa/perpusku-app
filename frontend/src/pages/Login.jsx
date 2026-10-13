import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Selamat datang, ${user.name}!`);

      const redirect = {
        admin: '/admin/dashboard',
        pustakawan: '/pustakawan/dashboard',
        masyarakat: '/user/dashboard',
      };
      navigate(redirect[user.role] || '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Coba lagi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@perpusku.com', password: 'password' },
      pustakawan: { email: 'pustakawan1@perpusku.com', password: 'password' },
      masyarakat: { email: 'user1@perpusku.com', password: 'password' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-dark-900/60 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 relative">
          <BookOpen size={72} className="text-coral-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">
            Perpus<span className="text-coral-500">Ku</span>
          </h2>
          <p className="text-center text-blue-100 text-sm max-w-xs">
            Sistem Perpustakaan Digital - Pinjam buku cukup scan QR Code,
            kapan saja dan di mana saja.
          </p>
          <p className="absolute bottom-6 text-xs text-blue-200">
            (c) {new Date().getFullYear()} PerpusKu
          </p>
        </div>

        {/* RIGHT */}
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-bold text-white mb-1">Selamat Datang </h1>
          <p className="text-sm text-dark-400 mb-6">Login untuk melanjutkan</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"
                />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="--------"
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-60"
            >
              {loading ? (
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <LogIn size={18} /> Login
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-dark-300 mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-slate-900 font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>

          {/* DEMO CREDENTIALS */}
          <div className="mt-6 p-3 bg-dark-900/40 rounded-lg text-xs text-dark-400 space-y-2">
            <p className="font-semibold text-dark-200">Demo Login (klik untuk isi otomatis):</p>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('pustakawan')}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              >
                Pustakawan
              </button>
              <button
                type="button"
                onClick={() => fillDemo('masyarakat')}
                className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition"
              >
                Masyarakat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}