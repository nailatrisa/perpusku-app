import api from './axios';

export const loanApi = {
  pending: () => api.get('/loans/pending'),
  approve: (id) => api.post(`/loans/${id}/approve`),
  reject: (id, reason) => api.post(`/loans/${id}/reject`, { reason }),
  returns: (params) => api.get('/loans/returns', { params }),
};