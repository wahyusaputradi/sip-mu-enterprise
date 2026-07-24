# EXECUTIVE SUMMARY (RINGKASAN EKSEKUTIF)
## SIP-MU ENTERPRISE
### Sistem Informasi Presensi & Manajemen Kepegawaian Terintegrasi
**SMK Manbaul Ulum Cirebon**

---

| Parameter Dokumen | Keterangan |
| :--- | :--- |
| **Nama Sistem** | SIP-MU Enterprise (*Sistem Integrasi Presensi Manbaul Ulum*) |
| **Instansi Target** | SMK Manbaul Ulum Cirebon |
| **Peruntukan** | Yayasan, Manajemen, Kepala Sekolah, Guru & Tenaga Kependidikan |
| **Status Dokumen** | Resmi / Siap Dipresentasikan (*Final Executive Brief*) |
| **Versi Dokumen** | v2.2 (Fokus Presensi, Kepegawaian & Spesifikasi Perangkat) |
| **Penyusun** | Tim System Analyst & Technical Writer |

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

**SIP-MU Enterprise** adalah solusi platform tata kelola kepegawaian, presensi presisi, dan manajemen kedisiplinan yang dirancang khusus untuk memenuhi kebutuhan operasional di **SMK Manbaul Ulum Cirebon**. 

Sistem ini hadir untuk memodernisasi dan meningkatkan efisiensi pencatatan kehadiran harian guru/karyawan, pemantauan kegiatan belajar mengajar (KBM) di kelas, alur pengajuan izin/cuti digital, serta akuntabilitas kedisiplinan SDM sekolah. Mengusung konsep *Single Point of Access*, SIP-MU Enterprise menyatukan portal guru, staf kependidikan, serta jajaran pimpinan dalam satu platform web responsif berbasis *cloud* yang dapat diakses dengan aman dari berbagai perangkat (*smartphone*, tablet, maupun komputer).

Dengan mengintegrasikan teknologi **Verifikasi Wajah (*Liveness Face Detection*)**, **Pembatasan Area Koordinat (*GPS Geofencing*)**, serta **Sistem Rekapitulasi Otomatis**, SIP-MU Enterprise menjamin 100% validitas data presensi, menghilangkan potensi manipulasi kehadiran (seperti titip absen atau foto palsu), serta memangkas waktu rekapitulasi kedisiplinan bulanan dari hitungan hari menjadi hitungan detik.

---

## 2. LATAR BELAKANG & TUJUAN STRATEGIS

### A. Tantangan Operasional Sebelum Implementasi (Pain Points)
Sebelum hadirnya SIP-MU Enterprise, pengelolaan presensi dan administrasi kepegawaian di lingkungan sekolah menghadapi beberapa tantangan utama:

1. **Rentan Manipulasi & Kurangnya Akurasi Presensi**:
   * Sistem presensi konvensional (kertas manual maupun mesin *fingerprint* fisik) memiliki keterbatasan, seperti ketergantungan pada alat fisik di satu titik antrean, kerentanan penumpukan antrean jam masuk, serta belum mampu memverifikasi keberadaan fisik pengguna secara *real-time* di lokasi yang sah.
2. **Kerapuhan Pemantauan Jam Mengajar & Guru Pengganti (*Inval*)**:
   * Pemantauan kehadiran guru di kelas kerap mengalami kendala keterlambatan informasi antara jadwal yang direncanakan dengan realisasi KBM di lapangan. Penugasan guru piket/pengganti (*inval*) sering kali dicatat manual sehingga menyulitkan evaluasi beban mengajar secara akurat.
3. **Proses Rekapitulasi Presensi yang Menyita Waktu Tata Usaha**:
   * Tim Tata Usaha (TU) dan bagian Kepegawaian harus mencocokkan secara manual lembar presensi harian, jurnal kelas, izin/sakit, hingga perhitungan tingkat keterlambatan bagi puluhan hingga ratusan staf. Proses ini rentan terhadap *human error* dan membutuhkan waktu lama.
4. **Kurangnya Transparansi Informasi Kedisiplinan Bagi Guru & Staf**:
   * Pegawai tidak memiliki akses langsung untuk memantau rekap statistik kehadiran harian, riwayat jam masuk/keluar, maupun jatah izin/cuti mereka secara mandiri dan *real-time*.

