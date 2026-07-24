# DOKUMEN PANDUAN PENGGUNA & RENCANA IMPLEMENTASI DASHBOARD
## Sistem Informasi Kepegawaian & Presensi Terintegrasi (SIP-MU Enterprise)
**Khusus Peran: Guru, Pegawai, dan Karyawan Sekolah**

Dokumen resmi ini disusun sebagai panduan operasional penggunaan menu **Dashboard** pada aplikasi **SIP-MU Enterprise**, serta memuat peta jalan perbaikan (*Implementation Plan*) untuk menjamin kestabilan dan kinerja seluruh fitur dashboard kepegawaian.

---

## 1. PENGANTAR & KEUNGGULAN DASHBOARD

Dashboard SIP-MU Enterprise dirancang sebagai portal terpadu (*single point of access*) bagi seluruh civitas sekolah. Dashboard ini mendistribusikan data kehadiran, jadwal kerja, dan data kepegawaian secara dinamis berdasarkan peran pengguna (*role-aware*).

### Keunggulan Dashboard:
*   **Antarmuka Responsif & Premium**: Menggunakan font modern *Plus Jakarta Sans* dengan tata letak yang bersih, animasi transisi halus (*Framer Motion*), dan dukungan otomatis untuk mode gelap (*Dark Mode*).
*   **Widget Absensi Dinamis (Punch Card)**: Menampilkan jam masuk dan jam pulang riil hari ini, serta akses langsung ke halaman kamera presensi dengan tombol warna adaptif.
*   **Visualisasi Data Interaktif**: Statistik kehadiran pribadi bulanan divisualisasikan dalam bentuk grafik batang (*Bar Chart*) interaktif menggunakan *Recharts*.
*   **Penyaringan Jadwal Mengajar Otomatis**: Khusus bagi pendidik (Guru), sistem menampilkan jadwal mengajar hari ini secara berurutan sesuai jam pelajaran beserta penanda tugas guru piket/pengganti (*Inval*).
*   **Navigasi Cepat (Quick Actions)**: Mempercepat akses ke menu pengajuan cuti, rekap absensi, dan jadwal mingguan dalam satu klik.

---

## 2. PENGENALAN ANTARMUKA DASHBOARD (WIDGET BREAKDOWN)

Dashboard terbagi menjadi beberapa komponen visual yang tersusun secara ergonomis:

### A. Header Portal (Selamat Datang)
*   **Fungsi**: Menyambut pengguna dengan nama lengkap dan jabatan mereka.
*   **Elemen**: Lencana status peran (misal: "Portal Guru" atau "Portal Pegawai") dan widget kalender dinamis yang menampilkan hari dan tanggal server.

### B. Punch Card Kehadiran Harian (Khusus Staf & Guru Hybrid)
*   **Fungsi**: Menampilkan rekaman jam *Check In* (Masuk) dan *Check Out* (Pulang) untuk hari ini.
*   **Warna Status**:
    *   *Belum Absen*: Tombol biru gradasi "Presensi Masuk" aktif.
    *   *Sudah Masuk*: Tombol merah gradasi "Presensi Keluar" aktif.
    *   *Selesai/Libur*: Banner hijau bertuliskan "Selesai Hari Ini" atau banner biru "Hari Libur" aktif.

### C. Jadwal Mengajar Hari Ini (Khusus Guru)
*   **Fungsi**: Menampilkan daftar mata pelajaran, jam ke, dan nama kelas yang diampu guru pada hari tersebut.
*   **Elemen Spesifik**: Menampilkan lencana warna amber berlabel "INVAL: [Nama Guru Asal]" jika guru bertindak sebagai guru pengganti.

### D. Grafik Statistik Bulanan (Personal Recap)
*   **Fungsi**: Diagram batang yang menyajikan akumulasi status presensi pribadi pengguna selama bulan berjalan.
*   **Kategori**: Hadir (Tepat Waktu), Terlambat, Sakit/Izin, dan Alfa.

### E. Profil Ringkas & Data Pribadi
*   **Fungsi**: Menampilkan foto/inisial nama, NIP/NIK, jabatan aktif, dan status koneksi kepegawaian (Active).

### F. Navigasi Cepat & Lokasi Kampus
*   **Fungsi**: Pintasan untuk mengajukan cuti, membuka rekap absensi, melihat jadwal mingguan, dan melihat radius jangkauan lokasi koordinat kampus yang terdaftar.

---

## 3. PANDUAN PENGGUNAAN (USER GUIDE)

### Langkah 1: Membuka Aplikasi & Login
1. Buka tautan resmi portal SIP-MU Enterprise sekolah Anda.
2. Masukkan email dan password Anda yang terdaftar pada sistem.
3. Setelah login berhasil, Anda akan otomatis diarahkan ke menu **Dashboard**.

### Langkah 2: Membaca Indikator Kehadiran
*   Periksa widget **Punch Card** di bagian atas dashboard untuk melihat apakah status absen masuk Anda sudah tercatat.
*   Jika hari ini merupakan hari libur nasional atau libur sekolah, sistem akan menampilkan banner berwarna oranye hangat dan memblokir opsi presensi karena Anda dihitung hadir otomatis.

