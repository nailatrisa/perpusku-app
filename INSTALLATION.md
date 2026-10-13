# Panduan Instalasi PerpusKu

Panduan lengkap instalasi PerpusKu dari nol sampai siap dijalankan.

## Prasyarat

- Node.js v18+ (https://nodejs.org)
- npm v9+ (bawaan Node.js)
- XAMPP v8+ (https://www.apachefriends.org)
- Git (https://git-scm.com)

Cek instalasi:

## Langkah 1 - Clone Repository

## Langkah 2 - Setup Database MySQL

### 2.1 Start MySQL
1. Buka XAMPP Control Panel
2. Klik Start pada baris MySQL
3. Tunggu status Running (hijau)

### 2.2 Buat Database
1. Buka http://localhost/phpmyadmin
2. Klik "Baru" / "New" di sidebar kiri
3. Nama database: library
4. Collation: utf8mb4_general_ci
5. Klik Buat / Create

### 2.3 Import Database

Cara A - Via phpMyAdmin:
1. Klik database library
2. Klik tab Import
3. Choose File - pilih database/perpusku_backup.sql
4. Klik Go / Import

Cara B - Via Command Line:

## Langkah 2 - Setup Database MySQL

### 2.1 Start MySQL
1. Buka XAMPP Control Panel
2. Klik Start pada baris MySQL
3. Tunggu status Running (hijau)

### 2.2 Buat Database
1. Buka http://localhost/phpmyadmin
2. Klik "Baru" / "New" di sidebar kiri
3. Nama database: library
4. Collation: utf8mb4_general_ci
5. Klik Buat / Create

### 2.3 Import Database

Cara A - Via phpMyAdmin:
1. Klik database library
2. Klik tab Import
3. Choose File - pilih database/perpusku_backup.sql
4. Klik Go / Import

Cara B - Via Command Line:

## Langkah 3 - Setup Backend

### 3.1 Masuk Folder Backend

### 3.2 Install Dependencies
APP_NAME=PerpusKu
APP_PORT=3000
FRONTEND_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=library
JWT_SECRET=perpusku-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_PATH=uploads

### 3.4 Buat Folder Uploads

### 3.5 Verifikasi Backend

Kalau muncul "PerpusKu API Server Running on http://localhost:3000" berarti berhasil.

## Langkah 4 - Setup Frontend

### 4.1 Masuk Folder Frontend (terminal baru)

### 4.2 Install Dependencies

### 4.3 Buat File .env
Buat file frontend/.env:

### 4.4 Verifikasi Frontend

Kalau muncul VITE ready di http://localhost:5173 berarti berhasil.

## Checklist Instalasi

- [ ] Node.js terinstall
- [ ] XAMPP MySQL Running
- [ ] Database library dibuat
- [ ] File database/perpusku_backup.sql ter-import
- [ ] Backend npm install sukses
- [ ] File backend/.env dibuat
- [ ] Backend bisa start
- [ ] Frontend npm install sukses
- [ ] File frontend/.env dibuat
- [ ] Frontend bisa start

## Troubleshooting

### Error npm command not found
Node.js belum terinstall. Restart terminal setelah install.

### Error ER_ACCESS_DENIED_ERROR
Password MySQL salah. Cek DB_PASSWORD di .env.

### Error ER_NO_SUCH_TABLE
Database belum ter-import. Ulangi Langkah 2.3.

### Error Port 3000 already in use

### Error Cannot find module

Kembali ke README.md