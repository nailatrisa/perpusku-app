import { useEffect, useState } from 'react';
import { FileText, Download, BookOpen, Users, HandHelping, Filter, Search, ChevronRight } from 'lucide-react';
import { reportApi } from '../../api/endpoints';
import { formatTanggalShort, formatRupiah, getInitials } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('loans');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    dari: '',
    sampai: '',
    status: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'loans') {
        res = await reportApi.loans(filters);
      } else if (activeTab === 'books') {
        res = await reportApi.books();
      } else if (activeTab === 'users') {
        res = await reportApi.users();
      }
      setData(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat laporan');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  const tabs = [
    { id: 'loans', label: 'Peminjaman', icon: HandHelping },
    { id: 'books', label: 'Buku', icon: BookOpen },
    { id: 'users', label: 'Anggota', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Laporan</h2>
          <p className="text-sm text-dark-400">Rekap data perpustakaan dan export ke PDF</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-1.5 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === t.id
                ? 'bg-primary-500 text-white shadow-violet'
                : 'text-dark-300 hover:bg-dark-800'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter */}
      {activeTab === 'loans' && (
        <form onSubmit={handleFilter} className="card p-4 grid md:grid-cols-5 gap-3">
          <div>
            <label className="label text-xs">Dari Tanggal</label>
            <input
              type="date"
              value={filters.dari}
              onChange={(e) => setFilters({ ...filters, dari: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label text-xs">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.sampai}
              onChange={(e) => setFilters({ ...filters, sampai: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label text-xs">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="dikembalikan">Dikembalikan</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <button type="submit" className="btn-primary flex-1">
              <Filter size={16} /> Terapkan Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ dari: '', sampai: '', status: '' });
                setTimeout(fetchData, 100);
              }}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activeTab === 'loans' && (
          <>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Total Transaksi</p>
              <p className="text-2xl font-bold text-white mt-1">{summary.total || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Total Denda</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{formatRupiah(summary.total_denda || 0)}</p>
            </div>
          </>
        )}
        {activeTab === 'books' && (
          <>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Total Judul</p>
              <p className="text-2xl font-bold text-white mt-1">{summary.total || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Total Stok</p>
              <p className="text-2xl font-bold text-primary-400 mt-1">{summary.total_stok || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Stok Tersedia</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{summary.total_tersedia || 0}</p>
            </div>
          </>
        )}
        {activeTab === 'users' && (
          <>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Total User</p>
              <p className="text-2xl font-bold text-white mt-1">{summary.total || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Admin</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{summary.admin || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Pustakawan</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{summary.pustakawan || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-500 uppercase font-semibold">Masyarakat</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{summary.masyarakat || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <Loading text="Memuat laporan..." />
        ) : data.length === 0 ? (
          <div className="p-16 text-center">
            <FileText size={48} className="mx-auto mb-3 text-dark-600" />
            <p className="text-dark-400">Tidak ada data</p>
          </div>
        ) : (
          <>
            {activeTab === 'loans' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-dark-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Peminjam</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Buku</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Tgl Pinjam</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-dark-400 uppercase">Denda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {data.map((l) => (
                      <tr key={l.id} className="hover:bg-dark-800/40">
                        <td className="px-4 py-3 font-mono text-xs text-dark-300">{l.kode_pinjam}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white text-xs">{l.user_name}</p>
                          <p className="text-xs text-dark-500 font-mono">{l.no_kartu_anggota || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-dark-200">{l.book_judul}</td>
                        <td className="px-4 py-3 text-center text-xs text-dark-400">
                          {formatTanggalShort(l.tanggal_pinjam)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${
                            l.status === 'dikembalikan' ? 'bg-emerald-500/15 text-emerald-400' :
                            l.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                            l.status === 'ditolak' ? 'bg-rose-500/15 text-rose-400' :
                            'bg-primary-500/15 text-primary-300'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs">
                          {l.denda > 0 ? (
                            <span className="text-rose-400 font-semibold">{formatRupiah(l.denda)}</span>
                          ) : (
                            <span className="text-dark-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'books' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-dark-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Judul</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Penulis</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Stok Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Tersedia</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Rak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {data.map((b) => (
                      <tr key={b.id} className="hover:bg-dark-800/40">
                        <td className="px-4 py-3 font-semibold text-white text-xs">{b.judul}</td>
                        <td className="px-4 py-3 text-xs text-dark-300">{b.penulis}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className="badge bg-blue-500/15 text-blue-400">{b.kategori}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-dark-200">{b.stok_total}</td>
                        <td className="px-4 py-3 text-center text-xs">
                          <span className={b.stok_tersedia > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {b.stok_tersedia}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-dark-400">{b.lokasi_rak || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-dark-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Role</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">No. Kartu</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {data.map((u) => (
                      <tr key={u.id} className="hover:bg-dark-800/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {getInitials(u.name)}
                            </div>
                            <span className="font-semibold text-white text-xs">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-dark-300">{u.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${
                            u.role === 'admin' ? 'bg-purple-500/15 text-purple-400' :
                            u.role === 'pustakawan' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-mono text-dark-300">{u.no_kartu_anggota || '-'}</td>
                        <td className="px-4 py-3 text-center text-xs">
                          {u.status === 'aktif' ? (
                            <span className="text-emerald-400 font-semibold">Aktif</span>
                          ) : (
                            <span className="text-rose-400 font-semibold">Nonaktif</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info PDF */}
      <div className="card p-4 flex items-start gap-3 border-l-4 border-primary-500">
        <FileText size={20} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-300">
          <p className="font-semibold text-white mb-1">Export PDF</p>
          <p>Fitur export PDF akan tersedia di update berikutnya. Untuk sekarang data bisa dilihat dan difilter di halaman ini.</p>
        </div>
      </div>
    </div>
  );
}