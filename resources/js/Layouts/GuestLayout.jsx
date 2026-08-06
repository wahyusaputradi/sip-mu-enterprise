import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Zap, MapPin, CheckCircle2 } from 'lucide-react';

export default function GuestLayout({ children, title = "SIP MU Enterprise" }) {
    return (
        <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Left Side: Branding & Visuals (Desktop > 1024px) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
                {/* Animated Ambient Background Gradients */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-transparent blur-[140px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[65%] h-[65%] rounded-full bg-gradient-to-tl from-sky-600/40 via-emerald-600/30 to-transparent blur-[140px]" />
                    <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-rose-500/20 blur-[100px]" />
                </motion.div>

                <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 text-white w-full">
                    {/* Header Logo */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link href="/" className="inline-flex items-center space-x-3 group">
                            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 group-hover:border-indigo-400/40 transition-colors">
                                <ApplicationLogo className="h-9 w-9 fill-current text-white shrink-0" />
                            </div>
                            <div>
                                <span className="text-2xl font-black tracking-tight text-white block leading-none">
                                    SIP MU <span className="text-indigo-400">Enterprise</span>
                                </span>
                                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1 block">
                                    SMK Manbaul Ulum Cirebon
                                </span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Middle Hero Text & Feature Cards */}
                    <div className="max-w-xl my-auto py-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-6 backdrop-blur-md">
                                <Zap className="w-3.5 h-3.5 mr-2 text-indigo-400" /> System Authentication Gateway
                            </span>

                            <h1 className="text-4xl lg:text-5xl font-black leading-[1.15] mb-6 text-white tracking-tight">
                                Sistem Terintegrasi<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-400">
                                    Presensi & Kehadiran.
                                </span>
                            </h1>
                            
                            <p className="text-base text-slate-300 font-medium leading-relaxed mb-10">
                                Efisiensi operasional tata kelola SDM sekolah melalui presensi Geofencing GPS presisi, verifikasi swafoto real-time, serta pencatatan kehadiran terotomatisasi.
                            </p>

                            {/* Floating Feature Badges */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Geofencing Valid</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Kampus 1 & Kampus 2</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Enkripsi 256-Bit</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Autentikasi Aman SSL</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Footer */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-6 border-t border-white/10"
                    >
                        <span>&copy; {new Date().getFullYear()} SIP MU Enterprise</span>
                        <span className="text-indigo-400 font-bold">v2.0 — Production</span>
                    </motion.div>
                </div>

                {/* Decorative Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} 
                />
            </div>

            {/* Right Side: Login Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen relative">
                {/* Back to Home Link & Theme Toggle */}
                <div className="flex justify-between items-center w-full max-w-md mx-auto mb-6">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Beranda Utama
                    </Link>
                    <div className="flex items-center space-x-3">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:inline-block">
                            Sign In Portal
                        </span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="my-auto w-full max-w-md mx-auto">
                    {/* Mobile Brand Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                                <ApplicationLogo className="h-8 w-8 shrink-0" />
                            </div>
                            <span className="text-xl font-black text-slate-900 leading-tight">
                                SIP MU <span className="text-indigo-600">Enterprise</span>
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500">SMK Manbaul Ulum Cirebon</p>
                    </div>

                    {/* Card Container */}
                    <motion.div 
                        initial={{ scale: 0.96, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none border border-slate-200/80 dark:border-slate-800 relative overflow-hidden"
                    >
                        {children}
                    </motion.div>
                </div>

                {/* Footer Credits */}
                <div className="text-center pt-8 text-xs font-medium text-slate-400">
                    &copy; {new Date().getFullYear()} SIP MU Enterprise — SMK Manbaul Ulum Cirebon. All Rights Reserved.
                </div>
            </div>
        </div>
    );
}
