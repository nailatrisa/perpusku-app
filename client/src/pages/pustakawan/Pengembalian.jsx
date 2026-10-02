import { useEffect, useState } from 'react';
import { Search, RotateCcw, CheckCircle, Banknote } from 'lucide-react';
import { loanApi } from '../../api/endpoints';
import { formatTanggalShort, formatRupiah, getInitials } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Pengembalian() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await loanApi.returns({ ...filters, page, limit: 15 });
      setLoans(res.data.data);
      setPagination({ page: res.data.pagination.page, total_pages: res.data.pagination.total_pages });
    } catch (err) {
      toast.error('Gagal memuat data pengembalian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchData(1); };

  const totalDenda = loans.reduce((sum, l) => sum + (parseFloat(l.denda) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Pengembalian Buku</h2>
          <p className="text-sm text-dark-400">Riwayat buku yang sudah dikembalikan</p>
        </div>
        <div className="card px-4 py-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-dark-500 uppercase font-semibold">Total Denda</p>
            <p className="font-bold text-white">{formatRupiah(totalDenda)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Cari kode, nama peminjam, atau judul buku..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary"><Search size={16} /> Cari</button>
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
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase hidden lg:table-cell">Pinjam</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase hidden lg:table-cell">Kembali</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Denda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {loans.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-16 text-center">
                    <RotateCcw size={48} className="mx-auto mb-3 text-dark-600" />
                    <p className="text-dark-400">Belum ada pengembalian</p>
                  </td></tr>
                ) : loans.map((l) => {
                  const denda = parseFloat(l.denda) || 0;
                  const terlambat = denda > 0;
                  return (
                    <tr key={l.id} className="hover:bg-dark-800/40">
                      <td className="px-4 py-3 font-mono text-xs text-dark-300">{l.kode_pinjam}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(l.user_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs truncate">{l.user_name}</p>
                            <p className="text-xs text-dark-500 font-mono">{l.no_kartu_anggota || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-dark-300">{l.book_judul}</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell text-xs text-dark-400">
                        {formatTanggalShort(l.tanggal_pinjam)}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell text-xs text-dark-400">
                        {l.tanggal_kembali ? formatTanggalShort(l.tanggal_kembali) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {terlambat ? (
                          <span className="badge bg-rose-500/15 text-rose-400">
                            <Banknote size={12} /> {formatRupiah(denda)}
                          </span>
                        ) : (
                          <span className="badge bg-emerald-500/15 text-emerald-400">
                            <CheckCircle size={12} /> Tepat waktu
                          </span>
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
                <button
                  key={p}
                  onClick={() => fetchData(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                    p === pagination.page ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
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