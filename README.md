# Manajemen Keuangan Tangki Air

Aplikasi web modern, profesional, dan responsif (Mobile-First) untuk mengelola pencatatan pemasukan dan pengeluaran usaha operasional penjualan air menggunakan tangki. Terintegrasi langsung dengan **Google Spreadsheet** sebagai database utama melalui **Google Apps Script API**.

---

## 🌟 Fitur Utama

### 1. Hak Akses & Keamanan Multi-Peran (RBAC)
- **Admin**:
  - Menambah, mengedit, dan menghapus transaksi keuangan.
  - Menambah dan mengelola kategori kustom.
  - Mengunduh laporan bulanan format PDF dan CSV.
  - Mengonfigurasi dan menyinkronkan data dengan Google Spreadsheet.
- **Viewer**:
  - Mode baca saja (read-only): dapat melihat seluruh dashboard, grafik, daftar riwayat transaksi, dan laporan.
  - Ditolak di tingkat backend / API jika mencoba memodifikasi atau menghapus data.
- **Kredensial Bawaan**:
  - Admin: `admin` / `admin123`
  - Viewer: `viewer` / `viewer123`

### 2. Pencatatan Transaksi Khusus Usaha Tangki Air
- Kolom transaksi: Tanggal, Jenis (Pemasukan / Pengeluaran), Kategori, Nominal Rupiah, Plat Nomor Armada Truk Tangki (opsional), Volume Air Tangki (Liter), dan Keterangan.
- Kategori Pemasukan:
  - *Penjualan air* (termasuk suplai depot, kolam renang, dan proyek konstruksi).
- Kategori Pengeluaran:
  - *Air bahan baku* (pembelian dari sumber mata air/PDAM).
  - *Solar* (BBM truk tangki).
  - *Bensin* (mesin pompa sedot/alkon).
  - *Konsumsi* (uang makan supir dan kernet).
  - *Service* (ganti oli, ban truk, perbaikan pompa tangki).
  - *Gaji crew* (uang jalan & ritase supir).
  - Kategori tambahan kustom yang dapat dibuat oleh Admin.

### 3. Dashboard Visual & Grafik Interaktif
- Kartu KPI: Total Pemasukan, Total Pengeluaran, Saldo Bersih, Ritase Pengiriman, dan Akumulasi Volume Air.
- Grafik Interaktif:
  - Tren Arus Kas Harian (14-30 hari aktif).
  - Perbandingan Bulanan (12 bulan tahun berjalan).
  - Akumulasi Tahunan.
  - Komposisi Beban Pengeluaran per Kategori (% dan Rupiah).
  - Komposisi Sumber Pemasukan per Kategori.
- Filter periode instan: Hari Ini, 7 Hari Terakhir, Bulan Ini, Tahun Ini, dan Semua.

### 4. Laporan Bulanan & Ekspor Dokumen
- Rekapitulasi per bulan dan tahun.
- **Unduh PDF**: Format dokumen resmi lengkap dengan header perusahaan, ringkasan eksekutif, tabel akumulasi kategori, tabel transaksi itemized, dan nomor halaman.
- **Unduh CSV**: Format tabel ber-BOM UTF-8 yang dapat langsung dibuka rapi di Microsoft Excel maupun Google Spreadsheet.

### 5. Desain Responsif Mobile-First
- Tampilan optimal pada HP Android, iPhone (termasuk notch/safe-area), tablet, laptop, dan monitor desktop (viewport 320px - 4K).
- Navigasi bawah (Bottom Bar) khusus HP dengan tombol cepat (+) untuk Admin.
- Tampilan transaksi mode kartu ringkas di layar ponsel dan tabel terstruktur di desktop.

---

## 🗄️ Panduan Integrasi Google Spreadsheet & Google Apps Script

Aplikasi ini menggunakan Google Spreadsheet sebagai database permanen. Ikuti langkah mudah berikut:

### Langkah 1: Buat Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama file, misalnya: **"Keuangan Tangki Air"**.

### Langkah 2: Buka Apps Script
1. Di menu atas Spreadsheet, klik **Ekstensi (Extensions)** &rarr; **Apps Script**.
2. Hapus seluruh isi kode bawaan di file `Code.gs`.
3. Buka file [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) di repositori ini, lalu salin dan tempelkan seluruh kodenya ke editor Google Apps Script.
4. Klik ikon **Simpan (Save)** 💾.

### Langkah 3: Terapkan Sebagai Web App
1. Klik tombol **Deploy (Terapkan)** di pojok kanan atas &rarr; pilih **New deployment (Penerapan baru)**.
2. Klik ikon gear ⚙️ di sebelah *Select type* &rarr; pilih **Web app**.
3. Atur konfigurasi berikut:
   - **Description**: API Manajemen Tangki Air
   - **Execute as**: *Me (email Anda)*
   - **Who has access**: **Anyone (Siapa saja)** *(Wajib dipilih agar aplikasi web dapat berkomunikasi tanpa kendala otorisasi Google)*.
4. Klik **Deploy**, lalu klik **Authorize access** dan izinkan akun Google Anda.
5. Salin **Web App URL** yang didapatkan (akhiran `/exec`).

