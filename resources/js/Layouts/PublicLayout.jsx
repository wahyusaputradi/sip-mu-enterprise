import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Globe, MapPin, Phone, Menu, X, FileText, Lock, Info, Mail, BookOpen } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import LanguageToggle from '@/Components/LanguageToggle';
import PwaInstallPrompt from '@/Components/PwaInstallPrompt';

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg>
);
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

export default function PublicLayout({ children, title, auth }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const socials = [
        { label: "WhatsApp Official", value: "0896-7585-7809", href: "https://wa.me/6289675857809", icon: <Phone className="w-5 h-5" /> },
        { label: "TikTok Official", value: "@smkmanbaululum", href: "https://www.tiktok.com/@smkmanbaululum", icon: <TikTokIcon /> },
        { label: "Instagram Official", value: "@smkmanbaululumcirebon", href: "https://www.instagram.com/smkmanbaululumcirebon/", icon: <InstagramIcon /> },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
            <Head title={title ? `${title} - SIP MU Enterprise` : "SIP MU Enterprise"} />

            {/* Navbar Header */}
            <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <ApplicationLogo className="h-10 w-10 sm:h-11 sm:w-11 transition-transform group-hover:scale-105" />
                        <div>
                            <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center">
                                SIP MU <span className="text-indigo-400 ml-1">Enterprise</span>
                            </span>
                            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">SMK Manbaul Ulum Cirebon</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
                        <Link href="/" className="text-slate-300 hover:text-white transition-colors">Beranda</Link>
                        <Link href="/about" className="text-slate-300 hover:text-white transition-colors">Tentang Kami</Link>
                        <Link href="/articles" className="text-slate-300 hover:text-white transition-colors">Artikel & Edukasi</Link>
                        <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">Kontak</Link>
                        <Link href="/privacy-policy" className="text-slate-300 hover:text-white transition-colors">Kebijakan Privasi</Link>
                    </nav>

                    {/* Action Controls */}
                    <div className="hidden md:flex items-center space-x-3">
                        <ThemeToggle />
                        <LanguageToggle />
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 text-sm flex items-center transition-all"
                            >
                                Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 text-sm flex items-center transition-all"
                            >
                                Masuk Sistem <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center space-x-2 md:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-3"
                        >
                            <Link href="/" className="block py-2 text-sm font-semibold text-slate-300 hover:text-white">Beranda</Link>
                            <Link href="/about" className="block py-2 text-sm font-semibold text-slate-300 hover:text-white">Tentang Kami</Link>
                            <Link href="/articles" className="block py-2 text-sm font-semibold text-slate-300 hover:text-white">Artikel & Edukasi</Link>
                            <Link href="/contact" className="block py-2 text-sm font-semibold text-slate-300 hover:text-white">Kontak</Link>
                            <Link href="/privacy-policy" className="block py-2 text-sm font-semibold text-slate-300 hover:text-white">Kebijakan Privasi</Link>
                            <Link href="/terms-of-service" className="block py-2 text-sm font-semibold text-slate-300 hover:text-white">Syarat & Ketentuan</Link>
                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                <LanguageToggle />
                                {auth?.user ? (
                                    <Link href={route('dashboard')} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs">Dashboard</Link>
                                ) : (
                                    <Link href={route('login')} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs">Masuk Sistem</Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Public Footer Compliance for AdSense */}
            <footer className="bg-slate-900 text-white mt-auto border-t border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        
                        {/* Col 1: Brand Info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <ApplicationLogo className="h-10 w-10 bg-white/10 rounded-xl p-1.5 border border-white/10" />
                                <div>
                                    <h3 className="text-base font-black tracking-tight">SIP MU <span className="text-indigo-400">Enterprise</span></h3>
                                    <p className="text-slate-400 text-xs">Presensi & Kehadiran Digital</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                Sistem Informasi Presensi dan Tata Kelola Kehadiran Pegawai Resmi SMK Manbaul Ulum Cirebon Berbasis Geofencing & Foto Swafoto Realtime.
                            </p>
                            <a
                                href="https://smkmucirebon.sch.id/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-600/30 transition-colors border border-indigo-500/20"
                            >
                                <Globe className="w-3.5 h-3.5 mr-1.5" /> smkmucirebon.sch.id
                            </a>
                        </div>

                        {/* Col 2: Halaman Legal & Informasi */}
                        <div>
                            <h4 className="text-sm font-extrabold mb-4 flex items-center text-white">
                                <span className="w-6 h-1 bg-indigo-500 rounded-full mr-2" /> Halaman Resmi
                            </h4>
                            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                                <li>
                                    <Link href="/about" className="hover:text-indigo-400 transition-colors flex items-center">
                                        <Info className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Tentang Kami
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/articles" className="hover:text-indigo-400 transition-colors flex items-center">
                                        <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Portal Artikel & Edukasi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="hover:text-indigo-400 transition-colors flex items-center">
                                        <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Hubungi Kami
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy-policy" className="hover:text-indigo-400 transition-colors flex items-center">
                                        <Lock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Kebijakan Privasi (Privacy Policy)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms-of-service" className="hover:text-indigo-400 transition-colors flex items-center">
                                        <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Syarat & Ketentuan (Terms of Service)
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Social & Contact */}
                        <div>
                            <h4 className="text-sm font-extrabold mb-4 flex items-center text-white">
                                <span className="w-6 h-1 bg-indigo-500 rounded-full mr-2" /> Kontak Resmi
                            </h4>
                            <div className="space-y-3">
                                {socials.map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2.5 group"
                                    >
                                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 border border-slate-700">
                                            {s.icon}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                                            <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">{s.value}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Col 4: Maps */}
                        <div>
                            <h4 className="text-sm font-extrabold mb-4 flex items-center text-white">
                                <span className="w-6 h-1 bg-indigo-500 rounded-full mr-2" /> Lokasi Kampus
                            </h4>
                            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-lg mb-2.5">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.123!2d108.4359!3d-6.7622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f1d9a1b2c3d4e%3A0x1234567890abcdef!2sSMK+Manbaul+Ulum+Cirebon!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                                    width="100%"
                                    height="130"
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
                                className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                            >
                                <MapPin className="w-3.5 h-3.5 mr-1" /> Google Maps SMK MU Cirebon
                            </a>
                        </div>

                    </div>
                </div>

                {/* Copyright Line */}
                <div className="border-t border-slate-800/80 py-5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                        <p>&copy; {new Date().getFullYear()} SIP MU Enterprise — SMK Manbaul Ulum Cirebon. All Rights Reserved.</p>
                        <div className="flex items-center space-x-4">
                            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
                            <span>•</span>
                            <Link href="/terms-of-service" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
                            <span>•</span>
                            <Link href="/sitemap.xml" target="_blank" className="hover:text-slate-400 transition-colors">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </footer>

            <PwaInstallPrompt />
        </div>
    );
}
