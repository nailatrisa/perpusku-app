import { useEffect, useState } from 'react';
import { BookOpen, Printer } from 'lucide-react';
import { authApi } from '../../api/endpoints';
import { formatTanggalShort } from '../../utils/helpers';
import Loading from '../../components/Loading';

export default function Card() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((res) => setUser(res.data.data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Kartu Anggota Digital</h2>
        <p className="text-sm text-dark-400">Tunjukkan QR Code ini ke pustakawan</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#0f172a] rounded-2xl shadow-2xl overflow-hidden text-white">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <BookOpen size={26} className="text-coral-500" />
              <span className="text-xl font-bold">Perpus<span className="text-coral-500">Ku</span></span>
            </div>
            <span className="px-2.5 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold uppercase">Kartu Anggota</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-3xl font-bold border-2 border-white/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-blue-200 uppercase">Nama Anggota</p>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-xs text-blue-200 mt-1">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/10">
            <div>
              <p className="text-xs text-blue-200 uppercase">No. Anggota</p>
              <p className="font-mono font-bold">{user.no_kartu_anggota || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 uppercase">NIK</p>
              <p className="font-mono font-bold">{user.nik || '-'}</p>
            </div>
          </div>

          <div className="pt-6 flex flex-col items-center">
            <div className="bg-dark-900/60 p-3 rounded-xl shadow-lg">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(user.qr_code)}`} alt="QR" className="w-48 h-48" />
            </div>
            <p className="text-xs font-mono text-blue-200 mt-3">{user.qr_code}</p>
            <p className="text-xs text-blue-200 mt-1 italic">Scan QR ini untuk peminjaman buku</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur px-6 py-3 flex justify-between items-center text-xs text-blue-200">
          <span>Terdaftar: {formatTanggalShort(user.created_at)}</span>
          <span>Status: <b className="text-emerald-400">{user.status}</b></span>
        </div>
      </div>

      <button onClick={() => window.print()} className="btn-primary w-full py-3">
        <Printer size={18} /> Cetak Kartu
      </button>
    </div>
  );
}