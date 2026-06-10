import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
    Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';

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

export default function Dashboard({ isEmployee, isGuruMurni, employee, todayAttendance, campusLocations, monthlyStats, adminStats, executiveStats, todayHoliday, primaryRole, roleData }) {
    // We redirect to attendance.presensi instead of posting directly from dashboard.

    const chartData = [
        { name: 'Hadir', value: monthlyStats?.present || 0, color: '#6366f1' },
        { name: 'Terlambat', value: monthlyStats?.late || 0, color: '#f59e0b' },
        { name: 'Sakit/Izin', value: (monthlyStats?.sick || 0) + (monthlyStats?.permit || 0), color: '#3b82f6' },
        { name: 'Alfa', value: monthlyStats?.alpha || 0, color: '#ef4444' },
    ];

    const statsConfig = adminStats ? [
        { title: 'Total Pegawai', value: adminStats.total_employees, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', link: 'employees.index' },
        { title: 'Hadir Hari Ini', value: adminStats.present_today, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', link: 'monitoring.attendance' },
        { title: 'Terlambat', value: adminStats.late_today, icon: <AlertCircle className="w-5 h-5" />, color: 'from-orange-400 to-rose-500', link: 'monitoring.attendance' },
        { title: 'Pending Cuti', value: adminStats.pending_leaves, icon: <CalendarDays className="w-5 h-5" />, color: 'from-purple-500 to-fuchsia-600', link: 'leave-requests.index' },
    ] : [];

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
                            Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{employee?.name || 'Administrator'}</span> 👋
                        </h2>
                    </div>
                    <div className="bg-white/80 dark:bg-card/80 backdrop-blur-md p-2 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-border flex items-center space-x-5 pr-5">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl shadow-inner border border-white dark:border-border">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Hari Ini</p>
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-none">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
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
                {/* Admin Overview Cards */}
                {adminStats && (
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

                {/* Executive Dashboard Overview (Super Admin, Kepsek, Kurikulum) */}
                {executiveStats && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Daily Overview Doughnut Chart */}
                        <motion.div variants={item} className="lg:col-span-1">
                            <Card className="h-full border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-xl hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                                <CardHeader className="p-6 pb-2">
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                                        Kehadiran Hari Ini
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
                                            Kedisiplinan Bulan Ini
                                        </CardTitle>
                                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center">
                                            Performance Overview <span className="mx-2 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span> {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Top Performers */}
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center mb-4 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full w-max border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                                            <Trophy className="w-3.5 h-3.5 mr-2" /> Top Performers
                                        </h4>
                                        <div className="space-y-3">
                                            {executiveStats.topPerformers.map((emp, i) => (
                                                <div key={i} className="group flex items-center justify-between p-3 rounded-[1.25rem] bg-white dark:bg-card border border-slate-100 dark:border-border hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-center">
                                                        <div className="w-9 h-9 rounded-[0.8rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black text-xs mr-3 shadow-sm group-hover:scale-110 transition-transform">
                                                            #{i + 1}
                                                        </div>
                                                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{emp.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                                        {emp.count} Hadir
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
                                                <div key={i} className="group flex items-center justify-between p-3 rounded-[1.25rem] bg-white dark:bg-card border border-slate-100 dark:border-border hover:border-rose-200 dark:hover:border-rose-500/30 hover:shadow-md transition-all duration-300">
                                                    <div className="flex items-center">
                                                        <div className="w-9 h-9 rounded-[0.8rem] bg-slate-50 dark:bg-secondary text-rose-500 border border-slate-100 dark:border-border flex items-center justify-center font-black text-xs mr-3 shadow-sm group-hover:scale-110 group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10 transition-all">
                                                            <Star className="w-4 h-4 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-rose-500 transition-colors">{emp.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-2.5 py-1 rounded-lg flex items-center">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
                                                        {emp.count} Pelanggaran
                                                    </span>
                                                </div>
                                            ))}
                                            {executiveStats.bottomPerformers.length === 0 && (
                                                <div className="text-center text-xs text-emerald-500 py-8 font-bold border-2 border-dashed border-emerald-100 dark:border-emerald-500/20 rounded-[1.25rem] bg-emerald-50/50 dark:bg-emerald-500/5">
                                                    ✨ Tidak ada pelanggaran!
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
                                                <Link 
                                                    href={route('attendance.presensi')} 
                                                    className="inline-flex items-center justify-center w-full lg:w-auto h-24 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xl rounded-3xl shadow-[0_10px_40px_rgba(99,102,241,0.4)] border border-white/10 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                                >
                                                    <MapPin className="w-7 h-7 mr-3" /> Presensi Masuk
                                                </Link>
                                            ) : !todayAttendance?.check_out ? (
                                                <Link 
                                                    href={route('attendance.presensi')} 
                                                    className="inline-flex items-center justify-center w-full lg:w-auto h-24 px-12 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-xl rounded-3xl shadow-[0_10px_40px_rgba(225,29,72,0.4)] border border-white/10 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                                >
                                                    <Clock className="w-7 h-7 mr-3" /> Presensi Keluar
                                                </Link>
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
                                    <Link 
                                        href={route('attendance.presensi')} 
                                        className="inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-indigo-500/30 w-full sm:w-auto transition-transform active:scale-95"
                                    >
                                        <Timer className="w-4 h-4 mr-2" /> Presensi Kelas
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-8 pt-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {roleData.todayTeachingSchedule.map((ts, i) => (
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
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Chart Card */}
                        <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-xl overflow-hidden group">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-slate-50/50 dark:border-border">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Statistik Bulanan</CardTitle>
                                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 flex items-center">
                                        Personal Recap <span className="mx-2 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span> {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                                    </CardDescription>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-secondary border border-slate-100 dark:border-border text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/20 transition-all duration-300 shadow-sm">
                                    <Activity className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-6">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                {chartData.map((entry, index) => (
                                                    <linearGradient key={`grad-${index}`} id={`colorUv-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6}/>
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.6} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
                                                dy={20}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(248,250,252,0.8)' }}
                                                contentStyle={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                                                itemStyle={{ fontWeight: 900, fontSize: '13px' }}
                                                labelStyle={{ fontWeight: 800, color: '#64748b', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                            />
                                            <Bar dataKey="value" radius={[16, 16, 4, 4]} barSize={56}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#colorUv-${index})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
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
                                    const isAdmin = ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi', 'Bendahara'].includes(primaryRole);
                                    let actions = [];
                                    
                                    if (isAdmin) {
                                        actions = [
                                            { label: 'Monitor Absen', icon: <Activity className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'monitoring.attendance' },
                                            { label: 'Pegawai', icon: <Users className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/30', route: 'employees.index' },
                                            { label: 'Persetujuan Cuti', icon: <CheckCircle2 className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.approval' },
                                            { label: 'Penggajian', icon: <CreditCard className="w-6 h-6" />, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-fuchsia-500/30', route: 'payroll.index' },
                                        ];
                                    } else {
                                        actions = [
                                            primaryRole === 'Guru' ? { label: 'Jadwal', icon: <CalendarDays className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', route: 'my-schedule.index' } : null,
                                            { label: 'Absensi Pribadi', icon: <Clock className="w-6 h-6" />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30', route: 'my-attendance.index' },
                                            { label: 'Slip Gaji', icon: <FileText className="w-6 h-6" />, color: 'from-emerald-400 to-emerald-500', shadow: 'shadow-emerald-500/30', route: 'my-payslip.index' },
                                            { label: 'Cuti/Izin', icon: <Briefcase className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', route: 'leave-requests.index' },
                                        ].filter(Boolean);
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

                        {/* Payroll Overview (Bendahara Only) */}
                        {roleData?.payrollStats && (
                            <Card className="border border-white dark:border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
                                <CardHeader className="px-8 pt-8 pb-2">
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-indigo-600" /> Penggajian Bulan Ini
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2 text-slate-500">
                                                <span>Total Slip</span>
                                                <span className="text-indigo-600">{roleData.payrollStats.total_this_month}</span>
                                            </div>
                                            <div className="w-full bg-white dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700">
                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2 text-slate-500">
                                                <span>Sudah Dibayar</span>
                                                <span className="text-emerald-600">{roleData.payrollStats.paid}</span>
                                            </div>
                                            <div className="w-full bg-white dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700">
                                                <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full" style={{ width: roleData.payrollStats.total_this_month > 0 ? `${(roleData.payrollStats.paid / roleData.payrollStats.total_this_month) * 100}%` : '0%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={route('payroll.index')} className="mt-6 w-full flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:shadow-md transition-all">
                                        Kelola Penggajian <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </Link>
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
            </motion.div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
                :root { --font-sans: 'Plus Jakarta Sans', sans-serif; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em; }
            `}} />
        </AuthenticatedLayout>
    );
}