### B. Tujuan Utama Pengembangan Sistem
SIP-MU Enterprise dikembangkan dengan tujuan strategis berikut:
* **Digitalisasi Presensi End-to-End**: Mengintegrasikan seluruh aktivitas kehadiran—mulai dari absen masuk harian, kehadiran jam pelajaran di kelas, pengajuan cuti, hingga laporan kedisiplinan—dalam satu alur terotomatisasi.
* **Akuntabilitas & Validitas Data Tinggi**: Menjamin bahwa setiap data presensi yang masuk dilaporkan dari lokasi sekolah yang sah (*geofenced*) dan dilakukan oleh personel yang bersangkutan (*face-verified*).
* **Efisiensi Waktu & Penghematan Biaya Operasional**: Menghilangkan penggunaan kertas (*paperless office*) dan memangkas waktu kerja administratif bagian Kepegawaian dan TU hingga 90%.
* **Meningkatkan Transparansi Kedisiplinan Staf**: Memberikan keterbukaan informasi bagi guru dan karyawan mengenai catatan kehadiran serta memicu budaya kedisiplinan yang berkeadilan.

---

## 3. FITUR UTAMA & ALUR KERJA OPERASIONAL

SIP-MU Enterprise dirancang dengan arsitektur modul terintegrasi yang mencakup seluruh aktivitas presensi dan kepegawaian sekolah.

```
+-----------------------------------------------------------------------------------+
|                           ALUR KERJA SIP-MU ENTERPRISE                             |
+-----------------------------------------------------------------------------------+
|  [1. PRESENSI PRESISI]       [2. AKTIVITAS KBM]        [3. VERIFIKASI & IZIN]     |
|  - Face Liveness Check       - Filter Jadwal Mengajar  - Permohonan Cuti Digital  |
|  - GPS Geofencing Campus     - Penanganan Guru Inval   - Token Keterlambatan      |
+--------------------------+-------------------------+------------------------------+
                           |                         |
                           v                         v
+-----------------------------------------------------------------------------------+
|                   [4. MESIN REKAPITULASI KEDISIPLINAN OTOMATIS]                   |
|  - Akumulasi Otomatis Jam Hadir, Terlambat, Sakit, Izin, & Alfa                   |
|  - Rekapitulasi Realisasi Jam Mengajar & Tugas Guru Inval                         |
+-----------------------------------------------------------------------------------+
                           |
                           v
+-----------------------------------------------------------------------------------+
|                        [5. OUTPUT & LAPORAN REAL-TIME]                            |
|  - Rekap Presensi Pribadi Staf (Portal & PDF)                                     |
|  - Executive Dashboard Kedisiplinan Yayasan & Kepala Sekolah                      |
|  - Notifikasi Internal Portal & Pusat Informasi Real-Time                         |
+-----------------------------------------------------------------------------------+
```

### Detail Modul Utama:

#### 1. Presensi Presisi (Biometric & Geofencing Attendance)
* **Verifikasi Kedipan & Gerakan Wajah (*Liveness Detection*)**: Menggunakan teknologi AI di browser ponsel untuk mendeteksi wajah secara *live*. Pengguna tidak dapat memanipulasi absensi menggunakan foto cetak atau rekaman video.
* **Validasi Lokasi Kampus (*GPS Geofencing*)**: Sistem mengunci koordinat GPS perangkat. Absensi hanya dapat dilakukan jika posisi fisik pengguna berada di dalam radius resmi area kampus SMK Manbaul Ulum Cirebon (misal: radius maks 100 meter).
* **Toleransi Keterlambatan & System Unlock Token**: Memiliki batas toleransi kedisiplinan jam masuk. Jika melewati batas toleransi karena alasan darurat yang valid, pimpinan/admin dapat menerbitkan *Unlock Token* agar presensi tetap dapat dicatat.

#### 2. Portal Dashboard Berbasis Peran (*Role-Aware Dashboard*)
* **Portal Guru**: Menampilkan jam masuk/keluar harian, jadwal mengajar hari ini secara berurutan, informasi tugas guru pengganti (*inval*), serta grafik statistik kehadiran pribadi bulanan.
* **Portal Pegawai/Karyawan**: Fokus pada *punch card* presensi harian (jam masuk & keluar) serta navigasi cepat permohonan izin/cuti.
* **Portal Administrator & Pimpinan**: Menyediakan ringkasan eksekutif kehadiran real-time seluruh staf, daftar guru terlambat/alfa, status kelas terisi, serta statistik kedisiplinan bulanan.

