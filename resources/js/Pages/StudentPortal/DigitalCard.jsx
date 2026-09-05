import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { QrCode, Download, ShieldCheck, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DigitalCard({ auth, student }) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(student.qr_token || student.nis)}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Kartu Presensi Digital — ${student.name}`} />

            <div className="max-w-xl mx-auto space-y-6 pb-12">
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Kartu Digital QR Code Siswa
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">
                        Gunakan Kartu Digital ini untuk dipindai di terminal Kiosk gerbang sekolah
                    </p>
                </div>

                {/* Digital Card ID Badge */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-[2rem] p-8 shadow-2xl border border-indigo-500/30">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    {/* School Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-indigo-500/20">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">SMK Manbaul Ulum Cirebon</p>
                            <h3 className="text-sm font-black text-white">Kartu Presensi Siswa Digital</h3>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Student Info & QR Code */}
                    <div className="py-8 flex flex-col items-center text-center space-y-6">
                        <div className="bg-white p-4 rounded-3xl shadow-xl ring-8 ring-white/10">
                            <img
                                src={qrUrl}
                                alt={`QR Code ${student.name}`}
                                className="w-48 h-48 object-contain"
                            />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white">{student.name}</h2>
                            <p className="text-xs text-indigo-300 font-semibold">
                                NIS: <span className="font-mono font-bold text-white">{student.nis}</span> | Kelas: <span className="font-bold text-white">{student.school_class?.name || '-'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Status: <span className="text-emerald-400 font-bold uppercase">Aktif</span></span>
                        <span className="font-mono text-[10px]">{student.qr_token}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="rounded-xl font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Cetak Kartu Digital
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
