import { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SUBJECT_COLORS = [
    'from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500',
    'from-blue-500 to-cyan-500', 'from-rose-500 to-pink-500', 'from-fuchsia-500 to-violet-500',
];
const hashColor = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length]; };

export default function Index({ schedules, todaySchedules, sessionSlots, dayLabels, employee, todayDow }) {
    const sessions = Object.entries(sessionSlots);
    const days = Object.entries(dayLabels).filter(([d]) => d <= 5); // Assuming exams are Monday-Friday
    const getSlot = (day, session) => schedules.find(s => s.day_of_week === day && s.session_number === session);
    const totalSesi = schedules.length;

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm mb-2">
                        <ShieldCheck className="w-3 h-3 mr-1.5" /> Jadwal Mengawas
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Jadwal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Mengawas Saya</span>
                    </h2>
                </div>
            </div>
        }>
            <Head title="Jadwal Mengawas Saya" />

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pb-10 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Sesi Mengawas', value: totalSesi, gradient: 'from-blue-500 to-indigo-600', icon: <BookOpen className="w-16 h-16" /> },
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
                {todayDow >= 1 && todayDow <= 6 && todaySchedules.length > 0 && (
                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b border-slate-100 p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                            <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <span className="animate-pulse">🔥</span> Jadwal Mengawas Hari Ini - {dayLabels[todayDow]}
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daftar sesi mengawas ujian Anda hari ini</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                {todaySchedules.map((ts, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                                        <div className={`bg-gradient-to-br ${hashColor(ts.subject)} text-white rounded-2xl p-4 text-center shadow-md border border-white/20 relative overflow-hidden`}>
                                            <div className="absolute top-0 right-0 bg-white/20 rounded-bl-xl px-2 py-1 text-[9px] font-black">
                                                Ruang {ts.room_name}
                                            </div>
                                            <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1 mt-2">Sesi {ts.session_number}</div>
                                            <div className="text-[10px] font-black bg-black/20 rounded-full px-2 py-0.5 inline-block mb-2">
                                                {sessionSlots[ts.session_number]?.start} - {sessionSlots[ts.session_number]?.end}
                                            </div>
                                            <div className="text-sm font-black mt-1 leading-tight">{ts.subject}</div>
                                            <div className="text-[11px] font-bold opacity-90 mt-1 bg-white/10 rounded-full px-2 py-0.5 inline-block">{ts.class_name}</div>
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
                        <CardTitle className="text-lg font-black text-slate-900">Grid Jadwal Ujian Mingguan</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jadwal mengawas Senin - Jumat</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="py-4 px-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest w-28">Hari</th>
                                        {sessions.map(([h, slot]) => (
                                            <th key={h} className="py-4 px-2 text-center">
                                                <div className="text-[11px] font-black text-indigo-600 uppercase mb-1">Sesi {h}</div>
                                                <div className="text-[10px] font-bold text-slate-500 bg-white shadow-sm border border-slate-200 rounded-full px-2 py-0.5 inline-block">
                                                    {slot.start} - {slot.end}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {days.map(([d, dayName]) => (
                                        <tr key={d} className={`border-b border-slate-50 transition-colors ${parseInt(d) === todayDow ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}>
                                            <td className="py-3 px-4">
                                                <span className={`font-black text-sm flex items-center gap-2 ${parseInt(d) === todayDow ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {dayName} {parseInt(d) === todayDow && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>}
                                                </span>
                                            </td>
                                            {sessions.map(([h]) => {
                                                const slot = getSlot(parseInt(d), parseInt(h));
                                                return (
                                                    <td key={h} className="py-2 px-2">
                                                        {slot ? (
                                                            <div className={`bg-gradient-to-br ${hashColor(slot.subject)} text-white rounded-2xl p-3 text-center shadow-md relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-default`}>
                                                                <div className="absolute top-0 right-0 bg-black/20 rounded-bl-lg px-1.5 py-0.5 text-[8px] font-black">
                                                                    R.{slot.room_name}
                                                                </div>
                                                                <div className="text-[10px] font-bold opacity-90 uppercase tracking-wider line-clamp-1 mt-1 mb-0.5">{slot.subject}</div>
                                                                <div className="text-[11px] font-black bg-white/20 rounded-md px-1 py-0.5 inline-block line-clamp-1">{slot.class_name}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full min-h-[60px] border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center opacity-50">
                                                                <span className="text-slate-300 text-xs font-bold">-</span>
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
