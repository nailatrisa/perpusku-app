import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Persetujuan from './pages/pustakawan/Persetujuan';
import Pengembalian from './pages/pustakawan/Pengembalian';

function LibrarianLayout() {
  return (
    <div className="min-h-screen bg-dark-950 md:pl-64">
      <Sidebar />
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/pustakawan" element={<LibrarianLayout />}>
          <Route index element={<Navigate to="persetujuan" replace />} />
          <Route path="persetujuan" element={<Persetujuan />} />
          <Route path="pengembalian" element={<Pengembalian />} />
          <Route path="*" element={<Navigate to="persetujuan" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/pustakawan/persetujuan" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Persetujuan from './pages/pustakawan/Persetujuan'
import Pengembalian from './pages/pustakawan/Pengembalian'
import Fines from './pages/pustakawan/Fines'
import Reports from './pages/admin/Reports'
import ActivityLogs from './pages/admin/ActivityLogs'
import Backups from './pages/admin/Backups'
import History from './pages/user/History'
import BookDetail from './pages/user/BookDetail'
import Card from './pages/user/Card'
import Catalog from './pages/user/Catalog'
import { HomePage, PlaceholderPage } from './pages/SharedPages'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="admin" element={<HomePage />} />
          <Route path="admin/reports" element={<Reports />} />
          <Route path="admin/activity-logs" element={<ActivityLogs />} />
          <Route path="admin/backups" element={<Backups />} />
          <Route path="pustakawan" element={<HomePage />} />
          <Route path="pustakawan/persetujuan" element={<Persetujuan />} />
          <Route path="pustakawan/pengembalian" element={<Pengembalian />} />
          <Route path="pustakawan/fines" element={<Fines />} />
          <Route path="user" element={<HomePage />} />
          <Route path="user/catalog" element={<Catalog />} />
          <Route path="user/catalog/:id" element={<BookDetail />} />
          <Route path="user/history" element={<History />} />
          <Route path="user/card" element={<Card />} />
          <Route path="admin/books" element={<PlaceholderPage title="Buku" />} />
          <Route path="admin/categories" element={<PlaceholderPage title="Kategori" />} />
          <Route path="admin/members" element={<PlaceholderPage title="Anggota" />} />
          <Route path="pustakawan/scan" element={<PlaceholderPage title="Scan QR" />} />
          <Route path="pustakawan/loans" element={<PlaceholderPage title="Peminjaman" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
