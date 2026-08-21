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
