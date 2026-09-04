import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Users, Plus, Edit, Trash2, Search, QrCode, Filter, Printer, UserPlus, ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentIndex({ auth, students, schoolClasses, filters }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [search, setSearch] = useState(filters.search || '');
    const [classFilter, setClassFilter] = useState(filters.class_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'active');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nis: '',
        nisn: '',
        name: '',
        gender: 'Laki-laki',
        school_class_id: '',
        parent_name: '',
        parent_phone: '',
        status: 'active',
    });

    const handleFilterChange = (newSearch, newClass, newStatus) => {
        router.get(
            route('students.index'),
            { search: newSearch, class_id: newClass, status: newStatus },
            { preserveState: true, replace: true }
        );
    };

    const openAddModal = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setData({
            nis: student.nis,
            nisn: student.nisn || '',
            name: student.name,
            gender: student.gender || 'Laki-laki',
            school_class_id: String(student.school_class_id),
            parent_name: student.parent_name || '',
            parent_phone: student.parent_phone || '',
            status: student.status || 'active',
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Users className="w-3 h-3 mr-1.5" /> Master Data Siswa
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Kelola Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Siswa-Siswi</span>
                        </h2>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button onClick={() => router.visit(route('student-attendance.monitoring'))} variant="outline" className="rounded-xl font-bold">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Ke Monitoring Presensi
                        </Button>
                        <Button onClick={() => router.visit(route('students.cards'))} variant="secondary" className="rounded-xl font-bold">
                            <Printer className="w-4 h-4 mr-2" /> Cetak Kartu Pelajar QR
                        </Button>
                        <Button onClick={openAddModal} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <UserPlus className="w-4 h-4 mr-2" /> Tambah Siswa Baru
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Kelola Data Siswa" />

            <div className="space-y-6 pb-12">
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
                                    {schoolClasses.map((c) => (
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
                                    <TableHead className="font-bold px-6 py-4">NIS / NISN</TableHead>
                                    <TableHead className="font-bold">Nama Siswa</TableHead>
                                    <TableHead className="font-bold">Kelas</TableHead>
                                    <TableHead className="font-bold">No. HP Orang Tua (WA)</TableHead>
                                    <TableHead className="font-bold text-center">Status</TableHead>
                                    <TableHead className="font-bold text-right px-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                                            Belum ada data siswa.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.data.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                            <TableCell className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
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
                                                <Button onClick={() => openEditModal(student)} size="sm" variant="outline" className="rounded-xl font-bold">
                                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                                </Button>
                                                <Button onClick={() => handleDelete(student.id)} size="sm" variant="destructive" className="rounded-xl font-bold">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

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
                                            {schoolClasses.map(c => (
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

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl font-bold w-full">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full">Simpan Siswa</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Student */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Edit Data Siswa</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">Perbarui identitas siswa {selectedStudent?.name}.</DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">NIS (Wajib)*</Label>
                                    <Input value={data.nis} onChange={e => setData('nis', e.target.value)} required className="rounded-xl" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">NISN</Label>
                                    <Input value={data.nisn} onChange={e => setData('nisn', e.target.value)} className="rounded-xl" />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold mb-1 block">Nama Lengkap Siswa*</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required className="rounded-xl" />
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
                                            {schoolClasses.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Nama Orang Tua/Wali</Label>
                                    <Input value={data.parent_name} onChange={e => setData('parent_name', e.target.value)} className="rounded-xl" />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">No. HP Orang Tua (WA)</Label>
                                    <Input value={data.parent_phone} onChange={e => setData('parent_phone', e.target.value)} className="rounded-xl" />
                                </div>
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

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl font-bold w-full">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full">Perbarui Data</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
