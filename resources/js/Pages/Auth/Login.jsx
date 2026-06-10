import { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCircle, Lock, LogIn, Loader2, Eye, EyeOff, ShieldCheck, ShieldX, Timer } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });
    
    const [showPassword, setShowPassword] = useState(false);

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
            <Head title="Sign In" />

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
                <p className="text-gray-500">Silakan masuk ke akun Anda untuk melanjutkan.</p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 text-sm font-medium text-green-600 border border-green-100">
                    {status}
                </div>
            )}

            {/* Login Error / Lockout Warning */}
            {errors.login && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-start gap-3 ${
                        errors.login.includes('dikunci') || errors.login.includes('locked')
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                >
                    {errors.login.includes('dikunci') || errors.login.includes('locked') ? (
                        <ShieldX className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                        <Timer className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span>{errors.login}</span>
                </motion.div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                >
                    <Label htmlFor="login" className="text-sm font-semibold text-gray-700">Email atau Username</Label>
                    <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            id="login"
                            type="text"
                            value={data.login}
                            className={`pl-11 h-12 bg-white border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl transition-all placeholder:text-gray-400/60 ${errors.login ? 'border-red-500' : ''}`}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="Email atau Username..."
                        />
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                >
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" title="Password" className="text-sm font-semibold text-gray-700">Password</Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Lupa Password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            className={`pl-11 pr-11 h-12 bg-white border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl transition-all placeholder:text-gray-400/60 ${errors.password ? 'border-red-500' : ''}`}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Masukkan password Anda..."
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                            tabIndex="-1"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center space-x-2"
                >
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <Label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer">
                        Ingat akun saya
                    </Label>
                </motion.div>

                {/* Security Honeypot Layer (Hidden from normal users) */}
                <input type="text" name="b_email" className="hidden" tabIndex="-1" autoComplete="off" />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100"
                >
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Koneksi aman terlindungi oleh enkripsi 256-bit</span>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 group active:scale-[0.98]"
                    >
                        {processing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Sign In ke SIP MU Enterprise</span>
                                <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </form>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-10 text-center"
            >
                <p className="text-sm text-gray-500">
                    Belum punya akun? <span className="text-indigo-600 font-bold">Hubungi Administrator</span>
                </p>
            </motion.div>
        </GuestLayout>
    );
}
