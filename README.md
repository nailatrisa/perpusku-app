# PerpusKu - Sistem Perpustakaan Digital

PerpusKu adalah aplikasi perpustakaan digital berbasis web. Checkout repository saat ini menyediakan frontend React dan API Express untuk persetujuan peminjaman serta riwayat pengembalian. Fitur lain yang disebut sebagai cakupan produk belum seluruhnya tersedia.

## Daftar Isi

- [Fitur yang tersedia](#fitur-yang-tersedia)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Database](#database)
- [Menjalankan aplikasi](#menjalankan-aplikasi)
- [Build frontend](#build-frontend)
- [Deploy ke server Ubuntu](#deploy-ke-server-ubuntu)
- [Endpoint API](#endpoint-api)
- [Batasan checkout](#batasan-checkout)
- [Lisensi](#lisensi)

## Fitur yang tersedia

- Daftar pengajuan peminjaman dengan pagination.
- Persetujuan peminjaman secara transaksional, termasuk pengurangan stok buku.
- Penolakan pengajuan dengan alasan.
- Riwayat pengembalian dengan pencarian dan pagination.
- Otorisasi endpoint untuk peran `pustakawan` dan `admin`.
- Pencatatan aktivitas persetujuan dan penolakan.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Backend | Node.js, Express 5, Knex.js |
| Database | MySQL atau MariaDB, `mysql2` |
| Autentikasi endpoint | JSON Web Token |

## Prasyarat

- Node.js 18 atau lebih baru dan npm.
- MySQL 8+ atau MariaDB yang sedang berjalan.
- Git.

## Instalasi

1. Clone repository dan masuk ke folder proyek:

   ```bash
   git clone <URL_REPOSITORY>
   cd perpusku-app
   ```

2. Instal dependency frontend dan backend menggunakan lockfile:

   ```bash
   cd client
   npm ci
   cd ../server
   npm ci
   cd ..
   ```

3. Salin `server/.env.example` menjadi `server/.env`, lalu isi konfigurasi database dan secret JWT. Jangan commit `server/.env` atau memasukkan credential produksi ke repository.

   ```dotenv
   PORT=3000
   CLIENT_URL=http://localhost:5173
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=ganti-password-database
   DB_NAME=library
   JWT_SECRET=ganti-dengan-secret-random-yang-panjang
   ```

   Buat secret acak yang kuat untuk `JWT_SECRET`; jangan gunakan nilai contoh di atas pada server.

## Database

File skema database yang diperlukan API tersedia di [`server/database/schema.sql`](./server/database/schema.sql). Skema membuat tabel `users`, `books`, `loans`, dan `activity_logs`. File ini membuat tabel, tetapi tidak mengisi data pengguna atau buku.

Buat database dan impor skema dari root repository:

```bash
mysql -u root -p -e "CREATE DATABASE library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p library < server/database/schema.sql
```

Jika nama database berbeda, ubah `DB_NAME` pada `server/.env` dan gunakan nama yang sama pada perintah impor. Pastikan akun database memiliki izin untuk membuat tabel dan mengakses database tersebut.

## Menjalankan aplikasi

Buka dua terminal dari root repository.

Terminal pertama, jalankan API:

```bash
cd server
npm run dev
```

Terminal kedua, jalankan frontend:

```bash
cd client
npm run dev
```

Frontend berjalan pada `http://localhost:5173`; API berjalan pada `http://localhost:3000/api`. Secara default frontend memakai URL API tersebut. Untuk menggantinya, buat `client/.env` dengan:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

## Build frontend

Build file statis untuk produksi dari root repository:

```bash
cd client
npm ci
npm run build
```

Hasil build ada di `client/dist`. Sajikan folder ini dengan web server seperti Nginx. Variabel `VITE_API_URL` dibaca saat build, jadi atur nilainya sebelum menjalankan `npm run build`.

## Deploy ke server Ubuntu

Contoh berikut menggunakan Ubuntu, Nginx, Node.js, dan MySQL/MariaDB. Sesuaikan domain, nama pengguna sistem, serta versi paket dengan kebijakan server Anda.

1. Pasang Node.js 18+, npm, MySQL/MariaDB, Nginx, dan Git. Buat database dan akun database khusus aplikasi dengan hak minimum yang diperlukan.
2. Clone repository ke direktori aplikasi, misalnya `/var/www/perpusku-app`, lalu jalankan `npm ci` dari masing-masing folder `server` dan `client`.
3. Buat database sesuai [panduan database](#database), lalu impor `server/database/schema.sql`.
4. Buat `server/.env` pada server. Isi `DB_*` dengan credential database server, `JWT_SECRET` dengan secret acak, `CLIENT_URL` dengan origin HTTPS situs frontend (contoh `https://perpus.example.com`), dan `PORT=3000`. Lindungi file ini dari akses pengguna lain.
5. Build frontend dengan URL API yang akan dipakai pengunjung. Jika Nginx melayani API pada domain dan port yang sama, gunakan:

   ```dotenv
   VITE_API_URL=/api
   ```

   Atur nilai tersebut di `client/.env.production` sebelum build, lalu jalankan `npm run build` dalam folder `client`.
6. Jalankan backend sebagai service terkelola (misalnya `systemd` atau PM2), bukan sebagai proses terminal sementara. Contoh unit `systemd` berikut mengasumsikan aplikasi berada di `/var/www/perpusku-app` dan service berjalan sebagai pengguna Linux `www-data`:

   ```ini
   [Unit]
   Description=PerpusKu API
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/perpusku-app/server
   Environment=NODE_ENV=production
   ExecStart=/usr/bin/node /var/www/perpusku-app/server/src/app.js
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

   Simpan sebagai `/etc/systemd/system/perpusku.service`, lalu aktifkan dengan `sudo systemctl daemon-reload`, `sudo systemctl enable --now perpusku`, dan periksa status/log dengan `sudo systemctl status perpusku` serta `sudo journalctl -u perpusku -f`. Untuk server produksi, batasi izin baca `server/.env` hanya kepada akun service dan pertimbangkan menjalankan service dengan akun khusus.
7. Atur Nginx untuk menyajikan file dari `/var/www/perpusku-app/client/dist`, meneruskan path `/api/` ke `http://127.0.0.1:3000/api/`, dan mengarahkan fallback aplikasi satu halaman ke `index.html`. Aktifkan konfigurasi situs dan uji dengan `sudo nginx -t` sebelum reload.
8. Aktifkan HTTPS pada domain, misalnya dengan Certbot/Let's Encrypt. Pastikan `CLIENT_URL` cocok dengan origin situs HTTPS, lalu build ulang frontend jika URL API berubah.

Jangan mengekspos port database ke internet publik. Skema yang disediakan hanya menyiapkan tabel; aplikasi pada checkout ini belum menyediakan halaman administrasi untuk membuat pengguna atau mengisi data awal.

## Endpoint API

Semua endpoint memerlukan header `Authorization: Bearer <token>` yang valid dan peran pengguna `pustakawan` atau `admin`.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/loans/pending` | Daftar pengajuan pending; mendukung query `page` dan `limit`. |
| `POST` | `/api/loans/:id/approve` | Menyetujui pengajuan dan mengurangi stok buku. |
| `POST` | `/api/loans/:id/reject` | Menolak pengajuan; body JSON wajib berisi `reason`. |
| `GET` | `/api/loans/returns` | Riwayat pengembalian; mendukung `page`, `limit`, dan `search`. |

## Batasan checkout

- Belum tersedia endpoint atau halaman login/registrasi untuk membuat akun dan token. Endpoint di atas baru dapat digunakan setelah pengguna serta token yang valid disediakan melalui mekanisme autentikasi yang terintegrasi.
- Tidak ada data demo atau seeder; skema database hanya membuat tabel kosong.
- Migrasi otomatis Knex dan pemulihan/backup database belum disediakan.
- Perhitungan denda dan fitur produk lain yang belum disebut pada bagian [Fitur yang tersedia](#fitur-yang-tersedia) belum tersedia pada checkout ini.

## Lisensi

Backend mendeklarasikan lisensi MIT. Sertakan file lisensi proyek yang sesuai sebelum mendistribusikan aplikasi.