#### 3. Manajemen Jadwal Mengajar & Guru Pengganti (*Inval Engine*)
* **Penyaringan Jadwal Otomatis**: Menampilkan jam pelajaran harian sesuai alokasi kurikulum bagi setiap guru.
* **Sistem Guru Inval**: Apabila seorang guru berhalangan hadir, sistem memfasilitasi penunjukan guru pengganti (*inval*) oleh Piket/Kurikulum. Kehadiran guru inval di kelas tercatat secara akurat untuk rekapitulasi KBM.

#### 4. Pengajuan Cuti, Izin, & Rekapitulasi Kedisiplinan
* **Alur Perizinan Digital**: Pengajuan izin sakit, cuti tahunan, atau izin keluar lingkungan sekolah dilakukan via aplikasi lengkap dengan unggah bukti (surat dokter/dinas).
* **Otomatisasi Rekapitulasi Presensi**: Akumulasi total hari hadir, jam terlambat, izin, dan alfa dihitung secara otomatis oleh sistem tanpa perlu rekap manual.

#### 5. Notifikasi Portal & Pusat Informasi Real-Time (System Notification Engine)
* Sistem menyediakan modul notifikasi terintegrasi langsung di dalam portal web (papan pengumuman & badge notifikasi aktif) untuk memberikan pemberitahuan langsung terkait status persetujuan izin, jadwal piket, serta pengumuman penting sekolah saat staf membuka aplikasi.

---

## 4. INFRASTRUKTUR & TEKNOLOGI (TECH STACK)

Untuk memastikan sistem berjalan sangat cepat, aman, dan mudah digunakan, SIP-MU Enterprise dibangun menggunakan kombinasi teknologi modern. Berikut adalah penjelasan komponen teknologi menggunakan **analogi sederhana yang mudah dipahami pihak non-teknis**:

```
+-----------------------------------------------------------------------------------+
|                        TUMPUMAN TEKNOLOGI (TECH STACK)                            |
+-----------------------------------------------------------------------------------+
|  [TAMPILAN DEPAN / FRONTEND]                                                      |
|  React.js + Inertia.js + Tailwind CSS                                             |
|  Analogi: "Wajah Portal yang Mewah, Responsif & Cepat Tanpa Loading Berbelit"     |
+-----------------------------------------------------------------------------------+
|  [MESIN UTAMA / BACKEND ENGINE]                                                   |
|  Laravel 11 (PHP 8.2+)                                                            |
|  Analogi: "Otak & Manajer Pusat Komando yang Mengatur Aturan Presensi & Izin"     |
+-----------------------------------------------------------------------------------+
|  [SISTEM KEAMANAN PRESENSI]                                                       |
|  Face-API.js (AI Liveness) + Leaflet GPS                                          |
|  Analogi: "Satpam Digital yang Memeriksa Wajah & Memastikan Pagar Sekolah"        |
+-----------------------------------------------------------------------------------+
|  [BASIS DATA & NOTIFIKASI SISTEM]                                                 |
|  MySQL Database + System Notification Portal                                      |
|  Analogi: "Bilik Arsip Besi Terproteksi + Papan Pengumuman Digital Internal"      |
+-----------------------------------------------------------------------------------+
```

### Detail Penjelasan Analogi Teknologi:

1. **Laravel 11 (*Backend Engine*) — "Otak & Manajer Pusat Komando"**
   * *Fungsi*: Bertindak sebagai pusat pemrosesan logika, validasi jam masuk/keluar, pemroses persetujuan cuti, dan pengolah data kedisiplinan.
   * *Analogi*: Seperti manajer operasional yang sangat disiplin dan cepat. Dia yang memverifikasi jam kehadiran, memeriksa jatah cuti, dan memastikan aturan presensi ditaati.

2. **React.js & Inertia.js (*Frontend User Interface*) — "Wajah & Pelayan Portal"**
   * *Fungsi*: Menampilkan antarmuka yang indah, modern, dan memberikan respon seketika saat tombol diklik tanpa membuat layar *blank* atau me-reload halaman.
   * *Analogi*: Seperti pelayan restoran bintang lima yang sangat ramah dan gesit. Saat Anda membuka jadwal atau menekan tombol presensi, pelayan langsung menyajikannya di layar tanpa membuat Anda menunggu lama.

3. **Tailwind CSS & Shadcn UI (*Visual Style & Design System*) — "Decor & Interior Modern"**
   * *Fungsi*: Membentuk tampilan aplikasi agar terlihat sangat profesional, elegan, menggunakan font modern (*Plus Jakarta Sans*), serta mendukung mode gelap (*Dark Mode*).
   * *Analogi*: Seperti penataan interior gedung kantor modern yang rapi, bersih, dan nyaman di mata, sehingga membuat siapapun betah menggunakannya.

