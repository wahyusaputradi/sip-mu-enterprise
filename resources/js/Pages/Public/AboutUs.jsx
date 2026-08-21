import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Info, GraduationCap, Building2, ShieldCheck, MapPin, CheckCircle2, Award, Users, Cpu } from 'lucide-react';

export default function AboutUs({ auth }) {
    const stats = [
        { label: "Tenaga Pendidik & Staf", value: "100+", icon: <Users className="w-5 h-5 text-indigo-400" /> },
        { label: "Akurasi Geofencing GPS", value: "99.8%", icon: <MapPin className="w-5 h-5 text-emerald-400" /> },
        { label: "Kampus Operasional", value: "2 Lokasi", icon: <Building2 className="w-5 h-5 text-amber-400" /> },
        { label: "Keamanan Data System", value: "AES-256", icon: <ShieldCheck className="w-5 h-5 text-purple-400" /> },
    ];

    return (
        <PublicLayout title="Tentang Kami (About Us)" auth={auth}>
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
                {/* Hero section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <GraduationCap className="w-4 h-4" />
                        <span>Profil Resmi Lembaga Pendidikan</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                        SIP MU Enterprise <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            SMK Manbaul Ulum Cirebon
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
                        Sistem Informasi Presensi & Tata Kelola Sumber Daya Manusia (SDM) Digital Modern yang dirancang khusus untuk mewujudkan efisiensi, akurasi, dan transparansi di lingkungan sekolah SMK Manbaul Ulum Cirebon.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center shadow-xl hover:border-indigo-500/40 transition-all">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-700">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-1">{item.value}</h3>
                            <p className="text-xs text-slate-400 font-semibold">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* About Detail Box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center">
                            <Cpu className="w-6 h-6 mr-3 text-indigo-400" />
                            Latar Belakang & Visi Aplikasi
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            SMK Manbaul Ulum Cirebon merupakan sekolah kejuruan terkemuka di Kabupaten Cirebon yang terus berinovasi dalam memanfaat teknologi informasi. **SIP MU Enterprise** lahir sebagai jawaban atas kebutuhan otomatisasi presensi harian guru dan staf, manajemen jam mengajar (JTM), pencatatan alpa/izin secara digital, serta transparansi penggajian.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                            <h3 className="text-lg font-bold text-indigo-300 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-indigo-400" /> Keunggulan Geofencing GPS
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Memastikan presensi kehadiran hanya dapat diproses ketika perangkat smartphone berada dalam radius presisi titik lokasi Kampus 1 maupun Kampus 2 SMK Manbaul Ulum Cirebon.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                            <h3 className="text-lg font-bold text-emerald-300 flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" /> Swafoto & Anti-Cheat
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Setiap presensi diverifikasi dengan foto kamera langsung (selfie) dan pengecekan integritas jaringan untuk mencegah praktik kecurangan titip absen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
