import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdSenseBanner from '@/Components/AdSenseBanner';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    MapPin, 
    Clock, 
    Users, 
    Calendar, 
    ArrowUpRight, 
    TrendingUp, 
    CheckCircle2, 
    AlertCircle,
    FileText,
    Settings as SettingsIcon,
    Briefcase,
    CalendarDays,
    Timer,
    Plus,
    History,
    Activity,
    UserPlus,
    ArrowRight,
    Sparkles,
    CreditCard,
    Trophy,
    Star,
    Award,
    LockOpen,
    QrCode
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie, LabelList } from 'recharts';
import { motion } from 'framer-motion';
import { useLanguage } from '@/Context/LanguageContext';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard({ serverTimestamp, isEmployee, isGuruMurni, employee, todayAttendance, campusLocations, monthlyStats, adminStats, studentStats, executiveStats, todayHoliday, primaryRole, roleData, managementMonthlyStats, dailyTrendStats, studentDailyTrendStats }) {
    const { t, language } = useLanguage();
    const dateLocale = language === 'en' ? 'en-US' : 'id-ID';

    // We redirect to attendance.presensi instead of posting directly from dashboard.
    const [initialServerTime] = useState(() => serverTimestamp || Date.now());
    const [initialPerformanceTime] = useState(() => performance.now());
    const [currentTime, setCurrentTime] = useState(() => new Date(initialServerTime));
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            const elapsed = performance.now() - initialPerformanceTime;
            setCurrentTime(new Date(initialServerTime + elapsed));
        }, 1000);
        return () => clearInterval(timer);
    }, [initialServerTime, initialPerformanceTime]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const skeletonTimer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearTimeout(skeletonTimer);
        };
    }, []);

    const [personalTab, setPersonalTab] = useState('harian');
    const [mgmtTrendTab, setMgmtTrendTab] = useState('pegawai');

    const chartData = [
        { name: t('dash.present_month'), value: monthlyStats?.present || 0, color: '#6366f1' },
        { name: t('dash.late'), value: monthlyStats?.late || 0, color: '#f59e0b' },
        { name: t('dash.sick_permit'), value: (monthlyStats?.sick || 0) + (monthlyStats?.permit || 0), color: '#3b82f6' },
        { name: t('dash.alpha'), value: monthlyStats?.alpha || 0, color: '#ef4444' },
    ];

    const jtmChartData = [
        { name: 'JTM Hadir', value: monthlyStats?.jtm_present || 0, color: '#10b981' },
        { name: 'JTM Inval', value: monthlyStats?.jtm_inval || 0, color: '#8b5cf6' },
        { name: 'JTM Izin', value: monthlyStats?.jtm_permit || 0, color: '#3b82f6' },
        { name: 'JTM Libur', value: monthlyStats?.jtm_holiday || 0, color: '#64748b' },
        { name: 'JTM Alfa', value: monthlyStats?.jtm_absent || 0, color: '#ef4444' },
    ];

    const mgmtChartData = [
        { name: t('dash.present_month'), value: managementMonthlyStats?.present || 0, color: '#10b981' },
        { name: t('dash.late'), value: managementMonthlyStats?.late || 0, color: '#f59e0b' },
        { name: t('dash.sick_permit'), value: (managementMonthlyStats?.sick || 0) + (managementMonthlyStats?.permit || 0), color: '#3b82f6' },
        { name: t('dash.alpha'), value: managementMonthlyStats?.alpha || 0, color: '#ef4444' },
    ];

    const statsConfig = (() => {
        if (primaryRole === 'Super Admin' && adminStats) {
            return [
                { title: t('dash.total_employees'), value: adminStats.total_employees, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', link: 'employees.index' },
                { title: t('dash.present_today'), value: adminStats.present_today, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', link: 'monitoring.attendance' },
                { title: t('dash.late_today'), value: adminStats.late_today, icon: <AlertCircle className="w-5 h-5" />, color: 'from-orange-400 to-rose-500', link: 'monitoring.attendance' },
                { title: t('dash.pending_leaves'), value: adminStats.pending_leaves, icon: <CalendarDays className="w-5 h-5" />, color: 'from-purple-500 to-fuchsia-600', link: 'leave-requests.approval' },
            ];
        } else if (primaryRole === 'Kepala Sekolah' && adminStats) {
            const pct = adminStats.total_employees > 0 ? Math.round((adminStats.present_today / adminStats.total_employees) * 100) : 0;
            return [
                { title: t('dash.discipline'), value: `${pct}%`, icon: <Trophy className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', link: 'monitoring.attendance' },
                { title: t('dash.present_today'), value: adminStats.present_today, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', link: 'monitoring.attendance' },
                { title: t('dash.unrecorded'), value: roleData?.unrecordedTodayCount || 0, icon: <AlertCircle className="w-5 h-5" />, color: 'from-orange-400 to-rose-500', link: 'monitoring.attendance' },
                { title: t('dash.pending_leaves'), value: adminStats.pending_leaves, icon: <CalendarDays className="w-5 h-5" />, color: 'from-purple-500 to-fuchsia-600', link: 'leave-requests.approval' },
            ];
        } else if (primaryRole === 'Kurikulum') {
            return [
                { title: t('dash.open_inval'), value: roleData?.openBursaInvalCount || 0, icon: <Briefcase className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', link: 'invals.index' },
                { title: t('dash.teaching_schedules'), value: roleData?.totalTeachingSchedules || 0, icon: <CalendarDays className="w-5 h-5" />, color: 'from-indigo-500 to-purple-600', link: 'teaching-schedules.index' },
                { title: t('dash.present_today'), value: adminStats?.present_today || 0, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', link: 'monitoring.attendance' },
                { title: t('dash.pending_leaves'), value: adminStats?.pending_leaves || 0, icon: <CalendarDays className="w-5 h-5" />, color: 'from-purple-500 to-fuchsia-600', link: 'leave-requests.approval' },
            ];
        } else if (primaryRole === 'Absensi' && adminStats) {
            return [
                { title: t('dash.present_today'), value: adminStats.present_today, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', link: 'monitoring.attendance' },
                { title: t('dash.late'), value: adminStats.late_today, icon: <AlertCircle className="w-5 h-5" />, color: 'from-orange-400 to-rose-500', link: 'monitoring.attendance' },
                { title: t('dash.unrecorded'), value: roleData?.unrecordedTodayCount || 0, icon: <Clock className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', link: 'monitoring.attendance' },
                { title: t('dash.pending_leaves'), value: adminStats.pending_leaves, icon: <CalendarDays className="w-5 h-5" />, color: 'from-purple-500 to-fuchsia-600', link: 'leave-requests.approval' },
            ];
        } else if (primaryRole === 'Guru') {
            return [
                { title: t('dash.present_month'), value: monthlyStats?.present || 0, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', link: 'my-attendance.index' },
                { title: t('dash.late'), value: monthlyStats?.late || 0, icon: <AlertCircle className="w-5 h-5" />, color: 'from-orange-400 to-rose-500', link: 'my-attendance.index' },
                { title: t('dash.jtm_teaching'), value: `${monthlyStats?.jtm_present || 0} ${t('dash.hours_unit')}`, icon: <CalendarDays className="w-5 h-5" />, color: 'from-indigo-500 to-purple-600', link: 'my-schedule.index' },
                { title: t('dash.inval_hours'), value: `${monthlyStats?.jtm_inval || 0} ${t('dash.hours_unit')}`, icon: <Briefcase className="w-5 h-5" />, color: 'from-purple-500 to-fuchsia-600', link: 'invals.index' },
            ];
        } else {
            return [
                { title: t('dash.present_month'), value: monthlyStats?.present || 0, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', link: 'my-attendance.index' },
                { title: t('dash.late'), value: monthlyStats?.late || 0, icon: <AlertCircle className="w-5 h-5" />, color: 'from-orange-400 to-rose-500', link: 'my-attendance.index' },
                { title: t('dash.sick_permit'), value: (monthlyStats?.sick || 0) + (monthlyStats?.permit || 0), icon: <CalendarDays className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', link: 'my-attendance.index' },
                { title: t('dash.alpha'), value: monthlyStats?.alpha || 0, icon: <AlertCircle className="w-5 h-5" />, color: 'from-rose-500 to-red-600', link: 'my-attendance.index' },
            ];
        }
    })();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Sparkles className="w-3 h-3 mr-1.5" />
                                {adminStats ? `Dashboard ${primaryRole || 'Admin'}` : `Portal ${primaryRole || 'Pegawai'}`}
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            {t('dash.welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{employee?.name || 'Administrator'}</span> 👋
                        </h2>
                    </div>
                    <div className="bg-white/80 dark:bg-card/80 backdrop-blur-md p-2 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-border flex items-center space-x-5 pr-5">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl shadow-inner border border-white dark:border-border">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{t('dash.day_time')}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-none flex items-center justify-end gap-2">
                                <span>{currentTime.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold tabular-nums">
                                    {currentTime.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-8"
            >
                {isOffline && (
                    <div className="bg-red-500 text-white px-6 py-4 rounded-[1.5rem] shadow-lg flex items-center justify-between animate-bounce border border-red-600">
                        <div className="flex items-center space-x-3">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            <span className="text-sm font-black uppercase tracking-wider">Koneksi Internet Terputus! Beberapa fitur absensi telah dinonaktifkan sementara.</span>
                        </div>
                    </div>
                )}

                {/* Overview Cards per User Role */}
                {statsConfig && statsConfig.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsConfig.map((stat, idx) => (
                            <motion.div key={idx} variants={item}>
                                <Link href={route(stat.link)} className="block group">
                                    <Card className="overflow-hidden border border-white dark:border-border rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 relative bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-gradient-to-br ${stat.color} opacity-[0.08] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
                                        <CardContent className="p-7 relative z-10">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                                    {stat.icon}
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                                            <p className="text-4xl font-black text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 tracking-tighter">
                                                {stat.value}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Student Executive Overview Cards & Quick Actions */}
                {studentStats && (
                    <motion.div variants={item} className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 animate-pulse"></span>
                                    Presensi & Kesiswaan Siswa-Siswi
                                </h3>
                                <p className="text-xs font-semibold text-slate-500">Ringkasan kedisiplinan dan presensi siswa hari ini</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                    href={route('student-attendance.kiosk')}
                                    className="inline-flex items-center px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                                >
                                    <QrCode className="w-3.5 h-3.5 mr-1.5" /> Kiosk Scanner
                                </Link>
                                <Link
                                    href={route('student-attendance.monitoring')}
                                    className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-all hover:-translate-y-0.5"
                                >
                                    <Users className="w-3.5 h-3.5 mr-1.5" /> Monitoring Siswa
                                </Link>
                                <Link
                                    href={route('student-attendance.recap')}
                                    className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-all hover:-translate-y-0.5"
                                >
                                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Rekap Bulanan
                                </Link>
                                <Link
                                    href={route('student-leave-requests.index')}
                                    className="inline-flex items-center px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all hover:-translate-y-0.5"
                                >
                                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Approval Izin ({studentStats.pending_leaves || 0})
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <Users className="w-6 h-6 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-400">Total Siswa</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{studentStats.total_students}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Siswa Aktif</p>
                            </Card>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase text-emerald-600">Hadir</span>
                                </div>
                                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{studentStats.present_today}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Hadir Tepat Waktu</p>
                            </Card>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <AlertCircle className="w-6 h-6 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase text-amber-600">Terlambat</span>
                                </div>
                                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{studentStats.late_today}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Terlambat Hari Ini</p>
                            </Card>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <Calendar className="w-6 h-6 text-purple-500" />
                                    <span className="text-[10px] font-black uppercase text-purple-600">Sakit / Izin</span>
                                </div>
                                <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">{(studentStats.sick_today || 0) + (studentStats.permit_today || 0)}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Dengan Keterangan</p>
                            </Card>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <AlertCircle className="w-6 h-6 text-rose-500" />
                                    <span className="text-[10px] font-black uppercase text-rose-600">Alpha</span>
                                </div>
                                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{studentStats.alpha_today}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">Tanpa Keterangan</p>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* Executive Dashboard Overview (Super Admin, Kepsek, Kurikulum) */}
                {executiveStats && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Daily Overview Doughnut Chart */}
                        <motion.div variants={item} className="lg:col-span-1">
                            <Card className="h-full border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-xl hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                                <CardHeader className="p-6 pb-2">
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                                        {t('dash.present_today')}
                                    </CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live School Overview</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <div className="h-[220px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={executiveStats.dailyOverview}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={85}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                    cornerRadius={8}
                                                >
                                                    {executiveStats.dailyOverview.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: '900', fontSize: '13px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
                                                    itemStyle={{ color: '#0f172a', fontWeight: '900' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 bg-slate-50/50 dark:bg-secondary/50 p-4 rounded-2xl border border-slate-100/50 dark:border-border">
                                        {executiveStats.dailyOverview.map((entry, idx) => (
                                            <div key={idx} className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: entry.color }}></span>
                                                <span className="flex-1 truncate">{entry.name}</span>
                                                <span className="text-slate-900 dark:text-slate-100 ml-1">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Performers and Needs Attention */}
                        <motion.div variants={item} className="lg:col-span-2">
                            <Card className="h-full border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-xl hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                                <CardHeader className="p-6 pb-4 border-b border-slate-100/50 dark:border-border/50 flex flex-row items-center justify-between bg-slate-50/30 dark:bg-secondary/30 rounded-t-[2rem]">
                                    <div>
                                        <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
                                            <Award className="w-5 h-5 mr-2 text-indigo-500" />
                                            {t('dash.discipline_month')}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center">
                                            Performance Overview <span className="mx-2 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span> {new Date().toLocaleString(dateLocale, { month: 'long', year: 'numeric' })}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                                    {/* Top Performers */}
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center mb-4 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full w-max border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                                            <Trophy className="w-3.5 h-3.5 mr-2" /> {t('dash.top_performers')}
                                        </h4>
                                        <div className="space-y-3">
                                            {executiveStats.topPerformers.map((emp, i) => (
                                                <div key={i} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-[1.25rem] bg-white dark:bg-card border border-slate-100 dark:border-border hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-center min-w-0 mr-2 flex-1">
                                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[0.8rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black text-xs mr-2.5 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                                            #{i + 1}
                                                        </div>
                                                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors truncate" title={emp.name}>{emp.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 sm:px-2.5 py-1.5 rounded-lg shrink-0 text-center whitespace-nowrap">
                                                        {emp.count} {t('dash.present_unit')}
                                                    </span>
                                                </div>
                                            ))}
                                            {executiveStats.topPerformers.length === 0 && (
                                                <div className="text-center text-xs text-slate-400 py-8 font-bold border-2 border-dashed border-slate-100 dark:border-border rounded-[1.25rem]">Belum ada data absensi.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Needs Attention */}
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 flex items-center mb-4 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-full w-max border border-rose-100 dark:border-rose-500/20 shadow-sm">
                                            <AlertCircle className="w-3.5 h-3.5 mr-2" /> Needs Attention
                                        </h4>
                                        <div className="space-y-3">
                                            {executiveStats.bottomPerformers.map((emp, i) => (
                                                <div key={i} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-[1.25rem] bg-white dark:bg-card border border-slate-100 dark:border-border hover:border-rose-200 dark:hover:border-rose-500/30 hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-center min-w-0 mr-2 flex-1">
                                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[0.8rem] bg-gradient-to-br from-rose-400 to-red-500 text-white flex items-center justify-center font-black text-xs mr-2.5 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                                            #{i + 1}
                                                        </div>
                                                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-rose-500 transition-colors truncate" title={emp.name}>{emp.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-2 sm:px-2.5 py-1.5 rounded-lg flex items-center justify-center shrink-0 text-center whitespace-nowrap">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-pulse shrink-0"></span>
                                                        {emp.count} Pelanggaran
                                                    </span>
                                                </div>
                                            ))}
                                            {executiveStats.bottomPerformers.length === 0 && (
                                                <div className="text-center text-xs text-rose-500 py-8 font-bold border-2 border-dashed border-rose-100 dark:border-border rounded-[1.25rem] bg-rose-50/50 dark:bg-rose-500/5">
                                                    ✨ Tidak ada pelanggaran!
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Buka Kunci Presensi */}
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 flex items-center mb-4 bg-violet-50 dark:bg-violet-500/10 px-3 py-1.5 rounded-full w-max border border-violet-100 dark:border-violet-500/20 shadow-sm">
                                            <LockOpen className="w-3.5 h-3.5 mr-2" /> Buka Kunci
                                        </h4>
                                        <div className="space-y-3">
                                            {executiveStats.mostUnlocked?.map((emp, i) => (
                                                <div key={i} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-[1.25rem] bg-white dark:bg-card border border-slate-100 dark:border-border hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-center min-w-0 mr-2 flex-1">
                                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[0.8rem] bg-gradient-to-br from-violet-400 to-indigo-500 text-white flex items-center justify-center font-black text-xs mr-2.5 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                                            #{i + 1}
                                                        </div>
                                                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-violet-600 transition-colors truncate" title={emp.name}>{emp.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-2 sm:px-2.5 py-1.5 rounded-lg shrink-0 text-center whitespace-nowrap">
                                                        {emp.count} Buka Kunci
                                                    </span>
                                                </div>
                                            ))}
                                            {(!executiveStats.mostUnlocked || executiveStats.mostUnlocked.length === 0) && (
                                                <div className="text-center text-xs text-slate-400 py-8 font-bold border-2 border-dashed border-slate-100 dark:border-border rounded-[1.25rem]">
                                                    Belum ada data buka kunci.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Area */}
                    <motion.div variants={item} className="lg:col-span-2 space-y-8">
                        {/* Attendance Punch Card (Personal) */}
                        {isEmployee && !isGuruMurni && (
                            <Card className="border border-white/10 shadow-2xl rounded-[2.5rem] bg-[#0F172A] text-white overflow-hidden relative group">
                                {/* Decorative Background Elements */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                                    <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500 rounded-full blur-[120px]"></div>
                                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500 rounded-full blur-[120px]"></div>
                                </div>
                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                                
                                <CardContent className="p-12 relative z-10">
                                    <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
                                        <div className="space-y-8 text-center lg:text-left">
                                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black tracking-[0.2em] uppercase text-indigo-400 backdrop-blur-md">
                                                <Activity className="w-3 h-3 mr-2 animate-pulse" /> {todayHoliday ? 'Libur Sekolah' : 'Real-time Attendance'}
                                            </div>
                                            <div className="flex items-center justify-center lg:justify-start space-x-12">
                                                <div>
                                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-3">Check In</p>
                                                    <p className="text-6xl font-black tracking-tighter text-white drop-shadow-lg">
                                                        {todayAttendance?.check_in ? todayAttendance.check_in.substring(0, 5) : '--:--'}
                                                    </p>
                                                </div>
                                                <div className="h-16 w-px bg-slate-800/50"></div>
                                                <div>
                                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-3">Check Out</p>
                                                    <p className="text-6xl font-black tracking-tighter text-slate-500">
                                                        {todayAttendance?.check_out ? todayAttendance.check_out.substring(0, 5) : '--:--'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-auto">
                                            {todayHoliday ? (
                                                <div className="bg-blue-500/10 border border-blue-500/20 px-10 py-8 rounded-[2rem] text-center backdrop-blur-md">
                                                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(59,130,246,0.3)] border border-white/20">
                                                        <CalendarDays className="w-8 h-8 text-white" />
                                                    </div>
                                                    <p className="font-black text-xl text-white mb-1">Hari Libur</p>
                                                    <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.2em] line-clamp-2 max-w-[200px] mx-auto">{todayHoliday.description}</p>
                                                </div>
                                            ) : !todayAttendance?.check_in ? (
                                                isOffline ? (
                                                    <button 
                                                        disabled
                                                        className="inline-flex items-center justify-center w-full lg:w-auto h-24 px-12 bg-slate-800 text-slate-500 font-black text-xl rounded-3xl border border-white/5 cursor-not-allowed opacity-50"
                                                    >
                                                        <MapPin className="w-7 h-7 mr-3 text-slate-500" /> Presensi Masuk (Offline)
                                                    </button>
                                                ) : (
                                                    <Link 
                                                        href={route('attendance.presensi')} 
                                                        className="inline-flex items-center justify-center w-full lg:w-auto h-24 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xl rounded-3xl shadow-[0_10px_40px_rgba(99,102,241,0.4)] border border-white/10 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                                    >
                                                        <MapPin className="w-7 h-7 mr-3" /> Presensi Masuk
                                                    </Link>
                                                )
                                            ) : !todayAttendance?.check_out ? (
                                                isOffline ? (
                                                    <button 
                                                        disabled
                                                        className="inline-flex items-center justify-center w-full lg:w-auto h-24 px-12 bg-slate-800 text-slate-500 font-black text-xl rounded-3xl border border-white/5 cursor-not-allowed opacity-50"
                                                    >
                                                        <Clock className="w-7 h-7 mr-3 text-slate-500" /> Presensi Keluar (Offline)
                                                    </button>
                                                ) : (
                                                    <Link 
                                                        href={route('attendance.presensi')} 
                                                        className="inline-flex items-center justify-center w-full lg:w-auto h-24 px-12 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-xl rounded-3xl shadow-[0_10px_40px_rgba(225,29,72,0.4)] border border-white/10 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                                    >
                                                        <Clock className="w-7 h-7 mr-3" /> Presensi Keluar
                                                    </Link>
                                                )
                                            ) : (
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-10 py-8 rounded-[2rem] text-center backdrop-blur-md">
                                                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-white/20">
                                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                                    </div>
                                                    <p className="font-black text-xl text-white mb-1">Selesai Hari Ini</p>
                                                    <p className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.2em]">Pekerjaan Hebat!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        )}

                        {/* Jadwal Mengajar Full Card for Teachers */}
                        {isEmployee && roleData?.todayTeachingSchedule && roleData.todayTeachingSchedule.length > 0 && (
                            <Card className="border border-white/10 shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                                <CardHeader className="p-8 pb-4 relative z-10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center">
                                            <CalendarDays className="w-6 h-6 mr-3 text-indigo-400" />
                                            Jadwal Mengajar Hari Ini
                                        </CardTitle>
                                        <CardDescription className="text-indigo-200 mt-2 font-medium">
                                            Anda memiliki {roleData.todayTeachingSchedule.length} kelas hari ini dari total {roleData.totalWeeklyHours} sesi per minggu.
                                        </CardDescription>
                                    </div>
                                    {isOffline ? (
                                        <button 
                                            disabled
                                            className="inline-flex items-center justify-center bg-slate-700 text-slate-500 rounded-2xl px-6 h-12 font-bold cursor-not-allowed opacity-50 w-full sm:w-auto"
                                        >
                                            <Timer className="w-4 h-4 mr-2" /> Presensi Kelas (Offline)
                                        </button>
                                    ) : (
                                        <Link 
                                            href={route('attendance.presensi')} 
                                            className="inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-indigo-500/30 w-full sm:w-auto transition-transform active:scale-95"
                                        >
                                            <Timer className="w-4 h-4 mr-2" /> Presensi Kelas
                                        </Link>
                                    )}
                                </CardHeader>
                                <CardContent className="p-8 pt-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {isLoading ? (
                                            Array.from({ length: 2 }).map((_, i) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center animate-pulse">
                                                    <div className="h-14 w-14 rounded-[1rem] bg-white/10 mr-4"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            roleData.todayTeachingSchedule.map((ts, i) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex items-center group/item">
                                                    <div className="h-14 w-14 rounded-[1rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center font-black mr-4 shadow-inner ring-1 ring-white/20">
                                                        <span className="text-[10px] font-black opacity-80 uppercase tracking-widest leading-tight">Jam</span>
                                                        <span className="text-xl leading-tight">{ts.hour_number}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-lg font-black text-white group-hover/item:text-indigo-300 transition-colors truncate">{ts.subject}</p>
                                                        <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                            <Users className="w-3.5 h-3.5 mr-1.5" /> {ts.class_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Chart Card */}
                        <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-xl overflow-hidden group">
                            <CardHeader className="p-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50/50 dark:border-border">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                        {adminStats ? 'Tren & Statistik Kehadiran Sekolah' : 'Statistik Presensi Saya'}
                                    </CardTitle>
                                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1 flex items-center">
                                        {adminStats ? 'School Daily Trend' : 'Personal Recap'} <span className="mx-2 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span> {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {adminStats && studentStats && (
                                        <div className="bg-slate-100 dark:bg-secondary p-1 rounded-xl flex items-center border border-slate-200/60 dark:border-border">
                                            <button
                                                type="button"
                                                onClick={() => setMgmtTrendTab('pegawai')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${mgmtTrendTab === 'pegawai' ? 'bg-white dark:bg-card text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                Pegawai & Guru
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMgmtTrendTab('siswa')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${mgmtTrendTab === 'siswa' ? 'bg-white dark:bg-card text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                Siswa-Siswi
                                            </button>
                                        </div>
                                    )}
                                    {!adminStats && monthlyStats?.has_jtm && (
                                        <div className="bg-slate-100 dark:bg-secondary p-1 rounded-xl flex items-center border border-slate-200/60 dark:border-border">
                                            <button
                                                type="button"
                                                onClick={() => setPersonalTab('harian')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${personalTab === 'harian' ? 'bg-white dark:bg-card text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                Presensi Harian
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPersonalTab('jtm')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${personalTab === 'jtm' ? 'bg-white dark:bg-card text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                JTM Mengajar
                                            </button>
                                        </div>
                                    )}
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-secondary border border-slate-100 dark:border-border text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/20 transition-all duration-300 shadow-sm">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-6">
                                {isLoading ? (
                                    <div className="h-[350px] w-full flex items-end justify-between px-6 pb-2 pt-10">
                                        <div className="w-[15%] bg-slate-200 dark:bg-slate-800 rounded-t-2xl animate-pulse" style={{ height: '70%' }}></div>
                                        <div className="w-[15%] bg-slate-200 dark:bg-slate-800 rounded-t-2xl animate-pulse" style={{ height: '30%' }}></div>
                                        <div className="w-[15%] bg-slate-200 dark:bg-slate-800 rounded-t-2xl animate-pulse" style={{ height: '15%' }}></div>
                                        <div className="w-[15%] bg-slate-200 dark:bg-slate-800 rounded-t-2xl animate-pulse" style={{ height: '5%' }}></div>
                                    </div>
                                ) : adminStats ? (
                                    <div className="space-y-6">
                                        {/* Cumulative Badges */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tepat Waktu</p>
                                                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                                                    {mgmtTrendTab === 'siswa' ? (studentStats?.present_today || 0) : (managementMonthlyStats?.present || 0)}
                                                </p>
                                            </div>
                                            <div className="bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Terlambat</p>
                                                <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">
                                                    {mgmtTrendTab === 'siswa' ? (studentStats?.late_today || 0) : (managementMonthlyStats?.late || 0)}
                                                </p>
                                            </div>
                                            <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sakit / Izin</p>
                                                <p className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
                                                    {mgmtTrendTab === 'siswa' ? ((studentStats?.sick_today || 0) + (studentStats?.permit_today || 0)) : ((managementMonthlyStats?.sick || 0) + (managementMonthlyStats?.permit || 0))}
                                                </p>
                                            </div>
                                            <div className="bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Alpha</p>
                                                <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
                                                    {mgmtTrendTab === 'siswa' ? (studentStats?.alpha_today || 0) : (managementMonthlyStats?.alpha || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Area Trend Chart */}
                                        <div className="h-[300px] w-full pt-2">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={(mgmtTrendTab === 'siswa' ? studentDailyTrendStats : dailyTrendStats) || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorSickPermit" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.6} />
                                                    <XAxis 
                                                        dataKey="day" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                                        dy={10}
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                                        allowDecimals={false}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
                                                        itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                                        labelStyle={{ fontWeight: 900, color: '#0f172a', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}
                                                    />
                                                    <Area type="monotone" dataKey="present" name="Tepat Waktu" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
                                                    <Area type="monotone" dataKey="late" name="Terlambat" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLate)" strokeWidth={2} />
                                                    <Area type="monotone" dataKey="sick_permit" name="Sakit/Izin" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSickPermit)" strokeWidth={2} />
                                                    <Area type="monotone" dataKey="alpha" name="Alpha" stroke="#ef4444" fillOpacity={1} fill="url(#colorAlpha)" strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {personalTab === 'jtm' && (
                                            <div className="bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
                                                <span className="font-extrabold text-indigo-700 dark:text-indigo-300">Target JTM Terjadwal Bulan Ini:</span>
                                                <span className="font-black text-indigo-900 dark:text-indigo-100 bg-white dark:bg-card px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-border">{monthlyStats?.jtm_scheduled || 0} Jam</span>
                                            </div>
                                        )}
                                        <div className="h-[340px] w-full pt-2">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart 
                                                    data={personalTab === 'jtm' ? jtmChartData : chartData} 
                                                    margin={{ top: 25, right: 10, left: -10, bottom: 35 }}
                                                >
                                                    <defs>
                                                        {(personalTab === 'jtm' ? jtmChartData : chartData).map((entry, index) => (
                                                            <linearGradient key={`grad-p-${index}`} id={`colorUv-p-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                                                                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                                                            </linearGradient>
                                                        ))}
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.6} />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        interval={0}
                                                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                        dy={10}
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        allowDecimals={false}
                                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                                                    />
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(248,250,252,0.8)' }}
                                                        contentStyle={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
                                                        itemStyle={{ fontWeight: 900, fontSize: '13px' }}
                                                        labelStyle={{ fontWeight: 800, color: '#64748b', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                                    />
                                                    <Bar dataKey="value" radius={[14, 14, 4, 4]} barSize={52}>
                                                        {(personalTab === 'jtm' ? jtmChartData : chartData).map((entry, index) => (
                                                            <Cell key={`cell-p-${index}`} fill={`url(#colorUv-p-${index})`} />
                                                        ))}
                                                        <LabelList dataKey="value" position="top" style={{ fill: '#1e293b', fontSize: 12, fontWeight: 900 }} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sidebar Area */}
                    <motion.div variants={item} className="space-y-8">
                        {/* Elegant Profile Card */}
                        <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500">
                            <CardContent className="p-0">
                                <div className="h-36 bg-gradient-to-br from-[#6366f1] to-[#a855f7] relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                    <div className="absolute w-full h-full bg-black/10"></div>
                                </div>
                                <div className="px-8 pb-8 -mt-20 relative z-10 text-center">
                                    <div className="h-36 w-36 rounded-[2.5rem] bg-white p-2.5 shadow-2xl mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 ring-1 ring-slate-100">
                                        <div className="h-full w-full rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-300 font-black text-5xl overflow-hidden shadow-inner border border-white">
                                            {employee?.name ? employee.name.charAt(0) : 'A'}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight mb-2 tracking-tight">{employee?.name || 'Administrator'}</h3>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6">
                                        {employee?.position?.name || 'System Controller'}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50/80 dark:bg-secondary/80 border border-slate-100 dark:border-border p-4 rounded-[1.5rem] text-center hover:bg-slate-50 dark:hover:bg-secondary transition-colors">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">NIK/NIP</p>
                                            <p className="text-[13px] font-black text-slate-900 dark:text-slate-100 truncate">{employee?.nip || '-'}</p>
                                        </div>
                                        <div className="bg-slate-50/80 dark:bg-secondary/80 border border-slate-100 dark:border-border p-4 rounded-[1.5rem] text-center hover:bg-slate-50 dark:hover:bg-secondary transition-colors">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Status</p>
                                            <p className="text-[13px] font-black text-emerald-600 flex items-center justify-center">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Quick Actions - Role Aware */}
                        <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                            <CardHeader className="px-8 pt-8 pb-2">
                                <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Navigasi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 grid grid-cols-2 gap-4">
                                {(() => {
                                    let actions = [];
                                    
                                    if (primaryRole === 'Super Admin') {
                                        actions = [
                                            { label: 'Monitor Absen', icon: <Activity className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'monitoring.attendance' },
                                            { label: 'Data Pegawai', icon: <Users className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/30', route: 'employees.index' },
                                            { label: 'Persetujuan Cuti', icon: <CheckCircle2 className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.approval' },
                                            { label: 'Pengaturan Sistem', icon: <SettingsIcon className="w-6 h-6" />, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/30', route: 'settings.index' },
                                        ];
                                    } else if (primaryRole === 'Kepala Sekolah') {
                                        actions = [
                                            { label: 'Monitor Absen', icon: <Activity className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'monitoring.attendance' },
                                            { label: 'Data Pegawai', icon: <Users className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/30', route: 'employees.index' },
                                            { label: 'Persetujuan Cuti', icon: <CheckCircle2 className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.approval' },
                                            { label: 'Rekap Presensi', icon: <FileText className="w-6 h-6" />, color: 'from-sky-400 to-blue-500', shadow: 'shadow-blue-500/30', route: 'attendance.recap' },
                                        ];
                                    } else if (primaryRole === 'Kurikulum') {
                                        actions = [
                                            { label: 'Jadwal Mengajar', icon: <CalendarDays className="w-6 h-6" />, color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/30', route: 'teaching-schedules.index' },
                                            { label: 'Bursa Inval', icon: <Briefcase className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/30', route: 'invals.index' },
                                            { label: 'Monitor Absen', icon: <Activity className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'monitoring.attendance' },
                                            { label: 'Persetujuan Cuti', icon: <CheckCircle2 className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.approval' },
                                        ];
                                    } else if (primaryRole === 'Absensi') {
                                        actions = [
                                            { label: 'Presensi Harian', icon: <Clock className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'attendance.presensi' },
                                            { label: 'Monitor Absen', icon: <Activity className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'monitoring.attendance' },
                                            { label: 'Persetujuan Cuti', icon: <CheckCircle2 className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.approval' },
                                            { label: 'Rekap Presensi', icon: <FileText className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30', route: 'attendance.recap' },
                                        ];
                                    } else if (primaryRole === 'Guru') {
                                        actions = [
                                            { label: 'Presensi Kelas', icon: <Clock className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'attendance.presensi' },
                                            { label: 'Jadwal Saya', icon: <CalendarDays className="w-6 h-6" />, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/30', route: 'my-schedule.index' },
                                            { label: 'Bursa Inval', icon: <Briefcase className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/30', route: 'invals.index' },
                                            { label: 'Cuti / Izin', icon: <Plus className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.index' },
                                        ];
                                    } else {
                                        actions = [
                                            { label: 'Presensi Harian', icon: <Clock className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'attendance.presensi' },
                                            { label: 'Absensi Saya', icon: <History className="w-6 h-6" />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30', route: 'my-attendance.index' },
                                            { label: 'Pengajuan Cuti', icon: <Briefcase className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.index' },
                                        ];
                                    }

                                    return actions.map((action, idx) => (
                                        <Link 
                                            key={idx} 
                                            href={route(action.route)}
                                            className="group flex flex-col items-center p-5 rounded-[2rem] bg-slate-50/50 dark:bg-secondary/50 hover:bg-white dark:hover:bg-card hover:shadow-[0_10px_30px_rgb(0,0,0,0.06)] transition-all duration-500 border border-slate-100/50 dark:border-border hover:border-white dark:hover:border-border hover:-translate-y-1"
                                        >
                                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform duration-500 mb-4 shadow-lg ${action.shadow} ring-2 ring-white/50`}>
                                                {action.icon}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-[0.2em] group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors leading-tight">{action.label}</span>
                                        </Link>
                                    ));
                                })()}
                            </CardContent>
                        </Card>

                        {/* Pending Leaves Mini List (Admin Only) */}
                        {adminStats?.recent_pending_leaves && adminStats.recent_pending_leaves.length > 0 && (
                            <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                                <CardHeader className="px-8 pt-8 pb-2 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Menunggu Persetujuan</CardTitle>
                                    <Link href={route('leave-requests.approval')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Lihat Semua</Link>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="space-y-2">
                                        {adminStats.recent_pending_leaves.map((leave) => (
                                            <div key={leave.id} className="flex items-center p-4 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-secondary hover:shadow-sm transition-all duration-300 group border border-transparent hover:border-slate-100 dark:hover:border-border">
                                                <div className="h-10 w-10 rounded-[1rem] bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-4 shadow-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{leave.employee_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{leave.type} • {leave.start_date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Bursa Inval Available Offers (Guru & Kurikulum Role) */}
                        {roleData?.availableInvalOffers && roleData.availableInvalOffers.length > 0 && (
                            <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                                <CardHeader className="px-8 pt-8 pb-2 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-emerald-500" />
                                        Bursa Inval Tersedia
                                    </CardTitle>
                                    <Link href={route('invals.index')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">Lihat Semua</Link>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="space-y-2">
                                        {roleData.availableInvalOffers.map((offer) => (
                                            <div key={offer.id} className="flex items-center p-4 rounded-[1.5rem] bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:shadow-sm transition-all duration-300">
                                                <div className="h-10 w-10 rounded-[1rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mr-4 shadow-sm font-black text-xs">
                                                    INVAL
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{offer.subject} ({offer.class_name})</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{offer.absent_name} • {offer.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Live Attendance Feed (Absensi / Kepsek / Admin Role) */}
                        {roleData?.todayLatestAttendances && roleData.todayLatestAttendances.length > 0 && (
                            <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                                <CardHeader className="px-8 pt-8 pb-2 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                                        Presensi Terkini Hari Ini
                                    </CardTitle>
                                    <Link href={route('monitoring.attendance')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Monitor Full</Link>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="space-y-2">
                                        {roleData.todayLatestAttendances.map((att) => (
                                            <div key={att.id} className="flex items-center p-3.5 rounded-[1.5rem] bg-slate-50/80 dark:bg-secondary/80 border border-slate-100 dark:border-border">
                                                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 font-black text-xs">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{att.employee_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Jam {att.check_in}</p>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${att.status === 'present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                    {att.status === 'present' ? 'Hadir' : 'Terlambat'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}



                        {/* Recent Activity Mini List */}
                        <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                            <CardHeader className="px-8 pt-8 pb-2">
                                <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Campus Coverage</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="space-y-2">
                                    {campusLocations.map((loc) => (
                                        <div key={loc.id} className="flex items-center p-4 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-secondary hover:shadow-sm transition-all duration-300 group border border-transparent hover:border-slate-100 dark:hover:border-border">
                                            <div className="h-12 w-12 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{loc.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{loc.radius}m Radius</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full border border-slate-200 dark:border-border flex items-center justify-center text-slate-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/20 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                    {campusLocations.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 font-bold text-sm">
                                            Belum ada data lokasi.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Google AdSense Responsive Unit Container */}
                <AdSenseBanner />
            </motion.div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
                :root { --font-sans: 'Plus Jakarta Sans', sans-serif; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em; }
            `}} />
        </AuthenticatedLayout>
    );
}
