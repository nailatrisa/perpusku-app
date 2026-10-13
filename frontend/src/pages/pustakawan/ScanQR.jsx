import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, Power, Check, X, AlertCircle, RotateCcw, HandHelping } from 'lucide-react';
import { scanApi, loanApi } from '../../api/endpoints';
import { formatTanggalShort } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ScanQR() {
  const [scanning, setScanning] = useState(false);
  const [user, setUser] = useState(null);
  const [book, setBook] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [durasi, setDurasi] = useState(7);
  const [processing, setProcessing] = useState(false);
  const qrRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ code: '', time: 0 });

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      const html5Qr = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );
      setScanning(true);
    } catch (err) {
      toast.error('Gagal nyalakan kamera: ' + err.message);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
    }
    setScanning(false);
  };

  const onScanSuccess = (decodedText) => {
    const now = Date.now();
    if (decodedText === lastScanRef.current.code && now - lastScanRef.current.time < 3000) return;
    lastScanRef.current = { code: decodedText, time: now };
    processCode(decodedText);
  };

  const processCode = async (code) => {
    // Coba user dulu
    try {
      const res = await scanApi.user(code);
      if (res.data.success) {
        setUser(res.data.data);
        toast.success(`Anggota: ${res.data.data.user.name}`);
        return;
      }
    } catch (e) {}

    // Coba buku
    try {
      const res = await scanApi.book(code);
      if (res.data.success) {
        setBook(res.data.data.book);
        toast.success(`Buku: ${res.data.data.book.judul}`);
        return;
      }
    } catch (e) {}

    toast.error('QR Code tidak dikenali');
  };

  const handleManual = () => {
    if (manualCode.trim()) {
      processCode(manualCode.trim());
      setManualCode('');
    }
  };

  const handleProsesPinjam = async () => {
    if (!user || !book) return toast.error('Scan user dan buku dulu');
    setProcessing(true);
    try {
      await loanApi.store({ user_id: user.user.id, book_id: book.id, durasi });
      toast.success('Peminjaman berhasil!');
      setBook(null);
      // Refresh user data
      const res = await scanApi.user(user.user.no_kartu);
      if (res.data.success) setUser(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses');
    } finally {
      setProcessing(false);
    }
  };

  const handleKembalikan = async (loanId) => {
    if (!confirm('Yakin kembalikan buku ini?')) return;
    try {
      const res = await loanApi.returnBook({ loan_id: loanId });
      toast.success(res.data.message + (res.data.data.denda > 0 ? ` Denda: Rp ${res.data.data.denda.toLocaleString('id-ID')}` : ''));
      if (user) {
        const refetch = await scanApi.user(user.user.no_kartu);
        if (refetch.data.success) setUser(refetch.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengembalikan');
    }
  };

  const handlePerpanjang = async (loanId) => {
    if (!confirm('Perpanjang peminjaman ini 7 hari?')) return;
    try {
      const res = await loanApi.perpanjang({ loan_id: loanId });
      toast.success(res.data.message);
      if (user) {
        const refetch = await scanApi.user(user.user.no_kartu);
        if (refetch.data.success) setUser(refetch.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperpanjang');
    }
  };

  const reset = () => {
    setUser(null);
    setBook(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode size={26} /> Scan QR Code
        </h2>
        <p className="text-blue-100 text-sm mt-1">Pindai kartu anggota lalu buku yang dipinjam</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`card p-4 border-2 transition ${user ? 'border-emerald-500 bg-emerald-50' : 'border-dark-900'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${user ? 'bg-emerald-500' : 'bg-slate-900'}`}>
              {user ? <Check size={20} /> : '1'}
            </div>
            <div>
              <p className="font-bold text-white text-sm">Scan Kartu Anggota</p>
              <p className="text-xs text-dark-400">{user ? user.user.name : 'Identifikasi peminjam'}</p>
            </div>
          </div>
        </div>
        <div className={`card p-4 border-2 transition ${book ? 'border-emerald-500 bg-emerald-50' : user ? 'border-dark-900' : 'border-dark-700 opacity-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${book ? 'bg-emerald-500' : user ? 'bg-slate-900' : 'bg-gray-300'}`}>
              {book ? <Check size={20} /> : '2'}
            </div>
            <div>
              <p className="font-bold text-white text-sm">Scan Buku</p>
              <p className="text-xs text-dark-400">{book ? book.judul : 'Pilih buku yang dipinjam'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SCANNER */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Camera size={18} className="text-slate-900" /> Kamera
            </h3>
            <button onClick={scanning ? stopScanner : startScanner} className={`btn ${scanning ? 'btn-danger' : 'btn-primary'} text-xs`}>
              <Power size={14} /> {scanning ? 'Matikan' : 'Nyalakan'}
            </button>
          </div>
          <div id="qr-reader" ref={qrRef} className="rounded-lg overflow-hidden bg-black" style={{ minHeight: 300 }} />
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-dark-400 font-semibold mb-2">Atau input manual:</p>
            <div className="flex gap-2">
              <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="USR-xxx / BK-xxx" className="input flex-1 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleManual()} />
              <button onClick={handleManual} className="btn-primary text-xs">Kirim</button>
            </div>
          </div>
        </div>

        {/* HASIL */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">Hasil Scan</h3>
            {(user || book) && (
              <button onClick={reset} className="text-xs text-dark-400 hover:text-rose-500 flex items-center gap-1">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>

          {!user && !book && (
            <div className="text-center py-10 text-dark-500">
              <QrCode size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Scan kartu anggota atau buku untuk memulai</p>
            </div>
          )}

          {user && (
            <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
              <p className="text-xs text-emerald-600 font-semibold uppercase">Anggota</p>
              <p className="font-bold text-white">{user.user.name}</p>
              <p className="text-xs text-dark-400 font-mono">{user.user.no_kartu || '-'}</p>
              {user.total_denda > 0 && (
                <p className="mt-2 text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded inline-block">
                  Denda aktif: Rp {user.total_denda.toLocaleString('id-ID')}
                </p>
              )}

              {user.active_loans.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2">
                  <p className="text-xs font-semibold text-dark-300 mb-1">Buku sedang dipinjam:</p>
                  {user.active_loans.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-xs bg-dark-900/60 rounded p-2 border gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{l.judul}</p>
                        <p className="text-dark-400">{l.kode} - {formatTanggalShort(l.jatuh_tempo)}</p>
                        {l.terlambat && <span className="text-rose-600 font-bold">TERLAMBAT</span>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {!l.terlambat && !l.pernah_diperpanjang && (
                          <button onClick={() => handlePerpanjang(l.id)} className="px-2 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600" title="Perpanjang 7 hari">
                            +7h
                          </button>
                        )}
                        <button onClick={() => handleKembalikan(l.id)} className="px-2 py-1 bg-rose-500 text-white rounded text-xs hover:bg-rose-600">
                          Kembalikan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {book && (
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <p className="text-xs text-blue-600 font-semibold uppercase">Buku</p>
              <div className="flex items-center gap-3 mt-1">
                {book.cover && (
                  <img src={book.cover.startsWith('http') ? book.cover : `http://localhost:3000/uploads/${book.cover}`} alt="" className="w-12 h-16 object-cover rounded shadow" />
                )}
                <div>
                  <p className="font-bold text-white">{book.judul}</p>
                  <p className="text-xs text-dark-400">{book.penulis}</p>
                  <p className="text-xs text-blue-700 mt-1">{book.kategori} - Stok: {book.stok}</p>
                </div>
              </div>
            </div>
          )}

          {user && book && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <label className="label text-xs">Durasi Pinjam (hari)</label>
                <select value={durasi} onChange={(e) => setDurasi(e.target.value)} className="input">
                  <option value="3">3 hari</option>
                  <option value="7">7 hari (default)</option>
                  <option value="14">14 hari</option>
                  <option value="21">21 hari</option>
                </select>
              </div>
              <button onClick={handleProsesPinjam} disabled={processing} className="btn-success w-full disabled:opacity-60">
                {processing ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <HandHelping size={18} />}
                {processing ? 'Memproses...' : 'Proses Peminjaman'}
              </button>
            </div>
          )}

          {user && !book && user.active_loans.length === 0 && (
            <div className="text-center py-6 text-dark-500 text-sm">
              <AlertCircle size={32} className="mx-auto mb-1 opacity-50" />
              <p>Scan buku yang akan dipinjam</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}