import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertTriangle, Fingerprint, Edit2, Sparkles, ShieldAlert, Thermometer, UserX, FileSpreadsheet, Printer, Unlock, CalendarOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CFG = {
    present: { label: 'Hadir', color: 'emerald', glow: 'rgba(16,185,129,0.8)' },
    late:    { label: 'Terlambat', color: 'amber', glow: 'rgba(245,158,11,0.8)' },
    alpha:   { label: 'Alpha', color: 'rose', glow: 'rgba(225,29,72,0.8)' },
    permit:  { label: 'Izin', color: 'sky', glow: 'rgba(14,165,233,0.8)' },
    sick:    { label: 'Sakit', color: 'purple', glow: 'rgba(168,85,247,0.8)' },
    holiday: { label: 'Libur', color: 'indigo', glow: 'rgba(99,102,241,0.8)' },
};

export default function Attendance({ attendances, stats, employees, todayHoliday, todaySchedules, todayUnlocks }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(today);

    const [editingAttendance, setEditingAttendance] = useState(null);
    const [unlockModal, setUnlockModal] = useState(false);
    const [unlockData, setUnlockData] = useState({ employee_id: '', type: 'daily_checkin', teaching_schedule_id: '', reason: '', expires_in_minutes: '15', is_lateness_violation: true });
    const [unlockProcessing, setUnlockProcessing] = useState(false);

    // Get teaching schedules for selected employee
    const selectedEmployeeSchedules = unlockData.employee_id && todaySchedules
        ? (todaySchedules[unlockData.employee_id] || [])
        : [];

    const handleUnlockEmployeeChange = (v) => {
        setUnlockData(d => ({...d, employee_id: v, teaching_schedule_id: ''}));
    };

    const handleUnlockTypeChange = (v) => {
        setUnlockData(d => ({...d, type: v, teaching_schedule_id: ''}));
    };

    const submitUnlock = (e) => {
        e.preventDefault();
        setUnlockProcessing(true);
        const payload = { ...unlockData };
        if (payload.type !== 'teaching') payload.teaching_schedule_id = null;
        router.post(route('attendance.unlock'), payload, {
            preserveScroll: true,
            onSuccess: () => { setUnlockModal(false); setUnlockData({ employee_id: '', type: 'daily_checkin', teaching_schedule_id: '', reason: '', expires_in_minutes: '15', is_lateness_violation: true }); },
            onFinish: () => setUnlockProcessing(false),
        });
    };

    const itemsPerPage = 50;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(attendances.length / itemsPerPage);
    const paginatedAttendances = attendances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const { data, setData, put, processing, errors, reset } = useForm({
        status: '',
        teaching_hours: 0,
        inval_hours: 0,
    });

    const openEdit = (att) => {
        setEditingAttendance(att);
        setData({
            status: att.status,
            teaching_hours: att.teaching_hours || 0,
            inval_hours: att.inval_hours || 0,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('attendance.update', editingAttendance.id), {
            preserveScroll: true,
            onSuccess: () => { setEditingAttendance(null); reset(); }
        });
    };

    const summaryCards = [
        { label: 'Total Hadir', value: stats.present, icon: <CheckCircle2 className="w-28 h-28" />, gradient: 'from-emerald-500 to-teal-600', lightText: 'text-emerald-100' },
        { label: 'Terlambat', value: stats.late, icon: <AlertTriangle className="w-28 h-28" />, gradient: 'from-amber-500 to-orange-500', lightText: 'text-amber-100' },
        { label: 'Total Izin', value: stats.permit, icon: <ShieldAlert className="w-28 h-28" />, gradient: 'from-sky-500 to-blue-600', lightText: 'text-sky-100' },
        { label: 'Total Sakit', value: stats.sick, icon: <Thermometer className="w-28 h-28" />, gradient: 'from-purple-500 to-violet-600', lightText: 'text-purple-100' },
        { label: 'Total Alpha', value: stats.alpha, icon: <UserX className="w-28 h-28" />, gradient: 'from-rose-500 to-pink-600', lightText: 'text-rose-100' },
        todayHoliday 
            ? { label: 'Status Sekolah', value: 'LIBUR', icon: <CalendarOff className="w-28 h-28" />, gradient: 'from-indigo-500 to-blue-600', lightText: 'text-indigo-100' }
            : { label: 'Waktu Sistem', value: null, icon: <Clock className="w-28 h-28" />, gradient: null, lightText: null },
    ];

    const renderStatusBadge = (status) => {
        const cfg = STATUS_CFG[status] || { label: status, color: 'slate', glow: 'rgba(100,116,139,0.8)' };
        return (
            <span className={`inline-flex items-center text-xs font-black uppercase tracking-widest text-${cfg.color}-600 bg-${cfg.color}-50 px-3 py-1.5 rounded-full border border-${cfg.color}-100/50 shadow-sm`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-${cfg.color}-500 mr-2`} style={{ boxShadow: `0 0 8px ${cfg.glow}` }}></span>
                {cfg.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Fingerprint className="w-3 h-3 mr-1.5" /> Real-time Monitoring
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Presensi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Harian</span>
                        </h2>
                    </div>
                    <div className="flex items-center flex-wrap gap-3">
                        <button
                            onClick={() => setUnlockModal(true)}
                            className="flex items-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-200 hover:shadow-amber-300"
                        >
                            <Unlock className="w-4 h-4 mr-2" /> Unlock Presensi
                        </button>
                        <button 
                            onClick={() => window.location.href = route('monitoring.export-excel')}
                            className="flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
                        </button>
                        <button 
                            onClick={() => window.location.href = route('monitoring.export-pdf')}
                            className="flex items-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300"
                        >
                            <Printer className="w-4 h-4 mr-2" /> Export PDF
                        </button>
                        <div className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
                            <CalendarIcon className="w-5 h-5 text-indigo-500 mr-3" />
                            <span className="font-bold text-slate-700">{formattedDate}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Monitoring Presensi" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="pb-8">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {summaryCards.map((card, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                            {card.gradient ? (
                                <Card className={`bg-gradient-to-br ${card.gradient} text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative h-full`}>
                                    <div className="absolute -right-4 -bottom-4 opacity-10">{card.icon}</div>
                                    <CardContent className="p-5 relative z-10">
                                        <p className={`${card.lightText} font-bold mb-1 uppercase tracking-wider text-[10px]`}>{card.label}</p>
                                        <h3 className="text-3xl font-black">{card.value} <span className="text-sm font-medium opacity-70">Orang</span></h3>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-white border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col justify-center p-5 h-full">
                                    <p className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-[10px] flex items-center">
                                        <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Waktu Sistem
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} <span className="text-sm font-medium text-slate-400">WIB</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                        Total Pegawai: <span className="text-indigo-600">{stats.total}</span>
                                    </p>
                                </Card>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Table */}
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-8">
                        <CardTitle className="text-xl font-black text-slate-900">Log Aktivitas Presensi</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Riwayat presensi harian seluruh pegawai berdasarkan lokasi kampus
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-b-slate-100">
                                        <TableHead className="font-black text-slate-900 px-6 lg:px-8 py-5">Pegawai</TableHead>
                                        <TableHead className="font-black text-slate-900 text-center">Waktu Masuk</TableHead>
                                        <TableHead className="font-black text-slate-900 text-center hidden sm:table-cell">Waktu Keluar</TableHead>
                                        <TableHead className="font-black text-slate-900 hidden md:table-cell">Lokasi Kampus</TableHead>
                                        <TableHead className="font-black text-slate-900 text-center px-6 lg:px-8">Status</TableHead>
                                        <TableHead className="font-black text-slate-900 text-right px-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {paginatedAttendances.map((att) => (
                                            <motion.tr
                                                key={att.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors border-b-slate-50"
                                            >
                                                <TableCell className="px-6 lg:px-8 py-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black shadow-inner">
                                                            {att.employee?.name ? att.employee.name.charAt(0) : 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{att.employee?.name || 'Unknown'}</p>
                                                            <p className="text-xs font-semibold text-slate-500">{att.employee?.position?.name || 'Staff'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {att.check_in ? (
                                                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                            {att.check_in.substring(0, 5)}
                                                        </span>
                                                    ) : <span className="text-slate-400 font-semibold">--:--</span>}
                                                </TableCell>
                                                <TableCell className="text-center hidden sm:table-cell">
                                                    {att.check_out ? (
                                                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                            {att.check_out.substring(0, 5)}
                                                        </span>
                                                    ) : <span className="text-slate-400 font-semibold">--:--</span>}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {att.is_dinas_luar ? (
                                                        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm text-emerald-600 bg-emerald-50 border-emerald-100/50">
                                                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                                            Dinas Luar
                                                        </div>
                                                    ) : att.campus_name ? (
                                                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${
                                                            att.campus_name === 'Di Luar Jangkauan' 
                                                            ? 'text-rose-600 bg-rose-50 border-rose-100/50' 
                                                            : 'text-indigo-600 bg-indigo-50 border-indigo-100/50'
                                                        }`}>
                                                            <MapPin className={`w-3.5 h-3.5 mr-1.5 ${att.campus_name === 'Di Luar Jangkauan' ? 'text-rose-500' : 'text-indigo-500'}`} />
                                                            {att.campus_name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 font-semibold">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 lg:px-8 text-center">
                                                    {att.status === 'present' && (
                                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>Hadir
                                                        </span>
                                                    )}
                                                    {att.status === 'late' && (
                                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>Terlambat
                                                        </span>
                                                    )}
                                                    {att.status === 'alpha' && (
                                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>Alpha
                                                        </span>
                                                    )}
                                                    {att.status === 'permit' && (
                                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>Izin
                                                        </span>
                                                    )}
                                                    {att.status === 'sick' && (
                                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>Sakit
                                                        </span>
                                                    )}
                                                    {att.status === 'holiday' && (
                                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>Libur
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <Button onClick={() => openEdit(att)} variant="outline" size="sm" className="h-8 rounded-lg font-bold border-slate-200 text-indigo-600 hover:bg-indigo-50">
                                                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Input Jam
                                                    </Button>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                        {attendances.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-16">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <Fingerprint className="w-12 h-12 mb-4 text-slate-200" />
                                                        <p className="font-bold text-slate-500">Belum ada pegawai yang presensi hari ini</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-1 bg-white/60 p-2 rounded-2xl shadow-sm border border-white/50 backdrop-blur-sm">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 text-slate-500 hover:bg-slate-100 disabled:hover:bg-transparent"
                            >Prev</button>
                            
                            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                    if (pageNum > totalPages - 2) pageNum = totalPages - 4 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >{pageNum}</button>
                                );
                            })}

                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 text-slate-500 hover:bg-slate-100 disabled:hover:bg-transparent"
                            >Next</button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Edit Attendance Modal */}
            <Dialog open={!!editingAttendance} onOpenChange={open => !open && setEditingAttendance(null)}>
                <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-5 text-white relative overflow-hidden shrink-0">
                        <div className="absolute -right-8 -top-8 opacity-20"><Sparkles className="w-32 h-32" /></div>
                        <DialogTitle className="text-xl font-black relative z-10">Validasi Jam & Status</DialogTitle>
                        <DialogDescription className="text-blue-100 font-medium mt-1 relative z-10">Pegawai: <span className="font-bold text-white">{editingAttendance?.employee?.name}</span></DialogDescription>
                    </div>
                    <form onSubmit={submit} className="px-6 py-5 bg-slate-50 space-y-4 overflow-y-auto flex-1">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="font-bold text-slate-700">Status Kehadiran</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className="w-full bg-white rounded-xl h-11 font-semibold">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl">
                                    <SelectItem value="present" className="font-semibold">Hadir</SelectItem>
                                    <SelectItem value="late" className="font-semibold">Terlambat</SelectItem>
                                    <SelectItem value="alpha" className="font-semibold">Alpha (Tidak Hadir)</SelectItem>
                                    <SelectItem value="permit" className="font-semibold">Izin</SelectItem>
                                    <SelectItem value="sick" className="font-semibold">Sakit</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-rose-500 text-xs font-bold">{errors.status}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="teaching_hours" className="font-bold text-slate-700">Jam Mengajar (Hadir)</Label>
                            <Input id="teaching_hours" type="number" min="0" value={data.teaching_hours} onChange={e => setData('teaching_hours', e.target.value)} className="rounded-xl border-slate-200 h-11 font-semibold shadow-sm focus-visible:ring-indigo-500" />
                            {errors.teaching_hours && <p className="text-rose-500 text-xs font-bold">{errors.teaching_hours}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inval_hours" className="font-bold text-slate-700">Jam Ganti / Inval</Label>
                            <Input id="inval_hours" type="number" min="0" value={data.inval_hours} onChange={e => setData('inval_hours', e.target.value)} className="rounded-xl border-slate-200 h-11 font-semibold shadow-sm focus-visible:ring-indigo-500" />
                            {errors.inval_hours && <p className="text-rose-500 text-xs font-bold">{errors.inval_hours}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2 sticky bottom-0 bg-slate-50 pb-1">
                            <Button type="button" variant="outline" onClick={() => setEditingAttendance(null)} className="rounded-xl font-bold h-11 px-6 border-slate-200">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold h-11 px-8 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200">{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Unlock Attendance Modal */}
            <Dialog open={unlockModal} onOpenChange={setUnlockModal}>
                <DialogContent className="max-w-none sm:max-w-none md:max-w-none w-[98vw] md:w-[95vw] h-[98vh] md:h-[95vh] max-h-[98vh] overflow-hidden bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl border-white/50 dark:border-slate-800 p-0 rounded-[2rem] shadow-2xl flex flex-col gap-0">
                    
                    {/* Header Banner */}
                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 text-white relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-3xl font-black mb-2 flex items-center text-white tracking-tight">
                                    <Unlock className="w-8 h-8 mr-4 text-indigo-300" /> Buka Akses Presensi
                                </DialogTitle>
                                <DialogDescription className="text-indigo-200 text-sm font-medium flex items-center">
                                    <ShieldAlert className="w-4 h-4 mr-2 opacity-70" /> Fitur ini digunakan untuk membuka sementara akses presensi pegawai yang terblokir.
                                </DialogDescription>
                            </div>
                            <button onClick={() => setUnlockModal(false)} className="text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2 z-20">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-8 space-y-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
                            
                            {/* Left: Form - col-span-5 */}
                            <div className="md:col-span-5 space-y-6">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <div className="flex items-center mb-6">
                                        <div className="h-10 w-1.5 bg-indigo-500 rounded-r-full -ml-8 mr-6"></div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Formulir Buka Akses</h3>
                                    </div>

                                    <form id="unlockForm" onSubmit={submitUnlock} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 h-full flex flex-col justify-center">
                                        <div className="space-y-3">
                                            <Label className="text-slate-700 dark:text-slate-200 font-bold flex items-center text-sm">Pegawai</Label>
                                            <Select value={unlockData.employee_id} onValueChange={handleUnlockEmployeeChange}>
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-100"><SelectValue placeholder="Pilih pegawai..." /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-xl max-h-80 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                     {(employees || []).map(emp => {
                                                         const isSelf = Boolean(emp.user_id && currentUserId && Number(emp.user_id) === Number(currentUserId));
                                                         const label = isSelf ? `${emp.name} (Akun Anda — Wajib Pengelola Lain)` : emp.name;
                                                         return (
                                                             <SelectItem key={emp.id} value={String(emp.id)} className={`font-semibold text-sm p-3 cursor-pointer ${isSelf ? 'text-rose-600 font-bold bg-rose-50/50' : 'hover:bg-indigo-50 text-slate-900 dark:text-slate-100'}`}>
                                                                 {label}
                                                             </SelectItem>
                                                         );
                                                     })}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-slate-700 dark:text-slate-200 font-bold flex items-center text-sm">Tipe Presensi</Label>
                                            <Select value={unlockData.type} onValueChange={handleUnlockTypeChange}>
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-100"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                    <SelectItem value="daily_checkin" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">Presensi Masuk (Harian)</SelectItem>
                                                    <SelectItem value="daily_checkout" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">Presensi Pulang (Harian)</SelectItem>
                                                    <SelectItem value="teaching" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">Presensi Jam Pelajaran</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Teaching Schedule Dropdown - Only when type is 'teaching' */}
                                        {unlockData.type === 'teaching' && (
                                            <div className="space-y-3">
                                                <Label className="text-slate-700 dark:text-slate-200 font-bold flex items-center text-sm">Jam Pelajaran</Label>
                                                {selectedEmployeeSchedules.length > 0 ? (
                                                    <Select value={unlockData.teaching_schedule_id} onValueChange={(v) => setUnlockData(d => ({...d, teaching_schedule_id: v}))}>
                                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-100"><SelectValue placeholder="Pilih jam pelajaran..." /></SelectTrigger>
                                                        <SelectContent className="rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                            {selectedEmployeeSchedules.map(s => (
                                                                <SelectItem key={s.id} value={String(s.id)} className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">
                                                                    Jam ke-{s.hour_number} • {s.subject} ({s.class_name}) • {s.time_start}-{s.time_end}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="bg-rose-50 dark:bg-rose-950/40 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/50 flex items-start shadow-sm">
                                                        <ShieldAlert className="w-5 h-5 text-rose-500 mr-3 shrink-0" />
                                                        <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
                                                            {unlockData.employee_id
                                                                ? 'Pegawai ini tidak memiliki jadwal mengajar pada hari ini.'
                                                                : 'Silakan pilih pegawai terlebih dahulu.'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <Label className="text-slate-700 dark:text-slate-200 font-bold flex items-center text-sm">Kebijakan Keterlambatan</Label>
                                            <Select value={String(unlockData.is_lateness_violation)} onValueChange={(v) => setUnlockData(d => ({...d, is_lateness_violation: v === 'true'}))}>
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-100"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                    <SelectItem value="true" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">Tandai Sebagai Pelanggaran Keterlambatan</SelectItem>
                                                    <SelectItem value="false" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">Tidak Tandai Sebagai Pelanggaran Keterlambatan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-slate-700 dark:text-slate-200 font-bold flex items-center text-sm">Batas Waktu Akses</Label>
                                            <Select value={unlockData.expires_in_minutes} onValueChange={(v) => setUnlockData(d => ({...d, expires_in_minutes: v}))}>
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-100"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                    <SelectItem value="15" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">15 Menit</SelectItem>
                                                    <SelectItem value="30" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">30 Menit</SelectItem>
                                                    <SelectItem value="60" className="font-semibold text-sm p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-900 dark:text-slate-100">1 Jam (60 Menit)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between text-sm">
                                                <span>Alasan</span>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md">Opsional</span>
                                            </Label>
                                            <Input value={unlockData.reason} onChange={(e) => setUnlockData(d => ({...d, reason: e.target.value}))}
                                                placeholder="Contoh: Izin terlambat dari Waka Kurikulum" className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                        </div>
                                    </form>
                                </motion.div>
                            </div>

                            {/* Right: History - col-span-7 */}
                            <div className="md:col-span-7 space-y-6 h-full flex flex-col">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full flex flex-col">
                                    <div className="flex items-center mb-6 justify-between flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-1.5 bg-purple-500 rounded-r-full -ml-8 mr-6"></div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Riwayat Akses Hari Ini</h3>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 flex items-center bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                            Total: {(todayUnlocks || []).length} diberikan
                                        </p>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-slate-900/60 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-y-auto space-y-4 relative custom-scrollbar">
                                        {(!todayUnlocks || todayUnlocks.length === 0) ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner mb-4 border border-slate-100 dark:border-slate-700">
                                                    <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                                </div>
                                                <p className="font-black text-xl text-slate-500 dark:text-slate-400 mb-1">Belum Ada Riwayat</p>
                                                <p className="text-sm font-medium text-center text-slate-400 dark:text-slate-500">Akses presensi yang dibuka hari ini akan muncul di sini.</p>
                                            </div>
                                        ) : (
                                            todayUnlocks.map(u => (
                                                <div key={u.id} className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group flex flex-col gap-4">
                                                    
                                                    <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl border-b border-l shadow-sm ${
                                                        u.used ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50' 
                                                        : u.is_expired ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-800/50'
                                                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-800/50'
                                                    }`}>
                                                        {u.used ? '✓ DIPAKAI' : (u.is_expired ? '✗ KEDALUWARSA' : '⏳ AKTIF')}
                                                    </div>
                                                    
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                                                            <Unlock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                                        </div>
                                                        <div className="flex-1 pt-0.5">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">{u.created_at}</span>
                                                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Oleh: <span className="text-indigo-600 dark:text-indigo-400 font-black">{u.unlocked_by_name}</span></span>
                                                            </div>
                                                            
                                                            <h4 className="font-black text-slate-800 dark:text-white text-lg mb-2">{u.employee_name}</h4>
                                                            
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <div className="flex items-center bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                                                    {u.type === 'daily_checkin' && 'Masuk'}
                                                                    {u.type === 'daily_checkout' && 'Pulang'}
                                                                    {u.type === 'teaching' && `Jam ke-${u.teaching_schedule?.hour_number}`}
                                                                </div>
                                                                {u.type === 'teaching' && (
                                                                    <div className="flex items-center bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-purple-100 dark:border-purple-800/50 shadow-sm truncate max-w-[200px]">
                                                                        {u.teaching_schedule?.subject}
                                                                    </div>
                                                                )}
                                                                <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-sm ${
                                                                    u.is_lateness_violation 
                                                                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-100/50 dark:border-rose-800/50' 
                                                                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-100/50 dark:border-emerald-800/50'
                                                                }`}>
                                                                    {u.is_lateness_violation ? 'Tandai Terlambat' : 'Bebas Terlambat'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {u.reason && (
                                                        <div className="mt-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-start">
                                                            <Edit2 className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" /> 
                                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">"{u.reason}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 flex sm:justify-between items-center gap-4 rounded-b-[2rem]">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setUnlockModal(false)}
                            className="rounded-xl h-12 px-6 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            form="unlockForm"
                            disabled={unlockProcessing || !unlockData.employee_id || (unlockData.type === 'teaching' && !unlockData.teaching_schedule_id)}
                            className="rounded-xl h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all"
                        >
                            <Unlock className="w-4 h-4 mr-2" />
                            {unlockProcessing ? 'Memproses...' : 'Buka Akses Sekarang'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