### Langkah 3: Melakukan Absensi Harian atau Kelas
1. Klik tombol **"Presensi Masuk"**, **"Presensi Keluar"**, atau **"Presensi Jam ke-X"** pada dashboard.
2. Sistem akan mengarahkan Anda ke halaman kamera presensi langsung (*Live Attendance*).
3. Pastikan GPS aktif dan izinkan browser mengakses kamera Anda.
4. Lakukan verifikasi kedipan/gerakan wajah sesuai petunjuk di layar, lalu ambil foto.

### Langkah 4: Mengakses Menu Tambahan via Navigasi Cepat
*   **Pengajuan Cuti**: Klik tombol **"Cuti/Izin"** untuk langsung menuju form pengisian permohonan izin sakit, cuti tahunan, atau izin pulang cepat.
*   **Rekap Absensi**: Klik **"Absensi Pribadi"** untuk melihat detail riwayat presensi, koordinat check-in, dan foto watermark Anda pada tanggal-tanggal sebelumnya.

---

## 4. SYARAT & KETENTUAN SISTEM

1.  **Izin Lokasi (GPS) Wajib Aktif**: Pengguna wajib memberikan akses lokasi berakurasi tinggi (*high accuracy*) pada browser ponsel mereka saat mengakses portal.
2.  **Izin Akses Kamera**: Kamera depan wajib berfungsi dengan baik untuk keperluan validasi *face verification*. Penggunaan foto cetak atau manipulasi kamera virtual akan diblokir otomatis oleh sistem *Liveness Detection*.
3.  **Batas Waktu Toleransi Keterlambatan**: Presensi harian masuk dan jam pelajaran dibatasi oleh toleransi waktu (default: 10 menit setelah jam masuk). Jika terlewat, Anda wajib meminta "Unlock Token" ke staf Kurikulum/Admin untuk melakukan absen.
4.  **Ketentuan Hari Libur**: Seluruh presensi dinonaktifkan pada tanggal merah/hari libur yang telah diinput Super Admin. Perhitungan gaji/kehadiran pada hari libur tidak akan terpotong (dianggap hadir).

---

## 5. TROUBLESHOOTING & FAQ (PERTANYAAN UMUM)

*   **Tanya: Mengapa tombol presensi di dashboard saya berwarna abu-abu dan tidak bisa diklik?**
    *   *Jawab*: Periksa jarak radius Anda dari lokasi kampus yang dipilih. Anda harus berada di dalam radius jangkauan (misal: max 100 meter). Periksa juga apakah sinyal GPS Anda sedang buruk (>60 meter) atau belum waktunya melakukan presensi.
*   **Tanya: Kamera di ponsel saya tidak muncul saat hendak melakukan absensi.**
    *   *Jawab*: Pastikan Anda mengakses aplikasi menggunakan protokol HTTPS yang aman (bukan HTTP biasa). Periksa juga pengaturan privasi browser Anda dan pastikan izin kamera (*Allow Camera*) untuk situs web portal sudah aktif.
*   **Tanya: Grafik rekap bulanan saya di dashboard menunjukkan jumlah "Alfa" padahal saya selalu hadir.**
    *   *Jawab*: Pastikan Anda selalu melakukan absen keluar (*Check Out*). Absen masuk yang tidak ditutup dengan absen keluar pada hari yang sama akan dikategorikan sebagai ketidakhadiran tidak lengkap (Alpha) oleh sistem rekap saat cutoff dijalankan, kecuali untuk role Guru Murni.

---

## 6. RENCANA PERBAIKAN & REKOMENDASI PENGEMBANGAN (IMPLEMENTATION PLAN)
Berikut adalah daftar peningkatan teknis untuk menu dashboard guna meminimalkan kegagalan dan meningkatkan pengalaman pengguna:

### A. Implementasi Real-time Clock Sync (Sinkronisasi Waktu Server)
*   **Masalah**: Pengguna dapat memanipulasi waktu lokal pada ponsel mereka agar terlihat tidak terlambat saat check-in.
*   **Rencana Perbaikan**: Jalankan sinkronisasi waktu server menggunakan HTTP Header Request saat dashboard dimuat, lalu jalankan jam dinamis di sisi frontend menggunakan interval Javascript berdasarkan waktu server tersebut, bukan waktu lokal perangkat.

### B. Penanganan State Offline (Offline Fallback Banner)
*   **Masalah**: Koneksi internet yang tidak stabil di area sekolah membuat dashboard macet saat memuat data grafik atau jadwal.
*   **Rencana Perbaikan**: Tambahkan detektor status jaringan (`navigator.onLine`) di frontend. Jika offline, tampilkan banner peringatan "Koneksi Terputus" di dashboard dan nonaktifkan tombol presensi agar tidak mengirimkan data yang corrupt ke server.

### C. Skeleton Loading untuk Data Berat
*   **Masalah**: Grafik Recharts dan data jadwal mengajar membutuhkan waktu 1-2 detik untuk dimuat, menyebabkan tata letak dashboard bergeser (*layout shift*).
*   **Rencana Perbaikan**: Terapkan komponen *Skeleton Loading* (berbasis Tailwind animate-pulse) sebagai placeholder sebelum data API dari Inertia terisi penuh.
