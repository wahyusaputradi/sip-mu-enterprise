import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import LanguageToggle from '@/Components/LanguageToggle';
import { useLanguage } from '@/Context/LanguageContext';
import PwaInstallPrompt from '@/Components/PwaInstallPrompt';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { 
    LayoutDashboard, 
    Users, 
    CalendarClock, 
    Settings, 
    MapPin, 
    ClipboardList,
    ChevronLeft,
    Menu,
    LogOut,
    User as UserIcon,
    Bell,
    Search,
    ChevronRight,
    Sparkles,
    Clock,
    FilePlus,
    ClipboardCheck,
    CalendarDays,
    School,
    GraduationCap,
    History,
    ShieldCheck,
    DatabaseBackup,
    Sun,
    Moon,
    AlertCircle,
    Image,
    QrCode,
    Printer,
    FileSpreadsheet
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

const RealtimeClock = () => {
    const [time, setTime] = useState(new Date());
    const { language } = useLanguage();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const locale = language === 'en' ? 'en-US' : 'id-ID';
    const dateStr = time.toLocaleDateString(locale, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).replace('.', '').toUpperCase();
    const timeStr = time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.');
    const timeZoneLabel = language === 'en' ? 'WIB (UTC+7)' : 'WIB';

    return (
        <div className="flex items-center bg-white/90 dark:bg-slate-900/90 rounded-full px-4 md:px-5 py-2 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-3 md:pr-4 mr-3 md:mr-4">
                <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] md:text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {dateStr}
                </span>
            </div>
            <div className="flex items-center">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="font-black text-slate-800 dark:text-slate-100 text-[12px] md:text-[13px] tracking-tight">
                    {timeStr} {timeZoneLabel}
                </span>
            </div>
        </div>
    );
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { flash, errors } = usePage().props;
    const { t } = useLanguage();
    
    // Map new custom roles to system roles for backward compatibility with menu filtering
    const roleMappings = {
        'Administrator (IT)': ['Super Admin', 'Kepala Sekolah'],
        'HRD / Bendahara': ['Bendahara', 'Absensi', 'Karyawan'],
        'Kurikulum / Admin': ['Kurikulum', 'Absensi'],
        'Guru / Karyawan Staf': ['Guru', 'Karyawan']
    };

    let baseRoles = user.roles || [];
    let expandedRoles = [...baseRoles];
    baseRoles.forEach(role => {
        if (roleMappings[role]) {
            expandedRoles = [...expandedRoles, ...roleMappings[role]];
        }
    });
    const roles = [...new Set(expandedRoles)];
    const isStudent = roles.some(r => ['Siswa', 'Wali Murid'].includes(r));

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Theme State
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    
    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Session Timeout State
    const [showIdleWarning, setShowIdleWarning] = useState(false);
    
    useEffect(() => {
        let warningTimer;
        let logoutTimer;
        
        const resetTimers = () => {
            clearTimeout(warningTimer);
            clearTimeout(logoutTimer);
            
            // 9 menit (540.000 ms) peringatan
            warningTimer = setTimeout(() => {
                setShowIdleWarning(true);
            }, 540000);
            
            // 10 menit (600.000 ms) logout otomatis
            logoutTimer = setTimeout(() => {
                router.post(route('logout'));
            }, 600000);
        };

        const handleActivity = () => {
            // Jika peringatan sudah muncul, hanya mereset lewat klik tombol di modal
            if (!showIdleWarning) {
                resetTimers();
            }
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, handleActivity));
        
        resetTimers(); // Start timers on mount

        return () => {
            events.forEach(e => window.removeEventListener(e, handleActivity));
            clearTimeout(warningTimer);
            clearTimeout(logoutTimer);
        };
    }, [showIdleWarning]);

    const fetchNotifications = async () => {
        try {
            if (typeof route === 'function' && route().has && !route().has('notifications.unread')) {
                return;
            }
            const url = route('notifications.unread');
            const res = await axios.get(url, {
                validateStatus: (status) => status >= 200 && status < 300
            });
            if (res && res.data) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.notifications?.length || 0);
            }
        } catch (error) {
            // Quietly handle background polling errors without disturbing the user interface
        }
    };

    useEffect(() => {
        fetchNotifications();
        const pollInterval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(pollInterval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.post(route('notifications.mark-as-read', id));
            fetchNotifications();
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(route('notifications.mark-all-as-read'));
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.message) {
            toast.success(flash.message);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        
        // Menangkap error validasi dari server (misal: withErrors(['message' => '...']))
        if (errors && errors.message) {
            toast.error(errors.message);
        }
    }, [flash, errors]);

    const menuItems = [
        // ═══ AREA UTAMA & SELF-SERVICE ═══
        { group: t('group.personal'), items: [
            { name: t('menu.dashboard'), route: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Bendahara', 'Absensi', 'Guru', 'Karyawan'] },
            { name: t('menu.presensi'), route: 'attendance.presensi', icon: <MapPin className="w-5 h-5" />, roles: ['Kepala Sekolah', 'Kurikulum', 'Bendahara', 'Absensi', 'Guru', 'Karyawan'] },
            { name: t('menu.profile'), route: 'profile.edit', icon: <UserIcon className="w-5 h-5" />, roles: ['Kepala Sekolah', 'Kurikulum', 'Bendahara', 'Absensi', 'Guru', 'Karyawan'] },
            { name: t('menu.my_schedule'), route: 'my-schedule.index', icon: <GraduationCap className="w-5 h-5" />, roles: ['Guru'] },
            { name: t('menu.recap'), route: 'my-attendance.index', icon: <History className="w-5 h-5" />, roles: ['Kepala Sekolah', 'Kurikulum', 'Bendahara', 'Absensi', 'Guru', 'Karyawan'] },
            { name: t('menu.leave_request'), route: 'leave-requests.index', icon: <FilePlus className="w-5 h-5" />, roles: ['Kepala Sekolah', 'Kurikulum', 'Bendahara', 'Absensi', 'Guru', 'Karyawan'] },
            { name: t('menu.inval'), route: 'invals.index', icon: <CalendarClock className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Bendahara', 'Absensi', 'Guru', 'Karyawan'] },
        ]},
        // ═══ PRESENSI & KEPEGAWAIAN ═══
        { group: t('group.employees'), items: [
            { name: t('menu.monitoring'), route: 'monitoring.attendance', icon: <CalendarClock className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.attendance_recap'), route: 'attendance.recap', icon: <ClipboardList className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.photos'), route: 'monitoring.photos.index', icon: <Image className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.schedules'), route: 'teaching-schedules.index', icon: <CalendarDays className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.leave_approval'), route: 'leave-requests.approval', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
        ]},
        // ═══ PRESENSI & KESISWAAN (SMK) ═══
        { group: t('group.students'), items: [
            { name: t('menu.students'), route: 'students.index', icon: <GraduationCap className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.school_classes'), route: 'school-classes.index', icon: <School className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.student_monitoring'), route: 'student-attendance.monitoring', icon: <CalendarClock className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.student_leave_approval'), route: 'student-leave-requests.index', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi', 'Guru'] },
            { name: t('menu.student_recap'), route: 'student-attendance.recap', icon: <FileSpreadsheet className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.student_kiosk'), route: 'student-attendance.kiosk', icon: <QrCode className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
            { name: t('menu.student_cards'), route: 'students.cards', icon: <Printer className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'] },
        ]},
        // ═══ PORTAL MANDIRI SISWA ═══
        { group: 'Portal Mandiri Siswa', items: [
            { name: 'Dashboard Portal Siswa', route: 'student-portal.dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Siswa', 'Wali Murid'] },
            { name: 'Data Profil Siswa', route: 'student-portal.profile', icon: <UserIcon className="w-5 h-5" />, roles: ['Siswa', 'Wali Murid'] },
            { name: 'Kalender Presensi Siswa', route: 'student-portal.history', icon: <CalendarDays className="w-5 h-5" />, roles: ['Siswa', 'Wali Murid'] },
            { name: 'Pengajuan Izin Online', route: 'student-portal.leave-requests', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Siswa', 'Wali Murid'] },
            { name: 'Kartu Digital QR', route: 'student-portal.digital-card', icon: <QrCode className="w-5 h-5" />, roles: ['Siswa', 'Wali Murid'] },
        ]},
        // ═══ KONFIGURASI & MASTER DATA ═══
        { group: t('group.config'), items: [
            { name: t('menu.employees'), route: 'employees.index', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Bendahara'] },
            { name: t('menu.positions'), route: 'positions.index', icon: <ClipboardList className="w-5 h-5" />, roles: ['Super Admin', 'Kepala Sekolah', 'Bendahara'] },
            { name: t('menu.campus'), route: 'campus-locations.index', icon: <MapPin className="w-5 h-5" />, roles: ['Super Admin'] },
            { name: t('menu.user_authority'), route: 'user-authority.index', icon: <ShieldCheck className="w-5 h-5" />, roles: ['Super Admin'] },
            { name: t('menu.backup'), route: 'backups.index', icon: <DatabaseBackup className="w-5 h-5" />, roles: ['Super Admin'] },
            { name: t('menu.settings'), route: 'settings.index', icon: <Settings className="w-5 h-5" />, roles: ['Super Admin'] },
        ]}
    ];

    const filteredMenu = menuItems.map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.some(role => roles.includes(role)))
    })).filter(group => group.items.length > 0);

    return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-900">
            <Toaster position="top-right" richColors theme={theme} />
            {/* Sidebar Desktop - Premium Dark Theme */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 320 : 110 }}
                className="hidden lg:flex flex-col bg-[#0B0F19] border-r border-white/5 sticky top-0 h-screen z-40 shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
            >
                {/* Logo Section */}
                <div className="h-28 flex items-center px-8 relative">
                    {/* Decorative glow behind logo */}
                    <div className="absolute top-1/2 left-12 -translate-y-1/2 w-20 h-20 bg-indigo-500/30 rounded-full blur-[40px] pointer-events-none"></div>
                    <AnimatePresence mode='wait'>
                        {isSidebarOpen ? (
                            <motion.div 
                                key="logo-full"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center space-x-4 overflow-hidden relative z-10"
                            >
                                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
                                    <ApplicationLogo className="h-8 w-8 fill-current text-white shrink-0" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-xl tracking-tight text-white leading-none">SIP MU</span>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-1">Enterprise</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="logo-short"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mx-auto p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 relative z-10"
                            >
                                <ApplicationLogo className="h-8 w-8 fill-current text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Menu Items */}
                <div className="flex-1 px-5 py-6 space-y-8 overflow-y-auto custom-scrollbar-dark">
                    {filteredMenu.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-3">
                            {isSidebarOpen && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4"
                                >
                                    {group.group}
                                </motion.p>
                            )}
                            <div className="space-y-1.5 relative">
                                {group.items.map((item) => {
                                    const isActive = route().current(item.route);
                                    return (
                                        <Link 
                                            key={item.route} 
                                            href={route(item.route)}
                                            className={`flex items-center p-4 rounded-2xl transition-all duration-300 group relative z-10 ${
                                                isActive 
                                                ? 'text-white' 
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="sidebar-active"
                                                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] ring-1 ring-white/10 z-0"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                            
                                            <div className={`relative z-10 ${isActive ? 'text-white' : 'group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-300'}`}>
                                                {item.icon}
                                            </div>
                                            
                                            <AnimatePresence>
                                                {isSidebarOpen && (
                                                    <motion.span 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        className="ml-4 font-bold text-[15px] whitespace-nowrap relative z-10"
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                            
                                            {isSidebarOpen && isActive && (
                                                <motion.div layoutId="active-indicator" className="ml-auto relative z-10">
                                                    <ChevronRight className="w-4 h-4 text-white/70" />
                                                </motion.div>
                                            )}
                                            
                                            {!isSidebarOpen && (
                                                <div className="absolute left-full ml-3 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-2xl border border-slate-800">
                                                    {item.name}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Sidebar */}
                <div className="p-5 border-t border-white/5 space-y-3">
                    {isSidebarOpen && (
                        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                            {user.employee_photo ? (
                                <img src={user.employee_photo} alt={user.name} className="h-9 w-9 rounded-xl object-cover" />
                            ) : (
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                                <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider truncate">{roles[0] || 'User'}</p>
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                
                {/* Floating Glassmorphic Header */}
                <div className="px-3 sm:px-6 lg:px-10 pt-3 sm:pt-6 z-30 sticky top-0">
                    <header className="h-16 sm:h-20 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between px-3 sm:px-6 lg:px-8 transition-all duration-300">
                        <div className="flex items-center space-x-3 sm:space-x-6 w-full lg:w-auto">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2.5 md:p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all bg-white dark:bg-card shadow-sm border border-slate-100 dark:border-border shrink-0"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="block">
                                <RealtimeClock />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 md:space-x-6">
                            <div className="hidden sm:flex items-center space-x-3">
                                {/* Language Toggle */}
                                <LanguageToggle />

                                {/* Theme Toggle */}
                                <ThemeToggle />

                                {/* Notifications */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="relative p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm">
                                            <Bell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                                            )}
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="right" width="80" contentClasses="py-2 bg-white dark:bg-card rounded-2xl shadow-xl border border-slate-100 dark:border-border overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-border flex justify-between items-center bg-slate-50/50 dark:bg-secondary/50">
                                            <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-100">{t('nav.notifications')}</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                                    {t('nav.mark_all_read')}
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? (
                                                notifications.map(notif => (
                                                    <div key={notif.id} onClick={() => markAsRead(notif.id)} className="px-4 py-3 border-b border-slate-50 dark:border-border hover:bg-slate-50 dark:hover:bg-secondary cursor-pointer transition-colors relative group">
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-500 group-hover:h-full transition-all duration-300"></div>
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                                                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">{notif.data.title || 'Notifikasi Baru'}</p>
                                                                <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.data.message || 'Anda memiliki pemberitahuan baru.'}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{notif.created_at}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-[13px] font-medium flex flex-col items-center">
                                                    <Bell className="w-8 h-8 text-slate-200 dark:text-slate-600 mb-2" />
                                                    Tidak ada notifikasi baru
                                                </div>
                                            )}
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>


                            </div>

                            <div className="h-8 w-px bg-slate-200 dark:bg-border hidden sm:block"></div>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center space-x-3 group p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all pr-2 md:pr-4 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                        <div className="relative">
                                            {user.employee_photo ? (
                                                <img src={user.employee_photo} alt={user.name} className="h-10 w-10 md:h-11 md:w-11 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-300 border-2 border-white" />
                                            ) : (
                                                <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base md:text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2.5px] border-white dark:border-card shadow-sm"></div>
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <p className="text-[14px] font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-none mb-1">{user.name}</p>
                                            <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                                                {roles[0] || 'User'}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors hidden lg:block ml-2" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content align="right" width="64" contentClasses="py-2 bg-white dark:bg-card rounded-2xl shadow-xl border border-slate-100 dark:border-border">
                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-border mb-2 bg-slate-50/50 dark:bg-secondary/50">
                                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="px-2">
                                        <Dropdown.Link href={isStudent ? route('student-portal.profile') : route('profile.edit')}>
                                            <div className="flex items-center font-bold text-[13px] py-1.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                <UserIcon className="w-4 h-4 mr-3 text-slate-400" /> {t('nav.profile')}
                                            </div>
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('account.edit')}>
                                            <div className="flex items-center font-bold text-[13px] py-1.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-1">
                                                <Settings className="w-4 h-4 mr-3 text-slate-400" /> {t('nav.settings')}
                                            </div>
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            <div className="flex items-center font-bold text-[13px] py-1.5 px-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors mt-1">
                                                <LogOut className="w-4 h-4 mr-3" /> {t('nav.logout')}
                                            </div>
                                        </Dropdown.Link>
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </header>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-3 sm:p-6 lg:p-10 lg:pt-8 overflow-x-hidden relative z-10">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={route().current()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {header && (
                                <div className="mb-10 px-2">
                                    {header}
                                </div>
                            )}
                            {children}
                        </motion.div>
                    </AnimatePresence>
                    
                    <footer className="mt-20 py-8 px-6 lg:px-8 bg-white/40 dark:bg-card/40 backdrop-blur-sm rounded-[2rem] border border-white/50 dark:border-border flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                        <div className="flex items-center space-x-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                            <ApplicationLogo className="h-6 w-6 fill-current" />
                            <span className="font-black text-sm tracking-tighter">SIP MU Enterprise</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            SMK Manbaul Ulum Cirebon &copy; 2026
                        </p>
                    </footer>
                </main>
            </div>

            {/* Mobile Sidebar Overlay (Dark Premium) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#0B0F19] border-r border-white/10 z-50 p-6 flex flex-col lg:hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-10 mt-4">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                                        <ApplicationLogo className="h-7 w-7 fill-current text-white" />
                                    </div>
                                    <span className="font-black text-xl tracking-tight text-white">SIP MU</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 bg-white/5 rounded-2xl text-slate-400 border border-white/10 hover:text-white transition-colors">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar-dark pr-2">
                                {filteredMenu.map((group, gIdx) => (
                                    <div key={gIdx} className="space-y-4">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">{group.group}</p>
                                        <div className="space-y-2">
                                            {group.items.map((item) => {
                                                const isActive = route().current(item.route);
                                                return (
                                                    <Link 
                                                        key={item.route} 
                                                        href={route(item.route)}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className={`flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all border ${
                                                            isActive 
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 border-white/10' 
                                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                                                        }`}
                                                    >
                                                        <div className={isActive ? 'text-white' : 'text-slate-500'}>
                                                            {item.icon}
                                                        </div>
                                                        <span className="text-[15px]">{item.name}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button"
                                    className="flex items-center space-x-4 p-4 w-full rounded-2xl font-black text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-[11px] uppercase tracking-[0.2em]"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Keluar Sistem</span>
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Session Timeout Warning Modal */}
            <Modal show={showIdleWarning} maxWidth="sm" closeable={false}>
                <div className="p-6 md:p-8 text-center bg-white dark:bg-card">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-500/20 mb-6">
                        <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sesi Hampir Berakhir</h3>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8">
                        Sesi Anda akan berakhir dalam 1 menit karena tidak ada aktivitas. Klik tombol di bawah ini untuk tetap masuk.
                    </p>
                    <div className="flex justify-center gap-4">
                        <PrimaryButton 
                            onClick={() => setShowIdleWarning(false)} 
                            className="w-full justify-center bg-indigo-600 hover:bg-indigo-700"
                        >
                            Tetap Masuk
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
                .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
                body { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em; }
            `}} />
            <PwaInstallPrompt />
        </div>
    );
}
