import { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCircle, Lock, LogIn, Loader2, Eye, EyeOff, ShieldCheck, ShieldX, Timer, KeyRound, Briefcase, GraduationCap, Info, QrCode } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Login({ status, canResetPassword }) {
    const { t } = useLanguage();
    const [loginMode, setLoginMode] = useState('pegawai'); // 'pegawai' | 'siswa'

    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        login_mode: 'pegawai',
        remember: false,
    });
    
    const [showPassword, setShowPassword] = useState(false);

    const handleSwitchMode = (mode) => {
        setLoginMode(mode);
        setData('login_mode', mode);
    };

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Sign In - SIP MU Enterprise" />

            {/* Header Form */}
            <div className="mb-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800/50 mb-3">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{t('login.auth_badge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    {t('login.welcome')}
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t('login.subtitle')}
                </p>
            </div>

            {/* Segmented Dual-Mode Role Selector */}
            <div className="mb-6 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center space-x-1 border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
                <button
                    type="button"
                    onClick={() => handleSwitchMode('pegawai')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                        loginMode === 'pegawai'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200/60 dark:ring-slate-700'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>{t('login.tab_employee')}</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleSwitchMode('siswa')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                        loginMode === 'siswa'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200/60 dark:ring-slate-700'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>{t('login.tab_student')}</span>
                </button>
            </div>

            {/* Status Message (e.g. Password Reset Successful) */}
            {status && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center space-x-3"
                >
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{status}</span>
                </motion.div>
            )}

            {/* Login Error / Lockout Warning Alert */}
            {errors.login && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-start space-x-3 shadow-sm ${
                        errors.login.includes('dikunci') || errors.login.includes('locked')
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50'
                    }`}
                >
                    {errors.login.includes('dikunci') || errors.login.includes('locked') ? (
                        <ShieldX className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                        <Timer className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{errors.login}</span>
                </motion.div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Contextual Helper Tip for Siswa Mode */}
                <AnimatePresence mode="wait">
                    {loginMode === 'siswa' && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-start space-x-2.5 shadow-sm"
                        >
                            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{t('login.student_tip')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Username / Email / NIS Input */}
                <motion.div 
                    initial={{ x: 15, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                >
                    <Label htmlFor="login" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        {loginMode === 'siswa' ? t('login.label_student_login') : t('login.label_login')}
                    </Label>
                    <div className="relative group">
                        {loginMode === 'siswa' ? (
                            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        ) : (
                            <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        )}
                        <Input
                            id="login"
                            type="text"
                            value={data.login}
                            className={`pl-11 h-12 bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 rounded-2xl text-sm font-semibold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal ${errors.login ? 'border-rose-500 bg-rose-50/30' : ''}`}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder={loginMode === 'siswa' ? t('login.placeholder_student_login') : t('login.placeholder_login')}
                        />
                    </div>
                </motion.div>

                {/* Password Input */}
                <motion.div 
                    initial={{ x: 15, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-2"
                >
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            {t('login.label_password')}
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                            >
                                {t('login.forgot_password')}
                            </Link>
                        )}
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            className={`pl-11 pr-11 h-12 bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 rounded-2xl text-sm font-semibold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal ${errors.password ? 'border-rose-500 bg-rose-50/30' : ''}`}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t('login.placeholder_password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                            tabIndex="-1"
                            aria-label="Toggle Password Visibility"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.password}</p>}
                </motion.div>

                {/* Remember Me Checkbox */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center space-x-2 pt-1"
                >
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', checked)}
                        className="rounded-lg border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <Label htmlFor="remember" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                        {t('login.remember_me')}
                    </Label>
                </motion.div>

                {/* Security Honeypot Layer (Anti-Bot Hidden Field) */}
                <input type="text" name="b_email" className="hidden" tabIndex="-1" autoComplete="off" />

                {/* 256-Bit SSL Security Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700"
                >
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {t('login.ssl_badge')}
                    </span>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="pt-2"
                >
                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 transition-all flex items-center justify-center space-x-2 group active:scale-[0.98]"
                    >
                        {processing ? (
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                        ) : (
                            <>
                                <span>{t('login.submit_btn')}</span>
                                <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </form>

            {/* Standalone Kiosk Quick Action */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
            >
                <Link
                    href="/student-attendance/kiosk"
                    className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 px-4 py-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 transition-all shadow-sm group"
                >
                    <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Mode Pemindai Kiosk QR Code Siswa (Standalone)</span>
                </Link>
            </motion.div>

            {/* Administrator Note */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-6 text-center pt-6 border-t border-slate-100 dark:border-slate-800"
            >
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('login.help_contact')} <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{t('login.help_admin')}</span>
                </p>
            </motion.div>
        </GuestLayout>
    );
}
