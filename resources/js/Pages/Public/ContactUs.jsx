import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Mail, Phone, MapPin, Globe, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUs({ auth }) {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.name && form.email && form.message) {
            setSubmitted(true);
        }
    };

    return (
        <PublicLayout title="Hubungi Kami (Contact Us)" auth={auth}>
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                        <Mail className="w-4 h-4" />
                        <span>Layanan Layanan Kontak Resmi</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        Hubungi Kami <span className="text-blue-400">(Contact Us)</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                        Punya pertanyaan seputar aplikasi SIP MU Enterprise atau butuh bantuan teknis? Hubungi tim support resmi SMK Manbaul Ulum Cirebon di bawah ini.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Contact Cards */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3" /> Informasi Kontak
                            </h3>

                            <div className="space-y-4 text-xs sm:text-sm">
                                <div className="flex items-start space-x-3 text-slate-300">
                                    <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-white">Alamat Kampus Utama</p>
                                        <p className="text-slate-400">Jl. Raya Nyi Ageng Serang No. 65, Sindangjawa, Kec. Dukupuntang, Kab. Cirebon, Jawa Barat 45652</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 text-slate-300">
                                    <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-white">WhatsApp & Telepon</p>
                                        <p className="text-slate-400">0896-7585-7809</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 text-slate-300">
                                    <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-white">Email Dukungan Layanan</p>
                                        <p className="text-slate-400">admin@sipmuenterprise.my.id</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 text-slate-300">
                                    <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-white">Jam Operasional Layanan</p>
                                        <p className="text-slate-400">Senin - Sabtu: 07.00 - 15.30 WIB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Maps Card */}
                        <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.123!2d108.4359!3d-6.7622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f1d9a1b2c3d4e%3A0x1234567890abcdef!2sSMK+Manbaul+Ulum+Cirebon!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                                width="100%"
                                height="220"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi SMK Manbaul Ulum Cirebon"
                            />
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Send className="w-5 h-5 mr-3 text-indigo-400" />
                            Kirim Pesan Layanan Bantuan
                        </h3>

                        {submitted ? (
                            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                                <h4 className="text-lg font-bold text-white">Pesan Berhasil Terkirim!</h4>
                                <p className="text-xs text-slate-300">Terima kasih telah menghubungi kami. Tim admin SIP MU Enterprise akan memproses pesan Anda secepatnya.</p>
                                <button onClick={() => setSubmitted(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl">
                                    Kirim Pesan Lain
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({...form, name: e.target.value})}
                                        placeholder="Masukkan nama lengkap"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1">Alamat Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({...form, email: e.target.value})}
                                        placeholder="nama@email.com"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1">Subjek Pesan</label>
                                    <input
                                        type="text"
                                        value={form.subject}
                                        onChange={(e) => setForm({...form, subject: e.target.value})}
                                        placeholder="Pertanyaan presensi / Kendala login"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1">Isi Pesan *</label>
                                    <textarea
                                        rows="4"
                                        required
                                        value={form.message}
                                        onChange={(e) => setForm({...form, message: e.target.value})}
                                        placeholder="Tuliskan pertanyaan atau informasi kendala Anda..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all"
                                >
                                    Kirim Pesan Sekarang
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
