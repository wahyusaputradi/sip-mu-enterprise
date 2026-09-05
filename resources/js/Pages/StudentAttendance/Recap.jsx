import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    FileSpreadsheet, 
    Filter, 
    Search, 
    Calendar, 
    School, 
    UserCheck, 
    Clock, 
    AlertTriangle, 
    Users,
    Download
} from 'lucide-react';

export default function Recap({ auth, matrix, grandTotals = { present: 0, late: 0, sick: 0, permit: 0, alpha: 0 }, daysInMonth, schoolClasses, filters }) {
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [classId, setClassId] = useState(filters.class_id || '');
    const [search, setSearch] = useState(filters.search || '');

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
        router.get(route('student-attendance.recap'), {
            month,
            year,
            class_id: classId,
            search,
        }, { preserveState: true });
    };

    const handleExportExcel = () => {
        const queryParams = new URLSearchParams({
            month,
            year,
            ...(classId && { class_id: classId }),
        }).toString();
        window.open(route('student-attendance.export-monthly-excel') + '?' + queryParams, '_blank');
    };

    const getStatusPill = (status) => {
        switch (status) {
            case 'present':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">H</span>;
            case 'late':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px]">T</span>;
            case 'sick':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">S</span>;
            case 'permit':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-[11px]">I</span>;
            case 'alpha':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px]">A</span>;
            default:
                return <span className="text-slate-300 dark:text-slate-700 text-xs font-bold">-</span>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Rekap Presensi Bulanan Siswa — SIP MU Enterprise" />

            <div className="space-y-8">
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/20">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>Rekapitulasi Presensi & Kesiswaan</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                                Rekap Presensi Bulanan Siswa
                            </h1>
                            <p className="text-sm text-slate-300 max-w-2xl font-medium">
                                Matriks presensi lengkap per tanggal dalam sebulan untuk seluruh siswa SMK Manbaul Ulum Cirebon dengan fitur pencatatan otomatis & export laporan resmi.
                            </p>
                        </div>
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 hover:shadow-emerald-600/40 transition-all border border-emerald-400/30 shrink-0"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Laporan Excel (.xlsx)</span>
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bulan</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tahun</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kelas / Rombel</label>
                            <div className="relative">
                                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Semua Kelas</option>
                                    {schoolClasses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cari Nama / NIS</label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Ketik NIS atau nama..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Terapkan Filter</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Summary Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Siswa</p>
                            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{matrix.total || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Hadir (H)</p>
                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{grandTotals.present}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Terlambat (T)</p>
                            <p className="text-lg font-black text-amber-600 dark:text-amber-400">{grandTotals.late}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sakit / Izin (S/I)</p>
                            <p className="text-lg font-black text-blue-600 dark:text-blue-400">{grandTotals.sick + grandTotals.permit}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alpha (A)</p>
                            <p className="text-lg font-black text-rose-600 dark:text-rose-400">{grandTotals.alpha}</p>
                        </div>
                    </div>
                </div>

                {/* Matrix Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">
                            Matriks Presensi Harian — Bulan {months.find(m => m.value === month)?.name} {year}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> H: Hadir</span>
                            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> T: Terlambat</span>
                            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> S: Sakit</span>
                            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> I: Izin</span>
                            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> A: Alpha</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-3 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-12 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">No</th>
                                    <th className="py-3 px-4 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px] sticky left-12 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">NIS</th>
                                    <th className="py-3 px-4 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px] sticky left-[168px] bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">Nama Siswa</th>
                                    <th className="py-3 px-3 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[100px] border-r border-slate-200 dark:border-slate-700">Kelas</th>

                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                        <th key={day} className="py-3 px-1.5 font-extrabold text-slate-500 dark:text-slate-400 text-center min-w-[32px] border-r border-slate-100 dark:border-slate-800">
                                            {day}
                                        </th>
                                    ))}

                                    <th className="py-3 px-2 font-extrabold text-emerald-600 dark:text-emerald-400 text-center min-w-[36px] bg-emerald-500/5">H</th>
                                    <th className="py-3 px-2 font-extrabold text-amber-600 dark:text-amber-400 text-center min-w-[36px] bg-amber-500/5">T</th>
                                    <th className="py-3 px-2 font-extrabold text-blue-600 dark:text-blue-400 text-center min-w-[36px] bg-blue-500/5">S</th>
                                    <th className="py-3 px-2 font-extrabold text-purple-600 dark:text-purple-400 text-center min-w-[36px] bg-purple-500/5">I</th>
                                    <th className="py-3 px-2 font-extrabold text-rose-600 dark:text-rose-400 text-center min-w-[36px] bg-rose-500/5">A</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                                {matrix.data && matrix.data.length > 0 ? (
                                    matrix.data.map((row, index) => (
                                        <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-2.5 px-3 text-center text-slate-400 sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 font-bold">
                                                {(matrix.current_page - 1) * 50 + index + 1}
                                            </td>
                                            <td className="py-2.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-300 sticky left-12 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">{row.nis}</td>
                                            <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap sticky left-[168px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">{row.name}</td>
                                            <td className="py-2.5 px-3 text-slate-500 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap font-bold text-[11px]">{row.class_name}</td>

                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                                <td key={day} className="py-2.5 px-1.5 text-center border-r border-slate-100 dark:border-slate-800/60">
                                                    {getStatusPill(row.daily[day])}
                                                </td>
                                            ))}

                                            <td className="py-2.5 px-2 text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">{row.stats.present}</td>
                                            <td className="py-2.5 px-2 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-500/5">{row.stats.late}</td>
                                            <td className="py-2.5 px-2 text-center font-black text-blue-600 dark:text-blue-400 bg-blue-500/5">{row.stats.sick}</td>
                                            <td className="py-2.5 px-2 text-center font-black text-purple-600 dark:text-purple-400 bg-purple-500/5">{row.stats.permit}</td>
                                            <td className="py-2.5 px-2 text-center font-black text-rose-600 dark:text-rose-400 bg-rose-500/5">{row.stats.alpha}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={daysInMonth + 9} className="py-12 text-center text-slate-400">
                                            Tidak ada data siswa ditemukan untuk kriteria filter ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {matrix.links && matrix.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2">
                        <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                            Menampilkan <span className="text-slate-900 dark:text-white font-black">{matrix.from || 0}</span> s/d <span className="text-slate-900 dark:text-white font-black">{matrix.to || 0}</span> dari total <span className="text-indigo-600 dark:text-indigo-400 font-black">{matrix.total || 0}</span> data siswa
                        </p>
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
                            {matrix.links.map((link, idx) => {
                                const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                                const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                                const label = isPrevious ? 'Prev' : (isNext ? 'Next' : link.label);

                                return link.url ? (
                                    <button
                                        key={idx}
                                        onClick={() => router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            link.active 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                ) : (
                                    <span key={idx} className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 dark:text-slate-600" dangerouslySetInnerHTML={{ __html: label }} />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
