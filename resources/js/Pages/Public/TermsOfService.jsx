import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { FileText, Shield, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function TermsOfService({ auth }) {
    return (
        <PublicLayout title="Syarat & Ketentuan (Terms of Service)" auth={auth}>
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-4">
                        <FileText className="w-4 h-4" />
                        <span>Ketentuan Penggunaan Sistem Aplikasi</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Syarat & Ketentuan <span className="text-purple-400">(Terms of Service)</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Syarat dan Ketentuan berikut mengatur hak, kewajiban, serta batasan lisensi pengguna dalam mengoperasikan sistem informasi presensi **SIP MU Enterprise**.
                    </p>
                    <p className="text-slate-500 text-xs mt-3 font-mono">Berlaku Efektif: 19 Agustus 2026</p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl backdrop-blur-sm text-slate-300 text-sm sm:text-base leading-relaxed">
                    
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mr-3 text-sm">1</span>
                            Penerimaan Ketentuan
                        </h2>
                        <p className="text-slate-300 pl-11">
                            Dengan mengakses situs web `sipmuenterprise.my.id` atau menggunakan aplikasi SIP MU Enterprise, Anda menyatakan bersedia untuk terikat oleh Syarat dan Ketentuan ini, serta seluruh hukum dan peraturan tata tertib kepegawaian yang berlaku di SMK Manbaul Ulum Cirebon.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mr-3 text-sm">2</span>
                            Akun & Keamanan Kredensial
                        </h2>
                        <div className="pl-11 space-y-2 text-slate-300">
                            <p>Sebagai pengguna terdaftar (Guru/Staf/Manajemen):</p>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-sm">
                                <li>Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi (*password*) dan aktivitas yang terjadi di dalam akun Anda.</li>
                                <li>Setiap tindakan pemalsuan presensi, manipulasi lokasi GPS (Fake GPS), atau penggunaan identitas orang lain secara tidak sah akan berakibat pada sanksi administratif dan pemblokiran akun.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mr-3 text-sm">3</span>
                            Hak Cipta & Kehakimilikan Intelektual
                        </h2>
                        <p className="text-slate-300 pl-11">
                            Seluruh desain antarmuka, kode sumber, logo, serta merek **SIP MU Enterprise** adalah milik hak cipta resmi SMK Manbaul Ulum Cirebon. Dilarang keras menggandakan, mendistribusikan ulang, atau mengalihkan lisensi tanpa izin tertulis dari pihak sekolah.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mr-3 text-sm">4</span>
                            Layanan Pihak Ketiga & Iklan
                        </h2>
                        <p className="text-slate-300 pl-11">
                            Situs ini dapat menampilkan tautan atau unit iklan publik dari mitra seperti Google AdSense. Kami tidak bertanggung jawab atas isi konten eksternal atau kebijakan privasi dari situs pihak ketiga yang ditautkan di luar domain resmi kami.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mr-3 text-sm">5</span>
                            Perubahan Ketentuan Layanan
                        </h2>
                        <p className="text-slate-300 pl-11">
                            SMK Manbaul Ulum Cirebon berhak untuk memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan berlaku secara langsung setelah diunggah ke halaman ini.
                        </p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
