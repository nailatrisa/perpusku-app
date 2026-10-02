import { useEffect, useState } from 'react';
import { Check, X, Clock, BookOpen } from 'lucide-react';
import { loanApi } from '../../api/endpoints';
import { formatDateTime, getUploadUrl, getInitials } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Persetujuan() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await loanApi.pending();
      setLoans(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat pengajuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    if (!confirm('Setujui peminjaman ini?')) return;
    setProcessing(id);
    try {
      await loanApi.approve(id);
      toast.success('Peminjaman disetujui');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) return toast.error('Alasan wajib diisi');
    try {
      await loanApi.reject(rejectModal.id, rejectModal.reason);
      toast.success('Peminjaman ditolak');
      setRejectModal({ open: false, id: null, reason: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menolak');
    }
  };

  if (loading) return <Loading text="Memuat pengajuan..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Persetujuan Peminjaman</h2>
          <p className="text-sm text-dark-400">Setujui atau tolak pengajuan peminjaman dari anggota</p>
        </div>
        <div className="badge bg-amber-500/20 text-amber-300 px-4 py-2">
          <Clock size={14} /> {loans.length} menunggu
        </div>
      </div>

      {loans.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-dark-800 flex items-center justify-center">
            <Check size={48} className="text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white mb-2">Tidak ada pengajuan</p>
          <p className="text-sm text-dark-400">Semua pengajuan sudah diproses</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((l) => (
            <div key={l.id} className="card p-5 hover:border-primary-500/40 transition">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-32 flex-shrink-0">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-dark-800">
                    {l.book_cover ? (
                      <img src={getUploadUrl(l.book_cover)} alt={l.book_judul} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-500"><BookOpen size={32} /></div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="badge bg-amber-500/20 text-amber-300 mb-2">
                        <Clock size={12} /> Menunggu Persetujuan
                      </span>
                      <h3 className="font-bold text-white text-lg font-display">{l.book_judul}</h3>
                      <p className="text-sm text-dark-400">oleh {l.book_penulis}</p>
                    </div>
                    <span className="font-mono text-xs text-dark-500 bg-dark-800 px-3 py-1.5 rounded-lg">{l.kode_pinjam}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 pt-3 border-t border-dark-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {getInitials(l.user_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-dark-500 uppercase font-semibold">Peminjam</p>
                        <p className="font-semibold text-white text-sm truncate">{l.user_name}</p>
                        <p className="text-xs text-dark-500 font-mono">{l.no_kartu_anggota || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 uppercase font-semibold">Diajukan</p>
                      <p className="font-semibold text-white text-sm">{formatDateTime(l.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 uppercase font-semibold">Jatuh Tempo</p>
                      <p className="font-semibold text-white text-sm">{formatDateTime(l.tanggal_jatuh_tempo)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-dark-800">
                    <button
                      onClick={() => handleApprove(l.id)}
                      disabled={processing === l.id}
                      className="btn-success flex-1 disabled:opacity-60"
                    >
                      {processing === l.id ? (
                        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      ) : (
                        <><Check size={16} /> Setujui</>
                      )}
                    </button>
                    <button
                      onClick={() => setRejectModal({ open: true, id: l.id, reason: '' })}
                      className="btn-danger flex-1"
                    >
                      <X size={16} /> Tolak
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-4 font-display">Tolak Peminjaman</h3>
            <div>
              <label className="label">Alasan Penolakan *</label>
              <textarea
                rows={3}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                className="input"
                placeholder="Contoh: Stok sedang kosong, buku sedang diperbaiki..."
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleReject} className="btn-danger flex-1">Tolak</button>
              <button onClick={() => setRejectModal({ open: false })} className="btn-secondary">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}