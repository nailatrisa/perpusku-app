# Panduan Instalasi PerpusKu

## Prasyarat

- Node.js 18 atau lebih baru dan npm.
- MySQL/MariaDB lokal, misalnya melalui XAMPP.

## 1. Siapkan database

Jalankan MySQL dari XAMPP. Aplikasi menggunakan database `library`; pastikan database tersebut sudah memiliki tabel `users`, `books`, `categories`, `loans`, `fines`, dan `activity_logs`.

Repository ini belum menyertakan dump SQL, migrasi, atau seeder. Jika database belum memiliki tabel/data, pulihkan skema dan data dari backup database Anda melalui phpMyAdmin atau MySQL.

## 2. Konfigurasi dan jalankan backend

Buat atau sesuaikan `backend/.env`:

```dotenv
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=library
JWT_SECRET=ganti-dengan-secret-acak-yang-kuat
JWT_EXPIRES_IN=7d
```

Di PowerShell:

```powershell
Set-Location C:\perpusku-app\backend
npm install
npm run dev
```

Periksa `http://localhost:3000/api/health`. Respons `database: "connected"` menandakan API berhasil tersambung ke MySQL.

## 3. Jalankan frontend

Buka terminal PowerShell baru:

```powershell
Set-Location C:\perpusku-app\frontend
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite (biasanya `http://localhost:5173`). Jika Vite memakai port lain karena port 5173 sedang digunakan, samakan `CLIENT_URL` di `backend/.env` dengan alamat frontend lalu jalankan ulang backend.

Katalog publik membaca data langsung dari database. Endpoint `GET http://localhost:3000/api/books` dan `GET http://localhost:3000/api/categories` dapat digunakan untuk memeriksa data katalog.

Jika file cover tidak ikut dipulihkan bersama database, katalog menampilkan cover placeholder. Simpan file cover pada `backend/uploads/covers` dengan nama file yang dirujuk kolom `books.cover` untuk menampilkan gambar aslinya.

## Akun demo

Jika akun demo sudah tersedia pada database:

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@perpusku.com` | `password` |
| Pustakawan | `pustakawan1@perpusku.com` | `password` |
| Masyarakat | `user1@perpusku.com` | `password` |

Akun tersebut hanya untuk pengembangan. Ganti password sebelum aplikasi digunakan di lingkungan lain.
