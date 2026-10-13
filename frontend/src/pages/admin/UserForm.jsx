import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, QrCode, Pencil } from 'lucide-react';
import { userApi } from '../../api/endpoints';
import { getInitials } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function UserForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const [loading, setLoading] = useState(isEdit || isView);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', role: 'masyarakat', status: 'aktif',
    nik: '', no_telepon: '', alamat: '', password: '', password_confirmation: '',
  });

  useEffect(() => {
    if ((isEdit || isView) && id) {
      userApi.show(id).then((res) => {
        const u = res.data.data;
        setUserData(u);
        setForm({
          name: u.name || '', email: u.email || '', role: u.role || 'masyarakat',
          status: u.status || 'aktif', nik: u.nik || '', no_telepon: u.no_telepon || '',
          alamat: u.alamat || '', password: '', password_confirmation: '',
        });
      }).catch(() => {
        toast.error('User tidak ditemukan');
        navigate('/admin/users');
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit, isView, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.password_confirmation) {
      return toast.error('Password tidak cocok');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      delete payload.password_confirmation;

      if (isEdit) {
        await userApi.update(id, payload);
        toast.success('User diupdate');
      } else {
        await userApi.create(payload);
        toast.success('User ditambahkan');
      }
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/users')} className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-800 hover:bg-gray-200">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isView ? 'Detail User' : isEdit ? 'Edit User' : 'Tambah User'}
          </h2>
          <p className="text-sm text-dark-400">
            {isView ? 'Informasi lengkap user' : isEdit ? userData?.name : 'Buat akun baru'}
          </p>
        </div>
      </div>

      {isView && userData ? (
        <>
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
                  {getInitials(userData.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userData.name}</h3>
                  <p className="text-blue-100 text-sm">{userData.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold uppercase">
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-dark-400 uppercase">NIK</p>
                <p className="font-mono font-semibold">{userData.nik || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase">No. Kartu</p>
                <p className="font-mono font-semibold">{userData.no_kartu_anggota || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase">No. Telepon</p>
                <p className="font-semibold">{userData.no_telepon || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase">Status</p>
                <p className={`font-semibold ${userData.status === 'aktif' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {userData.status}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-dark-400 uppercase">Alamat</p>
                <p>{userData.alamat || '-'}</p>
              </div>
            </div>
          </div>

          {userData.qr_code && (
            <div className="card p-6 text-center">
              <h3 className="font-bold text-white mb-3 flex items-center justify-center gap-2">
                <QrCode size={18} /> QR Code Anggota
              </h3>
              <div className="bg-dark-900/60 p-3 rounded-lg inline-block shadow">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(userData.qr_code)}`} alt="QR" className="w-40 h-40" />
              </div>
              <p className="text-xs font-mono text-dark-400 mt-2">{userData.qr_code}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => navigate(`/admin/users/${id}/edit`)} className="btn-primary">
              <Pencil size={18} /> Edit User
            </button>
            <button onClick={() => navigate('/admin/users')} className="btn-secondary">Kembali</button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Nama Lengkap *</label>
              <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Role *</label>
              <select required value={form.role} onChange={(e) => update('role', e.target.value)} className="input">
                <option value="masyarakat">Masyarakat</option>
                <option value="pustakawan">Pustakawan</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="label">Status</label>
                <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">NIK (16 digit)</label>
              <input type="text" maxLength={16} value={form.nik} onChange={(e) => update('nik', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">No. Telepon</label>
              <input type="text" value={form.no_telepon} onChange={(e) => update('no_telepon', e.target.value)} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Alamat</label>
              <textarea rows={2} value={form.alamat} onChange={(e) => update('alamat', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">{isEdit ? 'Password Baru (opsional)' : 'Password *'}</label>
              <input type="password" required={!isEdit} minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className="input" placeholder={isEdit ? 'Kosongkan jika tidak ganti' : 'Min. 6 karakter'} />
            </div>
            <div>
              <label className="label">Konfirmasi Password</label>
              <input type="password" required={!isEdit} value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} className="input" />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Save size={18} />}
              {saving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
            </button>
            <button type="button" onClick={() => navigate('/admin/users')} className="btn-secondary">Batal</button>
          </div>
        </form>
      )}
    </div>
  );
}