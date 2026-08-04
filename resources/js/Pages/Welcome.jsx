import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, ArrowRight, Fingerprint, BarChart3, Clock, GraduationCap, 
    CalendarDays, Phone, Globe, MapPin, Play, Camera, Images, ClipboardCheck, 
    Menu, X, CheckCircle2, ChevronDown, Sparkles, Zap, Smartphone, Check, HelpCircle, UserCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import PwaInstallPrompt from '@/Components/PwaInstallPrompt';

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg>
);
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

export default function Welcome({ auth }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFeatureTab, setActiveFeatureTab] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    const features = [
        { 
            title: "Smart Attendance", 
            tagline: "Presensi Swafoto & Geofencing Presisi",
            desc: "Validasi lokasi presensi berbasis titik koordinat GPS lokasi sekolah dengan Radius Geofencing presisi dan foto selfie real-time.",
            icon: <Fingerprint className="w-6 h-6" />, 
            color: "from-indigo-500 to-blue-600",
            badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
            highlights: ["Akurasi GPS hingga radius meter", "Foto Selfie Swafoto Wajib", "Cegah Kecurangan & Titip Absen"]
        },
        { 
            title: "Monitoring Real-time", 
            tagline: "Pantau Kehadiran Seluruh Pegawai Langsung",
            desc: "Dashboard eksekutif untuk memantau status hadir, terlambat, izin, sakit, maupun alpa seluruh guru dan staf secara live.",
            icon: <ClipboardCheck className="w-6 h-6" />, 
            color: "from-emerald-500 to-teal-600",
            badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
            highlights: ["Statistik Kehadiran Harian", "Notifikasi Keterlambatan Realtime", "Multi-role Dashboard Super Admin & Kepala Sekolah"]
        },
        { 
            title: "Dynamic Reporting", 
            tagline: "Generate Rekapitulasi Otomatis Excel / PDF",
            desc: "Cetak rekapitulasi kehadiran bulanan, perhitung jam mengajar (JTM), serta kalkulasi gaji/payroll secara otomatis.",
            icon: <BarChart3 className="w-6 h-6" />, 
            color: "from-amber-500 to-orange-600",
            badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
            highlights: ["Export File Excel & PDF Siap Cetak", "Hitungan Jam Mengajar (JTM)", "Pencetakan Slip Gaji Pegawai"]
        },
        { 
            title: "Leave Management", 
            tagline: "Pengajuan Cuti & Izin Digital Alur Bertingkat",
            desc: "Pengajuan surat izin, sakit, maupun cuti tahunan dilakukan secara online lengkap dengan unggah bukti foto/surat pendukung.",
            icon: <Clock className="w-6 h-6" />, 
            color: "from-purple-500 to-violet-600",
            badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
            highlights: ["Verifikasi Approval Berjenjang", "Unggah Lampiran Surat Dokter/Dinas", "Riwayat Pengajuan Terarsip Rapi"]
        },
        { 
            title: "Jadwal Mengajar", 
            tagline: "Manajemen Jam Mengajar Terintegrasi",
            desc: "Integrasi jadwal mengajar guru per jam pelajaran (JP) dari Jam ke-1 hingga Jam ke-10 untuk verifikasi kehadiran di kelas.",
            icon: <GraduationCap className="w-6 h-6" />, 
            color: "from-rose-500 to-pink-600",
            badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
            highlights: ["Presensi Per Jam Pelajaran (JP)", "Fitur Bursa Guru Inval / Pengganti", "Kalkulasi JTM Efektif"]
        },
        { 
            title: "Kalender Akademik", 
            tagline: "Kelola Hari Libur & Agenda Sekolah",
            desc: "Pengaturan hari libur nasional, libur sekolah, serta agenda kegiatan yang otomatis mengecualikan hitungan alpa pegawai.",
            icon: <CalendarDays className="w-6 h-6" />, 
            color: "from-sky-500 to-cyan-600",
            badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
            highlights: ["Sinkronisasi Hari Libur Otomatis", "Manajemen Kampus 1 & Kampus 2", "Bypass Alpa di Hari Libur Terdaftar"]
        },
    ];

    const faqs = [
        {
            q: "Bagaimana cara kerja presensi berbasis GPS & Geofencing pada SIP MU Enterprise?",
            a: "Sistem secara otomatis mendeteksi posisi koordinat GPS perangkat smartphone pegawai saat melakukan presensi. Presensi hanya akan diterima oleh sistem jika lokasi pegawai berada di dalam batas radius area lokasi kampus SMK Manbaul Ulum Cirebon yang telah ditentukan."
        },
        {
            q: "Apakah aplikasi ini mendukung akses fleksibel di berbagai perangkat (Mobile & Desktop)?",
            a: "Ya! SIP MU Enterprise dirancang menggunakan arsitektur web responsif modern. Aplikasi dapat diakses dengan lancar melalui Smartphone (Android & iOS), Tablet, maupun Komputer/Laptop Desktop."
        },
        {
            q: "Bagaimana alur pengajuan izin atau sakit bagi guru dan karyawan?",
            a: "Pegawai cukup masuk ke menu Pengajuan Cuti/Izin, memilih jenis pengajuan (Izin, Sakit, atau Dinas Luar), mengunggah foto bukti (surat dokter/surat tugas), dan mengirimkannya secara digital. Pimpinan dapat menyetujui atau menolak pengajuan tersebut secara langsung melalui dashboard admin."
        },
        {
            q: "Apakah data rekap presensi dan perhitungan JTM dapat di-export?",
            a: "Tentu saja. Super Admin dan tim manajemen dapat mengeksport rekapitulasi kehadiran bulanan, rincian Jam Terjadwal Mengajar (JTM), hingga cetak rekap PDF/Excel secara instan."
        }
    ];

    const socials = [
        { icon: <Phone className="w-5 h-5" />, label: "WhatsApp", value: "+62 851-8666-6031", href: "https://wa.me/6285186666031" },
        { icon: <InstagramIcon />, label: "Instagram", value: "SMK Manbaul Ulum Cirebon", href: "https://www.instagram.com/smks_mu?igsh=ZzVjcDlndDlsbWR6" },
        { icon: <TikTokIcon />, label: "TikTok", value: "Media Centre SMK MU", href: "https://www.tiktok.com/@smkmanbaululumcirebon?_r=1&_t=ZS-96EXnEuqJrJ" },
        { icon: <Play className="w-5 h-5" />, label: "YouTube", value: "SMK Manbaul Ulum Cirebon Official", href: "https://www.youtube.com/@SMKManbaulUlumCirebonOfficial" },
        { icon: <Globe className="w-5 h-5" />, label: "Website", value: "smkmucirebon.sch.id", href: "https://smkmucirebon.sch.id/" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
            <Head title="SIP MU Enterprise - Sistem Informasi Presensi & Kehadiran" />

            {/* Glassmorphic Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-inner">
                                <ApplicationLogo className="h-8 w-8 shrink-0" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                    SIP MU <span className="text-indigo-600">Enterprise</span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-1">SMK Manbaul Ulum Cirebon</span>
                            </div>
                        </div>

                        {/* Desktop Links & Theme Toggle */}
                        <div className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
                            <a href="#features" className="hover:text-indigo-600 transition-colors">Fitur Utama</a>
                            <a href="#about" className="hover:text-indigo-600 transition-colors">Tentang Aplikasi</a>
                            <a href="#privacy" className="hover:text-indigo-600 transition-colors">Privasi</a>
                            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
                            <a href="#contact" className="hover:text-indigo-600 transition-colors">Kontak</a>
                            <ThemeToggle />
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 rounded-full px-6 transition-all duration-300 transform hover:-translate-y-0.5">
                                        Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={route('login')}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 rounded-full px-6 transition-all duration-300 transform hover:-translate-y-0.5">
                                        Masuk Aplikasi
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Action & Toggle */}
                        <div className="flex md:hidden items-center space-x-2">
                            <ThemeToggle />
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <Button size="sm" className="bg-indigo-600 text-white rounded-full px-4 text-xs h-9">Dashboard</Button>
                                </Link>
                            ) : (
                                <Link href={route('login')}>
                                    <Button size="sm" className="bg-indigo-600 text-white rounded-full px-4 text-xs h-9">Masuk</Button>
                                </Link>
                            )}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl overflow-hidden shadow-xl"
                        >
                            <div className="px-4 pt-4 pb-6 space-y-3 font-medium text-slate-700">
                                <a
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    Fitur Utama
                                </a>
                                <a
                                    href="#about"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    Tentang Aplikasi
                                </a>
                                <a
                                    href="#privacy"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    Kebijakan Privasi
                                </a>
                                <a
                                    href="#faq"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    Pertanyaan Umum (FAQ)
                                </a>
                                <a
                                    href="#contact"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    Kontak & Lokasi
                                </a>
                                <div className="pt-3 border-t border-slate-100">
                                    {auth.user ? (
                                        <Link href={route('dashboard')} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 rounded-2xl justify-center h-12">
                                                Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href={route('login')} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 rounded-2xl justify-center h-12">
                                                Masuk Aplikasi
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
                {/* Ambient Background Glows */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-200/50 to-purple-200/40 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-sky-200/50 to-indigo-200/40 blur-[120px]" />
                    <div className="absolute top-[40%] right-[30%] w-[25%] h-[25%] rounded-full bg-rose-100/40 blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left Column: Headline & CTA */}
                        <div className="lg:col-span-7 text-center lg:text-left">
                            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                <div className="inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/90 text-indigo-700 border border-indigo-100 shadow-sm backdrop-blur-md mb-8">
                                    <span className="relative flex h-2.5 w-2.5 mr-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span>Platform SDM & Presensi Modern — SMK Manbaul Ulum Cirebon</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.12]">
                                    Kelola Presensi & Kehadiran<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600">
                                        SIP MU Enterprise.
                                    </span>
                                </h1>

                                <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                                    Solusi terintegrasi untuk mengotomatisasi pencatatan kehadiran guru, karyawan, jam mengajar (JTM), pengajuan izin/cuti digital, dan rekapitulasi SDM secara real-time.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                                    <Link href={route('login')} className="w-full sm:w-auto">
                                        <Button size="lg" className="h-14 px-8 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 hover:shadow-indigo-300 rounded-2xl w-full sm:w-auto transition-all duration-300 transform hover:-translate-y-0.5">
                                            Mulai Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <a href="#features" className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-2xl w-full sm:w-auto shadow-sm">
                                            Jelajahi Fitur
                                        </Button>
                                    </a>
                                </div>

                                {/* Key Bullet Points */}
                                <div className="pt-8 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-slate-700">GPS Geofencing Presisi</span>
                                    </div>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-slate-700">Swafoto Selfie Real-time</span>
                                    </div>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-slate-700">Export Rekap Excel / PDF</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Interactive App Dashboard Mockup */}
                        <div className="lg:col-span-5 relative">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.92, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="relative mx-auto max-w-md lg:max-w-none"
                            >
                                {/* Glow Effect Behind Card */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />

                                <div className="relative bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-100/50">
                                    {/* Mockup Top Bar */}
                                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                                        <div className="flex items-center space-x-3">
                                            <ApplicationLogo className="h-10 w-10 bg-indigo-50 p-1 rounded-xl" />
                                            <div>
                                                <h4 className="font-extrabold text-sm text-slate-900">Dashboard Presensi</h4>
                                                <p className="text-xs text-slate-400 font-medium">SMK Manbaul Ulum Cirebon</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            ● Live Active
                                        </span>
                                    </div>

                                    {/* Mockup Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100/50">
                                            <div className="flex items-center justify-between text-indigo-600 mb-1">
                                                <UserCheck className="w-4 h-4" />
                                                <span className="text-[10px] font-extrabold bg-indigo-100 px-1.5 py-0.5 rounded">98%</span>
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">100+</p>
                                            <p className="text-[11px] font-medium text-slate-500">Hadir Hari Ini</p>
                                        </div>
                                        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100/50">
                                            <div className="flex items-center justify-between text-purple-600 mb-1">
                                                <Zap className="w-4 h-4" />
                                                <span className="text-[10px] font-extrabold bg-purple-100 px-1.5 py-0.5 rounded">Realtime</span>
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">10 JP</p>
                                            <p className="text-[11px] font-medium text-slate-500">Sesi Mengajar</p>
                                        </div>
                                    </div>

                                    {/* Mockup Recent Activity List */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">AF</div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">Ahmad Fauzi, S.Pd.</p>
                                                    <p className="text-[10px] text-slate-400">Wakasek Keagamaan — Presensi Masuk</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">07:05 WIB</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">SR</div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">Siti Rahmawati, M.Pd.</p>
                                                    <p className="text-[10px] text-slate-400">Guru Produktif — JTM Jam ke-6</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Terverifikasi</span>
                                        </div>
                                    </div>

                                    {/* Floating Glass Badges */}
                                    <motion.div 
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl border border-slate-200 p-3.5 rounded-2xl shadow-xl flex items-center space-x-3 hidden sm:flex"
                                    >
                                        <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-900">Geofencing Valid</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Radius Kampus 1 & 2</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        animate={{ y: [0, 8, 0] }}
                                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                                        className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-xl border border-slate-200 p-3.5 rounded-2xl shadow-xl flex items-center space-x-3 hidden sm:flex"
                                    >
                                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-900">Swafoto Selfie</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Auto Anti-Cheating</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact & Trust Stats Section */}
            <section className="py-12 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center">
                        {[
                            { value: "100+", label: "Pegawai & Guru Aktif", desc: "Tergabung dalam sistem" },
                            { value: "7+", label: "Role & Wewenang", desc: "Akses bertingkat terstruktur" },
                            { value: "99.8%", label: "Akurasi Geofencing", desc: "Validasi koordinat GPS" },
                            { value: "2", label: "Kampus Utama", desc: "Kampus 1 & Kampus 2 Cirebon" }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 sm:p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300">
                                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-extrabold text-slate-800 mb-1">{stat.label}</p>
                                <p className="text-xs text-slate-400 font-medium">{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Feature Showcase Section */}
            <section id="features" className="py-24 bg-slate-50/70 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-3 inline-block">
                            Ekosistem Terintegrasi
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            Fitur <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Unggulan</span>
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-base">
                            Platform all-in-one yang dirancang presisi untuk tata kelola SDM dan administrasi sekolah modern.
                        </p>
                    </div>

                    {/* Interactive Feature Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                        {features.map((f, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveFeatureTab(index)}
                                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                                    activeFeatureTab === index
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                                }`}
                            >
                                <span>{f.icon}</span>
                                <span>{f.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Active Feature Detail Card */}
                    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-slate-100">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeFeatureTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                            >
                                <div className="lg:col-span-7">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border mb-4 ${features[activeFeatureTab].badgeColor}`}>
                                        {features[activeFeatureTab].title}
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                                        {features[activeFeatureTab].tagline}
                                    </h3>
                                    <p className="text-slate-600 text-base leading-relaxed mb-8">
                                        {features[activeFeatureTab].desc}
                                    </p>

                                    <div className="space-y-3">
                                        {features[activeFeatureTab].highlights.map((h, i) => (
                                            <div key={i} className="flex items-center space-x-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </div>
                                                <span className="text-slate-700 font-bold text-sm">{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-5">
                                    <div className={`p-8 rounded-3xl bg-gradient-to-br ${features[activeFeatureTab].color} text-white shadow-2xl relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
                                            {features[activeFeatureTab].icon}
                                        </div>
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white border border-white/20">
                                            {features[activeFeatureTab].icon}
                                        </div>
                                        <h4 className="text-xl font-extrabold mb-2">{features[activeFeatureTab].title}</h4>
                                        <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                                            Sistem pintar yang terhubung otomatis dengan database presensi pusat.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* About Application Section */}
            <section id="about" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-3 block">Tentang Aplikasi</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
                                Sistem Informasi Presensi & Kehadiran Terintegrasi
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-8 text-base">
                                SIP MU Enterprise adalah platform digital yang dirancang khusus untuk SMK Manbaul Ulum Cirebon dalam mengelola administrasi kehadiran, jadwal mengajar, pengajuan izin/cuti, dan manajemen SDM secara efisien dan akurat.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    'Presensi Berbasis GPS & Geofencing',
                                    'Jadwal Mengajar Real-Time per JP',
                                    'Rekap Kehadiran Bulanan (Excel/PDF)',
                                    'Multi-Role Access Control',
                                    'Verifikasi Bukti Foto Swafoto',
                                    'Integrasi Pengajuan Cuti & Izin'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                        <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-slate-800 font-bold text-xs">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 30 }} 
                            whileInView={{ opacity: 1, x: 0 }} 
                            viewport={{ once: true }}
                            className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 rounded-3xl p-10 text-white shadow-2xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] rounded-3xl pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-center space-x-4 mb-8">
                                    <ApplicationLogo className="h-16 w-16 bg-white/20 rounded-2xl p-2 backdrop-blur-sm border border-white/20" />
                                    <div>
                                        <h3 className="text-2xl font-black">SIP MU Enterprise</h3>
                                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-indigo-100 backdrop-blur-sm border border-white/20 mt-1">
                                            v2.0 — Production Ready
                                        </span>
                                    </div>
                                </div>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-8">
                                    Dikembangkan untuk memberikan pengalaman presensi terbaik, akurat, dan transparan bagi seluruh civitas akademika SMK Manbaul Ulum Cirebon.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[{ n: '7+', l: 'User Roles' }, { n: '100+', l: 'Pegawai Aktif' }, { n: '10', l: 'Jam Pelajaran' }, { n: '2', l: 'Kampus' }].map((s, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                            <p className="text-2xl sm:text-3xl font-black">{s.n}</p>
                                            <p className="text-indigo-200 text-xs font-bold">{s.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Privacy & Policy Section */}
            <section id="privacy" className="py-24 bg-slate-50/70 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-3 inline-block">
                            Keamanan & Kerahasiaan Data
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            Kebijakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Privasi</span>
                        </h2>
                        <p className="text-slate-500 max-w-3xl mx-auto leading-relaxed text-base">
                            Kami menghargai privasi dan kerahasiaan data Anda. Hak akses yang diminta oleh aplikasi ini semata-mata digunakan untuk verifikasi presensi kehadiran secara sah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Kamera */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-indigo-50 group-hover:bg-indigo-600 transition-colors duration-300 rounded-2xl flex items-center justify-center mb-6">
                                <Camera className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900 mb-3 uppercase tracking-wider">Kamera (Camera)</h4>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                Aplikasi SIP MU Enterprise memerlukan izin akses kamera untuk mengambil foto swafoto (selfie) pegawai sebagai bukti absensi fisik yang sah.
                            </p>
                        </div>

                        {/* Lokasi GPS */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-emerald-50 group-hover:bg-emerald-600 transition-colors duration-300 rounded-2xl flex items-center justify-center mb-6">
                                <MapPin className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900 mb-3 uppercase tracking-wider">Lokasi GPS (Location)</h4>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                Memerlukan akses koordinat GPS lokasi perangkat untuk memastikan posisi pegawai berada dalam radius area kampus yang diizinkan untuk presensi.
                            </p>
                        </div>

                        {/* Galeri foto */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-purple-50 group-hover:bg-purple-600 transition-colors duration-300 rounded-2xl flex items-center justify-center mb-6">
                                <Images className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900 mb-3 uppercase tracking-wider">Galeri Foto (Storage)</h4>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                Digunakan untuk mengunggah dokumen/surat bukti pendukung saat melakukan pengajuan izin, sakit, maupun fitur klaim banding presensi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Accordion Section */}
            <section id="faq" className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-3 inline-block">
                            Informasi Tambahan
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                            Pertanyaan Umum <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">(FAQ)</span>
                        </h2>
                        <p className="text-slate-500 text-base">
                            Jawaban atas pertanyaan yang sering diajukan terkait penggunaan sistem presensi digital.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-200"
                            >
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                    className="w-full px-6 py-5 text-left font-bold text-slate-900 flex items-center justify-between hover:text-indigo-600 transition-colors"
                                >
                                    <span className="text-sm sm:text-base">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-indigo-600 transition-transform duration-300 shrink-0 ml-4 ${openFaqIndex === index ? 'transform rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {openFaqIndex === index && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 pt-4"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-slate-900 text-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* Col 1: Logo & Desc */}
                        <div>
                            <div className="flex items-center space-x-3 mb-5">
                                <ApplicationLogo className="h-12 w-12 bg-white/10 rounded-2xl p-2 border border-white/10" />
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">SIP MU <span className="text-indigo-400">Enterprise</span></h3>
                                    <p className="text-slate-400 text-xs font-semibold">Sistem Informasi Presensi & Kehadiran</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                Aplikasi resmi SMK Manbaul Ulum Cirebon untuk tata kelola presensi, kehadiran, dan administrasi SDM secara digital dan akurat.
                            </p>
                            <a 
                                href="https://smkmucirebon.sch.id/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-600/30 transition-colors border border-indigo-500/20"
                            >
                                <Globe className="w-4 h-4 mr-2" /> smkmucirebon.sch.id
                            </a>
                        </div>

                        {/* Col 2: Social Media */}
                        <div>
                            <h4 className="text-base font-extrabold mb-6 flex items-center">
                                <span className="w-8 h-1 bg-indigo-500 rounded-full mr-3" />Hubungi Kami
                            </h4>
                            <div className="space-y-4">
                                {socials.map((s, i) => (
                                    <a 
                                        key={i} 
                                        href={s.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 group"
                                    >
                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 border border-slate-700 group-hover:border-indigo-500">
                                            {s.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                                            <p className="text-xs sm:text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{s.value}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Col 3: Maps */}
                        <div>
                            <h4 className="text-base font-extrabold mb-6 flex items-center">
                                <span className="w-8 h-1 bg-indigo-500 rounded-full mr-3" />Lokasi Sekolah
                            </h4>
                            <div className="rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl mb-4">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.123!2d108.4359!3d-6.7622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f1d9a1b2c3d4e%3A0x1234567890abcdef!2sSMK+Manbaul+Ulum+Cirebon!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                                    width="100%" 
                                    height="200" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade" 
                                    title="Lokasi SMK Manbaul Ulum Cirebon"
                                    className="grayscale hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <a 
                                href="https://maps.app.goo.gl/vZW8e962v8Kb2g2k8" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                            >
                                <MapPin className="w-4 h-4 mr-1.5" /> Buka di Google Maps
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center items-center">
                        <p className="text-slate-500 text-xs sm:text-sm font-medium text-center">
                            &copy; {new Date().getFullYear()} SIP MU Enterprise — SMK Manbaul Ulum Cirebon. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
            <PwaInstallPrompt />
        </div>
    );
}
