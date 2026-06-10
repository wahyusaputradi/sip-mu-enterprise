import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Save, Lock, Mail, User as UserIcon, Eye, EyeOff, ShieldAlert, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Password Strength Calculator
const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '', width: '0%' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
        { label: 'Sangat Lemah', color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400', width: '20%' },
        { label: 'Lemah', color: 'bg-orange-500', textColor: 'text-orange-600 dark:text-orange-400', width: '40%' },
        { label: 'Cukup', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', width: '60%' },
        { label: 'Kuat', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', width: '80%' },
        { label: 'Sangat Kuat', color: 'bg-emerald-600', textColor: 'text-emerald-700 dark:text-emerald-300', width: '100%' },
    ];

    const idx = Math.min(score, 5) - 1;
    return idx >= 0 ? { score, ...levels[idx] } : { score: 0, label: '', color: '', textColor: '', width: '0%' };
};

export default function Edit({ auth, user }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        email: user.email,
        username: user.username || '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const passwordStrength = useMemo(() => getPasswordStrength(data.password), [data.password]);
    const passwordsMatch = data.password && data.password_confirmation && data.password === data.password_confirmation;
    const passwordsMismatch = data.password && data.password_confirmation && data.password !== data.password_confirmation;

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmDialog(true);
    };

    const confirmSubmit = () => {
        setShowConfirmDialog(false);
        post(route('account.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('current_password', 'password', 'password_confirmation');
                toast.success('Pengaturan akun berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal memperbarui pengaturan akun. Silakan periksa isian Anda.');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Pengaturan Akun</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Kelola kredensial login dan keamanan akun Anda.</p>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Akun" />

            <div className="max-w-3xl">
                <div className="bg-white dark:bg-card rounded-[2rem] shadow-sm border border-slate-100 dark:border-border overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Peringatan Keamanan */}
                        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl p-5 flex items-start gap-4">
                            <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl shrink-0">
                                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-800 dark:text-rose-300">Konfirmasi Keamanan</h3>
                                <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">Anda wajib memasukkan password saat ini untuk dapat mengubah email, username, atau password baru. Ini adalah langkah keamanan untuk melindungi akun Anda.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Password Saat Ini */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Password Saat Ini <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                        <Lock className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={data.current_password}
                                        onChange={e => setData('current_password', e.target.value)}
                                        className="w-full pl-10 pr-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 h-12 transition-all"
                                        placeholder="Masukkan password saat ini"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                                        tabIndex="-1"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.current_password && <p className="text-sm text-rose-500 mt-1.5 font-medium">{errors.current_password}</p>}
                            </div>

                            <hr className="border-slate-100 dark:border-border" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Email */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <Mail className="w-4 h-4 text-slate-400" /> Alamat Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 h-12 transition-all"
                                        placeholder="Masukkan Alamat Email"
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-rose-500 mt-1.5 font-medium">{errors.email}</p>}
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <UserIcon className="w-4 h-4 text-slate-400" /> Username <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={e => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 h-12 transition-all"
                                        placeholder="Masukkan Username"
                                        maxLength={30}
                                    />
                                    <div className="flex items-start gap-1.5 mt-1.5">
                                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-400">Huruf kecil, angka, titik, underscore. Min. 3 karakter.</p>
                                    </div>
                                    {errors.username && <p className="text-sm text-rose-500 mt-1 font-medium">{errors.username}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Password Baru */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <Lock className="w-4 h-4 text-slate-400" /> Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            placeholder="Biarkan kosong jika tidak diubah"
                                            className="w-full pr-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 h-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                                            tabIndex="-1"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {/* Password Strength Indicator */}
                                    {data.password && (
                                        <div className="mt-2 space-y-1.5">
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                                                    style={{ width: passwordStrength.width }}
                                                />
                                            </div>
                                            <p className={`text-xs font-bold ${passwordStrength.textColor}`}>
                                                Kekuatan: {passwordStrength.label}
                                            </p>
                                            {/* Requirements Checklist */}
                                            <div className="grid grid-cols-2 gap-1 mt-2">
                                                {[
                                                    { test: data.password.length >= 8, label: 'Min. 8 karakter' },
                                                    { test: /[A-Z]/.test(data.password), label: 'Huruf besar (A-Z)' },
                                                    { test: /[a-z]/.test(data.password), label: 'Huruf kecil (a-z)' },
                                                    { test: /\d/.test(data.password), label: 'Angka (0-9)' },
                                                    { test: /[^a-zA-Z0-9]/.test(data.password), label: 'Simbol (!@#$)' },
                                                ].map((req, i) => (
                                                    <div key={i} className="flex items-center gap-1.5">
                                                        {req.test ? (
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                                                        )}
                                                        <span className={`text-[10px] font-medium ${req.test ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{req.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {errors.password && <p className="text-sm text-rose-500 mt-1 font-medium">{errors.password}</p>}
                                </div>

                                {/* Konfirmasi Password Baru */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Konfirmasi Password Baru</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi password baru"
                                            className="w-full pr-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 h-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                                            tabIndex="-1"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {/* Password Match Indicator */}
                                    {data.password_confirmation && (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            {passwordsMatch ? (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Password cocok</span>
                                                </>
                                            ) : passwordsMismatch ? (
                                                <>
                                                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Password tidak cocok</span>
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-border">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98]"
                            >
                                <Save className="w-5 h-5" />
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Login Info Card */}
                <div className="mt-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">Informasi Login</h4>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 leading-relaxed">
                                Anda dapat login ke sistem menggunakan <strong>email</strong> atau <strong>username</strong>. 
                                Pastikan username Anda unik dan mudah diingat. Username bersifat opsional — jika tidak diisi, 
                                Anda tetap bisa login menggunakan email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmDialog(false)} />
                    <div className="relative bg-white dark:bg-card rounded-3xl shadow-2xl border border-slate-100 dark:border-border p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-5">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Konfirmasi Perubahan</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Anda yakin ingin menyimpan perubahan pada pengaturan akun? Pastikan semua data yang diisi sudah benar.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmSubmit}
                                disabled={processing}
                                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
                            >
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
