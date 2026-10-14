import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, HandHelping, Check } from 'lucide-react';
import { bookApi, loanApi } from '../../api/endpoints';
import { getUploadUrl, handleBookCoverError } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    bookApi.show(id)
      .then((res) => setBook(res.data.data))
      .catch(() => {
        toast.error('Buku tidak ditemukan');
        navigate('/user/catalog');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBorrow = async () => {
    const now = new Date();
    const tglAjukan = now.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const jamAjukan = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const jatuhTempo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tglJatuh = jatuhTempo.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const jamJatuh = jatuhTempo.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const pesan = `Ajukan peminjaman buku "${book.judul}"?\n\n` +
      `Tanggal Pengajuan: ${tglAjukan}\n` +
      `Jam: ${jamAjukan}\n\n` +
      `Jatuh Tempo: ${tglJatuh}\n` +
      `Jam: ${jamJatuh}\n` +
      `Durasi: 7 hari\n\n` +
      `Setelah disetujui pustakawan, Anda dapat meminjam buku tersebut.`;

    if (!confirm(pesan)) return;
    setSubmitting(true);
    try {
      const res = await loanApi.requestBorrow({ book_id: book.id });
      toast.success(`Pengajuan terkirim pada ${jamAjukan}! Tunggu persetujuan pustakawan.`);
      navigate('/user/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal meminjam');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!book) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/user/catalog" className="inline-flex items-center gap-2 text-sm text-dark-300 hover:text-slate-900">
        <ArrowLeft size={16} /> Kembali ke Katalog
      </Link>

      <div className="card overflow-hidden">
        <div className="grid md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            {book.cover ? (
              <img src={getUploadUrl(book.cover)} onError={handleBookCoverError} alt={book.judul} className="w-full rounded-lg shadow-md" />
            ) : (
              <div className="aspect-[3/4] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={64} />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="badge bg-blue-50 text-blue-700">{book.kategori}</span>
              <h1 className="text-2xl font-bold text-white mt-2">{book.judul}</h1>
              <p className="text-dark-300">oleh <b>{book.penulis}</b></p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              <div>
                <p className="text-xs text-dark-400 uppercase">Penerbit</p>
                <p className="font-semibold">{book.penerbit || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase">Tahun</p>
                <p className="font-semibold">{book.tahun_terbit || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase">ISBN</p>
                <p className="font-mono font-semibold text-xs">{book.isbn || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase">Lokasi Rak</p>
                <p className="font-semibold">{book.lokasi_rak || '-'}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-dark-400 uppercase mb-2">Deskripsi</p>
              <p className="text-sm text-dark-200 leading-relaxed">{book.deskripsi || 'Tidak ada deskripsi.'}</p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-600">Tersedia</p>
                  <p className="font-bold text-emerald-700">{book.stok_tersedia} / {book.stok_total}</p>
                </div>
              </div>

              {book.stok_tersedia > 0 ? (
                <button onClick={handleBorrow} disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-60">
                  {submitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <HandHelping size={18} />}
                  {submitting ? 'Memproses...' : 'Ajukan Peminjaman'}
                </button>
              ) : (
                <button disabled className="btn-secondary w-full py-3 cursor-not-allowed">Stok Habis</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}