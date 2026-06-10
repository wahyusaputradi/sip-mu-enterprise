import { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SUBJECT_COLORS = [
    'from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500',
    'from-purple-500 to-violet-500', 'from-rose-500 to-pink-500', 'from-cyan-500 to-sky-500',
    'from-lime-500 to-green-500', 'from-fuchsia-500 to-pink-500',
];
const hashColor = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length]; };

export default function Index({ schedules, todaySchedules, hourSlots, dayLabels, employee, todayDow }) {
    const hours = Object.entries(hourSlots);
    const days = Object.entries(dayLabels);
    const getSlot = (day, hour) => schedules.find(s => s.day_of_week === day && s.hour_number === hour);
    const totalJam = schedules.length;

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm mb-2">
                        <GraduationCap className="w-3 h-3 mr-1.5" /> Jadwal Pribadi
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Jadwal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Mengajar Saya</span>
                    </h2>
                </div>
            </div>
        }>
            <Head title="Jadwal Mengajar Saya" />

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pb-10 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Sesi/Minggu', value: totalJam, gradient: 'from-blue-500 to-indigo-600', icon: <BookOpen className="w-16 h-16" /> },
                        { label: 'Jadwal Hari Ini', value: todaySchedules.length, gradient: 'from-emerald-500 to-teal-600', icon: <CalendarDays className="w-16 h-16" /> },
                        { label: 'Hari Ini', value: dayLabels[todayDow] || 'Libur', gradient: 'from-purple-500 to-fuchsia-600', icon: <Clock className="w-16 h-16" />, isText: true },
                    ].map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <Card className={`bg-gradient-to-br ${c.gradient} text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative`}>
                                <div className="absolute -right-4 -bottom-4 opacity-10">{c.icon}</div>
                                <CardContent className="p-5 relative z-10">
                                    <p className="text-white/70 font-bold mb-1 uppercase tracking-wider text-[10px]">{c.label}</p>
                                    <h3 className={`font-black ${c.isText ? 'text-2xl' : 'text-3xl'}`}>{c.value} {!c.isText && <span className="text-sm font-medium opacity-70">Sesi</span>}</h3>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Today's Schedule Highlight */}
                {todayDow >= 1 && todayDow <= 5 && todaySchedules.length > 0 && (
                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <CardTitle className="text-lg font-black text-slate-900">📋 Jadwal Hari Ini — {dayLabels[todayDow]}</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daftar jam mengajar Anda hari ini</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {todaySchedules.map((ts, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                                        <div className={`bg-gradient-to-br ${hashColor(ts.subject)} text-white rounded-2xl p-4 text-center shadow-md`}>
                                            <div className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Jam {ts.hour_number}</div>
                                            <div className="text-[9px] font-bold opacity-60">{hourSlots[ts.hour_number]?.start}-{hourSlots[ts.hour_number]?.end}</div>
                                            <div className="text-xs font-black mt-2">{ts.subject}</div>
                                            <div className="text-[11px] font-bold opacity-80 mt-1">{ts.class_name}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Full Weekly Grid */}
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 p-6">
                        <CardTitle className="text-lg font-black text-slate-900">Grid Jadwal Mingguan</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jadwal mengajar Senin - Jumat</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="py-3 px-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest w-24">Hari</th>
                                        {hours.map(([h, slot]) => (
                                            <th key={h} className="py-3 px-1 text-center">
                                                <div className="text-[10px] font-black text-indigo-600 uppercase">Jam {h}</div>
                                                <div className="text-[9px] font-bold text-slate-400">{slot.start}-{slot.end}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {days.map(([d, dayName]) => (
                                        <tr key={d} className={`border-b border-slate-50 ${parseInt(d) === todayDow ? 'bg-indigo-50/30' : 'hover:bg-slate-50/30'}`}>
                                            <td className="py-2 px-3">
                                                <span className={`font-black text-sm ${parseInt(d) === todayDow ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {dayName} {parseInt(d) === todayDow && '📍'}
                                                </span>
                                            </td>
                                            {hours.map(([h]) => {
                                                const slot = getSlot(parseInt(d), parseInt(h));
                                                return (
                                                    <td key={h} className="py-1.5 px-1">
                                                        {slot ? (
                                                            <div className={`bg-gradient-to-br ${hashColor(slot.subject)} text-white rounded-xl p-2 text-center shadow-md min-h-[52px] flex flex-col items-center justify-center`}>
                                                                <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider line-clamp-1">{slot.subject}</div>
                                                                <div className="text-[11px] font-black line-clamp-1">{slot.class_name}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full min-h-[52px] border border-slate-100 rounded-xl bg-slate-50/30 flex items-center justify-center">
                                                                <span className="text-slate-200 text-xs">—</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AuthenticatedLayout>
    );
}
