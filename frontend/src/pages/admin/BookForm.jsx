import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Pencil, QrCode } from 'lucide-react';
import { bookApi, categoryApi } from '../../api/endpoints';
import { getUploadUrl, handleBookCoverError } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function BookForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit || isView);
  const [saving, setSaving] = useState(false);
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [form, setForm] = useState({
    judul: '', category_id: '', penulis: '', penerbit: '', tahun_terbit: '',
    isbn: '', stok_total: 1, lokasi_rak: '', deskripsi: '',
  });

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data.data)).catch(() => {});
    if ((isEdit || isView) && id) {
      bookApi.show(id).then((res) => {
        const b = res.data.data;
        setForm({
          judul: b.judul || '', category_id: b.category_id || '',
          penulis: b.penulis || '', penerbit: b.penerbit || '',
          tahun_terbit: b.tahun_terbit || '', isbn: b.isbn || '',
          stok_total: b.stok_total || 1, lokasi_rak: b.lokasi_rak || '',
          deskripsi: b.deskripsi || '',
        });
        if (b.cover) setPreview(getUploadUrl(b.cover));
        if (b.qr_code) setQrCode(b.qr_code);
      }).catch(() => {
        toast.error('Buku tidak ditemukan');
        navigate('/admin/books');
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit, isView, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') fd.append(k, v);
      });
      if (cover) fd.append('cover', cover);

      if (isEdit) {
        await bookApi.update(id, fd);
        toast.success('Buku berhasil diupdate');
      } else {
        await bookApi.create(fd);
        toast.success('Buku berhasil ditambahkan');
      }
      navigate('/admin/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (file) { setCover(file); setPreview(URL.createObjectURL(file)); }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/books')} className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-800 hover:bg-gray-200 transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isView ? 'Detail Buku' : isEdit ? 'Edit Buku' : 'Tambah Buku'}
          </h2>
          <p className="text-sm text-dark-400">
            {isView ? 'Informasi lengkap buku' : isEdit ? `Edit: ${form.judul}` : 'Isi data buku baru'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label">Judul Buku *</label>
            <input type="text" required value={form.judul} onChange={(e) => update('judul', e.target.value)} className="input" disabled={isView} />
          </div>
          <div>
            <label className="label">Kategori *</label>
            <select required value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className="input" disabled={isView}>
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.nama_kategori}</option>))}
            </select>
          </div>
          <div>
            <label className="label">Penulis *</label>
            <input type="text" required value={form.penulis} onChange={(e) => update('penulis', e.target.value)} className="input" disabled={isView} />
          </div>
          <div>
            <label className="label">Penerbit</label>
            <input type="text" value={form.penerbit} onChange={(e) => update('penerbit', e.target.value)} className="input" disabled={isView} />
          </div>
          <div>
            <label className="label">Tahun Terbit</label>
            <input type="number" min="1900" max={new Date().getFullYear()} value={form.tahun_terbit} onChange={(e) => update('tahun_terbit', e.target.value)} className="input" disabled={isView} />
          </div>
          <div>
            <label className="label">ISBN</label>
            <input type="text" value={form.isbn} onChange={(e) => update('isbn', e.target.value)} className="input" disabled={isView} />
          </div>
          <div>
            <label className="label">Stok Total *</label>
            <input type="number" min="1" required value={form.stok_total} onChange={(e) => update('stok_total', e.target.value)} className="input" disabled={isView} />
          </div>
          <div>
            <label className="label">Lokasi Rak</label>
            <input type="text" placeholder="Contoh: RK-A-1" value={form.lokasi_rak} onChange={(e) => update('lokasi_rak', e.target.value)} className="input" disabled={isView} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Deskripsi</label>
            <textarea rows={4} value={form.deskripsi} onChange={(e) => update('deskripsi', e.target.value)} className="input" disabled={isView} />
          </div>
          {!isView && (
            <div className="md:col-span-2">
              <label className="label">Cover Buku</label>
              {preview && (
                <div className="mb-3">
                  <img src={preview} onError={handleBookCoverError} alt="preview" className="w-24 h-32 object-cover rounded shadow" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCover} className="input file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer" />
              <p className="text-xs text-dark-400 mt-1">Format: JPG, PNG, WEBP (max 2MB)</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {!isView ? (
            <>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Save size={18} />}
                {saving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
              </button>
              <button type="button" onClick={() => navigate('/admin/books')} className="btn-secondary">Batal</button>
            </>
          ) : (
            <button type="button" onClick={() => navigate(`/admin/books/${id}/edit`)} className="btn-primary">
              <Pencil size={18} /> Edit Buku
            </button>
          )}
        </div>
      </form>

      {isView && qrCode && (
        <div className="card p-6 text-center">
          <h3 className="font-bold text-white mb-3 flex items-center justify-center gap-2">
            <QrCode size={18} /> QR Code Buku
          </h3>
          <div className="bg-dark-900/60 p-3 rounded-lg inline-block shadow">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="QR" className="w-40 h-40" />
          </div>
          <p className="text-xs font-mono text-dark-400 mt-2">{qrCode}</p>
        </div>
      )}
    </div>
  );
}