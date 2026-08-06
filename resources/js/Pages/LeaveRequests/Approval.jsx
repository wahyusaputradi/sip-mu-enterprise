import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, CalendarDays, Clock, FileText, Paperclip, Eye, ClipboardCheck, Filter, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CFG = {
    cuti: { label: 'Cuti', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    izin_pribadi: { label: 'Izin Pribadi', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    izin_dinas_luar: { label: 'Izin Dinas Luar', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
    izin_pulang_cepat: { label: 'Izin Pulang Cepat', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
    sakit: { label: 'Sakit', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
};
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function Approval({ leaveRequests }) {
    const now = new Date();
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
    const [filterYear, setFilterYear] = useState(String(now.getFullYear()));

    const itemsPerPage = 50;
    const [currentPage, setCurrentPage] = useState(1);

    const handleApprove = (id) => router.post(route('leave-requests.approve', id));
    const handleReject = (id) => router.post(route('leave-requests.reject', id));
    const handleDeleteAdmin = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus berkas pengajuan ini secara permanen?')) {
            router.delete(route('leave-requests.destroy-admin', id));
        }
    };
    const fmt = (ds) => new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'short', year:'numeric' }).format(new Date(ds));
    const ti = (t) => TYPE_CFG[t] || TYPE_CFG.cuti;
    const isImg = (p) => p && /\.(jpg|jpeg|png)$/i.test(p);

    const years = useMemo(() => {
        const s = new Set(); leaveRequests.forEach(l => s.add(new Date(l.start_date).getFullYear())); s.add(now.getFullYear());
        return Array.from(s).sort((a,b) => b - a);
    }, [leaveRequests]);

    const filtered = useMemo(() => {
        return leaveRequests.filter(l => {
            const d = new Date(l.start_date);
            if (filterMonth !== 'all' && (d.getMonth() + 1) !== parseInt(filterMonth)) return false;
            if (filterYear !== 'all' && d.getFullYear() !== parseInt(filterYear)) return false;
            if (statusFilter !== 'all' && l.status !== statusFilter) return false;
            return true;
        });
    }, [leaveRequests, filterMonth, filterYear, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterMonth, filterYear, statusFilter]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const counts = { all: filtered.length, pending: filtered.filter(l=>l.status==='pending').length, approved: filtered.filter(l=>l.status==='approved').length, rejected: filtered.filter(l=>l.status==='rejected').length };
    const filterBtns = [
        { key:'all', label:'Semua', g:'from-slate-600 to-slate-800' },
        { key:'pending', label:'Menunggu', g:'from-amber-500 to-orange-500' },
        { key:'approved', label:'Disetujui', g:'from-emerald-500 to-teal-500' },
        { key:'rejected', label:'Ditolak', g:'from-rose-500 to-pink-500' },
    ];

    return (
        <AuthenticatedLayout header={
            <div><div className="flex items-center space-x-2 mb-2"><span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm"><ClipboardCheck className="w-3 h-3 mr-1.5" /> Persetujuan</span></div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Persetujuan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Cuti & Izin</span></h2></div>
        }>
            <Head title="Persetujuan Cuti & Izin" />

            {/* Date Filter */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.3}} className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-sm">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Filter</span>
                </div>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-[150px] rounded-xl border-slate-200 h-10 font-semibold bg-white/80 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl">
                        <SelectItem value="all" className="font-semibold">Semua Bulan</SelectItem>
                        {MONTHS.map((m,i) => <SelectItem key={i} value={String(i+1)} className="font-semibold">{m}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[120px] rounded-xl border-slate-200 h-10 font-semibold bg-white/80 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl">
                        <SelectItem value="all" className="font-semibold">Semua Tahun</SelectItem>
                        {years.map(y => <SelectItem key={y} value={String(y)} className="font-semibold">{y}</SelectItem>)}
                    </SelectContent>
                </Select>
                {(filterMonth !== String(now.getMonth()+1) || filterYear !== String(now.getFullYear())) && (
                    <button onClick={() => { setFilterMonth(String(now.getMonth()+1)); setFilterYear(String(now.getFullYear())); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2">Reset</button>
                )}
            </motion.div>

            {/* Status Cards */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {filterBtns.map((fb) => (
                    <button key={fb.key} onClick={()=>setStatusFilter(fb.key)}
                        className={`bg-white/80 backdrop-blur-xl border rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-left transition-all hover:-translate-y-0.5 ${statusFilter===fb.key?'border-indigo-300 ring-2 ring-indigo-100':'border-white hover:border-slate-200'}`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{fb.label}</p>
                        <p className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${fb.g}`}>{counts[fb.key]}</p>
                    </button>
                ))}
            </motion.div>

            {/* Table */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.1}} className="pb-8">
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-8">
                        <CardTitle className="text-xl font-black text-slate-900 flex items-center justify-between"><span>Daftar Pengajuan Pegawai</span><span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 flex items-center"><Clock className="w-3 h-3 mr-1" />Reviewer Mode</span></CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Tinjau dan setujui permohonan cuti/izin pegawai</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0"><div className="overflow-x-auto"><Table>
                        <TableHeader className="bg-slate-50/50"><TableRow className="hover:bg-transparent border-b-slate-100">
                            <TableHead className="font-black text-slate-900 px-6 lg:px-8 py-5">Pegawai</TableHead>
                            <TableHead className="font-black text-slate-900">Jenis</TableHead>
                            <TableHead className="font-black text-slate-900">Periode</TableHead>
                            <TableHead className="font-black text-slate-900">Keterangan</TableHead>
                            <TableHead className="font-black text-slate-900 text-center">Lampiran</TableHead>
                            <TableHead className="font-black text-slate-900 text-center">Status</TableHead>
                            <TableHead className="font-black text-slate-900 text-right px-6 lg:px-8">Aksi</TableHead>
                        </TableRow></TableHeader>
                        <TableBody><AnimatePresence>
                            {paginated.map((lr) => { const t = ti(lr.type); return (
                                <motion.tr key={lr.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="group hover:bg-slate-50/50 transition-colors border-b-slate-50">
                                    <TableCell className="px-6 lg:px-8 py-4"><div className="flex items-center space-x-3"><div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm">{lr.employee?.name?.charAt(0)||'?'}</div><span className="font-bold text-slate-900 text-sm">{lr.employee?.name||'-'}</span></div></TableCell>
                                    <TableCell><span className={`font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider ${t.bg} ${t.text} border ${t.border}`}>{t.label}</span></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{fmt(lr.start_date)}</span>
                                            {lr.duration_type === 'partial' ? (
                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/30 w-max mt-1">
                                                    ⏱️ {lr.start_time?.substring(0, 5)} - {lr.end_time?.substring(0, 5)}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-500">s/d {fmt(lr.end_date)}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px]"><div className="flex items-start space-x-2"><FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /><p className="text-sm font-medium text-slate-600 line-clamp-2">{lr.reason}</p></div></TableCell>
                                    <TableCell className="text-center">{lr.attachment_path ? <button onClick={()=>setPreviewAttachment(lr)} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-100 transition-colors"><Paperclip className="w-3 h-3" />Lihat</button> : <span className="text-xs text-slate-400">—</span>}</TableCell>
                                    <TableCell className="text-center"><div className="flex justify-center">
                                        {lr.status==='approved' && <span className="flex items-center text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-max border border-emerald-100/50 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>Disetujui</span>}
                                        {lr.status==='rejected' && <span className="flex items-center text-[11px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full w-max border border-rose-100/50 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>Ditolak</span>}
                                        {lr.status==='pending' && <span className="flex items-center text-[11px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-max border border-amber-100/50 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>Menunggu</span>}
                                    </div></TableCell>
                                    <TableCell className="px-6 lg:px-8 text-right">
                                        {lr.status==='pending' ? (
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button onClick={()=>handleApprove(lr.id)} size="sm" className="h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-none shadow-none font-bold"><Check className="w-4 h-4 mr-1" />Setuju</Button>
                                                <Button onClick={()=>handleReject(lr.id)} size="sm" className="h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-none shadow-none font-bold"><X className="w-4 h-4 mr-1" />Tolak</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end space-x-2">
                                                <span className="text-[11px] font-bold text-slate-400 mr-1 hidden xl:inline">
                                                    {lr.approver ? `oleh ${lr.approver.name}` : ''}
                                                </span>
                                                {lr.status === 'approved' ? (
                                                    <Button onClick={()=>handleReject(lr.id)} size="sm" variant="outline" className="h-7 px-2.5 rounded-xl bg-rose-50/80 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white font-bold text-[11px] transition-all" title="Batalkan Persetujuan & Ubah ke Ditolak">
                                                        <X className="w-3.5 h-3.5 mr-1" /> Batalkan
                                                    </Button>
                                                ) : (
                                                    <Button onClick={()=>handleApprove(lr.id)} size="sm" variant="outline" className="h-7 px-2.5 rounded-xl bg-emerald-50/80 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition-all" title="Setujui Kembali">
                                                        <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                                                    </Button>
                                                )}
                                                <Button onClick={()=>handleDeleteAdmin(lr.id)} size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Hapus Pengajuan">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </motion.tr>
                            ); })}
                            {filtered.length===0 && <TableRow><TableCell colSpan={7} className="text-center py-16"><div className="flex flex-col items-center text-slate-400"><CalendarDays className="w-12 h-12 mb-4 text-slate-200" /><p className="font-bold text-slate-500">Tidak ada data pengajuan</p></div></TableCell></TableRow>}
                        </AnimatePresence></TableBody>
                    </Table></div></CardContent>
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

            {/* Attachment Preview */}
            <Dialog open={!!previewAttachment} onOpenChange={()=>setPreviewAttachment(null)}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0"><DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2"><Paperclip className="w-5 h-5 text-indigo-500" />Lampiran</DialogTitle><DialogDescription className="text-sm text-slate-500">{previewAttachment?.attachment_name}</DialogDescription></DialogHeader>
                    <div className="p-6">{previewAttachment && isImg(previewAttachment.attachment_path) ? <img src={previewAttachment.attachment_url} alt="Lampiran" className="w-full rounded-2xl border border-slate-100" /> : previewAttachment?.attachment_path?.endsWith('.pdf') ? <div className="flex flex-col items-center gap-4 py-8"><FileText className="w-16 h-16 text-rose-400" /><a href={previewAttachment.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700"><Eye className="w-4 h-4" />Buka PDF</a></div> : null}</div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
