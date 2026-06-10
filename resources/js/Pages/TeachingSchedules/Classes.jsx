import { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, School, AlertCircle, Sparkles, Search, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Classes({ classes, teachers }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '', level: '', major: '', homeroom_teacher_id: ''
    });

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('school-classes.import'), formData, {
            onSuccess: () => {
                e.target.value = ''; // reset file input
            },
            onError: () => {
                e.target.value = ''; // reset file input
            }
        });
    };

    const filtered = classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openCreate = () => { clearErrors(); reset(); setIsEditMode(false); setIsFormOpen(true); };
    const openEdit = (cls) => {
        clearErrors(); setSelected(cls);
        setData({ 
            name: cls.name, 
            level: cls.level || '', 
            major: cls.major || '',
            homeroom_teacher_id: cls.homeroom_teacher_id || ''
        });
        setIsEditMode(true); setIsFormOpen(true);
    };
    const openDelete = (cls) => { setSelected(cls); setIsDeleteOpen(true); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('school-classes.update', selected.id), { onSuccess: () => { setIsFormOpen(false); reset(); } });
        } else {
            post(route('school-classes.store'), { onSuccess: () => { setIsFormOpen(false); reset(); } });
        }
    };

    const handleDelete = () => {
        destroy(route('school-classes.destroy', selected.id), { onSuccess: () => { setIsDeleteOpen(false); setSelected(null); } });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm mb-2">
                            <School className="w-3 h-3 mr-1.5" /> Master Data
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Kelas</span>
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                        <Button onClick={() => window.location.href = route('school-classes.template')} variant="outline" className="border-slate-200 hover:bg-slate-50 font-bold h-11 rounded-xl text-indigo-600">
                            <FileSpreadsheet className="w-4 h-4 mr-2" /> Template
                        </Button>
                        <Button onClick={() => window.location.href = route('school-classes.export')} variant="outline" className="border-slate-200 hover:bg-slate-50 font-bold h-11 rounded-xl text-indigo-600">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                        <Button onClick={handleImportClick} className="bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold h-11 rounded-xl shadow-sm transition-all">
                            <Upload className="w-4 h-4 mr-2" /> Import
                        </Button>
                        <Button onClick={openCreate} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-11 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
                            <Plus className="w-5 h-5 sm:mr-2" /><span className="hidden sm:inline">Tambah Kelas</span>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Data Kelas" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="pb-8 space-y-5">
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[1.5rem] border border-white shadow-sm flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="border-none shadow-none h-10 bg-transparent focus-visible:ring-0 font-semibold"
                        placeholder="Cari nama kelas..." />
                    <span className="text-xs font-black text-slate-400 shrink-0 bg-slate-100 px-2 py-1 rounded-lg">{filtered.length} kelas</span>
                </div>

                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-black text-slate-900 py-5 px-6">Nama Kelas</TableHead>
                                        <TableHead className="font-black text-slate-900">Wali Kelas</TableHead>
                                        <TableHead className="font-black text-slate-900">Tingkat</TableHead>
                                        <TableHead className="font-black text-slate-900">Jurusan</TableHead>
                                        <TableHead className="font-black text-slate-900 text-right px-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {paginated.map((cls) => (
                                            <motion.tr key={cls.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50">
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-black">
                                                            <School className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-900">{cls.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {cls.homeroom_teacher ? (
                                                        <span className="font-bold text-slate-700">{cls.homeroom_teacher.name}</span>
                                                    ) : <span className="text-slate-300">—</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {cls.level ? (
                                                        <span className="font-bold text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">{cls.level}</span>
                                                    ) : <span className="text-slate-300">—</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {cls.major ? (
                                                        <span className="font-bold text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100">{cls.major}</span>
                                                    ) : <span className="text-slate-300">—</span>}
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button onClick={() => openEdit(cls)} variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></Button>
                                                        <Button onClick={() => openDelete(cls)} variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                        {filtered.length === 0 && (
                                            <TableRow><TableCell colSpan={4} className="text-center py-16">
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <School className="w-12 h-12 mb-3 text-slate-200" />
                                                    <p className="font-bold text-slate-500">Belum ada data kelas</p>
                                                </div>
                                            </TableCell></TableRow>
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

            {/* Form Modal */}
            <Dialog open={isFormOpen} onOpenChange={o => !o && setIsFormOpen(false)}>
                <DialogContent className="max-w-lg rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-7 text-white relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 opacity-20"><Sparkles className="w-36 h-36" /></div>
                        <DialogTitle className="text-2xl font-black relative z-10">{isEditMode ? 'Edit Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium mt-1 relative z-10">Lengkapi data kelas di bawah ini.</DialogDescription>
                    </div>
                    <form onSubmit={handleSubmit} className="p-7 bg-slate-50 space-y-5">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Nama Kelas <span className="text-rose-500">*</span></Label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Contoh: XII TFM-1"
                                className="rounded-xl border-slate-200 h-11 font-semibold focus-visible:ring-indigo-500 shadow-sm" />
                            {errors.name && <p className="text-rose-500 text-xs font-bold">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Wali Kelas</Label>
                            <select value={data.homeroom_teacher_id} onChange={e => setData('homeroom_teacher_id', e.target.value)}
                                className="w-full h-11 rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4 shadow-sm">
                                <option value="">— Pilih Wali Kelas —</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {errors.homeroom_teacher_id && <p className="text-rose-500 text-xs font-bold">{errors.homeroom_teacher_id}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Tingkat</Label>
                                <Input value={data.level} onChange={e => setData('level', e.target.value)} placeholder="X / XI / XII"
                                    className="rounded-xl border-slate-200 h-11 font-semibold focus-visible:ring-indigo-500 shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Jurusan</Label>
                                <Input value={data.major} onChange={e => setData('major', e.target.value)} placeholder="TFM / MPB / BCP"
                                    className="rounded-xl border-slate-200 h-11 font-semibold focus-visible:ring-indigo-500 shadow-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl font-bold h-11 px-6 border-slate-200">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-sm rounded-[2rem] p-8 text-center border-none shadow-2xl">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-5">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900 mb-2">Hapus Kelas?</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-6">
                        Anda akan menghapus kelas <span className="font-bold text-slate-900">{selected?.name}</span>.
                    </DialogDescription>
                    <div className="flex flex-col gap-3">
                        <Button onClick={handleDelete} disabled={processing} className="w-full rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200">Ya, Hapus</Button>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full rounded-xl font-bold h-12 border-slate-200">Batal</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
