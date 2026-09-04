import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Users, Clock, CheckCircle2, AlertTriangle, ShieldAlert, Thermometer, UserX, 
    QrCode, Calendar as CalendarIcon, Filter, Search, Edit3, Printer, FileSpreadsheet, PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentMonitoring({ auth, students, stats, schoolClasses, filters }) {
    const [filterDate, setFilterDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [filterClass, setFilterClass] = useState(filters.class_id || '');
    const [filterSearch, setFilterSearch] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        date: filterDate,
        status: 'present',
        notes: '',
    });

    const handleFilterChange = (newDate, newClass, newStatus, newSearch) => {
        router.get(
            route('student-attendance.monitoring'),
            {
                date: newDate,
                class_id: newClass,
                status: newStatus,
                search: newSearch,
            },
            { preserveState: true, replace: true }
        );
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setData({
            student_id: student.id,
            date: filterDate,
            status: student.status || 'present',
            notes: student.notes || '',
        });
        setEditModalOpen(true);
    };

    const submitManualStatus = (e) => {
        e.preventDefault();
        post(route('student-attendance.update-status'), {
            preserveScroll: true,
            onSuccess: () => setEditModalOpen(false),
        });
    };

    const summaryCards = [
        { label: 'Total Siswa', value: stats.total, icon: <Users className="w-8 h-8 text-blue-500" />, color: 'blue' },
        { label: 'Hadir Tepat Waktu', value: stats.present, icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />, color: 'emerald' },
        { label: 'Terlambat', value: stats.late, icon: <AlertTriangle className="w-8 h-8 text-amber-500" />, color: 'amber' },
        { label: 'Sakit', value: stats.sick, icon: <Thermometer className="w-8 h-8 text-purple-500" />, color: 'purple' },
        { label: 'Izin', value: stats.permit, icon: <ShieldAlert className="w-8 h-8 text-sky-500" />, color: 'sky' },
        { label: 'Tanpa Keterangan (Alpha)', value: stats.alpha, icon: <UserX className="w-8 h-8 text-rose-500" />, color: 'rose' },
    ];

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
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <QrCode className="w-3 h-3 mr-1.5" /> Presensi Siswa-Siswi
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Monitoring <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Presensi Siswa</span>
                        </h2>
                    </div>

                    <div className="flex items-center flex-wrap gap-3">
                        <Button onClick={() => router.visit(route('students.index'))} variant="secondary" className="rounded-xl font-bold">
                            <Users className="w-4 h-4 mr-2" /> Kelola Data Siswa
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Monitoring Presensi Siswa" />

            <div className="space-y-6 pb-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {summaryCards.map((card, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    {card.icon}
                                    <span className="text-[10px] font-black uppercase text-slate-400">Siswa</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-1">{card.label}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Toolbar */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Tanggal Presensi</Label>
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => {
                                    setFilterDate(e.target.value);
                                    handleFilterChange(e.target.value, filterClass, filterStatus, filterSearch);
                                }}
                                className="rounded-xl"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Kelas / Rombel</Label>
                            <Select
                                value={filterClass}
                                onValueChange={(val) => {
                                    setFilterClass(val);
                                    handleFilterChange(filterDate, val, filterStatus, filterSearch);
                                }}
                            >
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Kelas</SelectItem>
                                    {schoolClasses.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Status Kehadiran</Label>
                            <Select
                                value={filterStatus}
                                onValueChange={(val) => {
                                    setFilterStatus(val);
                                    handleFilterChange(filterDate, filterClass, val, filterSearch);
                                }}
                            >
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="present">Hadir Tepat Waktu</SelectItem>
                                    <SelectItem value="late">Terlambat</SelectItem>
                                    <SelectItem value="sick">Sakit</SelectItem>
                                    <SelectItem value="permit">Izin</SelectItem>
                                    <SelectItem value="alpha">Alpha</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Cari Nama / NIS Siswa</Label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama atau NIS..."
                                    value={filterSearch}
                                    onChange={(e) => {
                                        setFilterSearch(e.target.value);
                                        handleFilterChange(filterDate, filterClass, filterStatus, e.target.value);
                                    }}
                                    className="rounded-xl pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Table */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Rekap Presensi Siswa Tanggal {filterDate}</CardTitle>
                        <CardDescription className="text-xs font-semibold text-slate-500">Daftar kehadiran siswa berdasarkan hasil scan QR Code gerbang dan konfirmasi Wali Kelas</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow>
                                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 px-6 py-4">Siswa</TableHead>
                                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Kelas</TableHead>
                                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Jam Masuk</TableHead>
                                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Jam Pulang</TableHead>
                                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Status</TableHead>
                                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-right px-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                                                Tidak ada data presensi siswa yang cocok dengan filter.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student) => (
                                            <TableRow key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <TableCell className="px-6 py-4">
                                                    <div>
                                                        <p className="font-extrabold text-slate-900 dark:text-white">{student.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">NIS: {student.nis}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                                                    {student.class_name}
                                                </TableCell>
                                                <TableCell className="text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    {student.check_in_time || '--:--'}
                                                </TableCell>
                                                <TableCell className="text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    {student.check_out_time || '--:--'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(student.status)}
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <Button
                                                        onClick={() => openEditModal(student)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="rounded-xl font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-1.5" /> Ubah Status
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Manual Status Update */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={submitManualStatus}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Ubah Status Presensi Siswa</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-semibold pt-1">
                                Konfirmasi status presensi manual untuk {selectedStudent?.name} ({selectedStudent?.class_name}) tanggal {filterDate}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div>
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Pilih Status Presensi</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Hadir Tepat Waktu</SelectItem>
                                        <SelectItem value="late">Terlambat</SelectItem>
                                        <SelectItem value="sick">Sakit (Dengan Surat/Izin)</SelectItem>
                                        <SelectItem value="permit">Izin (Resmi/Dinas)</SelectItem>
                                        <SelectItem value="alpha">Tanpa Keterangan (Alpha)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Catatan / Alasan (Opsional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Ada surat keterangan dokter"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="rounded-xl h-11"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl font-bold w-full sm:w-auto h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto h-11 px-6 shadow-lg shadow-indigo-600/20">Simpan Status</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
