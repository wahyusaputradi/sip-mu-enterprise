<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    /**
     * Data artikel edukasi publik berkategori High-Value Content
     */
    private function getArticlesData()
    {
        return [
            [
                'id' => 1,
                'slug' => 'panduan-presensi-geofencing-gps-sekolah-digital',
                'title' => 'Panduan Sistem Presensi Berbasis Geofencing GPS untuk Sekolah Digital Modern',
                'category' => 'Teknologi Sekolah',
                'author' => 'Tim Humas & IT SMK MU',
                'date' => '18 Agustus 2026',
                'readTime' => '5 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Implementasi teknologi Geofencing GPS pada presensi harian guru dan staf terbukti dapat meminimalisir kecurangan kecurangan titip absen serta meningkatkan kedisiplinan hingga 99.8%.',
                'content' => '
                    <p>Di era transformasi digital pendidikan modern saat ini, tata kelola kedisiplinan dan sistem absensi guru menjadi salah satu pilar utama efektivitas proses belajar mengajar. Metode absensi manual berbasis kertas atau mesin fingerprint konvensional seringkali menghadapi berbagai kendala seperti antrean panjang di pagi hari, resiko kerusakan perangkat hardware, hingga celah manipulasi data.</p>
                    
                    <h3>Mengapa Geofencing GPS Menjadi Solusi Terbaik?</h3>
                    <p>Teknologi <strong>Geofencing</strong> memungkinkan sistem untuk membuat batas virtual di sekitar titik koordinat geografis nyata dari kampus sekolah. Pada platform <strong>SIP MU Enterprise</strong> di SMK Manbaul Ulum Cirebon, koordinat GPS smartphone pegawai akan divalidasi secara real-time saat tombol presensi ditekan.</p>
                    
                    <ul>
                        <li><strong>Akurasi Radius Tinggi:</strong> Memastikan presensi hanya dapat dilakukan dalam batas area Kampus 1 maupun Kampus 2.</li>
                        <li><strong>Verifikasi Swafoto (Selfie):</strong> Dilengkapi pencocokan foto selfie langsung dari kamera smartphone tanpa perantara galeri.</li>
                        <li><strong>Transparansi Jam Masuk:</strong> Sistem mencatat timestamp detik dan menit kehadiran secara presisi.</li>
                    </ul>

                    <h3>Kesimpulan</h3>
                    <p>Dengan mengadopsi sistem presensi digital berbasis Geofencing GPS, sekolah tidak hanya menghemat biaya perawatan infrastruktur fisik, tetapi juga membangun budaya kedisiplinan yang transparan dan akuntabel di kalangan seluruh tenaga pendidik dan kependidikan.</p>
                '
            ],
            [
                'id' => 2,
                'slug' => 'efisiensi-manajemen-jam-mengajar-jtm-guru-kejuruan',
                'title' => 'Strategi Efisiensi Manajemen Jam Terhitung Mengajar (JTM) di SMK Kejuruan',
                'category' => 'Manajemen Kurikulum',
                'author' => 'Tim Kurikulum SMK MU',
                'date' => '15 Agustus 2026',
                'readTime' => '6 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Kalkulasi otomatis Jam Terhitung Mengajar (JTM) dan integrasi jadwal guru inval membantu menjamin kelangsungan KBM kelas kejuruan tetap berjalan 100% efektif.',
                'content' => '
                    <p>Sekolah Menengah Kejuruan (SMK) memiliki kompleksitas jadwal mengajar yang tinggi karena melibatkan alokasi waktu praktik laboratorium, bengkel kejuruan, dan teori kelas. Pengelolaan Jam Terhitung Mengajar (JTM) secara manual seringkali memakan waktu lama saat penyusunan rekapitulasi bulanan.</p>

                    <h3>Otomatisasi Kalkulasi JTM dan Guru Inval</h3>
                    <p>Melalui fitur manajemen jadwal pada SIP MU Enterprise, tim Kurikulum dan Kepala Sekolah dapat memantau ketercapaian jam mengajar setiap guru secara otomatis:</p>
                    <ul>
                        <li>Pencatatan presensi masuk per jam pelajaran (JP).</li>
                        <li>Alur pengajuan dan persetujuan <em>Guru Inval (Jam Ganti)</em> saat ada guru yang berhalangan hadir karena dinas luar atau sakit.</li>
                        <li>Export laporan rekapitulasi bulanan ke format Excel & PDF siap cetak.</li>
                    </ul>
                '
            ],
            [
                'id' => 3,
                'slug' => 'integrasi-pwa-dan-aplikasi-mobile-presensi-sekolah',
                'title' => 'Pemanfaatan PWA (Progressive Web Apps) untuk Aplikasi Presensi Sekolah Tanpa PlayStore',
                'category' => 'Teknologi Informasi',
                'author' => 'Tim Pengembang IT',
                'date' => '10 Agustus 2026',
                'readTime' => '4 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Arsitektur Progressive Web Apps (PWA) memungkinkan aplikasi dapat diinstall langsung di Android dan iOS secara instan tanpa perlu unduhan file APK yang rumit.',
                'content' => '
                    <p>Kemudahan akses perangkat merupakan kunci utama keberhasilan adopsi sistem aplikasi di lingkungan sekolah. Penggunaan arsitektur <strong>Progressive Web App (PWA)</strong> memungkinkan SIP MU Enterprise bekerja secara optimal baik di browser komputer desktop maupun dipasang langsung di layar utama smartphone.</p>

                    <h3>Keunggulan PWA untuk Lingkungan Sekolah:</h3>
                    <ul>
                        <li><strong>Instalasi Instan:</strong> Pengguna dapat menambahkan aplikasi ke layar utama (Add to Home Screen) dalam hitungan detik.</li>
                        <li><strong>Performa Ringan & Cepat:</strong> Ukuran penyimpanan sangat hemat dibandingkan aplikasi native konvensional.</li>
                        <li><strong>Multi-Platform:</strong> Mendukung operating system Android, iOS, Windows, dan macOS tanpa kendala kompatibilitas.</li>
                    </ul>
                '
            ],
            [
                'id' => 4,
                'slug' => 'keamanan-data-dan-privasi-sistem-informasi-sekolah',
                'title' => 'Keamanan Data dan Perlindungan Privasi pada Sistem Informasi Kepegawaian Sekolah',
                'category' => 'Keamanan Siber & Privasi',
                'author' => 'Tim Keamanan Sistem SIP MU',
                'date' => '25 Agustus 2026',
                'readTime' => '6 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Perlindungan data pribadi tenaga pendidik dan enkripsi titik lokasi GPS menjadi standar keamanan utama dalam implementasi platform SIP MU Enterprise.',
                'content' => '
                    <p>Integrasi teknologi dalam manajemen sekolah membawa konsekuensi penting terhadap perlindungan data sensitif pegawai. Data presensi, informasi identitas, lokasi GPS, hingga rekapitulasi gaji memerlukan standar perlindungan tingkat tinggi agar terhindar dari potensi kebocoran data.</p>
                    
                    <h3>Arsitektur Keamanan SIP MU Enterprise:</h3>
                    <p>Dalam platform SIP MU Enterprise, perlindungan privasi diterapkan secara ketat dari sisi infrastruktur hingga aplikasi:</p>
                    <ul>
                        <li><strong>Enkripsi SSL/TLS 256-bit:</strong> Seluruh transmisi data dari smartphone pengguna ke server terenkripsi penuh.</li>
                        <li><strong>Privasi Geofencing GPS:</strong> Koordinat GPS hanya diproses dan dicatat saat tombol presensi ditekan, tanpa melakukan pelacakan lokasi (*tracking*) secara berkelanjutan di latar belakang.</li>
                        <li><strong>Manajemen Peran & Otoritas:</strong> Pembatasan hak akses berbasis peran (*Role-Based Access Control*) memastikan data hanya dapat diakses oleh pihak berwenang seperti Kepala Sekolah, Kurikulum, dan Admin HR.</li>
                    </ul>
                '
            ],
            [
                'id' => 5,
                'slug' => 'otomatisasi-penggajian-dan-tunjangan-kinerja-guru',
                'title' => 'Otomatisasi Kalkulasi Penggajian dan Tunjangan Kehadiran Guru Berbasis Data Presensi Real-Time',
                'category' => 'Manajemen Keuangan & Kepegawaian',
                'author' => 'Tim Keuangan & HRD SMK MU',
                'date' => '22 Agustus 2026',
                'readTime' => '7 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Sistem penggajian otomatis terintegrasi data presensi akurat mengurangi kesalahan perhitungan manual gaji harian, insentif, dan potongan keterlambatan.',
                'content' => '
                    <p>Proses penggajian guru di sekolah swasta atau institusi kejuruan sering kali melibatkan perhitungan kompleks seperti akumulasi Jam Terhitung Mengajar (JTM), tunjangan jabatan, insentif kehadiran, serta akumulasi potongan keterlambatan atau ketidakhadiran.</p>
                    
                    <h3>Transparansi & Akurasi Penggajian:</h3>
                    <p>Dengan mengintegrasikan data presensi GPS langsung ke modul kalkulasi penggajian, sekolah memperoleh berbagai manfaat operasional:</p>
                    <ul>
                        <li><strong>Kalkulasi Otomatis Potongan Keterlambatan:</strong> Sistem secara otomatis menghitung tingkat keterlambatan berdasarkan batas waktu toleransi yang ditetapkan sekolah.</li>
                        <li><strong>Rekapitulasi Slip Gaji Digital:</strong> Tenaga pendidik dapat memeriksa rincian penerimaan dan potongan secara transparan dari aplikasi masing-masing.</li>
                        <li><strong>Efisiensi Waktu Tim Keuangan:</strong> Proses pembuatan payroll bulanan yang semula memakan waktu berminggu-minggu kini dapat diselesaikan dalam hitungan menit.</li>
                    </ul>
                '
            ],
            [
                'id' => 6,
                'slug' => 'solusi-mengatasi-kendala-mesin-fingerprint-konvensional-sekolah',
                'title' => 'Mengapa Sekolah Modern Beralih dari Mesin Fingerprint ke Sistem Presensi berbasis Cloud',
                'category' => 'Infrastruktur IT Sekolah',
                'author' => 'Tim Konsultan Teknologi Pendidikan',
                'date' => '20 Agustus 2026',
                'readTime' => '5 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Mesin sidik jari konvensional sering mengalami kerusakan sensor, antrean panjang di jam masuk, serta keterbatasan lokasi presensi bagi guru dinas luar.',
                'content' => '
                    <p>Banyak institusi sekolah yang selama ini mengandalkan mesin sidik jari (*fingerprint*) mengalami berbagai hambatan teknis. Kerusakan sensor optik akibat debu, kesalahan pemindaian sidik jari yang aus, hingga ketidakmampuan mencatat kehadiran guru saat tugas dinas di luar kampus merupakan permasalahan umum.</p>

                    <h3>Keunggulan Solusi Presensi Cloud:</h3>
                    <p>SIP MU Enterprise menghadirkan solusi modern tanpa bergantung pada perangkat keras khusus:</p>
                    <ul>
                        <li><strong>Tanpa Antrean Pagi Hari:</strong> Guru dan staf dapat melakukan presensi langsung dari smartphone masing-masing begitu memasuki radius kampus sekolah.</li>
                        <li><strong>Bebas Biaya Perawatan Mesin:</strong> Tidak ada risiko biaya servis mesin sidik jari atau penggantian suku cadang yang mahal.</li>
                        <li><strong>Dukungan Tugas Dinas & Izin Flexibel:</strong> Guru yang bertugas mengantar siswa lomba atau pelatihan luar sekolah tetap dapat melakukan presensi dengan lampiran foto bukti kegiatan.</li>
                    </ul>
                '
            ],
            [
                'id' => 7,
                'slug' => 'peran-kepala-sekolah-dalam-supervisi-kedisiplinan-guru-digital',
                'title' => 'Peran Supervisi Kepala Sekolah melalui Dashboard Analytics Kehadiran Real-Time',
                'category' => 'Kepemimpinan Pendidikan',
                'author' => 'Kepala Sekolah SMK MU',
                'date' => '17 Agustus 2026',
                'readTime' => '6 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Dashboard analitik kehadiran memberikan gambaran langsung bagi pimpinan sekolah untuk mengambil kebijakan evaluasi kinerjasa pendidik secara objektif.',
                'content' => '
                    <p>Kepemimpinan pendidikan yang efektif memerlukan dukungan data (*data-driven decision making*). Dengan adanya dashboard analisis kehadiran real-time pada SIP MU Enterprise, pimpinan sekolah memiliki kendali penuh terhadap pemantauan tingkat kedisiplinan guru secara transparan.</p>

                    <h3>Fitur Evaluasi Kinerja untuk Manajemen Sekolah:</h3>
                    <ul>
                        <li><strong>Statistik Kehadiran Harian & Bulanan:</strong> Visualisasi grafik persentase kehadiran tepat waktu, terlambat, izin, dan sakit.</li>
                        <li><strong>Notifikasi Peringatan Dini:</strong> Sistem memberikan peringatan sistematis bagi pegawai dengan akumulasi keterlambatan berulang.</li>
                        <li><strong>Laporan Kesiapan Mengajar:</strong> Pengawasan langsung terhadap guru yang hadir tepat waktu di ruang kelas atau laboratorium kejuruan.</li>
                    </ul>
                '
            ],
            [
                'id' => 8,
                'slug' => 'tata-cara-pengajuan-cuti-online-dan-alokasi-guru-pengganti',
                'title' => 'Tata Cara Pengajuan Izin Cuti Online dan Optimalisasi Penugasan Guru Inval',
                'category' => 'Tata Kelola Sekolah',
                'author' => 'Tim Administrasi Kepegawaian',
                'date' => '12 Agustus 2026',
                'readTime' => '5 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Alur pengajuan cuti digital bebas kertas (paperless) mempercepat proses persetujuan dan memastikan jadwal kelas yang ditinggalkan segera diisi guru pengganti.',
                'content' => '
                    <p>Kerap kali ketidakhadiran guru karena urusan mendadak atau sakit menyebabkan kelas kosong tanpa pendampingan. SIP MU Enterprise mengintegrasikan fitur pengajuan izin/cuti online dengan sistem penjadwalan guru inval (jam ganti).</p>

                    <h3>Alur Cuti Paperless & Guru Inval:</h3>
                    <ul>
                        <li><strong>Pengajuan Mudah via Smartphone:</strong> Guru cukup melampirkan surat dokter atau dokumen pendukung langsung dari aplikasi.</li>
                        <li><strong>Notifikasi Approval Real-time:</strong> Kepala Sekolah dan Tim Kurikulum menerima pemberitahuan persetujuan secara cepat.</li>
                        <li><strong>Penugasan Jam Ganti Otomatis:</strong> Kurikulum dapat menunjuk guru pengganti untuk mengisi kelas yang kosong, sehingga hak belajar siswa tetap terpenuhi 100%.</li>
                    </ul>
                '
            ],
            [
                'id' => 9,
                'slug' => 'transformasi-digital-smk-menuju-era-smart-campus-4-0',
                'title' => 'Roadmap Transformasi Digital SMK Manbaul Ulum Menuju Smart Campus 4.0',
                'category' => 'Inovasi Pendidikan',
                'author' => 'Tim Pengembang Strategis',
                'date' => '05 Agustus 2026',
                'readTime' => '8 Menit Baca',
                'image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
                'summary' => 'Visi tata kelola sekolah vokasi modern berbasis teknologi cloud, integrasi PWA, analitik big data kehadiran, dan pencapaian efisiensi operasional.',
                'content' => '
                    <p>Transformasi digital di lingkungan Sekolah Menengah Kejuruan bukan sekadar tentang otomatisasi tugas administratif, melainkan tentang membangun ekosistem pendukung pembelajaran vokasi yang unggul, terintegrasi, dan responsif terhadap perkembangan era Industri 4.0.</p>

                    <h3>Tiga Pilar Utama Smart Campus SIP MU:</h3>
                    <ul>
                        <li><strong>Infrastruktur Cloud Handal:</strong> Platform aplikasi dapat diakses 24/7 tanpa perlu kekhawatiran pemadaman server fisik sekolah.</li>
                        <li><strong>Integrasi Layanan Edukasi:</strong> Menghubungkan manajemen presensi, jadwal mengajar, supervisi pimpinan, hingga rekapitulasi penggajian dalam satu pintu.</li>
                        <li><strong>Ekosistem Ramah Lingkungan (*Paperless*):</strong> Mengurangi penggunaan kertas untuk absensi, surat izin, dan formulir rekapitulasi hingga 95%.</li>
                    </ul>
                '
            ]
        ];
    }

    public function privacyPolicy(Request $request)
    {
        return Inertia::render('Public/PrivacyPolicy', [
            'auth' => ['user' => $request->user()]
        ]);
    }

    public function termsOfService(Request $request)
    {
        return Inertia::render('Public/TermsOfService', [
            'auth' => ['user' => $request->user()]
        ]);
    }

    public function aboutUs(Request $request)
    {
        return Inertia::render('Public/AboutUs', [
            'auth' => ['user' => $request->user()]
        ]);
    }

    public function contactUs(Request $request)
    {
        return Inertia::render('Public/ContactUs', [
            'auth' => ['user' => $request->user()]
        ]);
    }

    public function blogIndex(Request $request)
    {
        $articles = $this->getArticlesData();
        return Inertia::render('Public/BlogIndex', [
            'articles' => $articles,
            'auth' => ['user' => $request->user()]
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
            'auth' => ['user' => $request->user()]
        ]);
    }
}