4. **Face-API.js & Leaflet GPS (*AI Liveness & Geofencing*) — "Satpam Digital & Pagar Kampus"**
   * *Fungsi*: Memverifikasi wajah pengguna secara langsung melalui kamera dan mencocokkan posisi koordinat GPS HP pengguna dengan lokasi kampus.
   * *Analogi*: Seperti petugas keamanan di pintu gerbang sekolah yang memeriksa wajah staf secara langsung dan memastikan staf sudah benar-benar melangkahkan kaki di dalam area sekolah.

5. **MySQL Database — "Bilik Arsip Besi Terproteksi"**
   * *Fungsi*: Tempat menyimpan seluruh catatan presensi harian, jadwal KBM, data kepegawaian, dan dokumen perizinan secara terstruktur dan aman.
   * *Analogi*: Seperti lemari arsip besi tahan api bernomor seri yang terkunci rapat. Hanya pihak berwenang yang memiliki kunci untuk membuka data di dalamnya.

6. **System Notification Engine — "Papan Pengumuman Digital Internal"**
   * *Fungsi*: Fitur notifikasi langsung di dalam portal yang menampilkan peringatan, pesan konfirmasi, dan pengumuman aplikasi secara langsung di layar pengguna.
   * *Analogi*: Seperti papan pengumuman digital interaktif di lobi utama sekolah yang langsung memberikan informasi begitu guru atau staf melangkah masuk ke dalam portal.

---

## 5. KEBUTUHAN MINIMAL PERANGKAT (DEVICE REQUIREMENTS)

Agar aplikasi **SIP-MU Enterprise** dapat diakses dan berjalan secara optimal oleh seluruh pihak, berikut adalah spesifikasi kebutuhan minimal perangkat (*device requirements*):

### A. Perangkat Pengguna / Staf (Ponsel Pintar / Smartphone Guru & Karyawan)
| Komponen Perangkat | Spesifikasi Minimal | Rekomendasi Optimal |
| :--- | :--- | :--- |
| **Sistem Operasi (OS)** | Android v7.0 (Nougat) atau iOS 12.0 | Android v10.0+ atau iOS 14.0+ |
| **Kamera Depan** | Minimal 2 Megapiksel (Fungsional) | 5 Megapiksel+ (*Hasil foto jernih*) |
| **Sensor GPS** | *Internal GPS/Location Sensor* | *High Precision GPS / GLONASS* |
| **Memori (RAM)** | Minimal 2 GB RAM | 3 GB RAM atau lebih |
| **Perjelajah Web (Browser)** | Google Chrome v90+, Safari v13+, atau Firefox | Google Chrome versi terbaru |
| **Koneksi Internet** | 3G / HSPA / Wi-Fi Kampus (Min 1 Mbps) | 4G LTE / 5G / Wi-Fi Kampus Stabil |
| **Izin Perangkat (Permissions)**| Wajib mengizinkan Akses Kamera & GPS Akurasi Tinggi pada Browser |

### B. Perangkat Administrator, Tata Usaha & Pimpinan (Laptop / PC Desktop)
| Komponen Perangkat | Spesifikasi Minimal | Rekomendasi Optimal |
| :--- | :--- | :--- |
| **Perangkat Keras (Hardware)**| Dual-Core Processor, RAM 4 GB | Intel Core i3 / Ryzen 3+, RAM 8 GB |
| **Resolusi Layar** | 1280 x 720 piksel (HD) | 1920 x 1080 piksel (Full HD) |
| **Perjelajah Web (Browser)** | Google Chrome, MS Edge, atau Mozilla Firefox terbaru | Google Chrome versi terbaru |
| **Koneksi Internet** | Broadband Wi-Fi / LAN Sekolah (Min 5 Mbps) | Fiber Optic LAN / Wi-Fi dedicated |

### C. Infrastruktur Server & Protokol Keamanan (Server Requirements)
* **Protokol Keamanan Wajib (HTTPS / SSL Certificate)**: Aplikasi **wajib** diakses melalui protokol aman `https://`. Hal ini karena sistem keamanan browser modern (Android/iOS/Chrome/Safari) secara otomatis akan **memblokir akses kamera & GPS** jika aplikasi diakses melalui koneksi HTTP biasa.
* **Spesifikasi Server Hosting/Cloud**:
  * **Web Server**: Nginx / Apache dengan PHP v8.2+
  * **Database Engine**: MySQL v8.0+ / MariaDB v10.4+
  * **Ekstensi PHP Wajib**: cURL, GD/Imagick, OpenSSL, PDO, Mbstring, Zip.

