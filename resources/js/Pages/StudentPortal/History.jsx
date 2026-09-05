import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    CalendarDays, 
    Filter, 
    CheckCircle2, 
    Clock, 
    FileText, 
    AlertCircle, 
    XCircle, 
    Sparkles, 
    ShieldCheck,
    Building2,
    QrCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function StudentHistory({ auth, student, calendarData, monthlyStats, filters }) {
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || new Date().getFullYear());

    const months = [
        { value: 1, name: 'Januari' },
        { value: 2, name: 'Februari' },
        { value: 3, name: 'Maret' },
        { value: 4, name: 'April' },
        { value: 5, name: 'Mei' },
        { value: 6, name: 'Juni' },
        { value: 7, name: 'Juli' },
        { value: 8, name: 'Agustus' },
        { value: 9, name: 'September' },
        { value: 10, name: 'Oktober' },
        { value: 11, name: 'November' },
        { value: 12, name: 'Desember' },
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(route('student-portal.history'), { month, year }, { preserveState: true });
    };

    const getStatusBadge = (status, isWeekend) => {
        if (isWeekend) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200/60 dark:border-slate-700">
                    Sabtu / Minggu
                </span>
            );
        }

        switch (status) {
            case 'present':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Hadir</span>
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Terlambat</span>
                    </span>
                );
            case 'permit':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>Izin</span>
                    </span>
                );
            case 'sick':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">
                        <AlertCircle className="w-3.5 h-3.5 text-purple-500" />
                        <span>Sakit</span>
                    </span>
                );
            case 'alpha':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Alpha</span>
                    </span>
                );
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold text-slate-400">-</span>;
        }
    };

    const statsCards = [
        { label: 'Hadir', value: monthlyStats?.present || 0, gradient: 'from-emerald-600 to-teal-700', icon: <CheckCircle2 className="w-10 h-10" /> },
        { label: 'Terlambat', value: monthlyStats?.late || 0, gradient: 'from-amber-500 to-orange-600', icon: <Clock className="w-10 h-10" /> },
        { label: 'Izin', value: monthlyStats?.permit || 0, gradient: 'from-blue-600 to-indigo-700', icon: <FileText className="w-10 h-10" /> },
        { label: 'Sakit', value: monthlyStats?.sick || 0, gradient: 'from-purple-600 to-violet-700', icon: <AlertCircle className="w-10 h-10" /> },
        { label: 'Alpha', value: monthlyStats?.alpha || 0, gradient: 'from-rose-600 to-pink-700', icon: <XCircle className="w-10 h-10" /> },
        { label: 'Tingkat Kehadiran', value: `${monthlyStats?.percentage ?? 100}%`, gradient: 'from-indigo-600 via-purple-600 to-cyan-600', icon: <Sparkles className="w-10 h-10" /> },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`Kalender & Rekap Presensi — ${student.name}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800 mb-2">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>Rekapitulasi Kehadiran Siswa</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Kalender & Rekap Presensi
                        </h1>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                            Siswa: <strong className="text-slate-800 dark:text-slate-200">{student.name}</strong> (NIS: {student.nis} | Kelas: {student.school_class?.name || '-'})
                        </p>
                    </div>

                    <form onSubmit={handleFilter} className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={month}
                            onChange={(e) => { setMonth(Number(e.target.value)); }}
                            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold py-2.5 px-4 focus:ring-2 focus:ring-indigo-500"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.name}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => { setYear(Number(e.target.value)); }}
                            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold py-2.5 px-4 focus:ring-2 focus:ring-indigo-500"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center space-x-1.5 shrink-0"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </form>
                </div>

                {/* 6 Summary Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statsCards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className={`bg-gradient-to-br ${card.gradient} text-white rounded-3xl border-none shadow-lg overflow-hidden relative`}>
                                <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none">{card.icon}</div>
                                <CardContent className="p-4 sm:p-5 relative z-10">
                                    <p className="text-white/80 font-bold uppercase tracking-wider text-[10px] sm:text-xs">{card.label}</p>
                                    <h3 className="text-2xl sm:text-3xl font-black mt-1">{card.value}</h3>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Attendance History Table */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                                Riwayat Presensi — {months.find(m => m.value === month)?.name} {year}
                            </CardTitle>
                            <CardDescription className="text-xs font-semibold text-slate-500 mt-0.5">
                                Catatan presensi harian siswa per tanggal
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="py-4 px-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal & Hari</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jam Masuk</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jam Pulang</th>
                                        <th className="py-4 px-4 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Kehadiran</th>
                                        <th className="py-4 px-6 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catatan / Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {calendarData.map((item) => {
                                        const dateFormatted = new Date(item.date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        });

                                        return (
                                            <tr 
                                                key={item.date}
                                                className={`transition-colors ${
                                                    item.is_weekend 
                                                        ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-70' 
                                                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                                                }`}
                                            >
                                                {/* Tanggal & Hari */}
                                                <td className="py-3.5 px-6 font-extrabold text-xs text-slate-900 dark:text-white">
                                                    {dateFormatted}
                                                </td>

                                                {/* Jam Masuk */}
                                                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {item.is_weekend ? '--:--' : (item.check_in_time ? `${item.check_in_time} WIB` : '--:--')}
                                                </td>

                                                {/* Jam Pulang */}
                                                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {item.is_weekend ? '--:--' : (item.check_out_time ? `${item.check_out_time} WIB` : '--:--')}
                                                </td>

                                                {/* Status Kehadiran */}
                                                <td className="py-3.5 px-4 text-center">
                                                    {getStatusBadge(item.status, item.is_weekend)}
                                                </td>

                                                {/* Catatan / Keterangan */}
                                                <td className="py-3.5 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                    {item.notes ? (
                                                        <span>{item.notes}</span>
                                                    ) : (
                                                        item.is_weekend ? (
                                                            <span className="text-slate-400 italic">Hari Libur Sekolah</span>
                                                        ) : (
                                                            <span className="text-slate-400 italic">-</span>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