### Langkah 4: Hubungkan ke Aplikasi
1. Buka aplikasi web ini, masuk sebagai **Admin**.
2. Klik menu **Google Spreadsheet** atau tombol status di pojok kanan atas.
3. Tempelkan URL Web App tersebut ke kolom yang disediakan.
4. Klik **Uji Koneksi Server**, lalu klik **Simpan & Sinkronkan Data**.
5. Spreadsheet Anda akan otomatis terisi sheet `Transaksi`, `Kategori`, dan `Users` lengkap dengan header berwarna rapi!

---

## 🚀 Panduan Deployment ke GitHub & Vercel

Aplikasi ini dibangun menggunakan Vite + React + TypeScript yang didukung penuh oleh platform hosting Vercel.

### 1. Push ke GitHub
Jalankan perintah berikut di terminal komputer Anda:

```bash
# Inisialisasi repositori git
git init
git add .
git commit -m "feat: Inisialisasi Manajemen Keuangan Tangki Air"

# Hubungkan ke repository GitHub Anda
git remote add origin https://github.com/USERNAME/manajemen-keuangan-tangki-air.git
git branch -M main
git push -u origin main
```

### 2. Deploy ke Vercel
1. Kunjungi [vercel.com](https://vercel.com) dan login menggunakan akun GitHub.
2. Klik **Add New...** &rarr; **Project**.
3. Pilih repositori **manajemen-keuangan-tangki-air** yang baru saja Anda push.
4. Pada bagian **Environment Variables**, tambahkan variabel berikut:
   - **Key**: `VITE_APPS_SCRIPT_URL`
   - **Value**: `https://script.google.com/macros/s/AKfycb.../exec` (URL Web App Apps Script Anda)
5. Klik tombol **Deploy**.
6. Selesai! Web Anda akan langsung aktif dengan URL Vercel (misal: `https://tangki-air-keuangan.vercel.app`).

---

## 💻 Menjalankan di Komputer Lokal

```bash
# 1. Install seluruh dependensi
npm install

# 2. Jalankan server pengembang (development)
npm run dev

# 3. Buka browser di http://localhost:3000
```

---

## 📁 Struktur Folder Proyek

```
/
├── google-apps-script/
│   └── Code.gs                 # Kode backend lengkap untuk Google Apps Script & Sheets API
├── src/
│   ├── components/             # Komponen UI modular responsif
│   │   ├── Navbar.tsx          # Top bar, status badge & akun
│   │   ├── Sidebar.tsx         # Sidebar desktop & drawer mobile
│   │   ├── MobileNav.tsx       # Bottom bar navigasi mobile
│   │   ├── StatCard.tsx        # Kartu statistik ringkasan keuangan
│   │   ├── ChartsSection.tsx   # Grafik interaktif SVG/HTML5 (Harian, Bulanan, Kategori)
│   │   ├── TransactionModal.tsx# Form tambah & edit transaksi
│   │   ├── CategoryModal.tsx   # Form tambah kategori kustom (Admin)
│   │   ├── SpreadsheetModal.tsx# Pengaturan koneksi Google Sheets
│   │   ├── DeleteConfirmModal.tsx # Konfirmasi penghapusan aman
│   │   └── GuideModal.tsx      # Panduan interaktif di dalam aplikasi
│   ├── pages/
│   │   ├── LoginPage.tsx       # Halaman login multi-peran
│   │   ├── DashboardPage.tsx   # Halaman utama ringkasan & grafik
│   │   ├── TransactionsPage.tsx# Riwayat, pencarian & filter transaksi
│   │   ├── CategoriesPage.tsx  # Kelola pos pemasukan & pengeluaran
│   │   ├── ReportsPage.tsx     # Rekap bulanan, cetak PDF & CSV
│   │   └── SettingsPage.tsx    # Profil usaha & konfigurasi Spreadsheet
│   ├── services/
│   │   ├── api.ts              # Service sinkronisasi data Apps Script & lokal
│   │   └── authService.ts      # Pengelolaan sesi & hak akses peran
│   ├── utils/
│   │   ├── defaultData.ts      # Kategori default & transaksi realistis tangki air
│   │   ├── exportPdf.ts        # Generator dokumen resmi PDF (jspdf-autotable)
│   │   ├── exportCsv.ts        # Generator file CSV Excel UTF-8 BOM
│   │   └── formatters.ts       # Format mata uang Rupiah & tanggal Indonesia
│   ├── types/
│   │   └── index.ts            # Definisi antarmuka TypeScript
│   ├── App.tsx                 # Root router & penampung state global
│   ├── main.tsx                # Entry point React 19
│   └── index.css               # Tailwind CSS & konfigurasi tipografi
├── vercel.json                 # Konfigurasi routing SPA untuk Vercel
├── .env.example                # Panduan konfigurasi environment variables
└── package.json                # Dependensi proyek
```

---

## 🔒 Catatan Keamanan
- Tidak ada password atau kredensial rahasia yang disimpan dalam frontend.
- Otorisasi penambahan/pengubahan data dicek ganda di frontend dan divalidasi ketat di endpoint backend Google Apps Script.
- Akun Viewer diblokir dari seluruh request mutasi data (POST / EDIT / DELETE).
