import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tags, X } from 'lucide-react';
import { categoryApi } from '../../api/endpoints';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ nama_kategori: '', deskripsi: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.list();
      setCategories(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm({ nama_kategori: '', deskripsi: '' });
    setModal({ open: true, mode: 'create', data: null });
  };

  const openEdit = (cat) => {
    setForm({ nama_kategori: cat.nama_kategori, deskripsi: cat.deskripsi || '' });
    setModal({ open: true, mode: 'edit', data: cat });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'edit') {
        await categoryApi.update(modal.data.id, form);
        toast.success('Kategori diupdate');
      } else {
        await categoryApi.create(form);
        toast.success('Kategori ditambahkan');
      }
      setModal({ open: false });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus kategori "${nama}"?`)) return;
    try {
      await categoryApi.destroy(id);
      toast.success('Kategori dihapus');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Kategori</h2>
          <p className="text-sm text-dark-400">Kelola kategori buku</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-900/40 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200 w-16">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200">Nama Kategori</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-200 hidden md:table-cell">Deskripsi</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200">Jumlah Buku</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark-200 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-dark-500">
                    <Tags size={40} className="mx-auto mb-2 opacity-50" />
                    <p>Belum ada kategori</p>
                  </td></tr>
                ) : categories.map((cat, i) => (
                  <tr key={cat.id} className="hover:bg-dark-900/40 transition">
                    <td className="px-4 py-3 text-dark-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{cat.nama_kategori}</p>
                      <p className="text-xs text-dark-500 font-mono">{cat.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-dark-300">{cat.deskripsi || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge bg-blue-50 text-blue-700">{cat.books_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.nama_kategori)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
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

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {modal.mode === 'edit' ? 'Edit Kategori' : 'Tambah Kategori'}
              </h3>
              <button onClick={() => setModal({ open: false })} className="text-dark-500 hover:text-dark-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nama Kategori *</label>
                <input type="text" required value={form.nama_kategori} onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Deskripsi</label>
                <textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="input" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {modal.mode === 'edit' ? 'Update' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}