import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Fingerprint, BarChart3, Clock, GraduationCap, CalendarDays, Phone, Globe, MapPin, Play, Camera, Images, ClipboardCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ApplicationLogo from '@/Components/ApplicationLogo';

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg>
);
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

export default function Welcome({ auth }) {
    const features = [
        { title: "Smart Attendance", desc: "Presensi Geofencing & Swafoto untuk akurasi kehadiran guru dan staf.", icon: <Fingerprint className="w-6 h-6" />, color: "from-indigo-500 to-blue-600" },
        { title: "Monitoring Real-time", desc: "Pantau kehadiran seluruh pegawai secara langsung dari dashboard.", icon: <ClipboardCheck className="w-6 h-6" />, color: "from-emerald-500 to-teal-600" },
        { title: "Dynamic Reporting", desc: "Generate rekapitulasi kehadiran bulanan dan export ke Excel/PDF.", icon: <BarChart3 className="w-6 h-6" />, color: "from-amber-500 to-orange-600" },
        { title: "Leave Management", desc: "Pengajuan cuti dan izin digital dengan alur persetujuan.", icon: <Clock className="w-6 h-6" />, color: "from-purple-500 to-violet-600" },
        { title: "Jadwal Mengajar", desc: "Manajemen jadwal mengajar terintegrasi dengan presensi per jam.", icon: <GraduationCap className="w-6 h-6" />, color: "from-rose-500 to-pink-600" },
        { title: "Kalender Akademik", desc: "Pengelolaan hari libur dan kalender akademik sekolah.", icon: <CalendarDays className="w-6 h-6" />, color: "from-sky-500 to-cyan-600" },
    ];

    const socials = [
        { icon: <Phone className="w-5 h-5" />, label: "WhatsApp", value: "+62 851-8666-6031", href: "https://wa.me/6285186666031" },
        { icon: <InstagramIcon />, label: "Instagram", value: "SMK Manbaul Ulum Cirebon", href: "https://www.instagram.com/smks_mu?igsh=ZzVjcDlndDlsbWR6" },
        { icon: <TikTokIcon />, label: "TikTok", value: "Media Centre SMK MU", href: "https://www.tiktok.com/@smkmanbaululumcirebon?_r=1&_t=ZS-96EXnEuqJrJ" },
        { icon: <Play className="w-5 h-5" />, label: "YouTube", value: "SMK Manbaul Ulum Cirebon Official", href: "https://www.youtube.com/@SMKManbaulUlumCirebonOfficial" },
        { icon: <Globe className="w-5 h-5" />, label: "Website", value: "smkmucirebon.sch.id", href: "https://smkmucirebon.sch.id/" },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-indigo-100">
            <Head title="SIP MU Enterprise - Sistem Informasi Presensi & Kehadiran" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <ApplicationLogo className="h-10 w-10 shrink-0" />
                            <span className="text-xl font-bold tracking-tight">SIP MU <span className="text-indigo-600">Enterprise</span></span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
                            <a href="#features" className="hover:text-indigo-600 transition-colors">Fitur</a>
                            <a href="#about" className="hover:text-indigo-600 transition-colors">Tentang Aplikasi</a>
                            <a href="#privacy" className="hover:text-indigo-600 transition-colors">Privacy & Policy</a>
                            <a href="#contact" className="hover:text-indigo-600 transition-colors">Kontak</a>
                            {auth.user ? (
                                <Link href={route('dashboard')}><Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-full px-6">Dashboard <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
                            ) : (
                                <Link href={route('login')}><Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-full px-6">Masuk</Button></Link>
                            )}
                        </div>
                        {/* Mobile */}
                        <div className="md:hidden">
                            {auth.user ? (
                                <Link href={route('dashboard')}><Button size="sm" className="bg-indigo-600 rounded-full px-4 text-xs">Dashboard</Button></Link>
                            ) : (
                                <Link href={route('login')}><Button size="sm" className="bg-indigo-600 rounded-full px-4 text-xs">Masuk</Button></Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/60 blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-50/60 blur-[100px]" />
                    <div className="absolute top-[30%] right-[20%] w-[25%] h-[25%] rounded-full bg-sky-50/40 blur-[80px]" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-8">
                            <ShieldCheck className="w-4 h-4 mr-2" /> SMK Manbaul Ulum Cirebon
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
                            Kelola Presensi & Kehadiran<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">SIP MU Enterprise.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed">
                            Solusi terintegrasi untuk mengotomatisasi pencatatan kehadiran guru, karyawan, jadwal mengajar, dan manajemen SDM secara real-time.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href={route('login')}>
                                <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 rounded-2xl w-full sm:w-auto">
                                    Mulai Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-gray-200 rounded-2xl w-full sm:w-auto">Pelajari Fitur</Button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 lg:py-28 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">Fitur <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Unggulan</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Platform all-in-one untuk manajemen SDM sekolah modern.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div key={i} whileHover={{ y: -8 }} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}>{f.icon}</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About */}
            <section id="about" className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4 block">Tentang Aplikasi</span>
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">Sistem Informasi Presensi & Kehadiran Terintegrasi</h2>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                SIP MU Enterprise adalah platform digital yang dirancang khusus untuk SMK Manbaul Ulum Cirebon dalam mengelola administrasi kehadiran, jadwal mengajar, pengajuan izin/cuti, dan manajemen SDM secara efisien dan akurat.
                            </p>
                            <div className="space-y-4">
                                {['Presensi berbasis GPS & Geofencing', 'Jadwal mengajar real-time', 'Rekap kehadiran bulanan (Excel/PDF)', 'Role-based access control'].map((item, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-10 text-white shadow-2xl">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] rounded-3xl" />
                            <div className="relative">
                                <div className="flex items-center space-x-4 mb-8">
                                    <ApplicationLogo className="h-16 w-16 bg-white/20 rounded-2xl p-2 backdrop-blur-sm" />
                                    <div>
                                        <h3 className="text-2xl font-extrabold">SIP MU Enterprise</h3>
                                        <p className="text-indigo-200 font-medium">v2.0 — Production</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[{ n: '7+', l: 'User Roles' }, { n: '100+', l: 'Pegawai Aktif' }, { n: '10', l: 'Jam Pelajaran' }, { n: '2', l: 'Kampus' }].map((s, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                            <p className="text-3xl font-extrabold">{s.n}</p>
                                            <p className="text-indigo-200 text-sm font-medium">{s.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Privacy & Policy */}
            <section id="privacy" className="py-20 lg:py-28 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-700 mb-3 tracking-tight">Privacy & Policy</h2>
                        <h3 className="text-2xl lg:text-3xl font-medium text-slate-500 mb-8">Kebijakan Privasi</h3>
                        <p className="text-slate-500 max-w-4xl mx-auto leading-relaxed text-base lg:text-lg">
                            Kami mengerti dan menghargai kepentingan anda atas hak privasi dan keamanan akan setiap informasi pribadi yang anda berikan secara online ketika berkunjung ke website. Privacy policy ini menjelaskan komitmen kami akan kerahasiaan dan keamanan data pribadi ketika anda menggunakan aplikasi ini.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mt-12">
                        {/* Kamera */}
                        <div className="text-center md:text-left group">
                            <div className="mb-6 flex justify-center md:justify-start">
                                <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-500 transition-colors duration-300 rounded-2xl flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>
                            <h4 className="text-base font-bold text-slate-700 mb-4 uppercase tracking-wider">KAMERA ( CAMERA )</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Aplikasi SIP MU Enterprise Memerlukan izin akses kamera pada perangkat handphone untuk melakukan foto selfi sebagai bukti kehadiran
                            </p>
                        </div>
                        {/* Lokasi */}
                        <div className="text-center md:text-left group">
                            <div className="mb-6 flex justify-center md:justify-start">
                                <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-500 transition-colors duration-300 rounded-2xl flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>
                            <h4 className="text-base font-bold text-slate-700 mb-4 uppercase tracking-wider">LOKASI GPS ( LOCATION )</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Aplikasi SIP MU Enterprise Memerlukan izin akses lokasi pada perangkat handphone untuk memastikan penggunan berada dalam radius yang diperbolehkan untuk melakukan presensi
                            </p>
                        </div>
                        {/* Galeri */}
                        <div className="text-center md:text-left group">
                            <div className="mb-6 flex justify-center md:justify-start">
                                <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-500 transition-colors duration-300 rounded-2xl flex items-center justify-center">
                                    <Images className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>
                            <h4 className="text-base font-bold text-slate-700 mb-4 uppercase tracking-wider">GALLERY FOTO</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Aplikasi SIP MU Enterprise Memerlukan izin akses foto galery pada perangkat handphone untuk melakukan upload foto yang dipergunakan pada fitur klaim banding dan fitur-fitur lainnya
                            </p>
                        </div>
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
                                <ApplicationLogo className="h-12 w-12 bg-white/10 rounded-xl p-1.5" />
                                <div>
                                    <h3 className="text-lg font-extrabold">SIP MU <span className="text-indigo-400">Enterprise</span></h3>
                                    <p className="text-slate-400 text-xs font-medium">Sistem Informasi Presensi & Kehadiran</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Aplikasi resmi SMK Manbaul Ulum Cirebon untuk manajemen presensi, kehadiran, dan administrasi SDM secara digital.
                            </p>
                            <a href="https://smkmucirebon.sch.id/" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-600/30 transition-colors border border-indigo-500/20">
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
                                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center space-x-3 group">
                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 border border-slate-700 group-hover:border-indigo-500">
                                            {s.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                                            <p className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{s.value}</p>
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
                            <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl mb-4">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.123!2d108.4359!3d-6.7622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f1d9a1b2c3d4e%3A0x1234567890abcdef!2sSMK+Manbaul+Ulum+Cirebon!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                                    width="100%" height="200" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade" title="Lokasi SMK Manbaul Ulum Cirebon"
                                    className="grayscale hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <a href="https://maps.app.goo.gl/vZW8e962v8Kb2g2k8" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                                <MapPin className="w-4 h-4 mr-1.5" /> Buka di Google Maps
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center items-center">
                        <p className="text-slate-500 text-sm font-medium text-center">
                            &copy; {new Date().getFullYear()} SIP MU Enterprise — SMK Manbaul Ulum Cirebon. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
