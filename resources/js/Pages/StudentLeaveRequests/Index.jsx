import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Check, 
    X, 
    Calendar, 
    FileText, 
    Paperclip, 
    Eye, 
    ClipboardCheck, 
    Filter, 
    Trash2, 
    Plus, 
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    UserCheck,
    GraduationCap,
    School
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ leaveRequests, classes = [], students = [], stats = {}, filters = {}, isGlobalAdmin = false }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    // Modals
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [rejectingItem, setRejectingItem] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form for Adding Request
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        student_id: '',
        type: 'sick',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null,
    });

    const handleFilterChange = (newClass, newStatus, newSearch) => {
        router.get(
            route('student-leave-requests.index'),
            {
                class_id: newClass !== 'all' ? newClass : undefined,
                status: newStatus !== 'all' ? newStatus : undefined,
                search: newSearch || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange(selectedClass, selectedStatus, searchQuery);
    };

    const handleApprove = (id) => {
        if (confirm('Apakah Anda yakin ingin MENYETUJUI permohonan izin/sakit ini? System akan otomatis mencatat presensi siswa.')) {
            router.post(route('student-leave-requests.approve', id));
        }
    };

    const handleRejectSubmit = () => {
        if (!rejectingItem) return;
        router.post(route('student-leave-requests.reject', rejectingItem.id), {
            rejection_reason: rejectionReason,
        }, {
            onSuccess: () => {
                setRejectingItem(null);
                setRejectionReason('');
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pengajuan izin ini?')) {
            router.delete(route('student-leave-requests.destroy', id));
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('student-leave-requests.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const fmtDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
    };

    const calcDays = (start, end) => {
        if (!start || !end) return 1;
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e - s);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const isImage = (path) => path && /\.(jpg|jpeg|png|webp)$/i.test(path);

    return (
        <AuthenticatedLayout header={
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                        <ClipboardCheck className="w-3 h-3 mr-1.5" /> Presensi & Kesiswaan
                    </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Persetujuan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400">Izin & Sakit Siswa</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Verifikasi permohonan ketidakhadiran siswa oleh Wali Kelas & Manajemen Sekolah.
                </p>
            </div>
        }>
            <Head title="Persetujuan Izin/Sakit Siswa" />

            <div className="space-y-6">
                {/* Top KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Menunggu Persetujuan</p>
                                    <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.total_pending || 0}</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Permohonan perlu diproses</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/50 dark:border-amber-800/40 rounded-xl text-amber-600 dark:text-amber-400">
                                    <Clock className="w-6 h-6 animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disetujui</p>
                                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.total_approved || 0}</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Tercatat ke presensi</p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ditolak</p>
                                    <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.total_rejected || 0}</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Permohonan ditolak</p>
                                </div>
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/50 dark:border-rose-800/40 rounded-xl text-rose-600 dark:text-rose-400">
                                    <XCircle className="w-6 h-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengajuan</p>
                                    <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.total_requests || 0}</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Keseluruhan permohonan</p>
                                </div>
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Toolbar & Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Search input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama atau NIS siswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        {/* Class Filter */}
                        {classes.length > 0 && (
                            <div className="w-full sm:w-[180px]">
                                <Select 
                                    value={selectedClass} 
                                    onValueChange={(val) => {
                                        setSelectedClass(val);
                                        handleFilterChange(val, selectedStatus, searchQuery);
                                    }}
                                >
                                    <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kelas</SelectItem>
                                        {classes.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Status Filter Buttons */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => { setSelectedStatus('all'); handleFilterChange(selectedClass, 'all', searchQuery); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedStatus === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => { setSelectedStatus('pending'); handleFilterChange(selectedClass, 'pending', searchQuery); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-amber-600 dark:text-slate-400'}`}
                            >
                                Menunggu
                            </button>
                            <button
                                type="button"
                                onClick={() => { setSelectedStatus('approved'); handleFilterChange(selectedClass, 'approved', searchQuery); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedStatus === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400'}`}
                            >
                                Disetujui
                            </button>
                            <button
                                type="button"
                                onClick={() => { setSelectedStatus('rejected'); handleFilterChange(selectedClass, 'rejected', searchQuery); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedStatus === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-rose-600 dark:text-slate-400'}`}
                            >
                                Ditolak
                            </button>
                        </div>
                    </form>

                    {/* Action Button */}
                    <Button
                        onClick={() => { clearErrors(); reset(); setIsAddModalOpen(true); }}
                        className="h-10 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Tambah Pengajuan
                    </Button>
                </div>

                {/* Main Table */}
                <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                                    <TableRow className="border-b border-slate-200/80 dark:border-slate-800">
                                        <TableHead className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Siswa & Kelas</TableHead>
                                        <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Jenis</TableHead>
                                        <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Periode</TableHead>
                                        <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alasan</TableHead>
                                        <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Lampiran</TableHead>
                                        <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Status</TableHead>
                                        <TableHead className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {leaveRequests.data && leaveRequests.data.length > 0 ? (
                                        leaveRequests.data.map((item) => {
                                            const days = calcDays(item.start_date, item.end_date);
                                            return (
                                                <TableRow key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                                    {/* Student Info */}
                                                    <TableCell className="py-4 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0">
                                                                {item.student?.name ? item.student.name.charAt(0).toUpperCase() : 'S'}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                                                    {item.student?.name || 'Siswa Terhapus'}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                                    <span>NIS: {item.student?.nis || '-'}</span>
                                                                    <span>•</span>
                                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                                        {item.class?.name || item.student?.school_class?.name || '-'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Type Badge */}
                                                    <TableCell className="py-4 px-4 text-center">
                                                        {item.type === 'sick' ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400">
                                                                🤒 Sakit
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400">
                                                                ✉️ Izin
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    {/* Period */}
                                                    <TableCell className="py-4 px-4">
                                                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                            {fmtDate(item.start_date)}
                                                            {item.start_date !== item.end_date && (
                                                                <span> s/d {fmtDate(item.end_date)}</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                                            Durasi: {days} Hari
                                                        </div>
                                                    </TableCell>

                                                    {/* Reason */}
                                                    <TableCell className="py-4 px-4">
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2 leading-relaxed">
                                                            {item.reason || '-'}
                                                        </p>
                                                    </TableCell>

                                                    {/* Attachment */}
                                                    <TableCell className="py-4 px-4 text-center">
                                                        {item.attachment_path ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setPreviewAttachment(`/storage/${item.attachment_path}`)}
                                                                className="h-8 px-2.5 text-[11px] rounded-lg border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1.5 mx-auto"
                                                            >
                                                                <Paperclip className="w-3.5 h-3.5" /> Lihat
                                                            </Button>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-400 italic">Tanpa Lampiran</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Status */}
                                                    <TableCell className="py-4 px-4 text-center">
                                                        {item.status === 'pending' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400">
                                                                <Clock className="w-3 h-3 animate-pulse" /> Menunggu
                                                            </span>
                                                        )}
                                                        {item.status === 'approved' && (
                                                            <div>
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
                                                                    <CheckCircle2 className="w-3 h-3" /> Disetujui
                                                                </span>
                                                                {item.approver && (
                                                                    <div className="text-[9px] text-slate-400 mt-1">
                                                                        oleh {item.approver.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {item.status === 'rejected' && (
                                                            <div>
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400">
                                                                    <XCircle className="w-3 h-3" /> Ditolak
                                                                </span>
                                                                {item.rejection_reason && (
                                                                    <div className="text-[9px] text-rose-500 dark:text-rose-400 mt-1 max-w-[120px] truncate mx-auto" title={item.rejection_reason}>
                                                                        Ket: {item.rejection_reason}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell className="py-4 px-5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {item.status !== 'approved' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApprove(item.id)}
                                                                    title="Setujui Pengajuan"
                                                                    className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1 font-bold"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" /> Setujui
                                                                </Button>
                                                            )}
                                                            {item.status !== 'rejected' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setRejectingItem(item);
                                                                        setRejectionReason('');
                                                                    }}
                                                                    title="Tolak Pengajuan"
                                                                    className="h-8 px-2.5 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 rounded-lg flex items-center gap-1 font-bold"
                                                                >
                                                                    <X className="w-3.5 h-3.5" /> Tolak
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(item.id)}
                                                                title="Hapus Data"
                                                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-12 text-center">
                                                <div className="max-w-xs mx-auto text-center space-y-2">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada pengajuan ditemukan</h3>
                                                    <p className="text-xs text-slate-400 leading-relaxed">
                                                        Belum ada permohonan izin atau sakit siswa untuk kriteria filter ini.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Links */}
                        {leaveRequests.links && leaveRequests.links.length > 3 && (
                            <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                                <div className="text-xs text-slate-500">
                                    Menampilkan {leaveRequests.from || 0} - {leaveRequests.to || 0} dari {leaveRequests.total || 0} data
                                </div>
                                <div className="flex items-center gap-1">
                                    {leaveRequests.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white font-bold'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal Attachment Preview */}
            <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-indigo-600" /> Preview Dokumen Lampiran
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Berkas pendukung permohonan izin/sakit siswa.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[70vh] overflow-auto">
                        {previewAttachment && isImage(previewAttachment) ? (
                            <img src={previewAttachment} alt="Lampiran Surat" className="max-w-full h-auto rounded-lg shadow-sm" />
                        ) : previewAttachment ? (
                            <iframe src={previewAttachment} title="Dokumen Lampiran" className="w-full h-[60vh] rounded-lg border-0" />
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPreviewAttachment(null)} className="rounded-xl text-xs">
                            Tutup
                        </Button>
                        {previewAttachment && (
                            <a
                                href={previewAttachment}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
                            >
                                Download Berkas
                            </a>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Rejection Reason */}
            <Dialog open={!!rejectingItem} onOpenChange={() => setRejectingItem(null)}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <XCircle className="w-5 h-5" /> Tolak Permohonan Izin/Sakit
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Berikan alasan penolakan permohonan ananda {rejectingItem?.student?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 space-y-3">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Alasan Penolakan (Opsional)
                        </Label>
                        <textarea
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Contoh: Lampiran surat dokter kurang jelas, silakan upload ulang."
                            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRejectingItem(null)} className="rounded-xl text-xs">
                            Batal
                        </Button>
                        <Button onClick={handleRejectSubmit} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm">
                            Konfirmasi Penolakan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Add New Request */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-600" /> Tambah Pengajuan Izin/Sakit Siswa
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Input permohonan izin/sakit secara manual atas konfirmasi orang tua siswa.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 my-2">
                        {/* Select Student */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Siswa *</Label>
                            <Select 
                                value={data.student_id} 
                                onValueChange={(val) => setData('student_id', val)}
                            >
                                <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="-- Cari / Pilih Siswa --" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name} ({s.nis}) - Kelas {s.school_class?.name || '-'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.student_id && <p className="text-[11px] text-rose-500 mt-1">{errors.student_id}</p>}
                        </div>

                        {/* Type */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jenis Permohonan *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'sick')}
                                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                        data.type === 'sick'
                                            ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-400 shadow-sm'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    🤒 Sakit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'permit')}
                                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                        data.type === 'permit'
                                            ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-400 shadow-sm'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    ✉️ Izin
                                </button>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal Mulai *</Label>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                                />
                                {errors.start_date && <p className="text-[11px] text-rose-500">{errors.start_date}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal Selesai *</Label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                                />
                                {errors.end_date && <p className="text-[11px] text-rose-500">{errors.end_date}</p>}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alasan / Keterangan *</Label>
                            <textarea
                                rows={3}
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder="Contoh: Sakit demam tinggi / Ada keperluan keluarga di luar kota"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                            {errors.reason && <p className="text-[11px] text-rose-500">{errors.reason}</p>}
                        </div>

                        {/* Attachment Upload */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Lampiran Surat (Opsional)</Label>
                            <Input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setData('attachment', e.target.files[0])}
                                className="text-xs rounded-xl border-slate-200 dark:border-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950 dark:file:text-indigo-400"
                            />
                            <p className="text-[10px] text-slate-400">Format: JPG, PNG, PDF (Maks. 3MB)</p>
                            {errors.attachment && <p className="text-[11px] text-rose-500">{errors.attachment}</p>}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl text-xs">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm">
                                {processing ? 'Menyimpan...' : 'Simpan Pengajuan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
