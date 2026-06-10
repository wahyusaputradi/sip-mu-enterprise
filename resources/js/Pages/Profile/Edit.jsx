import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { motion } from 'framer-motion';
import { User, Shield, AlertTriangle } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Saya</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Kelola informasi pribadi dan keamanan akun Anda</p>
                    </div>
                </div>
            }
        >
            <Head title="Profil Saya" />

            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Informasi Pribadi</h3>
                    </div>
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </motion.div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Keamanan & Sandi</h3>
                    </div>
                    <UpdatePasswordForm className="max-w-xl" />
                </motion.div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-rose-50/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-rose-900">Zona Berbahaya</h3>
                    </div>
                    <DeleteUserForm className="max-w-xl" />
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
