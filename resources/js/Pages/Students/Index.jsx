import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, Edit, Trash2, Search, QrCode, Filter, Printer, UserPlus, ArrowLeft,
    FileSpreadsheet, Upload, Download, CheckSquare, Square, AlertCircle, X,
    User, GraduationCap, Building2, Calendar, MapPin, Phone, CreditCard, FileText, ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentIndex({ auth = {}, students = {}, schoolClasses = [], filters = {}, isReadOnly = false, isHomeroomTeacher = false }) {
    const studentList = Array.isArray(students?.data) ? students.data : [];
    const classesList = Array.isArray(schoolClasses) ? schoolClasses : [];
    const filterData = filters || {};

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [search, setSearch] = useState(filterData.search || '');
    const [classFilter, setClassFilter] = useState(filterData.class_id || '');
    const [statusFilter, setStatusFilter] = useState(filterData.status || 'active');

    const [editActiveTab, setEditActiveTab] = useState('siswa');

    const regencyOptions = [
        'Kabupaten Cirebon',
        'Kota Cirebon',
        'Kabupaten Indramayu',
        'Kabupaten Majalengka',
        'Kabupaten Kuningan',
        'Lainnya'
    ];

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        // Data Siswa Utama
        nis: '',
        nisn: '',
        name: '',
        gender: 'Laki-laki',
        school_class_id: '',
        status: 'active',

        // Data Biodata Siswa
        pob: '',
        dob: '',
        nik: '',
        address: '',
        rt: '',
        rw: '',
        village: '',
        district: '',
        regency: 'Kabupaten Cirebon',
        kip_number: '',
        previous_school: '',
        family_card_number: '',
        student_phone: '',
        parent_name: '',
        parent_phone: '',

        // Data Ayah
        father_name: '',
        father_pob: '',
        father_dob: '',
        father_nik: '',
        father_phone: '',
        father_job: '',

        // Data Ibu
        mother_name: '',
        mother_pob: '',
        mother_dob: '',
        mother_nik: '',
        mother_phone: '',
        mother_job: '',
    });

    const handleNumericInput = (field, value, maxLen = 30) => {
        const clean = value.replace(/[^0-9]/g, '').slice(0, maxLen);
        setData(field, clean);
    };

    const importForm = useForm({
        file: null,
    });

    const handleFilterChange = (newSearch, newClass, newStatus) => {
        router.get(
            route('students.index'),
            { search: newSearch, class_id: newClass, status: newStatus },
            { preserveState: true, replace: true }
        );
    };

    // Checkbox selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === studentList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(studentList.map(s => s.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih?`)) {
            router.post(route('students.bulk-destroy'), { ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const openAddModal = () => {
        reset();
        setEditActiveTab('siswa');
        setIsAddModalOpen(true);
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setEditActiveTab('siswa');
        setData({
            // Data Siswa Utama
            nis: student.nis || '',
            nisn: student.nisn || '',
            name: student.name || '',
            gender: student.gender || 'Laki-laki',
            school_class_id: String(student.school_class_id || ''),
            status: student.status || 'active',

            // Data Biodata Siswa
            pob: student.pob || '',
            dob: student.dob || '',
            nik: student.nik || '',
            address: student.address || '',
            rt: student.rt || '',
            rw: student.rw || '',
            village: student.village || '',
            district: student.district || '',
            regency: student.regency || 'Kabupaten Cirebon',
            kip_number: student.kip_number || '',
            previous_school: student.previous_school || '',
            family_card_number: student.family_card_number || '',
            student_phone: student.student_phone || '',
            parent_name: student.parent_name || '',
            parent_phone: student.parent_phone || '',

            // Data Ayah
            father_name: student.father_name || '',
            father_pob: student.father_pob || '',
            father_dob: student.father_dob || '',
            father_nik: student.father_nik || '',
            father_phone: student.father_phone || '',
            father_job: student.father_job || '',

            // Data Ibu
            mother_name: student.mother_name || '',
            mother_pob: student.mother_pob || '',
            mother_dob: student.mother_dob || '',
            mother_nik: student.mother_nik || '',
            mother_phone: student.mother_phone || '',
            mother_job: student.mother_job || '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('students.store'), {
            onSuccess: () => { setIsAddModalOpen(false); reset(); }
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('students.update', selectedStudent.id), {
            onSuccess: () => { setIsEditModalOpen(false); reset(); }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
            destroy(route('students.destroy', id));
        }
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        importForm.post(route('students.import'), {
            preserveScroll: true,
            onSuccess: () => { setIsImportModalOpen(false); importForm.reset(); },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Users className="w-3 h-3 mr-1.5" /> Master Data Siswa
                            </span>
                            {isReadOnly && (
                                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                    <ShieldCheck className="w-3 h-3 mr-1.5" /> Read-Only (Kesiswaan)
                                </span>
                            )}
                            {isHomeroomTeacher && (
                                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                    <GraduationCap className="w-3 h-3 mr-1.5" /> Wali Kelas (Scope Terbatas)
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Kelola Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Siswa-Siswi</span>
                        </h2>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                        <Button onClick={() => window.location.href = route('students.export', { class_id: classFilter, search })} variant="outline" className="rounded-xl font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400">
                            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
                        </Button>
                        {!isReadOnly && (
                            <>
                                <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="rounded-xl font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400">
                                    <Upload className="w-4 h-4 mr-2" /> Import Excel
                                </Button>
                                <Button onClick={openAddModal} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <UserPlus className="w-4 h-4 mr-2" /> Tambah Siswa Baru
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Kelola Data Siswa" />

            <div className="space-y-6 pb-12 relative">
                {/* Floating Bulk Action Bar */}
                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between z-30 sticky top-4"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-black flex items-center justify-center text-sm">
                                    {selectedIds.length}
                                </span>
                                <span className="font-bold text-sm text-slate-200">Data siswa terpilih</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button onClick={() => setSelectedIds([])} variant="ghost" size="sm" className="text-slate-400 hover:text-white font-bold rounded-xl">
                                    Batal Pilih
                                </Button>
                                <Button onClick={handleBulkDelete} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30">
                                    <Trash2 className="w-4 h-4 mr-2" /> Hapus {selectedIds.length} Siswa Terpilih
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filter Bar */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Cari Nama / NIS / NISN</Label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Ketik pencarian..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); handleFilterChange(e.target.value, classFilter, statusFilter); }}
                                    className="rounded-xl pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Filter Kelas</Label>
                            <Select value={classFilter} onValueChange={(val) => { setClassFilter(val); handleFilterChange(search, val, statusFilter); }}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Kelas</SelectItem>
                                    {classesList.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Status Siswa</Label>
                            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); handleFilterChange(search, classFilter, val); }}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="graduated">Lulus</SelectItem>
                                    <SelectItem value="moved">Pindah</SelectItem>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Table */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead className="w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={studentList.length > 0 && selectedIds.length === studentList.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </TableHead>
                                    <TableHead className="font-bold py-4">NIS / NISN</TableHead>
                                    <TableHead className="font-bold">Nama Siswa</TableHead>
                                    <TableHead className="font-bold">Kelas</TableHead>
                                    <TableHead className="font-bold">No. HP Orang Tua (WA)</TableHead>
                                    <TableHead className="font-bold text-center">Status</TableHead>
                                    <TableHead className="font-bold text-right px-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                                            Belum ada data siswa.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    studentList.map((student) => (
                                        <TableRow key={student.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${selectedIds.includes(student.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}>
                                            <TableCell className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(student.id)}
                                                    onChange={() => toggleSelect(student.id)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {student.nis} {student.nisn ? `(${student.nisn})` : ''}
                                            </TableCell>
                                            <TableCell className="font-extrabold text-slate-900 dark:text-white">
                                                {student.name}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                                                {student.school_class?.name || '-'}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                                                {student.parent_phone || '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${student.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {student.status === 'active' ? 'Aktif' : student.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-6 space-x-2">
                                                {isReadOnly ? (
                                                    <span className="text-xs text-slate-400 font-semibold italic">Read-Only</span>
                                                ) : (
                                                    <>
                                                        <Button onClick={() => openEditModal(student)} size="sm" variant="outline" className="rounded-xl font-bold">
                                                            <Edit className="w-4 h-4 mr-1" /> Edit
                                                        </Button>
                                                        <Button onClick={() => handleDelete(student.id)} size="sm" variant="destructive" className="rounded-xl font-bold">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {students?.links && students.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2">
                        <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                            Menampilkan <span className="text-slate-900 dark:text-white font-black">{students.from || 0}</span> s/d <span className="text-slate-900 dark:text-white font-black">{students.to || 0}</span> dari total <span className="text-indigo-600 dark:text-indigo-400 font-black">{students.total || 0}</span> data siswa
                        </p>
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
                            {(students.links || []).map((link, idx) => {
                                const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                                const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                                const label = isPrevious ? 'Prev' : (isNext ? 'Next' : link.label);

                                return link.url ? (
                                    <button
                                        key={idx}
                                        onClick={() => router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            link.active 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                ) : (
                                    <span key={idx} className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 dark:text-slate-600" dangerouslySetInnerHTML={{ __html: label }} />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Import Excel */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleImportSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Import Data Siswa dari Excel</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">Unggah berkas Excel (.xlsx / .csv) untuk memasukkan atau memperbarui data siswa secara masal.</DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex items-start space-x-3">
                                <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Belum punya format Excel?</h4>
                                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">Unduh template standar terlebih dahulu agar kolom sesuai.</p>
                                    <a
                                        href={route('students.download-template')}
                                        className="inline-flex items-center text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                                    >
                                        <Download className="w-3.5 h-3.5 mr-1" /> Unduh Template Import (.xlsx)
                                    </a>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold mb-1.5 block">Pilih Berkas Excel (.xlsx / .csv)*</Label>
                                <Input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => importForm.setData('file', e.target.files[0])}
                                    required
                                    className="rounded-xl cursor-pointer"
                                />
                                {importForm.errors.file && <p className="text-xs text-rose-500 mt-1">{importForm.errors.file}</p>}
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)} className="rounded-xl font-bold w-full sm:w-auto h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={importForm.processing || !importForm.data.file} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto h-11 px-6 shadow-lg shadow-indigo-600/20">
                                <Upload className="w-4 h-4 mr-2" />
                                {importForm.processing ? 'Memproses Import...' : 'Unggah & Import'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Add Student */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Tambah Siswa Baru</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">Isi identitas siswa untuk pembuatan token QR Code presensi.</DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">NIS (Wajib)*</Label>
                                    <Input value={data.nis} onChange={e => setData('nis', e.target.value)} required placeholder="Contoh: 2026001" className="rounded-xl" />
                                    {errors.nis && <p className="text-xs text-rose-500 mt-1">{errors.nis}</p>}
                                </div>
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">NISN</Label>
                                    <Input value={data.nisn} onChange={e => setData('nisn', e.target.value)} placeholder="Contoh: 0051234567" className="rounded-xl" />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold mb-1 block">Nama Lengkap Siswa*</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Ketik nama lengkap..." className="rounded-xl" />
                                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Jenis Kelamin</Label>
                                    <Select value={data.gender} onValueChange={v => setData('gender', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Kelas / Rombel*</Label>
                                    <Select value={data.school_class_id} onValueChange={v => setData('school_class_id', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                        <SelectContent>
                                            {classesList.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Nama Orang Tua/Wali</Label>
                                    <Input value={data.parent_name} onChange={e => setData('parent_name', e.target.value)} placeholder="Nama Wali" className="rounded-xl" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">No. HP Orang Tua (WA)</Label>
                                    <Input value={data.parent_phone} onChange={e => setData('parent_phone', e.target.value)} placeholder="08xxxxxxxxxx" className="rounded-xl" />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl font-bold w-full sm:w-auto h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto h-11 px-6 shadow-lg shadow-indigo-600/20">Simpan Siswa</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Student - 3 Tabbed Interface */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span>Edit Data Siswa & Biodata Orang Tua</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Perbarui informasi profil siswa <strong className="text-slate-800 dark:text-slate-200">{selectedStudent?.name}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Navigation Tabs */}
                        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pt-4 pb-1">
                            <button
                                type="button"
                                onClick={() => setEditActiveTab('siswa')}
                                className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                                    editActiveTab === 'siswa'
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <User className="w-4 h-4" />
                                <span>1. Data Siswa</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setEditActiveTab('ayah')}
                                className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                                    editActiveTab === 'ayah'
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <User className="w-4 h-4 text-blue-400" />
                                <span>2. Data Ayah</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setEditActiveTab('ibu')}
                                className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                                    editActiveTab === 'ibu'
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <User className="w-4 h-4 text-pink-400" />
                                <span>3. Data Ibu</span>
                            </button>
                        </div>

                        {/* TAB 1: DATA PRIBADI SISWA */}
                        {editActiveTab === 'siswa' && (
                            <div className="py-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">NIS (Wajib)*</Label>
                                        <Input value={data.nis} onChange={e => setData('nis', e.target.value)} required className="rounded-xl" />
                                        {errors.nis && <p className="text-xs text-rose-500 mt-1">{errors.nis}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">NISN</Label>
                                        <Input value={data.nisn} onChange={e => setData('nisn', e.target.value)} placeholder="0051234567" className="rounded-xl" />
                                        {errors.nisn && <p className="text-xs text-rose-500 mt-1">{errors.nisn}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Kelas / Rombel*</Label>
                                        <Select value={data.school_class_id} onValueChange={v => setData('school_class_id', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                            <SelectContent>
                                                {classesList.map(c => (
                                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.school_class_id && <p className="text-xs text-rose-500 mt-1">{errors.school_class_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-2">
                                        <Label className="text-xs font-bold mb-1 block">Nama Lengkap Siswa*</Label>
                                        <Input value={data.name} onChange={e => setData('name', e.target.value)} required className="rounded-xl" />
                                        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Jenis Kelamin</Label>
                                        <Select value={data.gender} onValueChange={v => setData('gender', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Tempat Lahir Siswa</Label>
                                        <Input value={data.pob} onChange={e => setData('pob', e.target.value)} placeholder="Contoh: Cirebon" className="rounded-xl" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Tanggal Lahir Siswa</Label>
                                        <Input type="date" value={data.dob} onChange={e => setData('dob', e.target.value)} className="rounded-xl" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">NIK Siswa (16 Digit)</Label>
                                        <Input value={data.nik} onChange={e => handleNumericInput('nik', e.target.value, 16)} placeholder="320912..." className="rounded-xl font-mono" />
                                        {errors.nik && <p className="text-xs text-rose-500 mt-1">{errors.nik}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">No. Kartu Keluarga (KK)</Label>
                                        <Input value={data.family_card_number} onChange={e => handleNumericInput('family_card_number', e.target.value, 16)} placeholder="320912..." className="rounded-xl font-mono" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">No. KIP (Jika Ada)</Label>
                                        <Input value={data.kip_number} onChange={e => setData('kip_number', e.target.value)} placeholder="Contoh: KIP123456 / Alfanumerik" className="rounded-xl font-mono" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">No. HP/WA Siswa</Label>
                                        <Input value={data.student_phone} onChange={e => handleNumericInput('student_phone', e.target.value, 15)} placeholder="08xxxxxxxxxx" className="rounded-xl font-mono" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Asal Sekolah</Label>
                                        <Input value={data.previous_school} onChange={e => setData('previous_school', e.target.value)} placeholder="SMP / MTs Asal" className="rounded-xl" />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Alamat Tempat Tinggal (Jalan / Dusun / Blok)</Label>
                                    <Input value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Contoh: Jl. Sunan Gunung Jati No. 12, Blok Manis" className="rounded-xl" />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">RT</Label>
                                        <Input value={data.rt} onChange={e => handleNumericInput('rt', e.target.value, 5)} placeholder="001" className="rounded-xl font-mono" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">RW</Label>
                                        <Input value={data.rw} onChange={e => handleNumericInput('rw', e.target.value, 5)} placeholder="002" className="rounded-xl font-mono" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Desa / Kelurahan</Label>
                                        <Input value={data.village} onChange={e => setData('village', e.target.value)} placeholder="Desa" className="rounded-xl" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Kecamatan</Label>
                                        <Input value={data.district} onChange={e => setData('district', e.target.value)} placeholder="Kecamatan" className="rounded-xl" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Kabupaten / Kota</Label>
                                        <Select value={data.regency} onValueChange={v => setData('regency', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Kabupaten/Kota" /></SelectTrigger>
                                            <SelectContent>
                                                {regencyOptions.map(r => (
                                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Status Siswa</Label>
                                        <Select value={data.status} onValueChange={v => setData('status', v)}>
                                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Aktif</SelectItem>
                                                <SelectItem value="graduated">Lulus</SelectItem>
                                                <SelectItem value="moved">Pindah</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Nama Wali (Opsional)</Label>
                                        <Input value={data.parent_name} onChange={e => setData('parent_name', e.target.value)} placeholder="Nama Wali Utama" className="rounded-xl" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">No. HP Wali (WA Utama)</Label>
                                        <Input value={data.parent_phone} onChange={e => handleNumericInput('parent_phone', e.target.value, 15)} placeholder="08xxxxxxxxxx" className="rounded-xl font-mono" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: DATA AYAH KANDUNG */}
                        {editActiveTab === 'ayah' && (
                            <div className="py-5 space-y-4">
                                <div className="bg-blue-50/80 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/60 mb-2">
                                    <h4 className="text-xs font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Informasi Identitas Ayah Kandung</span>
                                    </h4>
                                    <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                                        Data ini tersinkronisasi langsung dengan halaman profil siswa dan wali murid.
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Nama Lengkap Ayah</Label>
                                    <Input value={data.father_name} onChange={e => setData('father_name', e.target.value)} placeholder="Ketik nama lengkap ayah..." className="rounded-xl" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Tempat Lahir Ayah</Label>
                                        <Input value={data.father_pob} onChange={e => setData('father_pob', e.target.value)} placeholder="Contoh: Cirebon" className="rounded-xl" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Tanggal Lahir Ayah</Label>
                                        <Input type="date" value={data.father_dob} onChange={e => setData('father_dob', e.target.value)} className="rounded-xl" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">NIK Ayah (16 Digit)</Label>
                                        <Input value={data.father_nik} onChange={e => handleNumericInput('father_nik', e.target.value, 16)} placeholder="320912..." className="rounded-xl font-mono" />
                                        {errors.father_nik && <p className="text-xs text-rose-500 mt-1">{errors.father_nik}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">No. HP/WA Ayah</Label>
                                        <Input value={data.father_phone} onChange={e => handleNumericInput('father_phone', e.target.value, 15)} placeholder="08xxxxxxxxxx" className="rounded-xl font-mono" />
                                        {errors.father_phone && <p className="text-xs text-rose-500 mt-1">{errors.father_phone}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Pekerjaan Ayah</Label>
                                        <Input value={data.father_job} onChange={e => setData('father_job', e.target.value)} placeholder="Contoh: Wiraswasta" className="rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: DATA IBU KANDUNG */}
                        {editActiveTab === 'ibu' && (
                            <div className="py-5 space-y-4">
                                <div className="bg-pink-50/80 dark:bg-pink-950/40 p-4 rounded-2xl border border-pink-200/60 dark:border-pink-900/60 mb-2">
                                    <h4 className="text-xs font-black text-pink-900 dark:text-pink-200 flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                        <span>Informasi Identitas Ibu Kandung</span>
                                    </h4>
                                    <p className="text-[11px] text-pink-700 dark:text-pink-300 mt-0.5">
                                        Data ini tersinkronisasi langsung dengan halaman profil siswa dan wali murid.
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Nama Lengkap Ibu</Label>
                                    <Input value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} placeholder="Ketik nama lengkap ibu..." className="rounded-xl" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Tempat Lahir Ibu</Label>
                                        <Input value={data.mother_pob} onChange={e => setData('mother_pob', e.target.value)} placeholder="Contoh: Cirebon" className="rounded-xl" />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Tanggal Lahir Ibu</Label>
                                        <Input type="date" value={data.mother_dob} onChange={e => setData('mother_dob', e.target.value)} className="rounded-xl" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">NIK Ibu (16 Digit)</Label>
                                        <Input value={data.mother_nik} onChange={e => handleNumericInput('mother_nik', e.target.value, 16)} placeholder="320912..." className="rounded-xl font-mono" />
                                        {errors.mother_nik && <p className="text-xs text-rose-500 mt-1">{errors.mother_nik}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">No. HP/WA Ibu</Label>
                                        <Input value={data.mother_phone} onChange={e => handleNumericInput('mother_phone', e.target.value, 15)} placeholder="08xxxxxxxxxx" className="rounded-xl font-mono" />
                                        {errors.mother_phone && <p className="text-xs text-rose-500 mt-1">{errors.mother_phone}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold mb-1 block">Pekerjaan Ibu</Label>
                                        <Input value={data.mother_job} onChange={e => setData('mother_job', e.target.value)} placeholder="Contoh: Ibu Rumah Tangga" className="rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl font-bold w-full sm:w-auto h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto h-11 px-6 shadow-lg shadow-indigo-600/20">
                                {processing ? 'Memperbarui...' : 'Perbarui Data Siswa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
