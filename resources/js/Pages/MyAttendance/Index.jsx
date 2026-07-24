import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, AlertCircle, CalendarDays, ClipboardList, Sparkles, History } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
    present: { label: 'Hadir', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
    late:    { label: 'Terlambat', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
    permit:  { label: 'Izin', color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
    sick:    { label: 'Sakit', color: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500' },
    alpha:   { label: 'Alpha', color: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' },
};

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function Index({ attendances, stats, filters, employee }) {
    const [month, setMonth] = useState(filters.month);
    const [year, setYear] = useState(filters.year);

    const applyFilter = (m, y) => {
        router.get(route('my-attendance.index'), { month: m, year: y }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm mb-2">
                        <History className="w-3 h-3 mr-1.5" /> Area Pribadi
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Rekap <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Absensi Saya</span>
                    </h2>
                </div>
                <div className="flex gap-2">
                    <select value={month} onChange={e => { setMonth(e.target.value); applyFilter(e.target.value, year); }}
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4 shadow-sm">
                        {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => { setYear(e.target.value); applyFilter(month, e.target.value); }}
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4 shadow-sm">
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
        }>
            <Head title="Rekap Absensi Saya" />

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pb-10 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Hadir', value: stats.present, gradient: 'from-emerald-500 to-teal-600', icon: <CheckCircle2 className="w-10 h-10" /> },
                        { label: 'Terlambat', value: stats.late, gradient: 'from-amber-500 to-orange-600', icon: <Clock className="w-10 h-10" /> },
                        { label: 'Izin', value: stats.permit, gradient: 'from-blue-500 to-indigo-600', icon: <CalendarDays className="w-10 h-10" /> },
                        { label: 'Sakit', value: stats.sick, gradient: 'from-purple-500 to-violet-600', icon: <AlertCircle className="w-10 h-10" /> },
                        { label: 'Alpha', value: stats.alpha, gradient: 'from-rose-500 to-pink-600', icon: <XCircle className="w-10 h-10" /> },
                        { label: 'Jam Mengajar', value: stats.teaching_hours, gradient: 'from-cyan-500 to-sky-600', icon: <ClipboardList className="w-10 h-10" /> },
                    ].map((c, i) => (
                        <Card key={i} className={`bg-gradient-to-br ${c.gradient} text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative`}>
                            <div className="absolute -right-2 -bottom-2 opacity-10">{c.icon}</div>
                            <CardContent className="p-4 relative z-10">
                                <p className="text-white/70 font-bold uppercase tracking-wider text-[9px]">{c.label}</p>
                                <h3 className="text-2xl font-black">{c.value}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* JTM Detailed Breakdown for Teachers */}
                {stats.jtm_scheduled > 0 && (
                    <Card className="border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white overflow-hidden p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30 inline-block mb-1">
                                    Rincian Jam Tatap Muka (JTM)
                                </span>
                                <h3 className="text-xl font-black text-white">Ringkasan Bebas Mengajar & Inval</h3>
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-right">
                                <span className="text-[10px] uppercase font-bold text-indigo-200 block">JTM Terjadwal (1 Bulan)</span>
                                <span className="text-2xl font-black text-amber-300">{stats.jtm_scheduled} Jam</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">Hadir X</span>
                                <span className="text-lg font-black text-emerald-400">{stats.jtm_effective_10}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">Hadir XI</span>
                                <span className="text-lg font-black text-emerald-400">{stats.jtm_effective_11}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">Hadir XII</span>
                                <span className="text-lg font-black text-emerald-400">{stats.jtm_effective_12}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">Hadir Total</span>
                                <span className="text-lg font-black text-emerald-300">{stats.jtm_effective}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">JTM Inval</span>
                                <span className="text-lg font-black text-cyan-400">{stats.jtm_inval}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">JTM Izin</span>
                                <span className="text-lg font-black text-blue-400">{stats.jtm_permit}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">JTM Libur</span>
                                <span className="text-lg font-black text-purple-300">{stats.jtm_holiday}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-300 block uppercase">JTM Alpa</span>
                                <span className="text-lg font-black text-rose-400">{stats.jtm_absent}</span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Attendance List */}
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 p-6">
                        <CardTitle className="text-lg font-black text-slate-900">Riwayat Presensi — {MONTHS[month]} {year}</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data kehadiran pribadi Anda</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="py-4 px-6 text-left text-xs font-black text-slate-500 uppercase">Tanggal</th>
                                        <th className="py-4 px-4 text-left text-xs font-black text-slate-500 uppercase">Masuk</th>
                                        <th className="py-4 px-4 text-left text-xs font-black text-slate-500 uppercase">Keluar</th>
                                        <th className="py-4 px-4 text-center text-xs font-black text-slate-500 uppercase">Status</th>
                                        <th className="py-4 px-4 text-center text-xs font-black text-slate-500 uppercase">Jam Mengajar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.length > 0 ? attendances.map((att, i) => {
                                        const cfg = STATUS_CONFIG[att.status] || STATUS_CONFIG.present;
                                        return (
                                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3 px-6 font-bold text-slate-800">
                                                    {new Date(att.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-700">{att.check_in || '--:--'}</td>
                                                <td className="py-3 px-4 font-bold text-slate-700">{att.check_out || '--:--'}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${cfg.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-2`}></span>{cfg.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center font-black text-slate-600">{att.teaching_hours || 0}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={5} className="py-16 text-center">
                                            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                            <p className="font-bold text-slate-500">Belum ada data presensi pada periode ini</p>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AuthenticatedLayout>
    );
}
