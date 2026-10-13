import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { BookOpen, HandHelping, AlertTriangle, QrCode, Calendar, ChevronRight } from 'lucide-react';
import { dashboardApi } from '../../api/endpoints';
import { formatTanggalShort, hitungHariTerlambat } from '../../utils/helpers';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PustakawanDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.pustakawan()
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Gagal memuat dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Memuat dashboard..." />;
  if (!data) return <p className="text-center text-dark-500">Data tidak tersedia</p>;

  const { stats, chart, terlambat_list } = data;

  const cards = [
    { label: 'Total Buku', val: stats.total_buku, icon: BookOpen, grad: 'from-primary-400 to-primary-600' },
    { label: 'Sedang Dipinjam', val: stats.sedang_dipinjam, icon: HandHelping, grad: 'from-amber-400 to-amber-600' },
    { label: 'Terlambat', val: stats.terlambat, icon: AlertTriangle, grad: 'from-rose-400 to-rose-600' },
    { label: 'Pinjam Hari Ini', val: stats.hari_ini, icon: Calendar, grad: 'from-emerald-400 to-emerald-600' },
  ];

  const chartData = {
    labels: chart.labels,
    datasets: [{
      label: 'Peminjaman',
      data: chart.data,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#fbbf24',
      pointBorderColor: '#0B1120',
      pointRadius: 5,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#1e293b' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h2 className="text-2xl lg:text-3xl font-bold font-display">Dashboard Pustakawan</h2>
          <p className="text-amber-50 text-sm mt-1">Kelola peminjaman & pengembalian buku</p>
        </div>
      </div>

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

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-bold text-white mb-4">Peminjaman 7 Hari Terakhir</h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="card p-5 text-center flex flex-col justify-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-3 shadow-violet">
            <QrCode size={32} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">Scan QR</h3>
          <p className="text-sm text-dark-400 mt-1 mb-4">Proses peminjaman & pengembalian</p>
          <Link to="/pustakawan/scan" className="btn-primary">
            <QrCode size={18} /> Buka Scanner
          </Link>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-500" /> Buku Terlambat
          </h3>
          <Link to="/pustakawan/loans?status=terlambat" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
            Lihat Semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-dark-400 uppercase">Peminjam</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-dark-400 uppercase">Buku</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-dark-400 uppercase hidden md:table-cell">Jatuh Tempo</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-dark-400 uppercase">Hari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {terlambat_list.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-dark-500 text-sm">Tidak ada buku terlambat 🎉</td></tr>
              ) : terlambat_list.map((l) => (
                <tr key={l.id} className="hover:bg-dark-800/40">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-white text-xs">{l.user_name}</p>
                    <p className="text-xs text-dark-500 font-mono">{l.no_kartu_anggota || '-'}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-dark-200">{l.book_judul}</td>
                  <td className="px-3 py-2 text-center hidden md:table-cell text-xs text-dark-400">{formatTanggalShort(l.tanggal_jatuh_tempo)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="badge bg-rose-500/15 text-rose-400">{hitungHariTerlambat(l.tanggal_jatuh_tempo)} hari</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}