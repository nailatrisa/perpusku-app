import { useEffect, useState } from 'react';
import { Database, Download, Trash2, Plus, AlertCircle, HardDrive, Clock, FileText } from 'lucide-react';
import api from '../../api/axios';
import { formatTanggalJam } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backups');
      setBackups(res.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat backup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!confirm('Buat backup database sekarang?')) return;
    setCreating(true);
    try {
      const res = await api.post('/backups');
      toast.success(`Backup berhasil: ${res.data.data.name}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = (filename) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:3000/api/backups/${filename}/download?token=${token}`;
    window.open(url, '_blank');
    toast.success('Backup diunduh');
  };

  const handleDelete = async (filename) => {
    if (!confirm(`Hapus backup "${filename}"?`)) return;
    try {
      await api.delete(`/backups/${filename}`);
      toast.success('Backup dihapus');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const totalSize = backups.reduce((sum, b) => sum + (b.size || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Backup Database</h2>
          <p className="text-sm text-dark-400">Kelola dan download backup database aplikasi</p>
        </div>
        <button onClick={handleCreate} disabled={creating} className="btn-primary disabled:opacity-60">
          {creating ? (
            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
          ) : (
            <><Plus size={18} /> Buat Backup Baru</>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="card p-4 flex items-start gap-3 border-l-4 border-primary-500">
        <AlertCircle size={20} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-300">
          <p className="font-semibold text-white mb-1">Informasi Backup</p>
          <p>Backup menghasilkan file <b>.sql</b> yang berisi struktur + data seluruh tabel. File tersimpan di server dan dapat di-download kapan saja untuk keperluan restore.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Database size={14} className="text-primary-400" />
            <p className="text-xs text-dark-500 uppercase font-semibold">Total Backup</p>
          </div>
          <p className="text-2xl font-bold text-white">{backups.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive size={14} className="text-emerald-400" />
            <p className="text-xs text-dark-500 uppercase font-semibold">Total Size</p>
          </div>
          <p className="text-2xl font-bold text-white">{(totalSize / 1024).toFixed(2)} KB</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-400" />
            <p className="text-xs text-dark-500 uppercase font-semibold">Terbaru</p>
          </div>
          <p className="text-sm font-bold text-white">
            {backups.length > 0 ? formatTanggalJam(backups[0].created_at) : '-'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <Loading text="Memuat backup..." />
        ) : backups.length === 0 ? (
          <div className="p-16 text-center">
            <Database size={48} className="mx-auto mb-3 text-dark-600" />
            <p className="text-xl font-bold text-white mb-2">Belum ada backup</p>
            <p className="text-sm text-dark-400 mb-6">Klik "Buat Backup Baru" untuk memulai</p>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              <Plus size={16} /> Buat Backup Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Nama File</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase">Ukuran</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase hidden md:table-cell">Dibuat</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {backups.map((b) => (
                  <tr key={b.name} className="hover:bg-dark-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-white truncate">{b.name}</p>
                          <p className="text-xs text-dark-500">SQL Dump</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-dark-300">{b.size_formatted}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell text-xs text-dark-400">
                      {formatTanggalJam(b.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(b.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500/15 hover:bg-primary-500 text-primary-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          <Download size={12} /> Download
                        </button>
                        <button
                          onClick={() => handleDelete(b.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          <Trash2 size={12} />
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

      {/* Info Restore */}
      <div className="card p-4 flex items-start gap-3 border-l-4 border-amber-500">
        <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-dark-300">
          <p className="font-semibold text-white mb-1">Cara Restore Database</p>
          <p>1. Download file backup (.sql)</p>
          <p>2. Buka phpMyAdmin → tab <b>Import</b></p>
          <p>3. Pilih file, klik <b>Go</b></p>
        </div>
      </div>
    </div>
  );
}