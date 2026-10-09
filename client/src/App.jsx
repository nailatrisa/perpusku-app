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

export default App;
