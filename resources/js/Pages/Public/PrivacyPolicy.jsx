import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, Server, Globe } from 'lucide-react';

export default function PrivacyPolicy({ auth }) {
    return (
        <PublicLayout title="Kebijakan Privasi (Privacy Policy)" auth={auth}>
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Header Badge */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Kepatuhan Keamanan & Privasi Data</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Kebijakan Privasi <span className="text-indigo-400">(Privacy Policy)</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Dokumen Kebijakan Privasi ini menjelaskan bagaimana **SIP MU Enterprise** (SMK Manbaul Ulum Cirebon) mengumpulkan, mengolah, melindungi, dan menggunakan informasi data pengguna serta penggunaan jaringan iklan Google AdSense.
                    </p>
                    <p className="text-slate-500 text-xs mt-3 font-mono">Terakhir Diperbarui: 19 Agustus 2026</p>
                </div>

                {/* Main Content Box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-10 shadow-2xl backdrop-blur-sm text-slate-300 text-sm sm:text-base leading-relaxed">
                    
                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mr-3 text-sm">1</span>
                            Pengantar & Komitmen Privasi
                        </h2>
                        <p className="text-slate-300 pl-11">
                            Selamat datang di situs web sistem aplikasi **SIP MU Enterprise** (`https://sipmuenterprise.my.id`). Kami menghormati hak privasi Anda dan berkomitmen penuh untuk melindungi informasi pribadi maupun data kehadiran pegawai/guru yang terdaftar pada platform kami.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mr-3 text-sm">2</span>
                            Informasi yang Kami Kumpulkan
                        </h2>
                        <div className="pl-11 space-y-2">
                            <p>Dalam menjalankan ekosistem presensi digital pegawai dan siswa, kami dapat mengumpulkan informasi berikut:</p>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-sm">
                                <li>**Informasi Identitas Pegawai & Siswa:** Nama lengkap, NIP/NUPTK/NIS, email resmi, nomor WhatsApp, kelas diampu/diikuti, serta jabatan/wewenang di SMK Manbaul Ulum Cirebon.</li>
                                <li>**Data Presensi & Token QR:** Koordinat GPS (Latitude & Longitude) real-time, foto selfie pegawai saat presensi, serta QR Token terenkripsi untuk presensi siswa di Standalone Kiosk.</li>
                                <li>**Log Perangkat & Berkas Surat Izin:** Informasi browser, alamat IP, file surat pengajuan izin/sakit yang diunggah oleh pengguna (pegawai, siswa, atau wali murid).</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 - Critical for AdSense Compliance */}
                    <section className="space-y-3 p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
                        <h2 className="text-xl font-bold text-indigo-300 flex items-center">
                            <Lock className="w-5 h-5 mr-3 text-indigo-400" />
                            Penggunaan Cookie & Google AdSense
                        </h2>
                        <div className="space-y-2 text-slate-300">
                            <p>
                                Platform kami menyajikan konten publik serta artikel edukasi dan menggunakan layanan iklan pihak ketiga seperti **Google AdSense**.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm">
                                <li>Google sebagai vendor pihak ketiga menggunakan cookie untuk menayangkan iklan di situs kami berdasarkan kunjungan pengguna sebelumnya ke situs ini atau situs lainnya di internet.</li>
                                <li>Penggunaan **Cookie DART** memungkinkan Google dan mitranya untuk menayangkan iklan kepada pengguna berdasarkan kunjungan mereka ke situs kami dan/atau situs lainnya di internet.</li>
                                <li>Pengguna dapat memilih untuk mengurutkan atau membatalkan penggunaan cookie DART dengan mengunjungi <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-semibold">Kebijakan Privasi Iklan dan Jaringan Konten Google</a>.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mr-3 text-sm">3</span>
                            Tujuan Penggunaan Data
                        </h2>
                        <div className="pl-11 space-y-2">
                            <p>Data yang dikumpulkan digunakan secara eksklusif untuk:</p>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-sm">
                                <li>Memvalidasi presensi dan tingkat kedisiplinan pegawai sekolah secara akurat.</li>
                                <li>Menghitung Rekapitulasi Jam Terhitung Mengajar (JTM) dan kalkulasi penggajian internal.</li>
                                <li>Mengirim notifikasi keterlambatan atau status approval pengajuan izin melalui WhatsApp API resmi.</li>
                                <li>Meningkatkan kualitas konten edukasi publik dan stabilitas performa sistem web.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mr-3 text-sm">4</span>
                            Keamanan & Perlindungan Data
                        </h2>
                        <p className="text-slate-300 pl-11">
                            Kami menerapkan enkripsi HTTPS standar industri, proteksi hash password BCRYPT, serta kontrol otorisasi bertingkat (*Role-Based Access Control*) untuk menjamin bahwa data presensi dan informasi pribadi Anda tidak dapat diakses oleh pihak luar yang tidak berwenang.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mr-3 text-sm">5</span>
                            Kontak Resmi Tim Privasi
                        </h2>
                        <p className="text-slate-300 pl-11">
                            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin mengajukan permintaan pembaruan data, silakan hubungi tim administrasi kami via email di <span className="text-indigo-400 font-bold">admin@sipmuenterprise.my.id</span> atau melalui halaman <a href="/contact" className="text-indigo-400 underline font-semibold">Kontak Kami</a>.
                        </p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
