import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function GuestLayout({ children, title = "SIP MU Enterprise" }) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Branding & Visuals (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-950">
                {/* Animated Background Gradients */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0"
                >
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-blue-600 to-emerald-500 blur-[120px]" />
                </motion.div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center space-x-3">
                            <ApplicationLogo className="h-12 w-12 fill-current text-white shrink-0" />
                            <span className="text-2xl font-bold tracking-tight whitespace-nowrap">SIP MU <span className="text-indigo-400">Enterprise</span></span>
                        </div>
                    </motion.div>

                    <div className="max-w-md">
                        <motion.h1 
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="text-5xl font-extrabold leading-tight mb-6"
                        >
                            Sistem Terintegrasi <br/>
                            <span className="text-indigo-400">Presensi & Kehadiran.</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="text-lg text-indigo-200/80 leading-relaxed"
                        >
                            Efisiensi operasional pendidikan melalui manajemen kehadiran cerdas dan pencatatan presensi digital yang akurat.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-sm font-semibold text-indigo-300/80 tracking-wide"
                    >
                        &copy; 2026 SIP MU Enterprise - SMK Manbaul Ulum Cirebon
                    </motion.div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
                />
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50/50 min-h-screen">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center space-x-3">
                             <ApplicationLogo className="h-10 w-10 shrink-0" />
                             <span className="text-xl font-bold text-gray-900 leading-tight whitespace-nowrap">SIP MU <span className="text-indigo-600">Enterprise</span></span>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        {children}
                    </div>
                </motion.div>

                {/* Mobile Copyright Footer */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:hidden mt-8 text-center"
                >
                    <p className="text-xs font-semibold text-gray-400 tracking-wide">
                        &copy; 2026 SIP MU Enterprise <br/> SMK Manbaul Ulum Cirebon
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
