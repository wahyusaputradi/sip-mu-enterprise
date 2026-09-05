import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, UserX, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NoProfile({ auth, message }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Profil Siswa Tidak Ditemukan" />

            <div className="max-w-md mx-auto py-12">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                        <UserX className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Profil Siswa Belum Terhubung</h3>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            {message || 'Akun Anda belum dihubungkan dengan data NIS/Siswa di sekolah. Silakan hubungi Administrator atau Wali Kelas.'}
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={() => window.history.back()}
                            variant="outline"
                            className="rounded-xl font-bold"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                        </Button>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
