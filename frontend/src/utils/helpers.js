export const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

export const formatTanggal = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTanggalShort = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const hitungHariTerlambat = (jatuhTempo) => {
  const now = new Date();
  const jt = new Date(jatuhTempo);
  if (now <= jt) return 0;
  return Math.ceil((now - jt) / (1000 * 60 * 60 * 24));
};

export const getUploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const uploadUrl = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3000/uploads';
  return `${uploadUrl.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
};

export const handleBookCoverError = (event) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = '/book-placeholder.svg';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};
export const formatTanggalJam = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTanggalWaktu = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const tgl = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${tgl} ${jam}`;
};