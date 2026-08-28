import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DatabaseBackup, Download, Trash2, RotateCcw, AlertTriangle, ShieldCheck, Database, FileArchive, HardDrive, FolderArchive, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Backup({ backups, appName, totalSize, totalCount }) {
    const [processing, setProcessing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmRestore, setConfirmRestore] = useState(null);
    const [backupMenuOpen, setBackupMenuOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    const handleBackup = (type) => {
        setProcessing(true);
        setBackupMenuOpen(false);
        router.post(route('backups.create'), { type }, {
            onFinish: () => setProcessing(false)
        });
    };

    const handleDownload = (path) => {
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

    const handleUploadRestore = (e) => {
        e.preventDefault();
        if (!uploadFile) return;
        setProcessing(true);
        const formData = new FormData();
        formData.append('file', uploadFile);
        router.post(route('backups.upload-restore'), formData, {
            onFinish: () => {
                setProcessing(false);
                setUploadModalOpen(false);
                setUploadFile(null);
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
                        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                            <ShieldCheck className="w-3 h-3 mr-1.5" /> Keamanan Sistem
                        </span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Backup & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">Restore</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setUploadModalOpen(true)}
                        disabled={processing}
                        variant="outline"
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <Upload className="w-4 h-4 mr-2 text-indigo-500" />
                        Unggah & Restore
                    </Button>
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
                                        className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pilih Jenis Backup</p>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => handleBackup('full')}
                                                className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900 transition-colors">
                                                    <FileArchive className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Full Backup</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Database + Seluruh File Storage</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleBackup('db-only')}
                                                className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left group mt-1"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center shrink-0 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900 transition-colors">
                                                    <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Database Only</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hanya Struktur & Data MySQL</p>
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        }>
            <Head title="Backup & Restore System" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-5"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.g} flex items-center justify-center text-white shadow-lg shrink-0`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className={`font-black text-slate-900 dark:text-white ${stat.isText ? 'text-lg' : 'text-3xl'}`}>{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 lg:px-8">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-between">
                            <span>Daftar Arsip Cadangan (Backup)</span>
                        </CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                            Kelola, unduh, atau pulihkan database dari berkas cadangan di server
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/60">
                                    <TableRow className="hover:bg-transparent border-b-slate-100 dark:border-b-slate-800">
                                        <TableHead className="font-black text-slate-900 dark:text-slate-200 px-6 lg:px-8 py-5">Nama Berkas</TableHead>
                                        <TableHead className="font-black text-slate-900 dark:text-slate-200">Ukuran</TableHead>
                                        <TableHead className="font-black text-slate-900 dark:text-slate-200">Waktu Dibuat</TableHead>
                                        <TableHead className="font-black text-slate-900 dark:text-slate-200 text-right px-6 lg:px-8">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {backups.length > 0 ? backups.map((backup, index) => (
                                            <motion.tr
                                                key={backup.path}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors border-b-slate-50 dark:border-b-slate-800/50"
                                            >
                                                <TableCell className="px-6 lg:px-8 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold shrink-0">
                                                            <FileArchive className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">{backup.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-mono">
                                                        {backup.size}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                        {backup.date}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 lg:px-8 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Button onClick={() => handleDownload(backup.path)} size="sm" variant="ghost" className="h-8 rounded-xl text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 font-bold">
                                                            <Download className="w-4 h-4 mr-1" /> Unduh
                                                        </Button>
                                                        <Button onClick={() => setConfirmRestore(backup.path)} size="sm" variant="ghost" className="h-8 rounded-xl text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold">
                                                            <RotateCcw className="w-4 h-4 mr-1" /> Restore DB
                                                        </Button>
                                                        <Button onClick={() => setConfirmDelete(backup.path)} size="sm" variant="ghost" className="h-8 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-16">
                                                    <div className="flex flex-col items-center text-slate-400">
                                                        <Database className="w-12 h-12 mb-4 text-slate-200 dark:text-slate-800" />
                                                        <p className="font-bold text-slate-500 dark:text-slate-400">Belum ada file backup</p>
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

            <Dialog open={!!confirmRestore} onOpenChange={(o) => !processing && setConfirmRestore(null)}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-950/50 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <DialogTitle className="text-xl font-black text-center text-slate-900 dark:text-white">Restore Database?</DialogTitle>
                        <DialogDescription className="text-center text-slate-500 dark:text-slate-400 font-medium pt-2">
                            Apakah Anda yakin ingin memulihkan database dari <b className="text-slate-800 dark:text-slate-200">{confirmRestore?.split('/').pop()}</b>?
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

            <Dialog open={!!confirmDelete} onOpenChange={(o) => !processing && setConfirmDelete(null)}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Hapus File Backup?</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium pt-2">
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

            <Dialog open={uploadModalOpen} onOpenChange={(o) => !processing && setUploadModalOpen(false)}>
                <DialogContent className="sm:max-w-[480px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900">
                    <form onSubmit={handleUploadRestore}>
                        <DialogHeader>
                            <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mb-3">
                                <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <DialogTitle className="text-xl font-black text-center text-slate-900 dark:text-white">Unggah & Restore Database</DialogTitle>
                            <DialogDescription className="text-center text-slate-500 dark:text-slate-400 font-medium pt-1">
                                Pilih berkas cadangan (`.sql` atau `.zip`) dari komputer Anda untuk memulihkan database.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors">
                                <input
                                    type="file"
                                    id="backup-file-upload"
                                    accept=".sql,.zip"
                                    onChange={(e) => setUploadFile(e.target.files[0] || null)}
                                    className="hidden"
                                />
                                <label htmlFor="backup-file-upload" className="cursor-pointer flex flex-col items-center">
                                    <FolderArchive className="w-10 h-10 text-indigo-500 mb-2" />
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {uploadFile ? uploadFile.name : 'Klik untuk memilih berkas (.sql / .zip)'}
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1">Maksimal ukuran berkas 100 MB</span>
                                </label>
                            </div>
                            <p className="text-[11px] text-rose-500 font-semibold mt-3 text-center">
                                ⚠️ Peringatan: Proses ini akan menimpa basis data saat ini dengan isi dari berkas yang diunggah.
                            </p>
                        </div>
                        <DialogFooter className="flex gap-3">
                            <Button type="button" disabled={processing} variant="outline" onClick={() => setUploadModalOpen(false)} className="rounded-xl font-bold w-full">Batal</Button>
                            <Button type="submit" disabled={processing || !uploadFile} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                                {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : 'Unggah & Restore'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
