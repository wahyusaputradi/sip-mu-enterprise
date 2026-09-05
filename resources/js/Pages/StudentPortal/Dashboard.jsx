import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, Calendar, Clock, CheckCircle2, AlertTriangle, Thermometer, ShieldAlert,
    QrCode, FileText, CalendarDays, Award, UserCheck, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StudentDashboard({ auth, student = {}, todayAttendance = null, monthlyStats = {}, recentAttendances = [], pendingLeavesCount = 0 }) {
    const studentData = student || {};
    const statsData = monthlyStats || {};
    const attendancesList = Array.isArray(recentAttendances) ? recentAttendances : [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'present':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">✓ Hadir Tepat Waktu</span>;
            case 'late':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">⚠️ Terlambat</span>;
            case 'sick':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">🏥 Sakit</span>;
            case 'permit':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">📜 Izin</span>;
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">✗ Alpha</span>;
        }
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Portal Siswa — ${studentData?.name || 'Siswa'}`} />

            <div className="space-y-6 pb-12">
                {/* Banner Profile */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-500/20">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-indigo-400/40 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                {studentData?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest inline-block mb-1">
                                    Portal Mandiri Siswa / Wali Murid
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black text-white">{studentData?.name || 'Siswa'}</h1>
                                <p className="text-xs text-slate-300 font-medium mt-0.5">
                                    NIS: <span className="font-mono font-bold text-white">{studentData?.nis || '-'}</span> | Kelas: <span className="font-bold text-indigo-300">{studentData?.school_class?.name || '-'}</span> | Wali Kelas: <span className="font-bold text-slate-200">{studentData?.school_class?.homeroom_teacher?.name || '-'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Link
                                href={route('student-portal.digital-card')}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition-all"
                            >
                                <QrCode className="w-4 h-4 mr-2 text-indigo-600" /> Kartu Digital QR
                            </Link>
                            <Link
                                href={route('student-portal.leave-requests')}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-extrabold text-xs hover:bg-indigo-500/30 transition-all"
                            >
                                <CalendarDays className="w-4 h-4 mr-2" /> Ajukan Izin ({pendingLeavesCount || 0})
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Today Status Card */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Presensi Hari Ini</span>
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                                {todayAttendance ? (
                                    <span className="flex items-center gap-2">
                                        {getStatusBadge(todayAttendance.status)}
                                    </span>
                                ) : (
                                    <span className="text-amber-500 font-bold">Belum Melakukan Scan Presensi Hari Ini</span>
                                )}
                            </h3>
                        </div>

                        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 w-full sm:w-auto">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Jam Masuk</p>
                                <p className="text-lg font-mono font-black text-slate-900 dark:text-white">{todayAttendance?.check_in_time || '--:--'}</p>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Jam Pulang</p>
                                <p className="text-lg font-mono font-black text-slate-900 dark:text-white">{todayAttendance?.check_out_time || '--:--'}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400">Tepat Waktu</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{statsData?.present || 0}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Hari Bulan Ini</p>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400">Terlambat</p>
                        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{statsData?.late || 0}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Hari Bulan Ini</p>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400">Sakit / Izin</p>
                        <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{(statsData?.sick || 0) + (statsData?.permit || 0)}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Hari Bulan Ini</p>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400">Alpha</p>
                        <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{statsData?.alpha || 0}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Hari Bulan Ini</p>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400">Tingkat Kehadiran</p>
                        <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{statsData?.percentage ?? 100}%</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Disiplin Presensi</p>
                    </Card>
                </div>

                {/* Recent Attendance List */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Riwayat Presensi Terbaru</CardTitle>
                            <CardDescription className="text-xs font-semibold text-slate-500">7 transaksi presensi harian terakhir Anda</CardDescription>
                        </div>
                        <Link
                            href={route('student-portal.history')}
                            className="inline-flex items-center text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Lihat Semua Kalender <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {attendancesList.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 font-semibold">
                                    Belum ada data riwayat presensi tercatat.
                                </div>
                            ) : (
                                attendancesList.map((item) => (
                                    <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                                <Calendar className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-slate-900 dark:text-white">{item.date}</p>
                                                <p className="text-xs text-slate-500 font-medium">{item.day_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    Masuk: <span className="font-mono font-extrabold text-slate-900 dark:text-white">{item.check_in_time}</span> | Pulang: <span className="font-mono font-extrabold text-slate-900 dark:text-white">{item.check_out_time}</span>
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
            </div>
        </AuthenticatedLayout>
    );
}
