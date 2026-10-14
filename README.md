# PerpusKu - Sistem Perpustakaan Digital

PerpusKu adalah aplikasi perpustakaan digital berbasis web untuk mengelola katalog buku dan alur peminjaman. Rancangan produk mencakup beberapa peran pengguna, approval workflow, scan QR, denda, serta kartu anggota digital.

> **Status checkout:** katalog buku dan kategori, autentikasi, serta API persetujuan peminjaman dan riwayat pengembalian tersedia. Halaman dashboard dan pengelolaan lain masih memerlukan endpoint backend tambahan. File migrasi, seeder, dan dump database tidak disertakan; siapkan database MySQL sesuai skema sebelum menjalankan aplikasi.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Akun Demo](#akun-demo)
- [Struktur Folder](#struktur-folder)
- [API](#api)
- [Business Rules](#business-rules)
- [Troubleshooting](#troubleshooting)
- [Lisensi](#lisensi)

## Fitur

### Cakupan produk

- Landing page, katalog buku, filter kategori, login, dan registrasi.
- Dashboard dan pengelolaan buku, kategori, serta pengguna berdasarkan peran.
- Scan QR Code untuk membantu proses peminjaman.
- Workflow pengajuan peminjaman: pending, disetujui, atau ditolak.
- Riwayat peminjaman dan pengembalian, serta pengelolaan denda.
- Kartu anggota digital dengan QR Code.
- Laporan, log aktivitas, dan backup database untuk administrator.

### Tersedia pada checkout ini

- Katalog publik buku dan kategori yang membaca data dari MySQL.
- Login, registrasi anggota, pemuatan profil, dan autentikasi JWT.
- Pemeriksaan status API dan koneksi database melalui `GET /api/health`.
- API untuk melihat pengajuan pending, menyetujui atau menolak pengajuan, dan melihat riwayat pengembalian.
- Otorisasi endpoint untuk peran pustakawan dan admin.
- Persetujuan menggunakan transaksi database dan penguncian baris untuk menjaga stok buku.
- Pencatatan aktivitas setelah persetujuan atau penolakan berhasil.
- Halaman katalog publik dan halaman pustakawan untuk persetujuan dan riwayat pengembalian.

## Tech Stack

| Area | Teknologi |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios |
| Backend | Node.js 18+, Express, Knex.js |
| Database | MySQL atau MariaDB, driver `mysql2` |
| Autentikasi | JSON Web Token, bcryptjs |
| UI | Lucide React, React Hot Toast |

Dependency yang dipakai aplikasi dideklarasikan pada `backend/package.json` dan `frontend/package.json`, termasuk Chart.js dan `html5-qrcode`.

## Prasyarat

- Node.js 18 atau lebih baru dan npm.
- MySQL atau MariaDB yang berjalan secara lokal.
- Git, jika repository di-clone.

## Instalasi dan Konfigurasi

1. Pastikan MySQL/MariaDB aktif dan database `library` beserta tabel aplikasi sudah dibuat atau dipulihkan dari dump database Anda. Repository ini tidak menyertakan dump, migrasi, atau seeder.

2. Instal dependency backend:

   ```bash
   cd backend
   npm install
   ```

3. Buat atau periksa `backend/.env`:

   ```dotenv
   PORT=3000
   NODE_ENV=development
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=library
   JWT_SECRET=ganti-dengan-secret-acak-yang-kuat
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

4. Instal dependency frontend:

   ```bash
   cd ../frontend
   npm install
   ```

5. (Opsional) Buat `frontend/.env` jika URL API berbeda:

   ```dotenv
   VITE_API_URL=http://localhost:3000/api
   ```

   Skema yang digunakan mencakup tabel `users`, `books`, `categories`, `loans`, `fines`, dan `activity_logs`.

## Menjalankan Aplikasi

Jalankan backend dari folder `backend`:

```bash
npm run dev
```

Jalankan frontend dari folder `frontend` pada terminal lain:

```bash
npm run dev
```

Frontend tersedia di `http://localhost:5173` dan API di `http://localhost:3000/api`.

API aktif di `http://localhost:3000/api`; cek koneksi database di `http://localhost:3000/api/health`. Katalog publik tersedia di `http://localhost:5173`.

Build frontend untuk produksi:

```bash
cd frontend
npm run build
```

## Akun Demo

Belum ada akun demo atau seeder pengguna pada checkout ini. Buat akun melalui mekanisme aplikasi yang tersedia setelah skema database dan fitur autentikasi disiapkan.

## Struktur Folder

```text
frontend/
  src/
    api/                 Konfigurasi Axios dan pemanggilan API
    components/          Komponen UI bersama
    pages/pustakawan/    Halaman persetujuan dan pengembalian
    utils/               Fungsi bantuan frontend
backend/
  src/
    config/              Koneksi database
    controllers/         Logika endpoint
    middleware/          Autentikasi, role, dan error handler
    routes/              Registrasi route API
    utils/               Utilitas, termasuk activity log
  knexfile.js            Konfigurasi Knex dan koneksi MySQL
```

## API

Semua endpoint menggunakan prefix `/api`. Katalog, kategori, health check, login, dan registrasi bersifat publik. Endpoint profil dan peminjaman memerlukan bearer token; endpoint peminjaman petugas dibatasi untuk peran `pustakawan` atau `admin`.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/health` | Memeriksa API dan koneksi database. |
| `GET` | `/api/books` | Katalog publik. Mendukung `page`, `limit`, `search`, `category_id`, dan `sort=popular`. |
| `GET` | `/api/books/:id` | Detail buku. |
| `GET` | `/api/categories` | Daftar kategori dan jumlah buku. |
| `POST` | `/api/auth/login` | Login dengan `email` dan `password`. |
| `POST` | `/api/auth/register` | Registrasi akun anggota. |
| `GET` | `/api/auth/me` | Profil pengguna dari bearer token. |
| `GET` | `/api/loans/pending` | Daftar pengajuan pending. Mendukung query `page` dan `limit`. |
| `POST` | `/api/loans/:id/approve` | Menyetujui pengajuan dan mengurangi stok buku secara transaksional. |
| `POST` | `/api/loans/:id/reject` | Menolak pengajuan. Body JSON wajib berisi `reason`. |
| `GET` | `/api/loans/returns` | Riwayat pengembalian. Mendukung `page`, `limit`, dan `search`. |

Contoh body penolakan:

```json
{
  "reason": "Stok buku tidak tersedia"
}
```

Format respons endpoint berupa JSON dengan properti `success`, `message`, dan `data`. Endpoint daftar juga mengembalikan informasi `pagination`.

## Business Rules

- Hanya pengajuan berstatus `pending` yang dapat disetujui atau ditolak.
- Persetujuan gagal jika buku tidak ditemukan atau stok tersedia kurang dari satu.
- Pengurangan stok dan perubahan status peminjaman dilakukan dalam transaksi database.
- Alasan penolakan wajib diisi.
- Riwayat pengembalian saat ini menampilkan pinjaman dengan status `dikembalikan` atau `terlambat`.
- Spesifikasi produk menetapkan denda Rp 2.000 per hari per buku; perhitungan dan penerapan denda belum tersedia pada kode checkout ini.

## Troubleshooting

- **API gagal terhubung ke database:** buka `/api/health`, pastikan MySQL aktif, database dan tabel sudah tersedia, serta nilai `DB_*` pada `backend/.env` benar.
- **Frontend tidak dapat mengakses API:** pastikan backend berjalan dan `VITE_API_URL` menunjuk ke alamat API yang benar. Nilai default adalah `http://localhost:3000/api`.
- **Permintaan mendapat `401`:** sertakan token pada header `Authorization: Bearer <token>` dan pastikan `JWT_SECRET` sesuai dengan secret pembuat token.
- **Endpoint mengembalikan error tabel tidak ditemukan:** skema database belum tersedia secara otomatis; siapkan tabel yang dibutuhkan sebelum menjalankan endpoint.
- **Cover buku tidak muncul:** pulihkan file cover ke `backend/uploads/covers` sesuai path pada database. Jika file belum ada, katalog menggunakan cover placeholder.
- **`npm run dev` gagal karena module tidak ditemukan:** jalankan `npm install` dari folder `backend` atau `frontend` yang sesuai.

## Lisensi

Metadata package backend menyatakan lisensi MIT. Pastikan file lisensi proyek disertakan sebelum mendistribusikan aplikasi.