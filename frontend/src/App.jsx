import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PublicCatalog from './pages/PublicCatalog';
import KategoriPage from './pages/KategoriPage';
import FiturPage from './pages/FiturPage';

import AdminDashboard from './pages/admin/Dashboard';
import AdminBooks from './pages/admin/Books';
import AdminBookForm from './pages/admin/BookForm';
import AdminCategories from './pages/admin/Categories';
import AdminUsers from './pages/admin/Users';
import AdminUserForm from './pages/admin/UserForm';
import AdminReports from './pages/admin/Reports';
import AdminActivityLogs from './pages/admin/ActivityLogs';
import AdminBackups from './pages/admin/Backups';

import PustakawanDashboard from './pages/pustakawan/Dashboard';
import ScanQR from './pages/pustakawan/ScanQR';
import Loans from './pages/pustakawan/Loans';
import Fines from './pages/pustakawan/Fines';
import Persetujuan from './pages/pustakawan/Persetujuan';
import Pengembalian from './pages/pustakawan/Pengembalian';

import UserDashboard from './pages/user/Dashboard';
import Catalog from './pages/user/Catalog';
import BookDetail from './pages/user/BookDetail';
import History from './pages/user/History';
import Card from './pages/user/Card';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  const redirect = { admin: '/admin/dashboard', pustakawan: '/pustakawan/dashboard', masyarakat: '/user/dashboard' };
  return <Navigate to={redirect[user.role]} replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalog" element={<PublicCatalog />} />
          <Route path="/kategori" element={<KategoriPage />} />
          <Route path="/fitur" element={<FiturPage />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="books/create" element={<AdminBookForm mode="create" />} />
            <Route path="books/:id" element={<AdminBookForm mode="view" />} />
            <Route path="books/:id/edit" element={<AdminBookForm mode="edit" />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/create" element={<AdminUserForm mode="create" />} />
            <Route path="users/:id" element={<AdminUserForm mode="view" />} />
            <Route path="users/:id/edit" element={<AdminUserForm mode="edit" />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="activity-logs" element={<AdminActivityLogs />} />
            <Route path="backups" element={<AdminBackups />} />
          </Route>

          <Route path="/pustakawan" element={
            <ProtectedRoute allowedRoles={['pustakawan', 'admin']}><Layout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<PustakawanDashboard />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="persetujuan" element={<Persetujuan />} />
            <Route path="loans" element={<Loans />} />
            <Route path="pengembalian" element={<Pengembalian />} />
            <Route path="fines" element={<Fines />} />
          </Route>

          <Route path="/user" element={
            <ProtectedRoute allowedRoles={['masyarakat']}><Layout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/:id" element={<BookDetail />} />
            <Route path="history" element={<History />} />
            <Route path="card" element={<Card />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}