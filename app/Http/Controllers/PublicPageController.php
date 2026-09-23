<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PublicPageController extends Controller
{
    private function getArticlesData()
    {
        return [
            [
                'id' => 1,
                'slug' => 'panduan-presensi-geofencing-gps-sekolah-digital',
                'title' => 'Panduan Komprehensif Menerapkan Presensi Geofencing GPS di Sekolah Digital',
                'category' => 'Teknologi Pendidikan',
                'author' => 'Tim Riset SIP MU',
                'date' => '25 Agustus 2026',
                'readTime' => '7 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Sistem absensi berbasis lokasi (Geofencing GPS) telah terbukti meningkatkan akurasi dan kedisiplinan hingga 98% dibandingkan metode konvensional.',
                'content' => '
                    <p>Di era transformasi digital pendidikan modern saat ini, tata kelola kedisiplinan dan sistem absensi guru menjadi salah satu pilar utama efektivitas proses belajar mengajar. Metode absensi manual berbasis kertas atau mesin fingerprint konvensional seringkali menghadapi berbagai kendala operasional yang tidak terhindarkan di lapangan. Masalah seperti antrean panjang di pagi hari yang menyita waktu persiapan mengajar, resiko kerusakan perangkat keras (hardware) akibat faktor cuaca atau debu, hingga celah manipulasi data kehadiran oleh pihak-pihak yang tidak bertanggung jawab, membuat sekolah harus memikirkan ulang strategi kedisiplinan mereka.</p>
                    <p>Memasuki era Industri 4.0, teknologi telah menyediakan solusi yang elegan, praktis, sekaligus sangat aman. Salah satu terobosan paling signifikan dalam bidang ini adalah pemanfaatan teknologi <strong>Geofencing GPS</strong> untuk mencatat titik koordinat kehadiran staf pendidik. Geofencing pada dasarnya adalah pembuatan sebuah batas geografis virtual di sekitar lokasi dunia nyata. Ketika sebuah perangkat cerdas (smartphone) memasuki atau meninggalkan batasan wilayah tersebut, sistem akan memicu sebuah tindakan otomatis, seperti mengizinkan proses check-in atau check-out.</p>
                    <h3>Mengapa Geofencing GPS Menjadi Solusi Terbaik?</h3>
                    <p>Teknologi Geofencing memungkinkan sistem informasi manajemen sekolah untuk membuat batas radius virtual di sekitar titik koordinat geografis nyata dari kampus sekolah. Pada platform <strong>SIP MU Enterprise</strong> di SMK Manbaul Ulum Cirebon, sistem bekerja dengan melakukan validasi dua lapis (two-factor validation) setiap kali guru atau staf melakukan presensi. Saat tombol presensi ditekan, aplikasi tidak hanya memeriksa waktu (timestamp), tetapi juga mencocokkan koordinat GPS presisi dari perangkat pengguna dengan titik koordinat pusat sekolah dan batas radius yang telah ditetapkan.</p>
                    <p>Ada beberapa alasan mendasar mengapa Geofencing mengungguli mesin biometrik konvensional:</p>
                    <ol>
                        <li><strong>Mobilitas Tinggi & Kemudahan Akses:</strong> Staf tidak perlu lagi berkerumun di satu titik mesin fingerprint di lobi utama. Selama mereka sudah berada di area parkir, gerbang, atau ruang guru yang masuk dalam radius Geofence (misalnya 50 meter dari titik pusat), mereka dapat langsung melakukan presensi dengan sekali tap di layar smartphone mereka masing-masing.</li>
                        <li><strong>Akurasi Lokasi dan Anti-Spoofing:</strong> Algoritma modern pada aplikasi presensi yang handal dilengkapi dengan fitur anti-lokasi palsu (anti-mock location/fake GPS). Hal ini memastikan bahwa pengguna benar-benar berada di lokasi fisik sekolah saat melakukan absensi, menutup celah kecurangan yang sering terjadi pada aplikasi absensi standar.</li>
                        <li><strong>Adaptasi Terhadap Tugas Luar:</strong> Seringkali guru ditugaskan untuk mendampingi siswa lomba, melakukan studi banding, atau tugas dinas luar kota. Sistem Geofencing yang fleksibel memungkinkan administrator (seperti Kepala Sekolah atau Kepala Tata Usaha) untuk menyetujui presensi di luar radius utama (Out of Area) dengan mewajibkan staf mengunggah foto selfie atau bukti dokumentasi kegiatan beserta catatan lokasi koordinat tempat tugas mereka berada. Ini memastikan kedisiplinan tetap terjaga tanpa mengorbankan fleksibilitas.</li>
                        <li><strong>Integrasi dengan Kalkulasi Jam Terhitung Mengajar (JTM):</strong> Presensi yang presisi memungkinkan sistem untuk menghitung secara otomatis berapa lama seorang guru berada di lingkungan sekolah. Data ini kemudian diolah oleh sistem penggajian (payroll) untuk menghitung besaran insentif, tunjangan kinerja, hingga potongan keterlambatan secara otomatis, transparan, dan akurat hingga ke hitungan menit.</li>
                    </ol>
                    <h3>Tantangan Implementasi dan Solusinya</h3>
                    <p>Meskipun menjanjikan berbagai kemudahan, implementasi Geofencing bukan tanpa tantangan. Salah satu masalah utama yang sering dikeluhkan adalah akurasi GPS di dalam ruangan tertutup (indoor). Sinyal satelit GPS seringkali melemah atau terblokir ketika pengguna berada di dalam gedung bertingkat atau ruang bawah tanah. Untuk mengatasi hal ini, sistem yang baik biasanya memadukan data GPS dengan jaringan Wi-Fi sekolah (Network-based Positioning) untuk meningkatkan presisi lokasi secara hibrid.</p>
                    <p>Selain itu, edukasi terhadap pengguna juga sangat krusial. Sistem baru seringkali menimbulkan resistensi di awal penerapannya. Oleh karena itu, penting bagi pihak sekolah untuk menyosialisasikan manfaat transparansi yang didapatkan dari sistem digital ini, memastikan bahwa teknologi tidak digunakan untuk sekadar "menghukum", melainkan untuk mendorong budaya kerja yang objektif, profesional, dan berkeadilan. Pada akhirnya, inovasi presensi digital berbasis Geofencing ini bukan hanya tentang memantau keberadaan fisik, tetapi merupakan langkah strategis untuk mewujudkan ekosistem sekolah kejuruan yang modern (Smart Campus 4.0).</p>
                '
            ],
            [
                'id' => 2,
                'slug' => 'efisiensi-manajemen-jam-mengajar-jtm-guru-kejuruan',
                'title' => 'Strategi Optimalisasi dan Efisiensi Manajemen Jam Terhitung Mengajar (JTM) Guru',
                'category' => 'Manajemen Kurikulum',
                'author' => 'Tim Kurikulum',
                'date' => '22 Agustus 2026',
                'readTime' => '6 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Pelajari bagaimana digitalisasi penjadwalan mampu mengurangi beban kerja tim kurikulum dan mencegah terjadinya bentrok jadwal di kelas kejuruan.',
                'content' => '
                    <p>Sekolah Menengah Kejuruan (SMK) memiliki karakteristik dan kompleksitas jadwal mengajar yang jauh lebih tinggi dibandingkan dengan institusi pendidikan menengah umum. Hal ini dikarenakan SMK melibatkan alokasi waktu yang harus diseimbangkan antara teori di ruang kelas reguler, sesi praktik yang intensif di laboratorium kejuruan, serta kegiatan bengkel (workshop) yang seringkali memakan waktu berjam-jam secara berkesinambungan (sistem blok). Mengelola Jam Terhitung Mengajar (JTM) secara manual dalam konteks seperti ini bukan hanya memakan waktu yang sangat lama, tetapi juga sangat rentan terhadap kesalahan manusia (human error), seperti bentrok jadwal antar guru atau pemakaian ruang laboratorium yang tumpang tindih.</p>
                    <h3>Tantangan Penyusunan Jadwal Manual</h3>
                    <p>Sebelum adanya digitalisasi, Wakasek Kurikulum biasanya harus berhadapan dengan papan jadwal berukuran raksasa atau spreadsheet Excel yang membingungkan dengan ratusan sel warna-warni. Setiap awal semester, proses plotting jadwal bisa memakan waktu berminggu-minggu. Jika terjadi perubahan mendadakÂ—misalnya seorang guru mengundurkan diri, cuti melahirkan, atau adanya perubahan struktur kurikulum nasionalÂ—maka seluruh jadwal harus direvisi secara manual, yang seringkali memicu efek domino yang merusak jadwal guru-guru lainnya.</p>
                    <p>Belum lagi terkait aspek keadilan dan pemenuhan beban kerja minimal guru (misalnya standar minimal 24 jam tatap muka per minggu untuk sertifikasi). Kesalahan perhitungan satu jam saja bisa berakibat fatal bagi hak tunjangan sertifikasi seorang pendidik. Di sinilah kehadiran sistem informasi manajemen sekolah yang komprehensif seperti SIP MU Enterprise membuktikan nilai strategisnya.</p>
                    <h3>Otomatisasi Kalkulasi JTM dan Guru Inval</h3>
                    <p>Melalui fitur manajemen penjadwalan cerdas pada SIP MU Enterprise, tim Kurikulum dan Kepala Sekolah dapat memantau ketercapaian jam mengajar setiap guru secara otomatis, akurat, dan real-time. Beberapa fitur unggulan dari digitalisasi JTM meliputi:</p>
                    <ul>
                        <li><strong>Deteksi Bentrok Otomatis (Clash Detection):</strong> Sistem secara algoritmik akan menolak input jadwal jika mendeteksi seorang guru ditugaskan di dua kelas berbeda pada hari dan jam yang sama, atau jika sebuah ruang kelas/laboratorium sudah di-booking untuk kegiatan lain. Hal ini mengeliminasi 100% resiko bentrok jadwal.</li>
                        <li><strong>Rekapitulasi JTM Seketika (Real-time Calculation):</strong> Saat kurikulum menyusun jadwal, sistem akan secara langsung mengakumulasi total JTM harian dan mingguan per individu guru. Dengan demikian, proses pemerataan beban kerja dapat dilakukan secara lebih adil dan transparan tanpa perlu menghitung ulang secara manual di akhir minggu.</li>
                        <li><strong>Manajemen Guru Pengganti (Sistem Inval):</strong> Ketidakhadiran guru karena sakit atau tugas mendadak tidak lagi menjadi mimpi buruk yang menyebabkan kelas kosong tanpa kegiatan belajar mengajar. Sistem dapat dengan cerdas merekomendasikan daftar guru piket atau guru mata pelajaran serumpun yang sedang tidak memiliki jadwal mengajar pada slot waktu tersebut, lalu mengirimkan notifikasi penugasan pengganti (inval) langsung ke smartphone guru yang bersangkutan.</li>
                        <li><strong>Integrasi dengan Jurnal Mengajar Harian:</strong> Jadwal yang telah ditetapkan secara digital akan langsung terhubung dengan dashboard guru masing-masing. Ketika jam mengajar tiba, guru wajib mengisi jurnal kegiatan belajar mengajar beserta daftar absensi siswa di kelas tersebut. Data ini kemudian akan diverifikasi oleh sistem sebagai bukti fisik pelaksanaan tugas untuk pembayaran honorarium (Payroll).</li>
                    </ul>
                    <h3>Dampak Terhadap Kualitas Pendidikan</h3>
                    <p>Dengan memangkas waktu administratif yang terbuang untuk mengurus kerumitan jadwal, tim Kurikulum dapat mengalihkan fokus dan energi mereka kepada tugas-tugas yang jauh lebih esensial: meningkatkan kualitas pedagogik, mengembangkan silabus kejuruan yang selaras dengan kebutuhan industri (link and match), serta mengevaluasi metode pengajaran. Efisiensi administratif bukan sekadar soal menghemat kertas atau mengurangi jam kerja lembur; ia adalah kunci untuk menciptakan ekosistem pendidikan yang lebih fokus pada output akademis dan kesiapan karir para siswa di dunia kerja.</p>
                '
            ],
            [
                'id' => 3,
                'slug' => 'integrasi-pwa-dan-aplikasi-mobile-presensi-sekolah',
                'title' => 'Mengapa Progressive Web App (PWA) Adalah Masa Depan Aplikasi Sekolah',
                'category' => 'Inovasi Digital',
                'author' => 'Tim Pengembang IT',
                'date' => '20 Agustus 2026',
                'readTime' => '5 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Ketahui mengapa pendekatan PWA lebih efisien dan hemat biaya dibandingkan mengembangkan aplikasi Android/iOS native secara terpisah untuk sistem sekolah.',
                'content' => '
                    <p>Kemudahan akses dan ketersediaan aplikasi di berbagai jenis perangkat (device) merupakan kunci utama keberhasilan adopsi sistem digital di lingkungan institusi pendidikan. Mengembangkan aplikasi Android (APK) dan iOS secara native terpisah seringkali membutuhkan biaya pengembangan yang sangat tinggi, waktu pengerjaan yang lama, serta kerumitan dalam proses pembaruan (update) di masa mendatang. Penggunaan arsitektur <strong>Progressive Web App (PWA)</strong> muncul sebagai solusi jitu yang memungkinkan SIP MU Enterprise bekerja secara optimal baik di peramban (browser) komputer desktop maupun dipasang langsung seperti aplikasi asli di layar utama smartphone.</p>
                    <h3>Apa Itu PWA dan Mengapa Ini Penting?</h3>
                    <p>PWA pada dasarnya adalah aplikasi berbasis web (website) yang dikembangkan menggunakan teknologi web modern terkini untuk memberikan pengalaman pengguna (User Experience/UX) yang menyerupai aplikasi mobile native. PWA memanfaatkan fitur-fitur mutakhir seperti Service Workers, Web App Manifests, dan HTTPS untuk menghadirkan performa cepat, kemampuan offline, dan integrasi yang mulus dengan sistem operasi ponsel cerdas. Ketika seorang guru membuka portal SIP MU dari browser ponsel mereka, sistem akan menawarkan opsi "Tambahkan ke Layar Utama" (Add to Home Screen), menciptakan ikon aplikasi mandiri tanpa perlu repot mengunduhnya melalui Google Play Store atau Apple App Store.</p>
                    <h3>Keunggulan PWA untuk Lingkungan Sekolah Modern:</h3>
                    <ol>
                        <li><strong>Instalasi Instan & Bebas Ruang Penyimpanan:</strong> Aplikasi PWA sangat ringan (seringkali ukurannya hanya di bawah 1 MB) dibandingkan dengan aplikasi native yang bisa mencapai puluhan bahkan ratusan MB. Ini sangat membantu bagi guru atau staf yang mungkin memiliki kapasitas penyimpanan terbatas pada perangkat smartphone lama mereka.</li>
                        <li><strong>Dukungan Lintas Platform (Cross-Platform Compatibility):</strong> Kode sumber (source code) yang sama dapat berjalan sempurna di laptop Windows, MacBook, tablet iPad, hingga smartphone Android tanpa memerlukan penyesuaian khusus. Hal ini memastikan seluruh civitas akademika dapat mengakses sistem tanpa batasan jenis gadget yang mereka miliki.</li>
                        <li><strong>Dukungan Mode Luring (Offline Support):</strong> Salah satu keajaiban terbesar teknologi PWA adalah penggunaan <em>Service Workers</em>. Teknologi ini bertindak sebagai proxy jaringan yang mampu melakukan proses *caching* atau penyimpanan data sementara secara agresif. Hasilnya, guru tetap dapat mengakses jadwal mengajar mereka atau mengisi rekapitulasi nilai bahkan ketika koneksi internet sedang terputus (offline) atau tidak stabil. Data akan disinkronisasikan kembali secara otomatis begitu perangkat mendapatkan sinyal internet yang memadai.</li>
                        <li><strong>Pembaruan Otomatis Tanpa Ribet (Seamless Updates):</strong> Tidak ada lagi notifikasi "Harap perbarui aplikasi Anda di Play Store". Setiap kali tim pengembang merilis fitur baru atau perbaikan celah keamanan (bug fixes), PWA akan memperbarui dirinya sendiri secara transparan di latar belakang (background) saat pengguna merefresh halaman aplikasi. Pengguna akan selalu mendapatkan versi terbaru secara seketika.</li>
                    </ol>
                    <h3>Pengalaman Pengguna (UX) Premium</h3>
                    <p>Selain aspek teknis, pendekatan PWA memungkinkan desainer untuk merancang antarmuka (UI) yang memprioritaskan perangkat seluler (Mobile-First Design). Interaksi sentuhan, navigasi geser (swipe), dan transisi halaman yang cepat tanpa proses *loading* halaman penuh membuat penggunaan aplikasi sehari-hari, seperti persetujuan cuti oleh Kepala Sekolah atau pengisian jurnal oleh guru, terasa mulus bagaikan membalikkan telapak tangan. Keputusan SMK Manbaul Ulum untuk mengadopsi fondasi PWA membuktikan komitmen institusi terhadap pemanfaatan teknologi yang bukan sekadar gaya-gayaan, melainkan tepat guna, efisien, dan berkelanjutan untuk jangka panjang.</p>
                '
            ],
            [
                'id' => 4,
                'slug' => 'otomatisasi-penggajian-dan-tunjangan-kinerja-guru',
                'title' => 'Transparansi dan Akurasi Tinggi: Otomatisasi Modul Penggajian Guru Berbasis Presensi',
                'category' => 'Keuangan & SDM',
                'author' => 'Bagian Keuangan & HRD',
                'date' => '15 Agustus 2026',
                'readTime' => '6 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Meningkatkan akurasi penghitungan tunjangan dan potongan keterlambatan untuk membangun budaya kerja pendidik yang objektif dan berkeadilan.',
                'content' => '
                    <p>Di banyak sekolah swasta dan institusi pendidikan kejuruan, proses rekapitulasi penggajian (payroll) bulanan bagi guru dan staf tenaga kependidikan acapkali dipenuhi oleh birokrasi perhitungan yang menguras tenaga dan pikiran staf keuangan (HR/Finance). Sebuah siklus penggajian bulanan sering kali melibatkan variabel perhitungan yang sangat kompleks, yang harus dikalkulasikan secara manual dari ratusan lembar rekap absen, surat izin yang tercecer, hingga catatan manual jam lembur (overtime).</p>
                    <p>Proses konvensional ini, selain lambat dan memakan waktu berhari-hari, juga sangat berisiko terhadap ketidakakuratan data (human error). Perhitungan akumulasi Jam Terhitung Mengajar (JTM), besaran tunjangan jabatan, insentif wali kelas, honorarium kegiatan ekstrakurikuler, serta penalti atau potongan akibat keterlambatan, pulang lebih awal, atau ketidakhadiran tanpa keterangan (alpa), menjadi rutinitas bulanan yang melelahkan. Apabila terjadi kesalahan perhitungan, hal ini tidak hanya merugikan finansial sekolah, tetapi juga dapat menurunkan moral, motivasi mengajar, dan tingkat kepercayaan para guru terhadap manajemen institusi.</p>
                    <h3>Mengatasi Masalah dengan Pendekatan Digital Sistematis</h3>
                    <p>Di sinilah keunggulan dari sistem yang terintegrasi penuh (Integrated ERP System) seperti SIP MU Enterprise menonjol. Dengan mengikat data presensi langsung dari modul absensi GPS dan modul akademik (Jurnal Mengajar) ke dalam satu modul kalkulasi finansial (Payroll Engine), proses rekapitulasi yang awalnya butuh waktu seminggu kini dapat diselesaikan hanya dalam beberapa menit saja melalui satu kali klik (One-Click Generate).</p>
                    <p>Mari kita telaah beberapa manfaat operasional yang krusial dari integrasi tingkat lanjut ini:</p>
                    <ul>
                        <li><strong>Akurasi Hingga Hitungan Menit:</strong> Sistem tidak lagi menghitung keterlambatan secara kasaran (pembulatan per hari). Algoritma komputer akan menghitung persis akumulasi selisih waktu keterlambatan seorang guru selama satu bulan berdasarkan toleransi masuk (misalnya 15 menit). Potongan indisipliner (jika diberlakukan) kemudian dikonversi secara otomatis dan transparan ke dalam komponen slip gaji, menghilangkan perdebatan dan keraguan antara staf dengan bagian keuangan.</li>
                        <li><strong>Dinamika Variabel Tunjangan:</strong> Sistem dapat dengan cerdas mengidentifikasi jenis-jenis penugasan tambahan yang dilakukan oleh guru pada bulan berjalan. Misalnya, jika seorang guru ditugaskan menjadi panitia pengawas ujian semester atau menjadi pembina pramuka mingguan, honorarium tambahan (inval atau insentif khusus) akan secara dinamis ditambahkan ke keranjang komponen pendapatan (Earnings) mereka tanpa perlu proses input manual ganda.</li>
                        <li><strong>Slip Gaji Digital (E-Payslip):</strong> Pada era modern, pembagian slip gaji berbentuk secarik kertas dalam amplop cokelat sudah tidak lagi relevan dan sangat tidak ramah lingkungan (boros kertas). SIP MU Enterprise secara otomatis menerbitkan dokumen Slip Gaji Digital dalam format PDF terenkripsi yang dapat diakses langsung, kapanpun dan dimanapun, melalui dashboard portal individu setiap guru. Akses ini tentunya dilindungi oleh kata sandi (password) dan otentikasi ketat untuk menjamin kerahasiaan nominal finansial (Privacy Protection).</li>
                        <li><strong>Buku Besar dan Laporan Yayasan:</strong> Bagi pihak manajemen tingkat atas, seperti Kepala Sekolah dan Ketua Yayasan Pendidikan, sistem akan memproduksi laporan arus kas pengeluaran operasional SDM bulanan dalam format rekapitulasi (dashboard analytics) yang visual dan mudah dibaca. Data ini sangat berharga untuk pengambilan keputusan taktis ke depannya, seperti proyeksi kenaikan kesejahteraan guru atau perencanaan alokasi dana Bantuan Operasional Sekolah (BOS) terkait pembayaran honor.</li>
                    </ul>
                    <h3>Membangun Keadilan Organisasi yang Transparan</h3>
                    <p>Pada akhirnya, tujuan sejati dari otomatisasi dan digitalisasi finansial ini bukan sekadar untuk menghemat waktu kerja tata usaha, tetapi untuk menegakkan pilar "Keadilan Organisasi" (Organizational Justice) di dalam institusi pendidikan. Ketika guru menyadari bahwa sistem mencatat kedisiplinan dan kontribusi mereka secara obyektif, netral, dan 100% tanpa campur tangan sentimen pribadi (like/dislike) dari pihak manajemen, maka motivasi intrinsik dan profesionalitas mereka untuk hadir dan memberikan yang terbaik bagi para siswa niscaya akan mengalami peningkatan yang signifikan.</p>
                '
            ]
,
            [
                'id' => 5,
                'slug' => 'masa-depan-pendidikan-kejuruan-ai-di-ruang-kelas',
                'title' => 'Masa Depan Pendidikan Kejuruan: Integrasi Kecerdasan Buatan (AI) di Ruang Kelas',
                'category' => 'Teknologi Pendidikan',
                'author' => 'Tim Kurikulum Digital',
                'date' => '10 Agustus 2026',
                'readTime' => '8 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Bagaimana pemanfaatan Kecerdasan Buatan (AI) membantu guru SMK mempersonalisasi pembelajaran dan mengevaluasi minat bakat siswa secara akurat.',
                'content' => '
                    <p>Integrasi Kecerdasan Buatan (Artificial Intelligence/AI) di dalam ruang kelas bukan lagi sekadar wacana futuristik, melainkan realitas yang sedang bertransformasi secara masif, terutama di lingkungan Sekolah Menengah Kejuruan (SMK). SMK, yang secara inheren dirancang untuk mempersiapkan tenaga kerja terampil dan siap pakai, kini memiliki kesempatan emas untuk memanfaatkan AI guna mengakselerasi transfer keterampilan teknis.</p>
                    <h3>Personalisasi Pembelajaran yang Ekstrem</h3>
                    <p>Salah satu hambatan terbesar dalam sistem pendidikan klasikal adalah pendekatan "satu ukuran untuk semua" (one size fits all). Kenyataannya, setiap siswa memiliki kecepatan kognitif dan gaya belajar yang unik. Ada siswa yang lebih cepat menyerap materi melalui simulasi visual 3D, sementara yang lain membutuhkan pendekatan teks atau auditori.</p>
                    <p>Melalui platform pendidikan cerdas, AI bertindak sebagai asisten tutor pribadi. Sistem AI dapat menganalisis data riwayat nilai, waktu pengerjaan tugas, hingga kelemahan spesifik setiap siswa secara real-time. Jika seorang siswa di jurusan Teknik Komputer Jaringan (TKJ) terus-menerus melakukan kesalahan pada konsep Subnetting, algoritma AI secara otomatis akan merekomendasikan lebih banyak latihan soal, modul interaktif, atau video tutorial khusus mengenai Subnetting kepada siswa tersebut, tanpa perlu menunggu intervensi manual dari guru.</p>
                    <h3>Meringankan Beban Administratif Guru</h3>
                    <p>Waktu yang dihabiskan seorang guru untuk mengoreksi ratusan lembar ujian pilihan ganda atau esai pendek sangatlah besar. Kehadiran AI, seperti teknologi <em>Optical Character Recognition (OCR)</em> canggih dan <em>Natural Language Processing (NLP)</em>, mampu mengambil alih fungsi penilaian dasar ini dengan akurasi yang nyaris sempurna.</p>
                    <p>Dengan berkurangnya beban koreksi dan administrasi (seperti pengisian rekap nilai harian), peran esensial guru perlahan bergeser dari sekadar "penyampai informasi" menjadi seorang "mentor dan fasilitator". Guru memiliki lebih banyak waktu untuk berinteraksi langsung secara empati dengan siswa yang tertinggal, merancang proyek kolaboratif, serta menanamkan nilai-nilai <em>soft skill</em> (seperti etika kerja, kepemimpinan, dan komunikasi) yang mutlak dibutuhkan di dunia industri, namun tidak bisa diajarkan oleh mesin.</p>
                    <h3>Masa Depan Penilaian Berbasis Prediksi</h3>
                    <p>AI tidak hanya bereaksi terhadap masa lalu, tetapi mampu memprediksi masa depan (Predictive Analytics). Dengan mengolah jutaan titik data (Data Points) dari pola kehadiran siswa di <strong>SIP MU Enterprise</strong> dan pola nilai akademisnya, sistem AI dapat memberikan "Peringatan Dini" (Early Warning System) kepada wali kelas atau Bimbingan Konseling (BK) jauh sebelum seorang siswa benar-benar putus sekolah atau gagal ujian. Kolaborasi harmonis antara kepekaan manusia (guru) dan presisi mesin (AI) inilah yang akan menjadi fondasi utama SMK Manbaul Ulum dalam mencetak lulusan unggul di era Society 5.0.</p>
                '
            ],
            [
                'id' => 6,
                'slug' => 'keamanan-siber-data-induk-sekolah',
                'title' => 'Keamanan Siber (Cybersecurity) dalam Pengelolaan Data Induk Sistem Informasi Sekolah',
                'category' => 'Inovasi Digital',
                'author' => 'Tim Pengembang IT',
                'date' => '05 Agustus 2026',
                'readTime' => '6 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Menjaga privasi data rapor, riwayat presensi, dan informasi vital staf menggunakan protokol keamanan enkripsi tingkat perbankan.',
                'content' => '
                    <p>Dalam proses transformasi menuju sekolah cerdas (Smart School), salah satu aspek yang paling krusial namun seringkali diremehkan adalah Keamanan Siber (Cybersecurity). Ketika semua catatan dari buku besar fisik—seperti data nilai ujian, riwayat presensi harian staf, catatan kedisiplinan, hingga informasi profil lengkap ribuan siswa dan orang tua—dipindahkan ke dalam basis data digital terpusat, maka basis data tersebut secara otomatis menjadi sasaran empuk bagi ancaman peretasan dan kebocoran data.</p>
                    <h3>Ancaman Nyata di Era Keterbukaan</h3>
                    <p>Ancaman keamanan data sekolah bukan sekadar serangan dari *hacker* eksternal yang mencari keuntungan finansial melalui modus *Ransomware* (penyanderaan data). Seringkali, ancaman justru berasal dari celah internal atau kecerobohan pengguna, seperti menggunakan kata sandi (password) yang terlalu mudah ditebak ("123456"), meninggalkan perangkat tanpa dikunci (log out), atau menjadi korban manipulasi psikologis (Phishing).</p>
                    <p>Kebocoran informasi pribadi seperti nomor induk, alamat rumah, nomor telepon orang tua, atau slip gaji bulanan para guru, bukan hanya dapat merusak reputasi institusi pendidikan, namun juga melanggar Undang-Undang Perlindungan Data Pribadi (UU PDP) yang mengancam denda hukum secara signifikan.</p>
                    <h3>Pertahanan Berlapis di SIP MU Enterprise</h3>
                    <p>Untuk memitigasi segala resiko tersebut, infrastruktur <strong>SIP MU Enterprise</strong> dirancang menggunakan filosofi keamanan berlapis (Defense in Depth). Pertama, seluruh transmisi komunikasi data antara peramban (browser) pengguna dengan server sekolah dilindungi oleh protokol enkripsi SSL/TLS 256-bit kelas perbankan. Ini memastikan bahwa meskipun seseorang berhasil "menguping" jaringan Wi-Fi lokal, mereka hanya akan melihat barisan teks acak yang tidak bermakna (Ciphertext).</p>
                    <p>Kedua, manajemen kata sandi tidak pernah disimpan dalam bentuk teks polos (Plain text). Sistem menggunakan algoritma <em>Bcrypt Hashing</em>, sehingga bahkan administrator server (Super Admin) sekali pun tidak dapat mengetahui apa password asli milik seorang pengguna biasa.</p>
                    <p>Terakhir, untuk modul-modul krusial seperti penggajian (Payroll) dan modifikasi nilai rapor akademik akhir semester, sistem mengharuskan adanya otorisasi ganda serta menyimpan catatan rekam jejak (Audit Trail) secara mendetail. Setiap kali seorang pengguna mengubah sebuah nilai atau data, sistem mencatat <em>Siapa</em> yang mengubahnya, <em>Kapan</em>, dari <em>Perangkat</em> apa (Alamat IP), dan data apa saja yang diganti. Keterbukaan dan ketegasan sistem keamanan ini menjamin bahwa seluruh arsip dan privasi institusi di SMK Manbaul Ulum tetap terjaga tanpa kompromi.</p>
                '
            ],
            [
                'id' => 7,
                'slug' => 'mewujudkan-link-and-match-lewat-kurikulum-digital',
                'title' => 'Mewujudkan Link and Match Industri Lewat Kurikulum Digital Terintegrasi',
                'category' => 'Manajemen Kurikulum',
                'author' => 'Bagian Hubin & Prakerin',
                'date' => '02 Agustus 2026',
                'readTime' => '7 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Langkah konkret merevolusi program Praktek Kerja Industri (Prakerin) dan sinkronisasi kompetensi dengan kebutuhan pasar tenaga kerja.',
                'content' => '
                    <p>Istilah "Link and Match" (Keterkaitan dan Kesepadanan) sudah lama digaungkan sebagai solusi utama untuk mengatasi tingginya angka pengangguran di kalangan lulusan Sekolah Menengah Kejuruan (SMK). Filosofinya sangat sederhana: Apa yang diajarkan oleh sekolah di laboratorium dan ruang bengkel haruslah selaras 100% dengan keterampilan (Skillset) spesifik yang sedang dicari oleh Dunia Usaha dan Dunia Industri (DUDI).</p>
                    <p>Namun, dalam praktiknya, mewujudkan penyelarasan ini merupakan tantangan yang sangat kompleks. Perubahan tren teknologi industri bergerak dengan kecepatan eksponensial (hitungan bulan), sementara birokrasi perubahan silabus kurikulum konvensional memakan waktu bertahun-tahun. Akibatnya, kurikulum sekolah kejuruan seringkali beresiko menjadi kadaluarsa.</p>
                    <h3>Menjembatani Kesenjangan dengan Ekosistem Digital</h3>
                    <p>Platform tata kelola digital (ERP) memegang peranan vital dalam mempersempit jurang komunikasi ini. Dengan modul Hubungan Industri (Hubin), sekolah tidak lagi memantau program Praktek Kerja Industri (Prakerin/PKL) melalui buku laporan fisik (jurnal) yang mudah hilang atau dipalsukan. Sebagai gantinya, siswa yang sedang magang dapat mengunggah dokumentasi harian pekerjaan lapangan mereka, seperti foto perbaikan mesin, ke dalam aplikasi portal siswa. Sistem ini dapat diakses secara *real-time* oleh guru pembimbing di sekolah, memungkinkan pemberian umpan balik langsung meski terpisah jarak.</p>
                    <p>Lebih dari itu, platform dapat memberikan akses terbatas (Guest Access) bagi instruktur dari pihak industri mitra (Perusahaan) untuk memberikan penilaian performa kompetensi siswa secara digital (e-Appraisal). Data kuantitatif dari penilaian ini akan otomatis terintegrasi masuk ke dalam database Pusat Kurikulum sekolah.</p>
                    <h3>Iterasi Kurikulum Berbasis Data Lapangan</h3>
                    <p>Jika tren penilaian dari berbagai instruktur industri menunjukkan bahwa angkatan tahun ini unggul dalam perbaikan perangkat keras keras (Hardware), namun lemah secara umum dalam aspek pemahaman Jaringan Cloud, maka Wakasek Kurikulum mendapatkan *insight* data statistik yang faktual. Dari analisis tersebut, sekolah dapat langsung menyesuaikan Jam Terhitung Mengajar (JTM) atau mengadakan ekstrakurikuler intensif mengenai Cloud Computing untuk angkatan berikutnya.</p>
                    <p>Pendekatan iteratif yang berfokus pada data (Data-Driven Decision Making) inilah yang membedakan manajemen SMK modern dari yang lain. Tidak ada lagi pengambilan keputusan kurikulum berdasarkan "perkiraan", semuanya bermuara pada realitas angka dari industri. Harmonisasi ini memantapkan visi SMK Manbaul Ulum sebagai institusi pendidik vokasi yang adaptif, gesit, dan mencetak individu-individu siap kerja kelas dunia.</p>
                '
            ],
            [
                'id' => 8,
                'slug' => 'transformasi-rapor-digital-pemantauan-orang-tua',
                'title' => 'Transformasi Rapor Digital: Transparansi Pemantauan Akademik oleh Orang Tua Wali',
                'category' => 'Keuangan & SDM',
                'author' => 'Tim Konseling & Wali Kelas',
                'date' => '28 Juli 2026',
                'readTime' => '5 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1571260899304-4250628120c1?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Memudahkan komunikasi segitiga antara Siswa, Sekolah, dan Orang Tua untuk memantau nilai dan kedisiplinan (absensi) anak.',
                'content' => '
                    <p>Pendidikan merupakan tanggung jawab bersama (kolaboratif) antara institusi sekolah dan lingkungan keluarga. Kendala klasik yang sering terjadi adalah fenomena "putusnya komunikasi" antara wali kelas dengan orang tua murid. Tradisi pengambilan Rapor Akademik yang hanya dilakukan satu atau dua kali dalam setahun (pada akhir semester) seringkali dirasa terlalu terlambat bagi orang tua untuk mengintervensi atau memberikan bimbingan kepada anak mereka yang mengalami penurunan prestasi.</p>
                    <h3>Menghadirkan Pemantauan ke Dalam Genggaman</h3>
                    <p>Platform sekolah digital berbasis <strong>Progressive Web App (PWA)</strong>, seperti ekosistem pada SIP MU Enterprise, memungkinkan pembukaan keran komunikasi yang transparan 24/7. Orang tua kini dibekali dengan kredensial akses khusus untuk masuk ke dalam Portal Wali Murid. Dari layar *smartphone* mereka, orang tua tidak hanya dapat melihat rekapitulasi nilai Ujian Tengah Semester (UTS), namun juga rincian nilai tugas harian, jadwal pelajaran harian siswa, hingga riwayat absensi (kehadiran, sakit, izin, atau bolos) pada setiap sesi mata pelajaran.</p>
                    <p>Fitur notifikasi instan memegang peranan krusial. Sistem dapat dikonfigurasikan untuk mengirimkan pesan WhatsApp atau peringatan langsung (Push Notification) jika seorang siswa tidak masuk kelas tanpa keterangan, atau jika nilainya berada di bawah Kriteria Ketuntasan Minimal (KKM). Keterbukaan sistem ini secara psikologis akan mendorong siswa untuk menjadi lebih disiplin dan bertanggung jawab terhadap rutinitas belajarnya sendiri.</p>
                    <h3>Menghilangkan Hambatan Birokrasi Administratif</h3>
                    <p>Bagi staf guru dan wali kelas, penerapan Rapor Digital (E-Rapor) merupakan penemuan yang revolusioner. Mereka tidak perlu lagi menghabiskan waktu berhari-hari mengkalkulasi bobot nilai UTS, UAS, dan tugas harian secara manual menggunakan kalkulator atau Microsoft Excel yang rawan kesalahan rumus. Begitu seluruh nilai individu dimasukkan ke dalam Jurnal Mengajar digital, sistem akan otomatis mengakumulasikannya, menghitung nilai rata-rata kelas, peringkat paralel, dan mencetak dokumen Rapor berformat PDF standar dalam hitungan detik.</p>
                    <p>Kemudahan ini membuka jalan baru untuk membangun komunitas pendidikan (Educational Community) yang sehat. Transparansi melahirkan kepercayaan (Trust). Ketika orang tua merasa dilibatkan secara proaktif dalam setiap fase tumbuh kembang akademis putra-putri mereka, tingkat kepuasan layanan sekolah (Satisfaction Rate) akan meningkat secara signifikan, membuktikan bahwa digitalisasi bukan semata-mata soal kecanggihan teknologi, melainkan soal meningkatkan kualitas kepedulian terhadap kemajuan tiap insan pelajar.</p>
                '
            ]

        ];
    }

    public function privacyPolicy(Request $request)
    {
        return Inertia::render('Public/PrivacyPolicy', [
            'auth' => ['user' => $request->user()],
            'meta' => [
                'title' => 'Privacy Policy - SIP MU Enterprise',
                'description' => 'Kebijakan privasi dan perlindungan data pengguna sistem informasi sekolah SIP MU Enterprise.',
            ]
        ]);
    }

    public function termsOfService(Request $request)
    {
        return Inertia::render('Public/TermsOfService', [
            'auth' => ['user' => $request->user()],
            'meta' => [
                'title' => 'Terms of Service - SIP MU Enterprise',
                'description' => 'Syarat dan ketentuan layanan penggunaan sistem aplikasi SIP MU Enterprise.',
            ]
        ]);
    }

    public function aboutUs(Request $request)
    {
        return Inertia::render('Public/AboutUs', [
            'auth' => ['user' => $request->user()],
            'meta' => [
                'title' => 'Tentang Kami - SIP MU Enterprise',
                'description' => 'Mengenal lebih dekat visi dan misi pengembangan aplikasi SIP MU Enterprise untuk digitalisasi sekolah.',
            ]
        ]);
    }

    public function contactUs(Request $request)
    {
        return Inertia::render('Public/ContactUs', [
            'auth' => ['user' => $request->user()],
            'meta' => [
                'title' => 'Hubungi Kami - SIP MU Enterprise',
                'description' => 'Kontak tim dukungan teknis dan layanan bantuan SIP MU Enterprise.',
            ]
        ]);
    }

    public function blogIndex(Request $request)
    {
        $articles = $this->getArticlesData();
        return Inertia::render('Public/BlogIndex', [
            'articles' => $articles,
            'auth' => ['user' => $request->user()],
            'meta' => [
                'title' => 'Artikel & Berita - SIP MU Enterprise',
                'description' => 'Kumpulan artikel informatif dan berita terbaru seputar teknologi pendidikan dan manajemen sekolah digital.',
            ]
        ]);
    }

    public function blogDetail(Request $request, $slug)
    {
        $articles = collect($this->getArticlesData());
        $article = $articles->firstWhere('slug', $slug);

        if (!$article) {
            abort(404);
        }

        $related = $articles->filter(function($item) use ($slug) {
            return $item['slug'] !== $slug;
        })->take(2)->values()->all();

        return Inertia::render('Public/BlogDetail', [
            'article' => $article,
            'relatedArticles' => $related,
            'auth' => ['user' => $request->user()],
            'meta' => [
                'title' => $article['title'] . ' - SIP MU',
                'description' => $article['summary'],
                'image' => $article['image'],
                'type' => 'article'
            ]
        ]);
    }
}
