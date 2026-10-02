# PerpusKu - Sistem Perpustakaan Digital

PerpusKu adalah aplikasi perpustakaan digital berbasis web untuk mengelola katalog buku dan alur peminjaman. Rancangan produk mencakup beberapa peran pengguna, approval workflow, scan QR, denda, serta kartu anggota digital.

> **Status checkout:** kode yang tersedia saat ini berfokus pada API persetujuan peminjaman dan riwayat pengembalian untuk pustakawan/admin. Fitur lain pada daftar di bawah merupakan cakupan produk dan belum seluruhnya tersedia pada snapshot repository ini. Migrasi dan seeder database juga belum disertakan.

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

- API untuk melihat pengajuan pending, menyetujui atau menolak pengajuan, dan melihat riwayat pengembalian.
- Otorisasi endpoint untuk peran pustakawan dan admin.
- Persetujuan menggunakan transaksi database dan penguncian baris untuk menjaga stok buku.
- Pencatatan aktivitas setelah persetujuan atau penolakan berhasil.
- Halaman pustakawan untuk persetujuan dan riwayat pengembalian.

## Tech Stack

| Area | Teknologi |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios |
| Backend | Node.js 18+, Express, Knex.js |
| Database | MySQL atau MariaDB, driver `mysql2` |
| Autentikasi | JSON Web Token, bcryptjs |
| UI | Lucide React, React Hot Toast |

Versi dependency backend yang tercantum pada `server/package-lock.json` mencakup Express 5, Knex 3, dan MySQL2 3. Sebagian library yang tercantum dalam spesifikasi produk, seperti Chart.js dan `html5-qrcode`, belum tercantum pada dependency frontend checkout ini.

## Prasyarat

- Node.js 18 atau lebih baru dan npm.
- MySQL atau MariaDB yang berjalan secara lokal.
- Git, jika repository di-clone.

## Instalasi dan Konfigurasi

1. Clone repository dan masuk ke folder proyek:

   ```bash
   git clone <URL_REPOSITORY>
   cd perpusku-app
   ```

2. Instal dependency frontend:

   ```bash
   cd client
   npm install
   ```

3. Instal dependency backend yang digunakan oleh kode dan tercantum pada lockfile:

   ```bash
   cd ../server
   npm install express cors dotenv knex mysql2 jsonwebtoken bcryptjs express-validator helmet multer morgan qrcode
   npm install --save-dev nodemon
   ```

   `server/package.json` pada checkout ini belum mendeklarasikan dependency runtime yang terdapat di lockfile. Perintah di atas menambahkannya ke manifest agar aplikasi dapat dijalankan.

4. Buat database MySQL, misalnya `library`:

   ```sql
   CREATE DATABASE library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. Buat file `server/.env` dengan konfigurasi berikut, lalu sesuaikan nilainya:

   ```dotenv
   PORT=3000
   CLIENT_URL=http://localhost:5173
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=library
   JWT_SECRET=ganti-dengan-secret-yang-kuat
   ```

6. (Opsional) Atur URL API untuk frontend pada `client/.env`:

   ```dotenv
   VITE_API_URL=http://localhost:3000/api
   ```

> **Database:** migrasi dan seeder belum tersedia pada checkout ini. Sebelum memakai endpoint, siapkan skema database yang sesuai, termasuk tabel `users`, `books`, `loans`, dan tabel yang digunakan oleh pencatatan aktivitas. Script migrasi di `server/package.json` baru dapat dijalankan setelah file migrasi/seeder ditambahkan.

## Menjalankan Aplikasi

Jalankan backend dari folder `server`:

```bash
npm run dev
```

Jalankan frontend dari folder `client` pada terminal lain:

```bash
npm run dev
```

Frontend tersedia di `http://localhost:5173` dan API di `http://localhost:3000/api`.

Build frontend untuk produksi:

```bash
cd client
npm run build
```

## Akun Demo

Belum ada akun demo atau seeder pengguna pada checkout ini. Buat akun melalui mekanisme aplikasi yang tersedia setelah skema database dan fitur autentikasi disiapkan.

## Struktur Folder

```text
client/
  src/
    api/                 Konfigurasi Axios dan pemanggilan API
    components/          Komponen UI bersama
    pages/pustakawan/    Halaman persetujuan dan pengembalian
    utils/               Fungsi bantuan frontend
server/
  src/
    config/              Koneksi database
    controllers/         Logika endpoint
    middleware/          Autentikasi, role, dan error handler
    routes/              Registrasi route API
    utils/               Utilitas, termasuk activity log
  knexfile.js            Konfigurasi Knex dan koneksi MySQL
```

## API

Semua endpoint menggunakan prefix `/api` dan memerlukan bearer token yang valid. Endpoint berikut dibatasi untuk peran `pustakawan` atau `admin`.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
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

- **API gagal terhubung ke database:** pastikan MySQL aktif, database sudah dibuat, dan nilai `DB_*` pada `server/.env` benar.
- **Frontend tidak dapat mengakses API:** pastikan backend berjalan dan `VITE_API_URL` menunjuk ke alamat API yang benar. Nilai default adalah `http://localhost:3000/api`.
- **Permintaan mendapat `401`:** sertakan token pada header `Authorization: Bearer <token>` dan pastikan `JWT_SECRET` sesuai dengan secret pembuat token.
- **Endpoint mengembalikan error tabel tidak ditemukan:** skema database belum tersedia secara otomatis; siapkan tabel yang dibutuhkan sebelum menjalankan endpoint.
- **`npm run dev` backend gagal karena module tidak ditemukan:** jalankan instalasi dependency backend pada bagian [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi).

## Lisensi

Metadata package backend menyatakan lisensi MIT. Pastikan file lisensi proyek disertakan sebelum mendistribusikan aplikasi.