import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar, Filter, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StudentHistory({ auth, student, calendarData, filters }) {
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

    const getStatusPill = (status, isWeekend) => {
        if (isWeekend) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-400">Sabtu / Minggu</span>;
        }

        switch (status) {
            case 'present':
                return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">✓ Hadir</span>;
            case 'late':
                return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">⚠️ Terlambat</span>;
            case 'sick':
                return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">🏥 Sakit</span>;
            case 'permit':
                return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">📜 Izin</span>;
            case 'alpha':
                return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">✗ Alpha</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-slate-300 dark:text-slate-600">-</span>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Kalender Presensi — ${student.name}`} />

            <div className="space-y-6 pb-12">
                {/* Header Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Kalender & Riwayat Presensi
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Data riwayat presensi harian per tanggal dalam sebulan untuk {student.name} ({student.school_class?.name})
                        </p>
                    </div>

                    <form onSubmit={handleFilter} className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold py-2.5 px-3"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.name}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold py-2.5 px-3"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20"
                        >
                            <Filter className="w-3.5 h-3.5 inline mr-1" /> Filter
                        </button>
                    </form>
                </div>

                {/* Calendar List Table */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                            Bulan {months.find(m => m.value === month)?.name} {year}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {calendarData.map((item) => (
                                <div
                                    key={item.date}
                                    className={`p-4 flex items-center justify-between transition-colors ${
                                        item.is_weekend 
                                            ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-60' 
                                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-black text-indigo-700 dark:text-indigo-300 text-xs">
                                            {item.day}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-xs text-slate-900 dark:text-white">{item.date}</p>
                                            <p className="text-[11px] text-slate-500 font-medium">{item.day_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        {!item.is_weekend && (
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                                                    Masuk: {item.check_in_time || '--:--'} | Pulang: {item.check_out_time || '--:--'}
                                                </p>
                                            </div>
                                        )}
                                        {getStatusPill(item.status, item.is_weekend)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
