import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    BookOpen, Plus, Edit, Trash2, Users, ArrowLeft, Building2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SchoolClassesIndex({ auth, classes, teachers }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        level: 'X',
        major: 'TJKT',
        homeroom_teacher_id: '',
    });

    const openAddModal = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (c) => {
        setSelectedClass(c);
        setData({
            name: c.name,
            level: c.level || 'X',
            major: c.major || 'TJKT',
            homeroom_teacher_id: c.homeroom_teacher_id ? String(c.homeroom_teacher_id) : '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('school-classes.store'), {
            onSuccess: () => { setIsAddModalOpen(false); reset(); }
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('school-classes.update', selectedClass.id), {
            onSuccess: () => { setIsEditModalOpen(false); reset(); }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
            destroy(route('school-classes.destroy', id));
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
                                <Building2 className="w-3 h-3 mr-1.5" /> Manajemen Rombel & Kelas
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Kelola Kelas <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">& Jurusan</span>
                        </h2>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button onClick={() => router.visit(route('students.index'))} variant="outline" className="rounded-xl font-bold">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Ke Data Siswa
                        </Button>
                        <Button onClick={openAddModal} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Plus className="w-4 h-4 mr-2" /> Tambah Kelas Baru
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Kelola Kelas & Jurusan" />

            <div className="space-y-6 pb-12">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead className="font-bold px-6 py-4">Nama Kelas</TableHead>
                                    <TableHead className="font-bold">Tingkat</TableHead>
                                    <TableHead className="font-bold">Jurusan</TableHead>
                                    <TableHead className="font-bold">Wali Kelas</TableHead>
                                    <TableHead className="font-bold text-center">Jumlah Siswa</TableHead>
                                    <TableHead className="font-bold text-right px-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                                            Belum ada data kelas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    classes.map((c) => (
                                        <TableRow key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                            <TableCell className="px-6 py-4 font-black text-slate-900 dark:text-white">
                                                {c.name}
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                                                Tingkat {c.level || '-'}
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                                                {c.major || '-'}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-600 dark:text-slate-400">
                                                {c.homeroom_teacher?.name || 'Belum Ditentukan'}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-indigo-600 dark:text-indigo-400">
                                                {c.students_count || 0} Siswa
                                            </TableCell>
                                            <TableCell className="text-right px-6 space-x-2">
                                                <Button onClick={() => openEditModal(c)} size="sm" variant="outline" className="rounded-xl font-bold">
                                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                                </Button>
                                                <Button onClick={() => handleDelete(c.id)} size="sm" variant="destructive" className="rounded-xl font-bold">
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

            {/* Modal Add Class */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Tambah Kelas Baru</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">Buat rombel kelas untuk pengelompokan presensi siswa.</DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div>
                                <Label className="text-xs font-bold mb-1 block">Nama Kelas (Contoh: X TJKT 1)*</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Contoh: X TJKT 1" className="rounded-xl" />
                                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Tingkat</Label>
                                    <Select value={data.level} onValueChange={v => setData('level', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="X">Kelas X</SelectItem>
                                            <SelectItem value="XI">Kelas XI</SelectItem>
                                            <SelectItem value="XII">Kelas XII</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Jurusan</Label>
                                    <Input value={data.major} onChange={e => setData('major', e.target.value)} placeholder="TJKT / TKRO / etc" className="rounded-xl" />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold mb-1 block">Wali Kelas (Opsional)</Label>
                                <Select value={data.homeroom_teacher_id} onValueChange={v => setData('homeroom_teacher_id', v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Wali Kelas" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Belum Ada Wali Kelas</SelectItem>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl font-bold w-full">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full">Simpan Kelas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Class */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Edit Kelas</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">Perbarui informasi kelas {selectedClass?.name}.</DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div>
                                <Label className="text-xs font-bold mb-1 block">Nama Kelas*</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required className="rounded-xl" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Tingkat</Label>
                                    <Select value={data.level} onValueChange={v => setData('level', v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="X">Kelas X</SelectItem>
                                            <SelectItem value="XI">Kelas XI</SelectItem>
                                            <SelectItem value="XII">Kelas XII</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Jurusan</Label>
                                    <Input value={data.major} onChange={e => setData('major', e.target.value)} className="rounded-xl" />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold mb-1 block">Wali Kelas</Label>
                                <Select value={data.homeroom_teacher_id} onValueChange={v => setData('homeroom_teacher_id', v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Wali Kelas" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Belum Ada Wali Kelas</SelectItem>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl font-bold w-full">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full">Perbarui Kelas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
