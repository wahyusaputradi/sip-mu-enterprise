import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Users, AlertCircle, Search, Download, Upload, FileUp, CheckSquare, Square, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ employees }) {
    const { t } = useLanguage();
    const { flash, auth } = usePage().props;
    const userRoles = auth?.user?.roles || (auth?.user?.role ? [auth.user.role] : []);
    const canManage = userRoles.some(r => ['Super Admin', 'Bendahara', 'Kepala Sekolah', 'Admin'].includes(r)) || auth?.user?.id === 1;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [checkedIds, setCheckedIds] = useState([]);
    const [importLoading, setImportLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Show flash messages as notification
    useEffect(() => {
        if (flash?.message) {
            setNotification({ type: 'success', text: flash.message });
        } else if (flash?.error) {
            setNotification({ type: 'error', text: flash.error });
        }
    }, [flash?.message, flash?.error]);
    
    // Derived positions list for filter
    const uniquePositions = useMemo(() => {
        const pos = employees.flatMap(e => e.position_names || [e.position?.name]).filter(Boolean);
        return [...new Set(pos)];
    }, [employees]);
    const [filterPosition, setFilterPosition] = useState('all');

    const { delete: destroy, processing } = useForm();

    const openDeleteModal = (emp) => {
        setSelectedEmployee(emp);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        destroy(route('employees.destroy', selectedEmployee.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedEmployee(null);
            },
        });
    };

    const handleBulkDelete = () => {
        router.post(route('employees.bulk-destroy'), { ids: checkedIds }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsBulkDeleteOpen(false);
                setCheckedIds([]);
            }
        });
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (emp.nik && emp.nik.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
        const matchesPosition = filterPosition === 'all' || (emp.position_names || [emp.position?.name]).includes(filterPosition);
        
        return matchesSearch && matchesStatus && matchesPosition;
    });

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterPosition]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const allChecked = paginatedEmployees.length > 0 && paginatedEmployees.every(e => checkedIds.includes(e.id));
    const toggleAll = () => {
        if (allChecked) {
            setCheckedIds(prev => prev.filter(id => !paginatedEmployees.find(e => e.id === id)));
        } else {
            const newIds = [...checkedIds];
            paginatedEmployees.forEach(e => {
                if (!newIds.includes(e.id)) newIds.push(e.id);
            });
            setCheckedIds(newIds);
        }
    };
    const toggleOne = (id) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setImportLoading(true);
        setNotification(null);

        router.post(route('employees.import'), formData, {
            preserveScroll: true,
            onFinish: () => {
                e.target.value = '';
                setImportLoading(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Users className="w-3 h-3 mr-1.5" />
                                Master Data
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Direktori <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pegawai</span>
                        </h2>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        {/* Import/Export Buttons */}
                        <div className="flex items-center flex-wrap gap-2">
                            {canManage && (
                                <>
                                    <div className="flex items-center">
                                        <input 
                                            type="file" 
                                            id="import_excel" 
                                            accept=".xlsx, .xls, .csv" 
                                            className="hidden" 
                                            onChange={handleFileImport} 
                                        />
                                        <Button 
                                            type="button" 
                                            disabled={importLoading} 
                                            onClick={() => document.getElementById('import_excel').click()} 
                                            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all disabled:opacity-60"
                                        >
                                            {importLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                            <span>{importLoading ? t('common.loading') : t('common.import_excel')}</span>
                                        </Button>
                                    </div>
                                    
                                    <a href={route('employees.template')}>
                                        <Button type="button" className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
                                            <FileUp className="w-4 h-4 mr-2" /><span>{t('common.template')}</span>
                                        </Button>
                                    </a>
                                </>
                            )}
                            
                            <a href={route('employees.export')}>
                                <Button type="button" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all">
                                    <Download className="w-4 h-4 mr-2" /><span>{t('common.export_excel')}</span>
                                </Button>
                            </a>
                        </div>
                        {canManage && checkedIds.length > 0 && (
                            <Button onClick={() => setIsBulkDeleteOpen(true)} variant="outline" className="rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-50">
                                <Trash2 className="w-4 h-4 mr-2" /> {t('common.delete')} ({checkedIds.length})
                            </Button>
                        )}
                        {canManage && (
                            <Link href={route('employees.create')}>
                                <Button 
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_10px_25px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5"
                                >
                                    <Plus className="w-5 h-5 mr-2" /><span>{t('emp.add_btn')}</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Pegawai" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pb-8 space-y-6"
            >
                {/* Flash Notification Banner */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className={`rounded-2xl p-4 flex items-start gap-3 shadow-lg border ${
                                notification.type === 'success'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}
                        >
                            {notification.type === 'success'
                                ? <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600 flex-shrink-0" />
                                : <XCircle className="w-5 h-5 mt-0.5 text-rose-600 flex-shrink-0" />
                            }
                            <p className="text-sm font-semibold flex-1">{notification.text}</p>
                            <button onClick={() => setNotification(null)} className="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Filter and Search Bar */}
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[1.5rem] border border-white shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-1 min-w-0">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white w-full" 
                            placeholder="Cari NIK atau Nama..." 
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Select value={filterPosition} onValueChange={setFilterPosition}>
                            <SelectTrigger className="flex-1 sm:w-[160px] h-11 rounded-xl border-slate-200 min-w-[130px]">
                                <SelectValue placeholder="Semua Jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jabatan</SelectItem>
                                {uniquePositions.map(pos => (
                                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="flex-1 sm:w-[140px] h-11 rounded-xl border-slate-200 min-w-[120px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Non-aktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

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
                                        <TableHead className="font-black text-slate-900 px-4 lg:px-8 py-5">Profil Pegawai</TableHead>
                                        <TableHead className="font-black text-slate-900 hidden sm:table-cell">NIK / Masa Kerja</TableHead>
                                        <TableHead className="font-black text-slate-900 hidden md:table-cell">Jabatan &amp; Tugas</TableHead>
                                        <TableHead className="font-black text-slate-900 text-center hidden sm:table-cell">Status</TableHead>
                                        <TableHead className="font-black text-slate-900 text-right px-4 lg:px-8">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {paginatedEmployees.map((emp) => {
                                            const isChecked = checkedIds.includes(emp.id);
                                            return (
                                            <motion.tr 
                                                key={emp.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={`group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 ${isChecked ? 'bg-indigo-50/40' : ''}`}
                                            >
                                                <TableCell className="px-4">
                                                    <button onClick={() => toggleOne(emp.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                        {isChecked ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="px-4 lg:px-8 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {emp.photo_path ? (
                                                                <img src={emp.photo_url} alt={emp.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-slate-400 font-bold text-base sm:text-lg">{emp.name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">{emp.name}</p>
                                                            <p className="text-xs font-semibold text-slate-500 truncate hidden sm:block">{emp.user?.email || 'Belum ada akun'}</p>
                                                            {/* Mobile: show jabatan inline */}
                                                            <p className="text-xs font-bold text-indigo-600 sm:hidden mt-0.5">{emp.primary_position_name || emp.position?.name || '-'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded text-xs block w-max">{emp.nik || emp.nip}</span>
                                                        <span className="text-[10px] font-semibold text-slate-500">{emp.work_duration || 'Masa kerja belum dihitung'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="space-y-1.5">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {(emp.position_names || [emp.position?.name]).filter(Boolean).map((name, idx) => (
                                                                <span key={idx} className={`font-bold px-2.5 py-1 rounded-md text-xs block w-max ${
                                                                    name === emp.primary_position_name 
                                                                    ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' 
                                                                    : 'text-slate-600 bg-slate-100 border border-slate-200'
                                                                }`}>
                                                                    {name === emp.primary_position_name && '★ '}{name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {(emp.is_homeroom_teacher || emp.is_extracurricular_builder || (emp.position_names || [emp.position?.name]).filter(Boolean).some(name => name.toLowerCase().includes('guru'))) && (
                                                            <div className="flex gap-1 flex-wrap">
                                                                {(emp.position_names || [emp.position?.name]).filter(Boolean).some(name => name.toLowerCase().includes('guru')) && (
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                                                        emp.is_certified 
                                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                                                    }`}>
                                                                        {emp.is_certified ? 'Sertifikasi' : 'Non-Sertifikasi'}
                                                                    </span>
                                                                )}
                                                                {emp.is_homeroom_teacher && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-100">Wali: {emp.homeroom_class}</span>}
                                                                {emp.is_extracurricular_builder && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold border border-purple-100">Pembina: {emp.extracurricular_name}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center hidden sm:table-cell">
                                                    {emp.status === 'active' ? (
                                                        <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>
                                                            Non-aktif
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 lg:px-8 text-right">
                                                     {canManage ? (
                                                         <div className="flex items-center justify-end space-x-2">
                                                             <Link href={route('employees.edit', emp.id)}>
                                                                 <Button 
                                                                     variant="outline" 
                                                                     size="icon" 
                                                                     className="h-8 w-8 rounded-lg border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                                                                 >
                                                                     <Edit2 className="w-4 h-4" />
                                                                 </Button>
                                                             </Link>
                                                             <Button 
                                                                 onClick={() => openDeleteModal(emp)}
                                                                 variant="outline" 
                                                                 size="icon" 
                                                                 className="h-8 w-8 rounded-lg border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                                             >
                                                                 <Trash2 className="w-4 h-4" />
                                                             </Button>
                                                         </div>
                                                     ) : (
                                                         <span className="text-[11px] font-semibold text-slate-400 italic">Read-Only</span>
                                                     )}
                                                 </TableCell>
                                            </motion.tr>
                                        )})}
                                        {filteredEmployees.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-16">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <Users className="w-12 h-12 mb-4 text-slate-200" />
                                                        <p className="font-bold text-slate-500">Tidak ada data ditemukan</p>
                                                        <p className="text-sm mt-1">Ganti filter atau pencarian Anda.</p>
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

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 text-center border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Hapus Pegawai?</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-8 text-base">
                        Anda yakin ingin menghapus <span className="font-bold text-slate-900">{selectedEmployee?.name}</span>?
                    </DialogDescription>
                    
                    <div className="flex flex-col space-y-3">
                        <Button 
                            onClick={handleDelete} 
                            disabled={processing}
                            className="w-full rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                        >
                            Ya, Hapus Pegawai
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="w-full rounded-xl font-bold h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 text-center border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Hapus {checkedIds.length} Pegawai?</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-8 text-base">
                        Aksi ini tidak dapat dibatalkan. Semua data terkait pegawai yang dipilih akan dihapus secara permanen.
                    </DialogDescription>
                    
                    <div className="flex flex-col space-y-3">
                        <Button 
                            onClick={handleBulkDelete} 
                            disabled={processing}
                            className="w-full rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus Semua'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsBulkDeleteOpen(false)}
                            className="w-full rounded-xl font-bold h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
