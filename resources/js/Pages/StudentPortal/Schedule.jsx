import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, GraduationCap, BookOpen, Sparkles, User, School } from 'lucide-react';
import { motion } from 'framer-motion';

const SUBJECT_COLORS = [
    'from-indigo-600 to-blue-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-purple-600 to-violet-600',
    'from-rose-600 to-pink-600',
    'from-cyan-600 to-sky-600',
    'from-lime-600 to-green-600',
    'from-fuchsia-600 to-pink-600',
];

const hashColor = (str) => {
    if (!str) return SUBJECT_COLORS[0];
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length];
};

export default function StudentSchedule({ auth, student, schedules, todaySchedules, hourSlots, dayLabels, todayDow }) {
    const hours = Object.entries(hourSlots);
    const days = Object.entries(dayLabels);

    const getSlot = (day, hour) => schedules.find(s => s.day_of_week === day && s.hour_number === hour);
    const totalJam = schedules.length;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Jadwal Pelajaran — ${student.name}`} />

            <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="max-w-7xl mx-auto space-y-6 pb-12"
            >
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/20">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0">
                                <BookOpen className="w-7 h-7 text-indigo-200" />
                            </div>
                            <div>
                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest inline-block mb-1">
                                    Portal Mandiri Siswa / Informasi Kelas
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black text-white">Jadwal Pelajaran Kelas</h1>
                                <p className="text-xs text-slate-300 font-medium mt-0.5">
                                    Kelas: <span className="font-bold text-indigo-300">{student.school_class?.name || '-'}</span> | Wali Kelas: <span className="font-bold text-slate-200">{student.school_class?.homeroom_teacher?.name || '-'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { 
                            label: 'Total Sesi / Minggu', 
                            value: totalJam, 
                            suffix: 'Jam Pelajaran',
                            gradient: 'from-blue-600 to-indigo-700', 
                            icon: <BookOpen className="w-16 h-16" /> 
                        },
                        { 
                            label: 'Jadwal Hari Ini', 
                            value: todaySchedules.length, 
                            suffix: 'Mapel Hari Ini',
                            gradient: 'from-emerald-600 to-teal-700', 
                            icon: <CalendarDays className="w-16 h-16" /> 
                        },
                        { 
                            label: 'Status Hari Ini', 
                            value: dayLabels[todayDow] || 'Hari Libur', 
                            isText: true,
                            gradient: 'from-purple-600 to-violet-700', 
                            icon: <Clock className="w-16 h-16" /> 
                        },
                    ].map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <Card className={`bg-gradient-to-br ${c.gradient} text-white rounded-3xl border-none shadow-lg overflow-hidden relative`}>
                                <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">{c.icon}</div>
                                <CardContent className="p-5 relative z-10">
                                    <p className="text-white/80 font-bold mb-1 uppercase tracking-wider text-[10px] sm:text-xs">{c.label}</p>
                                    <h3 className={`font-black ${c.isText ? 'text-2xl' : 'text-3xl'}`}>
                                        {c.value} {!c.isText && <span className="text-xs font-medium opacity-80">{c.suffix}</span>}
                                    </h3>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Real-Time Highlight: Today's Schedule */}
                {todayDow >= 1 && todayDow <= 5 && (
                    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Real-Time Hari Ini</span>
                                </div>
                                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                                    Jadwal Pelajaran Hari Ini — {dayLabels[todayDow]}
                                </CardTitle>
                                <CardDescription className="text-xs font-semibold text-slate-500 mt-0.5">
                                    Mata pelajaran dan guru pengampu yang mengajar di kelas Anda hari ini
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {todaySchedules.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 font-semibold">
                                    Tidak ada jadwal pelajaran tercatat untuk hari ini.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {todaySchedules.map((ts, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, scale: 0.95 }} 
                                            animate={{ opacity: 1, scale: 1 }} 
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <div className={`bg-gradient-to-br ${hashColor(ts.subject)} text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]`}>
                                                <div>
                                                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-white/80 mb-1">
                                                        <span>Jam Ke-{ts.hour_number}</span>
                                                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded-full">{hourSlots[ts.hour_number]?.start} - {hourSlots[ts.hour_number]?.end}</span>
                                                    </div>
                                                    <h4 className="text-base font-black text-white mt-2 leading-tight">{ts.subject}</h4>
                                                </div>

                                                <div className="pt-3 border-t border-white/20 mt-3 flex items-center space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                                        <User className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <p className="text-xs font-bold text-white/90 line-clamp-1">{ts.teacher_name}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Full Weekly Matrix Table (Senin - Jumat) */}
                <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                            Grid Matrix Jadwal Pelajaran Mingguan
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-slate-500 mt-0.5">
                            Jadwal lengkap kegiatan belajar mengajar dari hari Senin s/d Jumat (Jam ke 1 - 10)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px] border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                        <th className="py-4 px-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-28">Hari</th>
                                        {hours.map(([h, slot]) => (
                                            <th key={h} className="py-3 px-2 text-center">
                                                <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Jam {h}</div>
                                                <div className="text-[9px] font-mono font-bold text-slate-400">{slot.start}-{slot.end}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {days.map(([d, dayName]) => {
                                        const isToday = parseInt(d) === todayDow;

                                        return (
                                            <tr 
                                                key={d} 
                                                className={`transition-colors ${
                                                    isToday 
                                                        ? 'bg-indigo-50/40 dark:bg-indigo-950/30' 
                                                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                                }`}
                                            >
                                                <td className="py-3 px-4">
                                                    <span className={`font-black text-xs sm:text-sm flex items-center ${
                                                        isToday ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                                                    }`}>
                                                        {dayName} {isToday && <span className="ml-1.5 text-xs">📍</span>}
                                                    </span>
                                                </td>

                                                {hours.map(([h]) => {
                                                    const slot = getSlot(parseInt(d), parseInt(h));

                                                    return (
                                                        <td key={h} className="py-2 px-1.5">
                                                            {slot ? (
                                                                <div className={`bg-gradient-to-br ${hashColor(slot.subject)} text-white rounded-xl p-2.5 text-center shadow-md min-h-[64px] flex flex-col justify-between transition-transform hover:scale-105`}>
                                                                    <p className="text-[11px] font-black leading-tight line-clamp-1">{slot.subject}</p>
                                                                    <p className="text-[9px] font-bold opacity-90 line-clamp-1 mt-1 text-white/90">
                                                                        👨‍🏫 {slot.teacher_name}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full min-h-[64px] border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-800/20 flex items-center justify-center">
                                                                    <span className="text-slate-300 dark:text-slate-600 text-xs font-bold">—</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AuthenticatedLayout>
    );
}
