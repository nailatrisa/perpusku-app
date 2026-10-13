# Panduan Deployment PerpusKu

Panduan deploy PerpusKu ke server production.

## Pilihan Platform

| Komponen | Platform | Biaya |
|----------|----------|-------|
| Frontend | Vercel | Gratis |
| Backend | Railway | Gratis (500 jam) |
| Database | Railway MySQL | Gratis (1GB) |

## Rekomendasi Vercel + Railway

- Frontend ke Vercel
- Backend ke Railway
- Database ke Railway MySQL

## Prasyarat

1. Project sudah di-push ke GitHub
2. Akun GitHub - https://github.com
3. Akun Vercel - https://vercel.com
4. Akun Railway - https://railway.app

## Deploy Database ke Railway

### 1. Buat Project Railway
1. Buka https://railway.app
2. Klik New Project
3. Pilih Provision MySQL
4. Tunggu sampai MySQL instance dibuat

### 2. Ambil Connection Details
- Host: xxx.railway.app
- Port: 12345
- User: root
- Password: xxx
- Database: railway

### 3. Import Database

## Deploy Backend ke Railway

### 1. Tambah Service Backend
1. Klik + New
2. Pilih Deploy from GitHub repo
3. Pilih repo perpusku-app

### 2. Konfigurasi Root Directory
Root Directory: backend

### 3. Set Environment Variables

### 4. Generate Domain
Settings - Public Networking - Generate Domain

Test:

## Deploy Frontend ke Vercel

### 1. Import Project
1. Buka https://vercel.com
2. Klik Add New - Project
3. Pilih repo perpusku-app

### 2. Konfigurasi
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist

### 3. Environment Variables

### 4. Deploy
Klik Deploy. Tunggu 1-2 menit.

## Update CORS Backend

Setelah frontend ter-deploy, update FRONTEND_URL di Railway Variables dengan URL Vercel.

## Test Production

1. Buka https://perpusku.vercel.app
2. Login admin:
   - Email: admin@perpusku.com
   - Password: password
3. Test semua fitur

## Security Checklist

| Item | Status |
|------|--------|
| JWT_SECRET random | Wajib |
| HTTPS aktif | Otomatis |
| CORS whitelist | Wajib |
| Rate limiting | Opsional |

### Generate JWT Secret

## Biaya

| Platform | Free Tier |
|----------|-----------|
| Vercel | 100GB bandwidth/bulan |
| Railway | 500 jam runtime |
| Railway MySQL | 1GB storage |

Total: Rp 0/bulan untuk demo.

## Deploy ke VPS Advanced

### Install di VPS Ubuntu

## Checklist Deployment

- [ ] Project di-push ke GitHub
- [ ] Database di Railway MySQL
- [ ] File SQL ter-import
- [ ] Backend ter-deploy di Railway
- [ ] Environment variables backend di-set
- [ ] Frontend ter-deploy di Vercel
- [ ] Environment variables frontend di-set
- [ ] CORS di-update
- [ ] Test login production
- [ ] HTTPS aktif

## Troubleshooting

### Backend crash di Railway
Cek logs di Railway - Deployments - View Logs.

### CORS error
Update FRONTEND_URL di backend env vars.

### Frontend blank
DevTools - Console. Cek error. Kemungkinan VITE_API_URL salah.

Kembali ke README.md