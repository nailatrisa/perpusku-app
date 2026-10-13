import { useEffect, useState } from 'react';
import { ListChecks, Search, Filter, Activity, User, Clock, Globe } from 'lucide-react';
import api from '../../api/axios';
import { formatTanggalJam, getInitials } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [aktivitasList, setAktivitasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 });
  const [filters, setFilters] = useState({
    user_id: '',
    aktivitas: '',
    dari: '',
    sampai: '',
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs', { params: { ...filters, page, limit: 25 } });
      setLogs(res.data.data || []);
      setUsers(res.data.users || []);
      setAktivitasList(res.data.aktivitas_list || []);
      setPagination(res.data.pagination || { page: 1, total: 0, total_pages: 1 });
    } catch (err) {
      toast.error('Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const resetFilter = () => {
    setFilters({ user_id: '', aktivitas: '', dari: '', sampai: '' });
    setTimeout(() => fetchData(1), 100);
  };

  const getActivityColor = (aktivitas) => {
    if (aktivitas.includes('login')) return 'bg-blue-500/15 text-blue-400';
    if (aktivitas.includes('logout')) return 'bg-dark-900/400/15 text-dark-500';
    if (aktivitas.includes('pinjam')) return 'bg-primary-500/15 text-primary-300';
    if (aktivitas.includes('kembali')) return 'bg-emerald-500/15 text-emerald-400';
    if (aktivitas.includes('hapus') || aktivitas.includes('reject')) return 'bg-rose-500/15 text-rose-400';
    if (aktivitas.includes('approve')) return 'bg-emerald-500/15 text-emerald-400';
    if (aktivitas.includes('backup')) return 'bg-amber-500/15 text-amber-400';
    return 'bg-dark-700 text-dark-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Log Aktivitas</h2>
        <p className="text-sm text-dark-400">Riwayat semua aktivitas pengguna sistem</p>
      </div>

      {/* Filter */}
      <form onSubmit={handleFilter} className="card p-4 grid md:grid-cols-5 gap-3">
        <div>
          <label className="label text-xs">User</label>
          <select value={filters.user_id} onChange={(e) => setFilters({ ...filters, user_id: e.target.value })} className="input">
            <option value="">Semua User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">Aktivitas</label>
          <select value={filters.aktivitas} onChange={(e) => setFilters({ ...filters, aktivitas: e.target.value })} className="input">
            <option value="">Semua Aktivitas</option>
            {aktivitasList.map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">Dari</label>
          <input type="date" value={filters.dari} onChange={(e) => setFilters({ ...filters, dari: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label text-xs">Sampai</label>
          <input type="date" value={filters.sampai} onChange={(e) => setFilters({ ...filters, sampai: e.target.value })} className="input" />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">
            <Filter size={16} /> Filter
          </button>
        </div>
      </form>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-primary-400" />
            <p className="text-xs text-dark-500 uppercase font-semibold">Total Log</p>
          </div>
          <p className="text-2xl font-bold text-white">{pagination.total}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-emerald-400" />
            <p className="text-xs text-dark-500 uppercase font-semibold">Total User</p>
          </div>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-400" />
            <p className="text-xs text-dark-500 uppercase font-semibold">Jenis Aksi</p>
          </div>
          <p className="text-2xl font-bold text-white">{aktivitasList.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={14} className="text-blue-400" />
            <p className="text-xs text-dark-500 uppercase font-semibold">Halaman</p>
          </div>
          <p className="text-2xl font-bold text-white">{pagination.page}/{pagination.total_pages}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <Loading text="Memuat log..." />
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <ListChecks size={48} className="mx-auto mb-3 text-dark-600" />
            <p className="text-dark-400">Belum ada log aktivitas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase w-40">Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Aktivitas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase hidden md:table-cell">Deskripsi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase hidden lg:table-cell">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-800/40">
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold text-dark-200">{formatTanggalJam(log.created_at).split(' ').slice(0, 3).join(' ')}</p>
                      <p className="text-primary-400 font-mono flex items-center gap-1">
                        <Clock size={10} /> {formatTanggalJam(log.created_at).split(' ').slice(3).join(' ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(log.user_name || 'System')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-xs truncate">{log.user_name || '(deleted)'}</p>
                          <p className="text-xs text-dark-500 capitalize">{log.user_role || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getActivityColor(log.aktivitas)}`}>
                        {log.aktivitas.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-dark-300">{log.deskripsi || '-'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs font-mono text-dark-500">{log.ip_address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-dark-800 flex items-center justify-between">
            <p className="text-xs text-dark-500">Halaman {pagination.page} dari {pagination.total_pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.total_pages, 10) }, (_, i) => i + 1).map((p) => (
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