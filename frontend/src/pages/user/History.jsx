import { useEffect, useState } from 'react';
import { BookOpen, History as HistoryIcon, RotateCcw, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { loanApi } from '../../api/endpoints';
import { formatTanggalJam, formatRupiah, hitungHariTerlambat } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function History() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await loanApi.myLoans();
      setLoans(res.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleKembalikan = async (loanId, judul) => {
    if (!confirm(`Ajukan pengembalian buku "${judul}"?\n\nPastikan Anda sudah menyerahkan buku fisik ke pustakawan.`)) return;
    setProcessing(loanId);
    try {
      const res = await loanApi.returnBook({ loan_id: loanId });
      const denda = res.data.data?.denda || 0;
      if (denda > 0) {
        toast.success(`Buku dikembalikan pada ${formatTanggalJam(new Date())}. Denda: ${formatRupiah(denda)}`);
      } else {
        toast.success('Buku berhasil dikembalikan.');
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengembalikan');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Riwayat Peminjaman</h2>
        <p className="text-sm text-dark-400">Semua transaksi peminjaman Anda dengan timestamp realtime</p>
      </div>

      <div className="card p-4 flex items-start gap-3 border-l-4 border-amber-500">
        <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-300">
          <p className="font-semibold text-white mb-1">Informasi Denda</p>
          <p>Keterlambatan pengembalian dikenakan denda <b className="text-amber-400">Rp 2.000 / hari / buku</b>. Tanggal kembali dicatat realtime saat Anda klik tombol Kembalikan.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loans.length === 0 ? (
          <div className="p-12 text-center text-dark-500">
            <HistoryIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>Belum ada riwayat peminjaman</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Buku</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase hidden md:table-cell">Tgl Pinjam</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase hidden md:table-cell">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase hidden lg:table-cell">Tgl Kembali</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-400 uppercase">Denda</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {loans.map((l) => {
                  const denda = parseFloat(l.denda_display || l.denda) || 0;
                  const terlambat = l.is_terlambat || (l.status === 'dipinjam' && new Date() > new Date(l.tanggal_jatuh_tempo));
                  const hariTerlambat = l.hari_terlambat || hitungHariTerlambat(l.tanggal_jatuh_tempo);
                  const bisaKembalikan = l.status === 'dipinjam';

                  return (
                    <tr key={l.id} className="hover:bg-dark-800/40 transition">
                      <td className="px-4 py-3 font-mono text-xs text-dark-300">{l.kode_pinjam}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {l.cover ? (
                              <img src={l.cover.startsWith('http') ? l.cover : `http://localhost:3000/uploads/${l.cover}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen size={16} className="text-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{l.judul}</p>
                            <p className="text-xs text-dark-400 truncate">{l.penulis}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell text-xs">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-dark-300 font-semibold">{formatTanggalJam(l.tanggal_pinjam).split(' ').slice(0, 3).join(' ')}</span>
                          <span className="text-primary-400 font-mono text-xs flex items-center gap-1">
                            <Clock size={10} /> {formatTanggalJam(l.tanggal_pinjam).split(' ').slice(3).join(' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell text-xs">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-dark-300 font-semibold">{formatTanggalJam(l.tanggal_jatuh_tempo).split(' ').slice(0, 3).join(' ')}</span>
                          <span className="text-amber-400 font-mono text-xs flex items-center gap-1">
                            <Clock size={10} /> {formatTanggalJam(l.tanggal_jatuh_tempo).split(' ').slice(3).join(' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell text-xs">
                        {l.tanggal_kembali ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-dark-300 font-semibold">{formatTanggalJam(l.tanggal_kembali).split(' ').slice(0, 3).join(' ')}</span>
                            <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                              <CheckCircle size={10} /> {formatTanggalJam(l.tanggal_kembali).split(' ').slice(3).join(' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-dark-500 italic">Belum dikembalikan</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {l.status === 'dikembalikan' ? (
                          <span className="badge bg-emerald-500/15 text-emerald-400">Selesai</span>
                        ) : l.status === 'pending' ? (
                          <span className="badge bg-amber-500/15 text-amber-400">Menunggu</span>
                        ) : l.status === 'ditolak' ? (
                          <span className="badge bg-rose-500/15 text-rose-400">Ditolak</span>
                        ) : terlambat ? (
                          <span className="badge bg-rose-500/15 text-rose-400">Terlambat {hariTerlambat}h</span>
                        ) : (
                          <span className="badge bg-primary-500/15 text-primary-300">Dipinjam</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {denda > 0 ? (
                          <span className="font-bold text-rose-400">{formatRupiah(denda)}</span>
                        ) : (
                          <span className="text-dark-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {bisaKembalikan ? (
                          <button
                            onClick={() => handleKembalikan(l.id, l.judul)}
                            disabled={processing === l.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60"
                          >
                            {processing === l.id ? (
                              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                            ) : (
                              <><RotateCcw size={12} /> Kembalikan</>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-dark-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}