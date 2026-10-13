# Cara Menjalankan Aplikasi PerpusKu

## Development Mode

Butuh 3 service yang jalan bersamaan.

### Terminal 1 - MySQL (XAMPP)
1. Buka XAMPP Control Panel
2. Klik Start di baris MySQL
3. Tunggu status Running (hijau)

### Terminal 2 - Backend Server
Buka PowerShell baru:

Tunggu sampai muncul:
PerpusKu API Server
Running on: http://localhost:3000

JANGAN TUTUP TERMINAL INI.

### Terminal 3 - Frontend
Buka PowerShell baru lagi:

Tunggu sampai muncul:
VITE ready in xxx ms
Local: http://localhost:5173/

JANGAN TUTUP TERMINAL INI JUGA.

### Buka Browser
http://localhost:5173

## Login dengan Akun Demo

Klik tombol Demo Login untuk auto-isi:

| Tombol | Email | Password |
|--------|-------|----------|
| Admin | admin@perpusku.com | password |
| Pustakawan | pustakawan1@perpusku.com | password |
| Masyarakat | user1@perpusku.com | password |

## Test Cepat

### Backend Hidup?
Expected: balas PerpusKu API berjalan

### Database Terkoneksi?

## Ringkasan 3 Terminal

| Terminal | Isi | Perintah |
|----------|-----|----------|
| 1 | XAMPP | Start MySQL |
| 2 | Backend | cd backend dan npm run dev |
| 3 | Frontend | cd frontend dan npm run dev |

Browser: http://localhost:5173

## Cara Mematikan

1. Terminal 3 (frontend) - Ctrl + C - Y
2. Terminal 2 (backend) - Ctrl + C - Y
3. XAMPP - klik Stop di baris MySQL

## Cara Cepat Pakai File .bat

File start-backend.bat dan start-frontend.bat sudah tersedia di root project.

Cara pakai:
1. Buka XAMPP - Start MySQL
2. Double-click start-backend.bat
3. Double-click start-frontend.bat
4. Buka browser http://localhost:5173

## Akses dari HP

1. Cek IP laptop: buka PowerShell, ketik ipconfig, cari IPv4 Address
2. Pastikan HP dan laptop di WiFi yang sama
3. Buka browser HP: http://IP-LAPTOP:5173

## Troubleshooting

### Backend error EADDRINUSE port 3000

### Frontend blank
Buka DevTools F12, cek Console tab.

### Failed to fetch
Backend tidak jalan. Cek Terminal 2.

Kembali ke README.md