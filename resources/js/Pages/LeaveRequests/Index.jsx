import { useState, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CalendarDays, FileText, Upload, Trash2, Paperclip, Eye, AlertCircle, Pencil, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/Context/LanguageContext';

const TYPE_CFG = {
    cuti: { label: 'Cuti', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    izin_pribadi: { label: 'Izin Pribadi', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    izin_dinas_luar: { label: 'Izin Dinas Luar', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
    izin_pulang_cepat: { label: 'Izin Pulang Cepat', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
    sakit: { label: 'Sakit', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
};
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function Index({ leaveRequests, hasEmployee, isGuru }) {
    const { t } = useLanguage();
    const user = usePage().props.auth.user;
    const now = new Date();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const fileInputRef = useRef(null);
    // Filter state
    const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
    const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
    // Form state
    const [formData, setFormData] = useState({ start_date: '', end_date: '', type: 'cuti', duration_type: 'full_day', start_time: '', end_time: '', reason: '', attachment: null, remove_attachment: false });
    const [fileName, setFileName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const supportsDurationChoice = (type) => {
        if (type === 'izin_dinas_luar') return true;
        if (isGuru && ['izin_pribadi', 'izin_pulang_cepat', 'sakit'].includes(type)) return true;
        return false;
    };

    const years = useMemo(() => {
        const s = new Set(); leaveRequests.forEach(l => s.add(new Date(l.start_date).getFullYear())); s.add(now.getFullYear());
        return Array.from(s).sort((a,b) => b - a);
    }, [leaveRequests]);

    const filtered = useMemo(() => {
        return leaveRequests.filter(l => {
            const d = new Date(l.start_date);
            if (filterMonth !== 'all' && (d.getMonth() + 1) !== parseInt(filterMonth)) return false;
            if (filterYear !== 'all' && d.getFullYear() !== parseInt(filterYear)) return false;
            return true;
        });
    }, [leaveRequests, filterMonth, filterYear]);

    const resetForm = () => { setFormData({ start_date: '', end_date: '', type: 'cuti', duration_type: 'full_day', start_time: '', end_time: '', reason: '', attachment: null, remove_attachment: false }); setFileName(''); setErrors({}); };
    const openCreate = () => { resetForm(); setEditingId(null); setIsFormOpen(true); };
    const openEdit = (lr) => { setFormData({ start_date: lr.start_date, end_date: lr.end_date, type: lr.type, duration_type: lr.duration_type || 'full_day', start_time: lr.start_time ? lr.start_time.substring(0, 5) : '', end_time: lr.end_time ? lr.end_time.substring(0, 5) : '', reason: lr.reason || '', attachment: null, remove_attachment: false }); setFileName(lr.attachment_name || ''); setErrors({}); setEditingId(lr.id); setIsFormOpen(true); };

    const handleDurationTypeChange = (val) => {
        if (val === 'partial') {
            setFormData(prev => ({
                ...prev,
                duration_type: val,
                end_date: prev.start_date,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                duration_type: val,
            }));
        }
    };

    const handleStartDateChange = (val) => {
        if (formData.duration_type === 'partial') {
            setFormData(prev => ({ ...prev, start_date: val, end_date: val }));
        } else {
            setFormData(prev => ({ ...prev, start_date: val }));
        }
    };

    const submitForm = (e) => {
        e.preventDefault(); setProcessing(true);
        const fd = new FormData();
        fd.append('start_date', formData.start_date); fd.append('end_date', formData.end_date);
        fd.append('type', formData.type);
        const supportsDuration = supportsDurationChoice(formData.type);
        fd.append('duration_type', supportsDuration ? formData.duration_type : 'full_day');
        if (supportsDuration && formData.duration_type === 'partial') {
            fd.append('start_time', formData.start_time);
            fd.append('end_time', formData.end_time);
        }
        fd.append('reason', formData.reason);
        if (formData.attachment) fd.append('attachment', formData.attachment);
        if (formData.remove_attachment) fd.append('remove_attachment', '1');
        if (editingId) fd.append('_method', 'PUT');
        const url = editingId ? route('leave-requests.update', editingId) : route('leave-requests.store');
        router.post(url, fd, { forceFormData: true, onSuccess: () => { resetForm(); setIsFormOpen(false); setEditingId(null); setProcessing(false); }, onError: (errs) => { setErrors(errs); setProcessing(false); } });
    };

    const handleFileChange = (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 2*1024*1024) { alert('Maks 2 MB'); e.target.value=''; return; } setFormData({...formData, attachment: f, remove_attachment: false}); setFileName(f.name); };
    const removeFile = () => { setFormData({...formData, attachment: null, remove_attachment: true}); setFileName(''); if(fileInputRef.current) fileInputRef.current.value=''; };
    const handleDelete = (id) => router.delete(route('leave-requests.destroy', id), { onSuccess: () => setConfirmDelete(null) });
    const fmt = (ds) => new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'short', year:'numeric' }).format(new Date(ds));
    const ti = (t) => TYPE_CFG[t] || TYPE_CFG.cuti;
    const isImg = (p) => p && /\.(jpg|jpeg|png)$/i.test(p);

    const summaries = [
        { label:'Total', count: filtered.length, g:'from-slate-600 to-slate-800' },
        { label:'Menunggu', count: filtered.filter(l=>l.status==='pending').length, g:'from-amber-500 to-orange-500' },
        { label:'Disetujui', count: filtered.filter(l=>l.status==='approved').length, g:'from-emerald-500 to-teal-500' },
        { label:'Ditolak', count: filtered.filter(l=>l.status==='rejected').length, g:'from-rose-500 to-pink-500' },
    ];

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-2"><span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm"><CalendarDays className="w-3 h-3 mr-1.5" /> Pengajuan</span></div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pengajuan <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Cuti & Izin</span></h2>
                </div>
                {hasEmployee && <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-0.5"><Plus className="w-5 h-5 mr-2" /> Ajukan Baru</Button>}
            </div>
        }>
            <Head title="Pengajuan Cuti & Izin" />

            {!hasEmployee && <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-6"><div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800"><AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm font-bold">Akun Anda belum terhubung dengan data pegawai.</p></div></motion.div>}

            {/* Filter Bar */}
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

            {/* Summary */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {summaries.map((s,i) => <div key={i} className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p><p className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.g}`}>{s.count}</p></div>)}
            </motion.div>

            {/* Table */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.1}} className="pb-8">
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-8">
                        <CardTitle className="text-xl font-black text-slate-900">Riwayat Pengajuan Anda</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Kelola pengajuan cuti dan izin Anda</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0"><div className="overflow-x-auto"><Table>
                        <TableHeader className="bg-slate-50/50"><TableRow className="hover:bg-transparent border-b-slate-100">
                            <TableHead className="font-black text-slate-900 px-6 lg:px-8 py-5">Jenis</TableHead>
                            <TableHead className="font-black text-slate-900">Periode</TableHead>
                            <TableHead className="font-black text-slate-900">Keterangan</TableHead>
                            <TableHead className="font-black text-slate-900 text-center">Lampiran</TableHead>
                            <TableHead className="font-black text-slate-900 text-center">Status</TableHead>
                            <TableHead className="font-black text-slate-900 text-right px-6 lg:px-8">Aksi</TableHead>
                        </TableRow></TableHeader>
                        <TableBody><AnimatePresence>
                            {filtered.map((lr) => { const t = ti(lr.type); return (
                                <motion.tr key={lr.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="group hover:bg-slate-50/50 transition-colors border-b-slate-50">
                                    <TableCell className="px-6 lg:px-8 py-4"><span className={`font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider ${t.bg} ${t.text} border ${t.border}`}>{t.label}</span></TableCell>
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
                                    <TableCell className="px-6 lg:px-8 text-right">{lr.status==='pending' ? (
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button onClick={()=>openEdit(lr)} size="sm" variant="ghost" className="h-8 rounded-xl text-indigo-500 hover:bg-indigo-50 font-bold"><Pencil className="w-4 h-4 mr-1" />Edit</Button>
                                            <Button onClick={()=>setConfirmDelete(lr.id)} size="sm" variant="ghost" className="h-8 rounded-xl text-rose-500 hover:bg-rose-50 font-bold"><Trash2 className="w-4 h-4 mr-1" />Hapus</Button>
                                        </div>
                                    ) : <span className="text-xs font-bold text-slate-400">{lr.status==='approved'?'Disetujui':'Ditolak'}</span>}</TableCell>
                                </motion.tr>
                            ); })}
                            {filtered.length===0 && <TableRow><TableCell colSpan={6} className="text-center py-16"><div className="flex flex-col items-center text-slate-400"><CalendarDays className="w-12 h-12 mb-4 text-slate-200" /><p className="font-bold text-slate-500">Belum ada pengajuan</p></div></TableCell></TableRow>}
                        </AnimatePresence></TableBody>
                    </Table></div></CardContent>
                </Card>
            </motion.div>

            {/* Form Modal - scrollable */}
            <Dialog open={isFormOpen} onOpenChange={(o)=>{if(!o){setIsFormOpen(false);setEditingId(null);}}}>
                <DialogContent className="sm:max-w-[540px] rounded-[2rem] p-0 overflow-hidden border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)] max-h-[92vh] flex flex-col" showCloseButton={false}>
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 px-6 py-5 sm:px-8 sm:py-6 text-white relative overflow-hidden shrink-0">
                        <div className="absolute -right-10 -bottom-10 opacity-20"><CalendarDays className="w-40 h-40" /></div>
                        <button onClick={()=>{setIsFormOpen(false);setEditingId(null);}} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors z-10"><X className="w-4 h-4" /></button>
                        <DialogTitle className="text-xl sm:text-2xl font-black relative z-10">{editingId ? 'Edit Pengajuan' : 'Formulir Pengajuan'}</DialogTitle>
                        <DialogDescription className="text-purple-100 font-medium mt-1 text-sm relative z-10">Lampiran bersifat opsional (JPG, PNG, PDF maks. 2MB)</DialogDescription>
                    </div>
                    <form onSubmit={submitForm} className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50 space-y-4 overflow-y-auto flex-1" encType="multipart/form-data">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-slate-700 text-sm">Tanggal Mulai</Label>
                                <Input 
                                    type="date" 
                                    value={formData.start_date} 
                                    onChange={e => handleStartDateChange(e.target.value)} 
                                    required 
                                    className="rounded-xl border-slate-200 focus-visible:ring-purple-500 h-10 font-semibold text-slate-700" 
                                />
                                {errors.start_date && <p className="text-rose-500 text-xs font-bold">{errors.start_date}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold text-slate-700 text-sm">Tanggal Selesai</Label>
                                <Input 
                                    type="date" 
                                    value={formData.end_date} 
                                    onChange={e => setFormData({...formData, end_date: e.target.value})} 
                                    required 
                                    disabled={formData.duration_type === 'partial'}
                                    className="rounded-xl border-slate-200 focus-visible:ring-purple-500 h-10 font-semibold text-slate-700 disabled:bg-slate-100/80 disabled:text-slate-400" 
                                />
                                {errors.end_date && <p className="text-rose-500 text-xs font-bold">{errors.end_date}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold text-slate-700 text-sm">Jenis Pengajuan</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={v => {
                                    const supports = supportsDurationChoice(v);
                                    setFormData(prev => ({
                                        ...prev,
                                        type: v,
                                        duration_type: supports ? prev.duration_type : 'full_day'
                                    }));
                                }}
                            >
                                <SelectTrigger className="rounded-xl border-slate-200 h-10 font-semibold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl">
                                    <SelectItem value="cuti" className="font-semibold">Cuti</SelectItem>
                                    <SelectItem value="izin_pribadi" className="font-semibold">Izin Pribadi</SelectItem>
                                    <SelectItem value="izin_dinas_luar" className="font-semibold">Izin Dinas Luar</SelectItem>
                                    <SelectItem value="izin_pulang_cepat" className="font-semibold">Izin Pulang Cepat</SelectItem>
                                    <SelectItem value="sakit" className="font-semibold">Sakit</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-rose-500 text-xs font-bold">{errors.type}</p>}
                        </div>

                        {/* Pilihan Durasi (Dinas Luar, atau Izin Pribadi/Pulang Cepat/Sakit khusus Guru) */}
                        {supportsDurationChoice(formData.type) && (
                            <div className="space-y-3 p-3.5 bg-white border border-slate-100 rounded-xl">
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-slate-700 text-sm">Durasi Pengajuan</Label>
                                    <Select 
                                        value={formData.duration_type} 
                                        onValueChange={handleDurationTypeChange}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200 h-10 font-semibold bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-xl">
                                            <SelectItem value="full_day" className="font-semibold">Satu Hari Penuh</SelectItem>
                                            <SelectItem value="partial" className="font-semibold">Rentang Jam</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.duration_type === 'partial' && (
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="space-y-1.5">
                                            <Label className="font-bold text-slate-700 text-sm">Jam Mulai</Label>
                                            <Input 
                                                type="time" 
                                                value={formData.start_time} 
                                                onChange={e => setFormData({...formData, start_time: e.target.value})} 
                                                required 
                                                className="rounded-xl border-slate-200 focus-visible:ring-purple-500 h-10 font-semibold text-slate-700" 
                                            />
                                            {errors.start_time && <p className="text-rose-500 text-xs font-bold">{errors.start_time}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-bold text-slate-700 text-sm">Jam Selesai</Label>
                                            <Input 
                                                type="time" 
                                                value={formData.end_time} 
                                                onChange={e => setFormData({...formData, end_time: e.target.value})} 
                                                required 
                                                className="rounded-xl border-slate-200 focus-visible:ring-purple-500 h-10 font-semibold text-slate-700" 
                                            />
                                            {errors.end_time && <p className="text-rose-500 text-xs font-bold">{errors.end_time}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-1.5"><Label className="font-bold text-slate-700 text-sm">Keterangan</Label><Textarea value={formData.reason} onChange={e=>setFormData({...formData,reason:e.target.value})} required placeholder="Jelaskan alasan pengajuan..." className="rounded-xl border-slate-200 focus-visible:ring-purple-500 min-h-[80px] font-medium resize-none" />{errors.reason && <p className="text-rose-500 text-xs font-bold">{errors.reason}</p>}</div>
                        <div className="space-y-1.5"><Label className="font-bold text-slate-700 text-sm">Lampiran <span className="text-slate-400 font-medium">(Opsional)</span></Label>
                            {!fileName ? <div onClick={()=>fileInputRef.current?.click()} className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-4 cursor-pointer transition-colors bg-white/60 hover:bg-purple-50/30 group"><Upload className="w-6 h-6 text-slate-300 group-hover:text-purple-400 mb-1 transition-colors" /><p className="text-xs font-bold text-slate-500 group-hover:text-purple-600">Klik untuk upload</p></div>
                            : <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5"><div className="flex items-center space-x-2 min-w-0"><div className="p-1.5 bg-purple-50 rounded-lg shrink-0"><Paperclip className="w-3.5 h-3.5 text-purple-500" /></div><span className="text-xs font-bold text-slate-700 truncate">{fileName}</span></div><button type="button" onClick={removeFile} className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button></div>}
                            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />{errors.attachment && <p className="text-rose-500 text-xs font-bold">{errors.attachment}</p>}
                        </div>
                        <div className="flex justify-end space-x-3 pt-3 pb-1 sticky bottom-0 bg-slate-50">
                            <Button type="button" variant="outline" onClick={()=>{setIsFormOpen(false);setEditingId(null);}} className="rounded-xl font-bold h-10 px-5 border-slate-200 text-slate-600">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200">{processing?'Menyimpan...':editingId?'Simpan':'Kirim Pengajuan'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!confirmDelete} onOpenChange={()=>setConfirmDelete(null)}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-none shadow-2xl p-6">
                    <DialogHeader><DialogTitle className="text-xl font-black text-slate-900">Hapus Pengajuan?</DialogTitle><DialogDescription className="text-slate-500 font-medium">Pengajuan akan dihapus permanen.</DialogDescription></DialogHeader>
                    <DialogFooter className="flex gap-3 pt-4 -mx-0 -mb-0 p-0 border-0 bg-transparent"><Button variant="outline" onClick={()=>setConfirmDelete(null)} className="rounded-xl font-bold">Kembali</Button><Button onClick={()=>handleDelete(confirmDelete)} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white">Ya, Hapus</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Attachment Preview */}
            <Dialog open={!!previewAttachment} onOpenChange={()=>setPreviewAttachment(null)}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0"><DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2"><Paperclip className="w-5 h-5 text-indigo-500" /> Lampiran</DialogTitle><DialogDescription className="text-sm text-slate-500">{previewAttachment?.attachment_name}</DialogDescription></DialogHeader>
                    <div className="p-6">{previewAttachment && isImg(previewAttachment.attachment_path) ? <img src={previewAttachment.attachment_url} alt="Lampiran" className="w-full rounded-2xl border border-slate-100" /> : previewAttachment?.attachment_path?.endsWith('.pdf') ? <div className="flex flex-col items-center gap-4 py-8"><FileText className="w-16 h-16 text-rose-400" /><a href={previewAttachment.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700"><Eye className="w-4 h-4" />Buka PDF</a></div> : null}</div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
