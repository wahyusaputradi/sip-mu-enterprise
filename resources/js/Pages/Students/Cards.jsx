import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Filter, Search, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function StudentCards({ auth, students, schoolClasses, filters }) {
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [search, setSearch] = useState(filters.search || '');

    const handleFilterChange = (c, s) => {
        router.get(
            route('students.cards'),
            { class_id: c, search: s },
            { preserveState: true, replace: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Printer className="w-3 h-3 mr-1.5" /> Batch Print Kartu Pelajar
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Cetak Kartu Pelajar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Ber-QR Code</span>
                        </h2>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button onClick={() => router.visit(route('students.index'))} variant="outline" className="rounded-xl font-bold">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Data Siswa
                        </Button>
                        <Button onClick={handlePrint} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Printer className="w-4 h-4 mr-2" /> Cetak Semua Kartu (PDF)
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Cetak Kartu Pelajar QR Code" />

            <div className="space-y-6 pb-12">
                {/* Print Filter Bar */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Pilih Kelas</label>
                            <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); handleFilterChange(v, search); }}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Kelas ({students.length} Siswa)</SelectItem>
                                    {schoolClasses.map(c => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Cari Nama Siswa</label>
                            <Input
                                type="text"
                                placeholder="Ketik nama siswa..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); handleFilterChange(selectedClass, e.target.value); }}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </Card>

                {/* Printable Student ID Cards Layout (Grid 2 Column per Page) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
                    {students.length === 0 ? (
                        <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-semibold print:hidden">
                            Tidak ada siswa yang dipilih untuk dicetak.
                        </div>
                    ) : (
                        students.map((student) => (
                            <div key={student.id} className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden flex flex-col justify-between h-[270px] print:h-[260px] print:break-inside-avoid print:shadow-none print:border-slate-800">
                                
                                {/* Background Watermark Icon */}
                                <ShieldCheck className="w-48 h-48 absolute -right-10 -bottom-10 opacity-5 pointer-events-none" />

                                {/* Card Header */}
                                <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3 z-10">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-indigo-300 border border-white/20">
                                            MU
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black tracking-widest text-indigo-300 uppercase">SMK MANBAUL ULUM</h4>
                                            <p className="text-[9px] font-bold text-slate-300 tracking-wider">KARTU PELAJAR RESMI</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                                        {student.school_class?.name || 'SMK'}
                                    </span>
                                </div>

                                {/* Card Content Body */}
                                <div className="flex items-center justify-between my-2 z-10">
                                    <div className="space-y-1 max-w-[210px]">
                                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Nama Lengkap</p>
                                        <h3 className="text-lg font-black tracking-tight text-white line-clamp-1">{student.name}</h3>
                                        <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400">NIS</p>
                                                <p className="font-mono font-bold text-white">{student.nis}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400">NISN</p>
                                                <p className="font-mono font-bold text-white">{student.nisn || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Encrypted QR Code Render */}
                                    <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-indigo-400/50 shrink-0">
                                        <QRCodeSVG
                                            value={student.qr_token || student.nis}
                                            size={90}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between border-t border-indigo-500/20 pt-2 text-[9px] font-bold text-slate-400 z-10">
                                    <span>Presensi QR Code • Fast-Track Gate System</span>
                                    <span className="font-mono text-indigo-300">SIP-MU ENTERPRISE</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
