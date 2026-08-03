import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, ShieldCheck, AlertCircle, Sparkles, Search, Download, Upload, FileUp, CheckSquare, Square, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export default function Index({ positions }) {
    const { auth } = usePage().props;
    const userRoles = auth?.user?.roles || (auth?.user?.role ? [auth.user.role] : []);
    const canManage = userRoles.some(r => ['Super Admin', 'Bendahara'].includes(r));

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selected, setSelected] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedIds, setCheckedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '', description: '',
    });

    const filtered = useMemo(() =>
        positions.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [positions, searchTerm]
    );

    // Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const allChecked = paginated.length > 0 && paginated.every(p => checkedIds.includes(p.id));
    const toggleAll = () => {
        if (allChecked) {
            setCheckedIds(prev => prev.filter(id => !paginated.find(p => p.id === id)));
        } else {
            const newIds = [...checkedIds];
            paginated.forEach(p => {
                if (!newIds.includes(p.id)) newIds.push(p.id);
            });
            setCheckedIds(newIds);
        }
    };
    const toggleOne = (id) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const openCreate = () => { clearErrors(); reset(); setIsEditMode(false); setIsFormOpen(true); };
    const openEdit = (pos) => {
        clearErrors();
        setSelected(pos);
        setData({ name: pos.name, description: pos.description || '' });
        setIsEditMode(true);
        setIsFormOpen(true);
    };
    const openDelete = (pos) => { setSelected(pos); setIsDeleteOpen(true); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('positions.update', selected.id), { onSuccess: () => { setIsFormOpen(false); reset(); } });
        } else {
            post(route('positions.store'), { onSuccess: () => { setIsFormOpen(false); reset(); } });
        }
    };

    const handleDelete = () => {
        destroy(route('positions.destroy', selected.id), { onSuccess: () => { setIsDeleteOpen(false); setSelected(null); } });
    };

    const handleBulkDelete = () => {
        router.post(route('positions.bulk-destroy'), { ids: checkedIds }, {
            onSuccess: () => { setIsBulkDeleteOpen(false); setCheckedIds([]); }
        });
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData(); fd.append('file', file);
        router.post(route('positions.import'), fd, { preserveScroll: true });
        e.target.value = '';
    };

    const fieldStyle = "rounded-xl border-slate-200 h-10 font-semibold focus-visible:ring-indigo-500 shadow-sm";

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm mb-2">
                            <ShieldCheck className="w-3 h-3 mr-1.5" /> Struktur Organisasi
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Struktur <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Jabatan</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="hidden sm:flex gap-2">
                            {canManage && (
                                <>
                                    <input type="file" id="import_pos" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
                                    <Button onClick={() => document.getElementById('import_pos').click()} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all">
                                        <Upload className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Import</span>
                                    </Button>
                                    <a href={route('positions.template')}>
                                        <Button className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
                                            <FileUp className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Template</span>
                                        </Button>
                                    </a>
                                </>
                            )}
                            <a href={route('positions.export')}>
                                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all">
                                    <Download className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Export</span>
                                </Button>
                            </a>
                        </div>
                        {canManage && checkedIds.length > 0 && (
                            <Button onClick={() => setIsBulkDeleteOpen(true)} variant="outline" className="rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-50">
                                <Trash2 className="w-4 h-4 mr-2" /> Hapus ({checkedIds.length})
                            </Button>
                        )}
                        {canManage && (
                            <Button onClick={openCreate} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
                                <Plus className="w-5 h-5 sm:mr-2" /><span className="hidden sm:inline">Tambah Jabatan</span>
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Jabatan" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="pb-8 space-y-5">
                {/* Search */}
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[1.5rem] border border-white shadow-sm flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="border-none shadow-none h-10 bg-transparent focus-visible:ring-0 font-semibold"
                        placeholder="Cari nama jabatan..." />
                    <span className="text-xs font-black text-slate-400 shrink-0 bg-slate-100 px-2 py-1 rounded-lg">{filtered.length} jabatan</span>
                </div>

                {/* Table */}
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-12 px-4">
                                            <button onClick={toggleAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                {allChecked ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                                            </button>
                                        </TableHead>
                                        <TableHead className="font-black text-slate-900 py-5">Nama Jabatan</TableHead>
                                        <TableHead className="font-black text-slate-900 hidden md:table-cell">Keterangan</TableHead>
                                        <TableHead className="font-black text-slate-900 text-center hidden sm:table-cell">Pegawai</TableHead>
                                        <TableHead className="font-black text-slate-900 text-right px-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {paginated.map((pos) => {
                                            const isChecked = checkedIds.includes(pos.id);
                                            return (
                                                <motion.tr key={pos.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className={`group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 ${isChecked ? 'bg-indigo-50/40' : ''}`}>
                                                    <TableCell className="px-4">
                                                        <button onClick={() => toggleOne(pos.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                            {isChecked ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                                                        </button>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div>
                                                            <p className="font-bold text-slate-900">{pos.name}</p>
                                                            {pos.description && <p className="text-xs text-slate-500 mt-0.5 md:hidden line-clamp-1">{pos.description}</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <p className="text-sm text-slate-500 max-w-xs line-clamp-2">{pos.description || <span className="text-slate-300">—</span>}</p>
                                                    </TableCell>
                                                    <TableCell className="text-center hidden sm:table-cell">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${pos.employees_count > 0 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                            <Users className="w-3 h-3" /> {pos.employees_count}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-6 text-right">
                                                        {canManage ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button onClick={() => openEdit(pos)} variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button onClick={() => openDelete(pos)} variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] font-semibold text-slate-400 italic">Read-Only</span>
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })}
                                        {filtered.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-16">
                                                    <div className="flex flex-col items-center text-slate-400">
                                                        <ShieldCheck className="w-12 h-12 mb-3 text-slate-200" />
                                                        <p className="font-bold text-slate-500">{searchTerm ? 'Jabatan tidak ditemukan' : 'Belum ada data jabatan'}</p>
                                                        <p className="text-sm mt-1">{searchTerm ? 'Coba kata kunci lain.' : 'Klik "Tambah Jabatan" untuk memulai.'}</p>
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

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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

            {/* Create/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={open => { if (!open) { setIsFormOpen(false); } }}>
                <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-7 text-white relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 opacity-20"><Sparkles className="w-36 h-36" /></div>
                        <DialogTitle className="text-2xl font-black relative z-10">{isEditMode ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium mt-1 relative z-10">Lengkapi nama jabatan dan keterangan.</DialogDescription>
                    </div>
                    <form onSubmit={handleSubmit} className="p-7 bg-slate-50 space-y-5 max-h-[70vh] overflow-y-auto">
                        {/* Informasi Dasar */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Informasi Dasar</h3>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-bold text-slate-700">Nama Jabatan <span className="text-rose-500">*</span></Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Contoh: Guru Produktif TKJ" className={fieldStyle} />
                                {errors.name && <p className="text-rose-500 text-xs font-bold">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-bold text-slate-700">Keterangan <span className="text-slate-400 font-normal">(opsional)</span></Label>
                                <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Deskripsi singkat tanggung jawab jabatan..." className="rounded-xl border-slate-200 font-semibold focus-visible:ring-indigo-500 shadow-sm resize-none" rows={2} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl font-bold h-11 px-6 border-slate-200">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Single Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-sm rounded-[2rem] p-8 text-center border-none shadow-2xl">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-5">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900 mb-2">Hapus Jabatan?</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-1">
                        Anda akan menghapus jabatan <span className="font-bold text-slate-900">{selected?.name}</span>.
                    </DialogDescription>
                    {selected?.employees_count > 0 && (
                        <p className="text-rose-600 text-sm font-bold bg-rose-50 rounded-xl p-3 mt-3">
                            ⚠ Jabatan ini masih digunakan oleh {selected.employees_count} pegawai dan tidak dapat dihapus.
                        </p>
                    )}
                    <div className="flex flex-col gap-3 mt-6">
                        {selected?.employees_count === 0 && (
                            <Button onClick={handleDelete} disabled={processing} className="w-full rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200">
                                Ya, Hapus
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full rounded-xl font-bold h-12 border-slate-200">
                            {selected?.employees_count > 0 ? 'Tutup' : 'Batal'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Modal */}
            <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <DialogContent className="max-w-sm rounded-[2rem] p-8 text-center border-none shadow-2xl">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-5">
                        <Trash2 className="w-8 h-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900 mb-2">Hapus {checkedIds.length} Jabatan?</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-6">
                        Jabatan yang masih digunakan pegawai akan dilindungi secara otomatis dan tidak akan terhapus.
                    </DialogDescription>
                    <div className="flex flex-col gap-3">
                        <Button onClick={handleBulkDelete} disabled={processing} className="w-full rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200">
                            {processing ? 'Menghapus...' : 'Ya, Hapus Semua'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)} className="w-full rounded-xl font-bold h-12 border-slate-200">Batal</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
