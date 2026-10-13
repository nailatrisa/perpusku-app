import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    nik: '',
    no_telepon: '',
    alamat: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      return toast.error('Password dan konfirmasi tidak cocok.');
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Registrasi berhasil! Selamat datang.');
      navigate('/user/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registrasi gagal.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-dark-900/60 backdrop-blur border border-dark-800 rounded-3xl shadow-2xl p-8">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-dark-400 hover:text-primary-400 mb-5 transition">
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-3 shadow-violet">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Daftar Akun Anggota</h1>
          <p className="text-sm text-dark-400">Gratis, cukup isi data diri Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
              placeholder="Nama lengkap Anda"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="input"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="label">NIK (16 digit)</label>
              <input
                type="text"
                maxLength={16}
                value={form.nik}
                onChange={(e) => update('nik', e.target.value)}
                className="input"
                placeholder="3201xxxxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="label">No. Telepon</label>
            <input
              type="text"
              value={form.no_telepon}
              onChange={(e) => update('no_telepon', e.target.value)}
              className="input"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="label">Alamat</label>
            <textarea
              rows={2}
              value={form.alamat}
              onChange={(e) => update('alamat', e.target.value)}
              className="input"
              placeholder="Alamat lengkap"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="input"
                placeholder="Min. 6 karakter"
              />
            </div>
            <div>
              <label className="label">Konfirmasi *</label>
              <input
                type="password"
                required
                value={form.password_confirmation}
                onChange={(e) => update('password_confirmation', e.target.value)}
                className="input"
                placeholder="Ulangi password"
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
                <UserPlus size={18} /> Daftar Sekarang
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-center text-dark-400 mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}