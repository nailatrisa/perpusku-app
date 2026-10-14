# Menjalankan PerpusKu

## 1. Nyalakan MySQL

Jalankan MySQL melalui XAMPP. Pastikan database `library` dan tabelnya sudah tersedia.

## 2. Jalankan backend

Buka PowerShell:

```powershell
Set-Location C:\perpusku-app\backend
npm run dev
```

Backend berjalan di `http://localhost:3000`. Periksa `http://localhost:3000/api/health`; respons `database: "connected"` memastikan koneksi MySQL berhasil.

## 3. Jalankan frontend

Buka PowerShell baru:

```powershell
Set-Location C:\perpusku-app\frontend
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`. Jika alamat frontend berbeda dari `CLIENT_URL` di `backend/.env`, sesuaikan nilainya dan jalankan ulang backend.

Halaman katalog publik menampilkan data buku dan kategori dari database. Akun demo yang tersedia di database dapat digunakan untuk login; lihat [INSTALLATION.md](./INSTALLATION.md).

## Troubleshooting

- **Database tidak tersambung:** cek MySQL aktif dan nilai `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, serta `DB_NAME` di `backend/.env`.
- **`ER_NO_SUCH_TABLE`:** database perlu dipulihkan dengan skema aplikasi; dump SQL dan migrasi tidak disertakan dalam repository.
- **`EADDRINUSE`:** port sedang dipakai proses lain. Hentikan proses tersebut atau pilih port kosong dan perbarui URL frontend/backend yang sesuai.
- **`Failed to fetch` atau CORS:** backend harus aktif, dan `CLIENT_URL` harus sama persis dengan origin yang ditampilkan Vite.
- **Module tidak ditemukan:** jalankan `npm install` dari folder `backend` atau `frontend` yang melaporkan error.
