import { useEffect, useState } from 'react';
import { Search, Banknote, Check } from 'lucide-react';
import { fineApi } from '../../api/endpoints';
import { formatRupiah, formatTanggalShort } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [summary, setSummary] = useState({ total_belum: 0, total_sudah: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fineApi.list(filters);
      setFines(res.data.data);
      setSummary(res.data.summary);
    } catch (err) {
      toast.error('Gagal memuat denda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchData(); };

  const handleBayar = async (id) => {
    if (!confirm('Konfirmasi denda sudah dibayar?')) return;
    try {
      await fineApi.bayar(id);
      toast.success('Denda ditandai lunas');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Manajemen Denda</h2>
        <p className="text-sm text-dark-400">Kelola dan konfirmasi pembayaran denda</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-xs uppercase opacity-80">Total Belum Dibayar</p>
          <p className="text-3xl font-bold mt-1">{formatRupiah(summary.total_belum)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-xs uppercase opacity-80">Total Sudah Dibayar</p>
          <p className="text-3xl font-bold mt-1">{formatRupiah(summary.total_sudah)}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input type="text" placeholder="Cari nama anggota..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input pl-10" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input sm:w-48">
          <option value="">Semua Status</option>
          <option value="belum_bayar">Belum Bayar</option>
          <option value="sudah_bayar">Sudah Bayar</option>
        </select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      <div className="card overflow-hidden">
        {loading ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-900/40 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200">Anggota</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200 hidden md:table-cell">Buku</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200 hidden lg:table-cell">Tgl Kembali</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark-200">Denda</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200 w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {fines.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-dark-500">
                    <Banknote size={40} className="mx-auto mb-2 opacity-50" />
                    <p>Tidak ada denda</p>
                  </td></tr>
                ) : fines.map((f) => (
                  <tr key={f.id} className="hover:bg-dark-900/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white text-xs">{f.user_name}</p>
                      <p className="text-xs text-dark-500 font-mono">{f.no_kartu_anggota || '-'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs">{f.book_judul}</td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell text-xs">
                      {f.tanggal_kembali ? formatTanggalShort(f.tanggal_kembali) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-600 text-xs">
                      {formatRupiah(f.jumlah_denda)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {f.status_bayar === 'sudah_bayar' ? (
                        <span className="badge bg-emerald-50 text-emerald-700">Lunas</span>
                      ) : (
                        <span className="badge bg-rose-50 text-rose-700">Belum Bayar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {f.status_bayar === 'belum_bayar' ? (
                        <button onClick={() => handleBayar(f.id)} className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600">
                          <Check size={14} className="inline" /> Lunas
                        </button>
                      ) : (
                        <span className="text-xs text-dark-500">{formatTanggalShort(f.tanggal_bayar)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}