---

## 6. MANFAAT & NILAI TAMBAH IMPLEMENTASI

Implementasi SIP-MU Enterprise memberikan dampak positif yang signifikan bagi seluruh pemangku kepentingan (*stakeholders*) di SMK Manbaul Ulum Cirebon:

### A. Bagi Pihak Yayasan & Manajemen Organisasi
* **Pengawasan Kedisiplinan SDM Transparan**: Menyediakan *Executive Dashboard* untuk memantau tingkat kehadiran dan kedisiplinan guru/staf secara real-time dari mana saja.
* **Akuntabilitas Data Kehadiran**: Menghilangkan risiko kecurangan presensi sehingga laporan kedisiplinan dapat dipertanggungjawabkan sepenuhnya.
* **Pengambilan Keputusan Berbasis Data (*Data-Driven*)**: Memudahkan evaluasi kinerja harian dan bulanan pegawai berbasis data historis presensi yang objektif.

### B. Bagi Kepala Sekolah & Tim Kurikulum
* **Penjaminan Mutu KBM**: Memastikan setiap jam pelajaran di kelas terisi sesuai jadwal. Sistem langsung mendeteksi kelas yang berpotensi kosong dan mempermudah penunjukan guru *inval*.
* **Monitoring Kehadiran Kelas**: Pengawasan ketat terhadap jam masuk kelas guru demi kenyamanan dan ketertiban proses pembelajaran siswa.

### C. Bagi Tata Usaha (TU) & Bagian Kepegawaian
* **Otomatisasi Rekapitulasi Kehadiran**: Menghemat waktu rekap bulanan hingga 90% (dari 3–5 hari kerja manual menjadi hitungan menit).
* **Bebas *Human Error***: Perhitungan akumulasi terlambat, izin, dan alfa dieksekusi oleh mesin secara konsisten tanpa risiko kekeliruan pencatatan.
* **Pengelolaan Arsip Digital Rapi**: Pengelolaan dokumen perizinan, cuti, dan riwayat presensi tersimpan secara digital tanpa membutuhkan gudang arsip kertas.

### D. Bagi Guru & Tenaga Kependidikan (Karyawan)
* **Kemudahan Akses Presensi**: Cukup menggunakan *smartphone* pribadi di area sekolah tanpa perlu mengantre di mesin *fingerprint*.
* **Transparansi Catatan Kedisiplinan**: Staf dapat memantau riwayat presensi dan akumulasi kehadiran harian secara mandiri melalui portal.
* **Kenyamanan Layanan Mandiri (*Self-Service*)**: Pengajuan izin, cuti, dan pengecekan jadwal mengajar dapat dilakukan dengan cepat dari layar ponsel.

---

## 7. KESIMPULAN & REKOMENDASI PENGEMBANGAN

### Kesimpulan
**SIP-MU Enterprise** merupakan **ekosistem transformasi digital presensi dan kepegawaian modern** yang dirancang khusus untuk meningkatkan standar tata kelola dan kedisiplinan di **SMK Manbaul Ulum Cirebon**. Dengan memadukan keamanan teknologi *liveness detection*, *GPS geofencing*, serta mesin rekapitulasi otomatis, sistem ini memberikan kepastian akurasi data, efisiensi waktu kerja administratif, serta transparansi yang berkeadilan bagi seluruh civitas sekolah.

### Rencana Tindak Lanjut (Next Steps)
1. **Sosialisasi & Pelatihan Pengguna**: Mengadakan sesi pelatihan singkat bagi seluruh guru dan karyawan untuk pengenalan tata cara presensi berbasis ponsel.
2. **Uji Coba Paralel (*Parallel Run*)**: Menjalankan sistem SIP-MU Enterprise untuk pencatatan presensi harian selama 1 periode bulan sebagai pemantauan kestabilan data.
3. **Penerapan Penuh (*Full Go-Live*)**: Memberlakukan SIP-MU Enterprise sebagai rujukan resmi tunggal pencatatan kehadiran dan kedisiplinan di SMK Manbaul Ulum Cirebon.

---

*Dokumen Executive Summary ini telah diperbarui (v2.2 - Fokus Presensi, Kepegawaian & Kebutuhan Minimal Perangkat) secara resmi untuk dipresentasikan kepada Manajemen, Yayasan, dan Kepala Sekolah SMK Manbaul Ulum Cirebon.*
