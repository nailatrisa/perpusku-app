import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { BookOpen, Users, HandHelping, Banknote, TrendingUp, AlertTriangle, Flame, ChevronRight, Activity } from 'lucide-react';
import { dashboardApi } from '../../api/endpoints';
import { formatRupiah, formatDateTime, getUploadUrl, getInitials, handleBookCoverError } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.admin()
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Gagal memuat dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Memuat dashboard..." />;
  if (!data) return <p className="text-center text-dark-500">Data tidak tersedia</p>;

  const { stats, chart, stok_menipis, recent_loans, top_books } = data;

  const cards = [
    { label: 'Total Buku', val: stats.total_buku, icon: BookOpen, grad: 'from-primary-400 to-primary-600' },
    { label: 'Total Anggota', val: stats.total_anggota, icon: Users, grad: 'from-emerald-400 to-emerald-600' },
    { label: 'Sedang Dipinjam', val: stats.sedang_dipinjam, icon: HandHelping, grad: 'from-amber-400 to-amber-600' },
    { label: 'Total Denda', val: formatRupiah(stats.total_denda), icon: Banknote, grad: 'from-rose-400 to-rose-600' },
  ];

  const chartData = {
    labels: chart.labels,
    datasets: [{
      label: 'Peminjaman',
      data: chart.data,
      borderColor: '#6C63FF',
      backgroundColor: 'rgba(108, 99, 255, 0.15)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#aba3ff',
      pointBorderColor: '#0B1120',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#1e293b' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 font-display">
            <Activity size={28} /> Dashboard Admin
          </h2>
          <p className="text-primary-100 text-sm mt-1">Ringkasan aktivitas perpustakaan secara real-time</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5 hover:border-primary-500/40 transition">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} text-white flex items-center justify-center mb-3 shadow-lg`}>
              <c.icon size={20} />
            </div>
            <p className="text-xs text-dark-400 uppercase tracking-wide font-semibold">{c.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{c.val}</p>
          </div>
        ))}
      </div>

      {/* Chart + Stok */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" /> Peminjaman 7 Hari Terakhir
          </h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Stok Menipis
          </h3>
          <div className="space-y-3">
            {stok_menipis.length === 0 ? (
              <p className="text-sm text-dark-500 text-center py-4">Semua stok aman 👍</p>
            ) : stok_menipis.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-10 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                  {b.cover ? <img src={getUploadUrl(b.cover)} onError={handleBookCoverError} alt="" className="w-full h-full object-cover" /> : <BookOpen size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{b.judul}</p>
                  <p className="text-xs text-dark-400 truncate">{b.penulis}</p>
                </div>
                <span className="badge bg-rose-500/15 text-rose-400">{b.stok_tersedia}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent + Top */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">📖 Peminjaman Terbaru</h3>
            <Link to="/admin/books" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">Lihat <ChevronRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {recent_loans.length === 0 ? (
              <p className="text-sm text-dark-500 text-center py-4">Belum ada peminjaman</p>
            ) : recent_loans.map((l) => (
              <div key={l.id} className="flex items-center gap-3 pb-3 border-b border-dark-800 last:border-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {getInitials(l.user_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{l.user_name}</p>
                  <p className="text-xs text-dark-400 truncate">{l.book_judul}</p>
                </div>
                <span className="text-xs text-dark-500">{formatDateTime(l.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Flame size={18} className="text-rose-500" /> Buku Terpopuler
          </h3>
          <div className="space-y-3">
            {top_books.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 pb-3 border-b border-dark-800 last:border-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{b.judul}</p>
                  <p className="text-xs text-dark-400">{b.penulis}</p>
                </div>
                <span className="text-xs text-primary-400 font-bold">{b.loans_count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}