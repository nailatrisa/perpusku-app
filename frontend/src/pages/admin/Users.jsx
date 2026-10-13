import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Users as UsersIcon } from 'lucide-react';
import { userApi } from '../../api/endpoints';
import { getInitials } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await userApi.list({ ...filters, page, limit: 10 });
      setUsers(res.data.data);
      setPagination({ page: res.data.pagination.page, total_pages: res.data.pagination.total_pages });
    } catch (err) {
      toast.error('Gagal memuat user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(1); };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus user "${name}"?`)) return;
    try {
      await userApi.destroy(id);
      toast.success('User dihapus');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const roleBadge = {
    admin: 'bg-purple-50 text-purple-700',
    pustakawan: 'bg-blue-50 text-blue-700',
    masyarakat: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Anggota</h2>
          <p className="text-sm text-dark-400">Kelola user, pustakawan, dan masyarakat</p>
        </div>
        <Link to="/admin/users/create" className="btn-primary">
          <Plus size={18} /> Tambah User
        </Link>
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input type="text" placeholder="Cari nama, email, no. anggota..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input pl-10" />
        </div>
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="input sm:w-48">
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="pustakawan">Pustakawan</option>
          <option value="masyarakat">Masyarakat</option>
        </select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      <div className="card overflow-hidden">
        {loading ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-900/40 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200 hidden md:table-cell">Kontak</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200">Role</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200 hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-dark-500">
                    <UsersIcon size={40} className="mx-auto mb-2 opacity-50" />
                    <p>Belum ada user</p>
                  </td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-900/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-dark-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-dark-300">{u.no_telepon || '-'}</p>
                      <p className="text-xs font-mono text-dark-500">{u.no_kartu_anggota || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      {u.status === 'aktif' ? (
                        <span className="badge bg-emerald-50 text-emerald-700">Aktif</span>
                      ) : (
                        <span className="badge bg-rose-50 text-rose-700">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/admin/users/${u.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/admin/users/${u.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(u.id, u.name)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
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