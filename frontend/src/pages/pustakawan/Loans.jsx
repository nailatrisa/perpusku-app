import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, QrCode, HandHelping } from 'lucide-react';
import { loanApi } from '../../api/endpoints';
import { formatTanggalShort, hitungHariTerlambat, formatRupiah } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await loanApi.list({ ...filters, page, limit: 15 });
      setLoans(res.data.data);
      setPagination({ page: res.data.pagination.page, total_pages: res.data.pagination.total_pages });
    } catch (err) {
      toast.error('Gagal memuat peminjaman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchData(1); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Daftar Peminjaman</h2>
          <p className="text-sm text-dark-400">Pantau semua transaksi peminjaman</p>
        </div>
        <Link to="/pustakawan/scan" className="btn-primary">
          <QrCode size={18} /> Scan QR untuk Proses
        </Link>
      </div>

      <div className="card p-4 flex items-start gap-3 border-l-4 border-primary-500">
        <QrCode size={20} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-300">
          <p className="font-semibold text-white mb-1">Cara Proses Pengembalian</p>
          <p>Klik <b className="text-primary-400">Scan QR</b> → scan kartu anggota → scan buku → klik <b className="text-primary-400">Kembalikan</b> di panel scan.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input type="text" placeholder="Cari kode, nama, judul..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input pl-10" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input sm:w-48">
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="dipinjam">Dipinjam</option>
          <option value="dikembalikan">Dikembalikan</option>
          <option value="ditolak">Ditolak</option>
        </select>
        <button type="submit" className="btn-primary"><Filter size={16} /> Filter</button>
      </form>

      <div className="card overflow-hidden">
        {loading ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Peminjam</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase hidden md:table-cell">Buku</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase hidden lg:table-cell">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-400 uppercase">Denda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {loans.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-dark-500">
                    <HandHelping size={40} className="mx-auto mb-2 opacity-50" />
                    <p>Belum ada peminjaman</p>
                  </td></tr>
                ) : loans.map((l) => {
                  const terlambat = l.status === 'dipinjam' && new Date() > new Date(l.tanggal_jatuh_tempo);
                  const hariTerlambat = terlambat ? hitungHariTerlambat(l.tanggal_jatuh_tempo) : 0;
                  const denda = l.status === 'dikembalikan' ? parseFloat(l.denda) : (terlambat ? hariTerlambat * 2000 : 0);
                  return (
                    <tr key={l.id} className="hover:bg-dark-800/40">
                      <td className="px-4 py-3 font-mono text-xs text-dark-300">{l.kode_pinjam}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white text-xs">{l.user_name}</p>
                        <p className="text-xs text-dark-500 font-mono">{l.no_kartu_anggota || '-'}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-dark-300">{l.book_judul}</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell text-xs text-dark-400">
                        {formatTanggalShort(l.tanggal_jatuh_tempo)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {l.status === 'dikembalikan' ? (
                          <span className="badge bg-emerald-500/15 text-emerald-400">Dikembalikan</span>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-dark-800 flex items-center justify-between">
            <p className="text-xs text-dark-500">Halaman {pagination.page} dari {pagination.total_pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => fetchData(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${p === pagination.page ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}