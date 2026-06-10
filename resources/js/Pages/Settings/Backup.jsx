import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DatabaseBackup, Download, Trash2, RotateCcw, AlertTriangle, ShieldCheck, Database, FileArchive, HardDrive, FolderArchive, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Backup({ backups, appName, totalSize, totalCount }) {
    const [processing, setProcessing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmRestore, setConfirmRestore] = useState(null);
    const [backupMenuOpen, setBackupMenuOpen] = useState(false);

    const handleBackup = (type) => {
        setProcessing(true);
        setBackupMenuOpen(false);
        router.post(route('backups.create'), { type }, {
            onFinish: () => setProcessing(false)
        });
    };

    const handleDownload = (path) => {
        // Gunakan window.open agar browser melakukan download langsung (GET request)
        window.open(route('backups.download', { path }), '_blank');
    };

    const handleDelete = (path) => {
        setProcessing(true);
        router.delete(route('backups.destroy'), {
            data: { path },
            onFinish: () => {
                setProcessing(false);
                setConfirmDelete(null);
            }
        });
    };

    const handleRestore = (path) => {
        setProcessing(true);
        router.post(route('backups.restore-db'), { path }, {
            onFinish: () => {
                setProcessing(false);
                setConfirmRestore(null);
            }
        });
    };

    const stats = [
        { label: 'Total Arsip', value: totalCount, icon: <FolderArchive className="w-5 h-5" />, g: 'from-indigo-500 to-purple-500' },
        { label: 'Total Ukuran', value: totalSize, icon: <HardDrive className="w-5 h-5" />, g: 'from-cyan-500 to-blue-500' },
        { label: 'Backup Terbaru', value: backups.length > 0 ? backups[0].date : '—', icon: <DatabaseBackup className="w-5 h-5" />, g: 'from-emerald-500 to-teal-500', isText: true },
    ];

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                            <ShieldCheck className="w-3 h-3 mr-1.5" /> Keamanan Sistem
                        </span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Backup & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Restore</span>
                    </h2>
                </div>
                <div className="relative">
                    <Button
                        onClick={() => setBackupMenuOpen(!backupMenuOpen)}
                        disabled={processing}
                        className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5"
                    >
                        {processing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <DatabaseBackup className="w-5 h-5 mr-2" />}
                        {processing ? 'Memproses Backup...' : 'Buat Backup Baru'}
                    </Button>
                    <AnimatePresence>
                        {backupMenuOpen && !processing && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setBackupMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pilih Jenis Backup</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => handleBackup('full')}
                                            className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                                                <FileArchive className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">Full Backup</p>
                                                <p className="text-[11px] text-slate-500 font-medium">Database + Semua File Upload</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleBackup('db-only')}
                                            className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-cyan-50 transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0 group-hover:bg-cyan-200 transition-colors">
                                                <Database className="w-5 h-5 text-cyan-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">Database Only</p>
                                                <p className="text-[11px] text-slate-500 font-medium">Hanya data MySQL (lebih cepat)</p>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        }>
            <Head title="Backup & Restore" />

            {/* Stats Cards */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${s.g} text-white`}>{s.icon}</div>
                        </div>
                        <p className={`${s.isText ? 'text-lg' : 'text-3xl'} font-black text-slate-900`}>{s.value}</p>
                    </div>
                ))}
            </motion.div>

            {/* Warning Box */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="mb-6">
                <div className="flex items-start gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 shadow-sm">
                    <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                        <h4 className="text-sm font-black mb-1">Perhatian Penting</h4>
                        <p className="text-xs font-semibold leading-relaxed">
                            <b>Restore Database</b> akan menimpa seluruh data sistem saat ini. Pastikan Anda memilih arsip yang benar.
                            Untuk memulihkan <b>Source Code / File Aplikasi</b>, silakan unduh file <code className="bg-amber-100 px-1 rounded">.zip</code> dan ekstrak secara manual ke direktori server.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.15}} className="pb-8">
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-8">
                        <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <FileArchive className="w-5 h-5 text-indigo-500" /> Daftar Arsip Cadangan
                        </CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Riwayat pencadangan data sistem ({appName})
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-b-slate-100">
                                        <TableHead className="font-black text-slate-900 px-6 lg:px-8 py-5">Nama File</TableHead>
                                        <TableHead className="font-black text-slate-900">Tanggal Backup</TableHead>
                                        <TableHead className="font-black text-slate-900">Ukuran</TableHead>
                                        <TableHead className="font-black text-slate-900 text-right px-6 lg:px-8">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {backups.length > 0 ? backups.map((backup) => (
                                            <motion.tr key={backup.path} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="group hover:bg-slate-50/50 transition-colors border-b-slate-50">
                                                <TableCell className="px-6 lg:px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                                            <FileArchive className="w-5 h-5 text-indigo-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{backup.name}</p>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zip Archive</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-slate-700 text-sm">{backup.date}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                                        {backup.size}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 lg:px-8 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Button onClick={() => handleDownload(backup.path)} size="sm" variant="ghost" className="h-8 rounded-xl text-sky-600 hover:bg-sky-50 font-bold">
                                                            <Download className="w-4 h-4 mr-1" /> Unduh
                                                        </Button>
                                                        <Button onClick={() => setConfirmRestore(backup.path)} size="sm" variant="ghost" className="h-8 rounded-xl text-amber-600 hover:bg-amber-50 font-bold">
                                                            <RotateCcw className="w-4 h-4 mr-1" /> Restore DB
                                                        </Button>
                                                        <Button onClick={() => setConfirmDelete(backup.path)} size="sm" variant="ghost" className="h-8 rounded-xl text-rose-500 hover:bg-rose-50 font-bold">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-16">
                                                    <div className="flex flex-col items-center text-slate-400">
                                                        <Database className="w-12 h-12 mb-4 text-slate-200" />
                                                        <p className="font-bold text-slate-500">Belum ada file backup</p>
                                                        <p className="text-sm font-medium text-slate-400 mt-1">Klik "Buat Backup Baru" untuk memulai.</p>
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
            </motion.div>

            {/* Restore Confirm Modal */}
            <Dialog open={!!confirmRestore} onOpenChange={(o) => !processing && setConfirmRestore(null)}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-none shadow-2xl p-6">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <DialogTitle className="text-xl font-black text-center text-slate-900">Restore Database?</DialogTitle>
                        <DialogDescription className="text-center text-slate-500 font-medium pt-2">
                            Apakah Anda yakin ingin memulihkan database dari <b className="text-slate-800">{confirmRestore?.split('/').pop()}</b>?
                            <br/><br/>
                            <span className="text-rose-500 font-bold">Peringatan: Seluruh data saat ini akan ditimpa secara permanen dan tidak dapat dibatalkan!</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 pt-6 w-full sm:justify-center">
                        <Button disabled={processing} variant="outline" onClick={() => setConfirmRestore(null)} className="rounded-xl font-bold w-full">Batal</Button>
                        <Button disabled={processing} onClick={() => handleRestore(confirmRestore)} className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white w-full">
                            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memulihkan...</> : 'Ya, Restore Sekarang'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <Dialog open={!!confirmDelete} onOpenChange={(o) => !processing && setConfirmDelete(null)}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-none shadow-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Hapus File Backup?</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium pt-2">
                            File backup ini akan dihapus permanen dari penyimpanan server.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 pt-4">
                        <Button disabled={processing} variant="outline" onClick={() => setConfirmDelete(null)} className="rounded-xl font-bold">Batal</Button>
                        <Button disabled={processing} onClick={() => handleDelete(confirmDelete)} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white">
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
