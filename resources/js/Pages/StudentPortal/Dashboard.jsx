import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, Calendar, Clock, CheckCircle2, AlertTriangle, Thermometer, ShieldAlert,
    QrCode, FileText, CalendarDays, Award, UserCheck, ChevronRight, Sparkles,
    BookOpen, XCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function StudentDashboard({ auth, student = {}, todayAttendance = null, monthlyStats = {}, recentAttendances = [], pendingLeavesCount = 0 }) {
    const studentData = student || {};
    const statsData = monthlyStats || {};
    const attendancesList = Array.isArray(recentAttendances) ? recentAttendances : [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'present':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Hadir Tepat Waktu</span>
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>Terlambat</span>
                    </span>
                );
            case 'sick':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
                        <Thermometer className="w-4 h-4 text-purple-500" />
                        <span>Sakit</span>
                    </span>
                );
            case 'permit':
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shadow-sm">
                        <FileText className="w-4 h-4 text-sky-500" />
                        <span>Izin</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-sm">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Alpha</span>
                    </span>
                );
        }
    };

    const statsCards = [
        { 
            label: 'Hadir Tepat Waktu', 
            value: statsData?.present || 0, 
            unit: 'Hari Bulan Ini',
            gradient: 'from-emerald-600 to-teal-700', 
            bgLight: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/60',
            textColor: 'text-emerald-700 dark:text-emerald-300',
            icon: <CheckCircle2 className="w-7 h-7 text-emerald-500" /> 
        },
        { 
            label: 'Terlambat', 
            value: statsData?.late || 0, 
            unit: 'Hari Bulan Ini',
            gradient: 'from-amber-500 to-orange-600', 
            bgLight: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/60',
            textColor: 'text-amber-700 dark:text-amber-300',
            icon: <Clock className="w-7 h-7 text-amber-500" /> 
        },
        { 
            label: 'Izin', 
            value: statsData?.permit || 0, 
            unit: 'Hari Bulan Ini',
            gradient: 'from-blue-600 to-indigo-700', 
            bgLight: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/60',
            textColor: 'text-blue-700 dark:text-blue-300',
            icon: <FileText className="w-7 h-7 text-blue-500" /> 
        },
        { 
            label: 'Sakit', 
            value: statsData?.sick || 0, 
            unit: 'Hari Bulan Ini',
            gradient: 'from-purple-600 to-violet-700', 
            bgLight: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-900/60',
            textColor: 'text-purple-700 dark:text-purple-300',
            icon: <Thermometer className="w-7 h-7 text-purple-500" /> 
        },
        { 
            label: 'Alpha', 
            value: statsData?.alpha || 0, 
            unit: 'Hari Bulan Ini',
            gradient: 'from-rose-600 to-pink-700', 
            bgLight: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/60',
            textColor: 'text-rose-700 dark:text-rose-300',
            icon: <XCircle className="w-7 h-7 text-rose-500" /> 
        },
        { 
            label: 'Tingkat Kehadiran', 
            value: `${statsData?.percentage ?? 100}%`, 
            unit: 'Disiplin Presensi',
            gradient: 'from-indigo-600 via-purple-600 to-cyan-600', 
            bgLight: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-900/60',
            textColor: 'text-indigo-700 dark:text-indigo-300',
            icon: <Sparkles className="w-7 h-7 text-indigo-500" /> 
        },
    ];

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Dashboard Portal Siswa — ${studentData?.name || 'Siswa'}`} />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6 pb-12"
            >
                {/* Banner Profile Card */}
                <motion.div variants={itemVariants}>
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/20">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center space-x-4 sm:space-x-5">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-indigo-300/40 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl shadow-indigo-950/50 shrink-0">
                                    {studentData?.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Portal Mandiri Siswa / Wali Murid</span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{studentData?.name || 'Siswa'}</h1>
                                    <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                                        NIS: <span className="font-mono font-bold text-white bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">{studentData?.nis || '-'}</span> | Kelas: <span className="font-bold text-indigo-300">{studentData?.school_class?.name || '-'}</span> | Wali Kelas: <span className="font-bold text-slate-200">{studentData?.school_class?.homeroom_teacher?.name || '-'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <Link
                                    href={route('student-portal.schedule')}
                                    className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-extrabold text-xs hover:bg-indigo-500/30 transition-all shadow-md"
                                >
                                    <BookOpen className="w-4 h-4 mr-2 text-indigo-300" /> Jadwal Pelajaran
                                </Link>
                                <Link
                                    href={route('student-portal.digital-card')}
                                    className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-white text-indigo-950 font-black text-xs shadow-lg hover:bg-slate-100 transition-all"
                                >
                                    <QrCode className="w-4 h-4 mr-2 text-indigo-600" /> Kartu Digital QR
                                </Link>
                                <Link
                                    href={route('student-portal.leave-requests')}
                                    className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-extrabold text-xs hover:bg-amber-500/30 transition-all shadow-md"
                                >
                                    <CalendarDays className="w-4 h-4 mr-2" /> Ajukan Izin ({pendingLeavesCount || 0})
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Today Status Card */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Status Presensi Hari Ini</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                                    {todayAttendance ? (
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(todayAttendance.status)}
                                        </div>
                                    ) : (
                                        <span className="text-amber-500 font-extrabold flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            <span>Belum Melakukan Scan Presensi Hari Ini</span>
                                        </span>
                                    )}
                                </h3>
                            </div>

                            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-full sm:w-auto shadow-inner">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jam Masuk</p>
                                    <p className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">{todayAttendance?.check_in_time || '--:--'}</p>
                                </div>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jam Pulang</p>
                                    <p className="text-lg font-mono font-black text-indigo-600 dark:text-indigo-400">{todayAttendance?.check_out_time || '--:--'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Colorful Stat Cards Grid (Inspired by History.jsx) */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            <span>Rekapitulasi Presensi Bulan Ini</span>
                        </div>
                        <Link
                            href={route('student-portal.history')}
                            className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                        >
                            <span>Lihat Kalender Lengkap</span>
                            <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                        {statsCards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="relative overflow-hidden rounded-3xl shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className={`p-5 rounded-3xl border ${card.bgLight} backdrop-blur-md flex flex-col justify-between h-full relative z-10`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            {card.label}
                                        </span>
                                        <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/50 dark:border-slate-800">
                                            {card.icon}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className={`text-2xl sm:text-3xl font-black ${card.textColor} tracking-tight`}>
                                            {card.value}
                                        </h3>
                                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                            {card.unit}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Attendance List Card */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-indigo-500" />
                                    <span>Riwayat Presensi Terbaru</span>
                                </CardTitle>
                                <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">7 transaksi presensi harian terakhir Anda</CardDescription>
                            </div>
                            <Link
                                href={route('student-portal.history')}
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-900/60"
                            >
                                Kalender Presensi <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {attendancesList.length === 0 ? (
                                    <div className="p-10 text-center text-slate-400 font-semibold">
                                        <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                        <span>Belum ada data riwayat presensi tercatat.</span>
                                    </div>
                                ) : (
                                    attendancesList.map((item) => (
                                        <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                            <div className="flex items-center space-x-3.5">
                                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">{item.date}</p>
                                                    <p className="text-xs text-slate-500 font-semibold">{item.day_name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                        Masuk: <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{item.check_in_time}</span> | Pulang: <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{item.check_out_time}</span>
                                                    </p>
                                                </div>
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
