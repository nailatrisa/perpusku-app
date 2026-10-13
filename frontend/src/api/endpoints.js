import api from './axios';

// ============ AUTH ============
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ============ DASHBOARD ============
export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  pustakawan: () => api.get('/dashboard/pustakawan'),
  user: () => api.get('/dashboard/user'),
};

// ============ BOOKS ============
export const bookApi = {
  list: (params) => api.get('/books', { params }),
  show: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/books/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  destroy: (id) => api.delete(`/books/${id}`),
};

// ============ CATEGORIES ============
export const categoryApi = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  destroy: (id) => api.delete(`/categories/${id}`),
};

// ============ USERS ============
export const userApi = {
  list: (params) => api.get('/users', { params }),
  show: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  destroy: (id) => api.delete(`/users/${id}`),
};

// ============ LOANS ============
export const loanApi = {
  list: (params) => api.get('/loans', { params }),
  pending: () => api.get('/loans/pending'),
  returns: (params) => api.get('/loans/returns', { params }),
  myLoans: () => api.get('/my-loans'),
  store: (data) => api.post('/loans', data),
  returnBook: (data) => api.post('/loans/return', data),
  perpanjang: (data) => api.post('/loans/perpanjang', data),
  requestBorrow: (data) => api.post('/loans/request', data),
  approve: (id) => api.post(`/loans/${id}/approve`),
  reject: (id, reason) => api.post(`/loans/${id}/reject`, { reason }),
  update: (id, data) => api.put(`/loans/${id}`, data),
  destroy: (id) => api.delete(`/loans/${id}`),
};

// ============ SCAN QR ============
export const scanApi = {
  user: (qr_code) => api.post('/scan/user', { qr_code }),
  book: (qr_code) => api.post('/scan/book', { qr_code }),
};

// ============ FINES ============
export const fineApi = {
  list: (params) => api.get('/fines', { params }),
  bayar: (id) => api.post(`/fines/${id}/bayar`),
};

// ============ REPORTS ============
export const reportApi = {
  loans: (params) => api.get('/reports/loans', { params }),
  books: () => api.get('/reports/books'),
  users: () => api.get('/reports/users'),
  activityLogs: (params) => api.get('/reports/activity-logs', { params }),
};