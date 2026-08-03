import { useState, useMemo, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, XCircle, Sparkles, Clock, GraduationCap, School, Download, Upload, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const SUBJECT_COLORS = [
    'from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500',
    'from-purple-500 to-violet-500', 'from-rose-500 to-pink-500', 'from-cyan-500 to-sky-500',
    'from-lime-500 to-green-500', 'from-fuchsia-500 to-pink-500',
];
const hashColor = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length]; };

export default function Index({ teachers, schoolClasses, schedules, hourSlots, dayLabels, todaySchedules, monitorStats, todayDow }) {
    const user = usePage().props.auth.user;
    const roleMappings = {
        'Administrator (IT)': ['Super Admin', 'Kepala Sekolah'],
        'HRD / Bendahara': ['Bendahara', 'Absensi', 'Karyawan'],
        'Kurikulum / Admin': ['Kurikulum', 'Absensi'],
        'Guru / Karyawan Staf': ['Guru', 'Karyawan']
    };
    let baseRoles = user?.roles || [];
    let expandedRoles = [...baseRoles];
    baseRoles.forEach(role => {
        if (roleMappings[role]) {
            expandedRoles = [...expandedRoles, ...roleMappings[role]];
        }
    });
    const roles = [...new Set(expandedRoles)];
    const canManage = roles.some(r => ['Super Admin', 'Kurikulum'].includes(r));

    const [activeTab, setActiveTab] = useState('manage');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [slotContext, setSlotContext] = useState({ day: 1, hour: 1 });
    const fileInputRef = useRef(null);

    // Filter states for Monitor Tab
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterHour, setFilterHour] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        employee_id: '', school_class_id: '', day_of_week: 1, hour_number: 1, subject: '',
    });

    const teacherSchedules = useMemo(() => {
        if (!selectedTeacher) return [];
        return schedules.filter(s => s.employee_id == selectedTeacher);
    }, [selectedTeacher, schedules]);

    const filteredTodaySchedules = useMemo(() => {
        return todaySchedules.filter(ts => {
            if (filterStatus === 'hadir' && !ts.has_attended) return false;
            if (filterStatus === 'kosong' && ts.has_attended) return false;
            if (filterHour !== 'all' && ts.hour_number.toString() !== filterHour) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return ts.teacher_name.toLowerCase().includes(q) || 
                       ts.subject.toLowerCase().includes(q) || 
                       ts.class_name.toLowerCase().includes(q);
            }
            return true;
        });
    }, [todaySchedules, filterStatus, filterHour, searchQuery]);

    const getSlot = (day, hour) => teacherSchedules.find(s => s.day_of_week === day && s.hour_number === hour);

    const openAdd = (day, hour) => {
        if (!canManage) return;
        clearErrors(); reset();
        setSlotContext({ day, hour });
        setData({ employee_id: selectedTeacher, school_class_id: '', day_of_week: day, hour_number: hour, subject: '' });
        setEditingSlot(null); setIsFormOpen(true);
    };

    const openEdit = (slot) => {
        if (!canManage) return;
        clearErrors();
        setEditingSlot(slot);
        setData({ employee_id: slot.employee_id, school_class_id: slot.school_class_id || '', day_of_week: slot.day_of_week, hour_number: slot.hour_number, subject: slot.subject });
        const sc = schoolClasses.find(c => c.name === slot.class_name);
        if (sc) setData(prev => ({ ...prev, school_class_id: sc.id }));
        setIsFormOpen(true);
    };

    const openDelete = (slot) => { 
        if (!canManage) return;
        setEditingSlot(slot); setIsDeleteOpen(true); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canManage) return;
        if (editingSlot) {
            put(route('teaching-schedules.update', editingSlot.id), { onSuccess: () => { setIsFormOpen(false); reset(); } });
        } else {
            post(route('teaching-schedules.store'), { onSuccess: () => { setIsFormOpen(false); reset(); } });
        }
    };

    const handleDelete = () => {
        if (!canManage) return;
        destroy(route('teaching-schedules.destroy', editingSlot.id), { onSuccess: () => { setIsDeleteOpen(false); setEditingSlot(null); } });
    };

    const handleExport = () => {
        if (!selectedTeacher) return;
        window.location.href = route('teaching-schedules.export', { employee_id: selectedTeacher });
    };

    const handleImportClick = () => {
        if (!canManage || !selectedTeacher) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!canManage || !file || !selectedTeacher) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('employee_id', selectedTeacher);

        router.post(route('teaching-schedules.import'), formData, {
            onSuccess: () => {
                e.target.value = ''; // reset file input
            },
            onError: () => {
                e.target.value = ''; // reset file input on error too
            }
        });
    };

    const dayName = dayLabels[todayDow] || 'Hari Libur';
    const hours = Object.entries(hourSlots);
    const days = Object.entries(dayLabels);

    const tabs = [
        { id: 'manage', label: 'Kelola Jadwal', icon: <CalendarDays className="w-4 h-4" /> },
        { id: 'monitor', label: 'Monitor Hari Ini', icon: <AlertTriangle className="w-4 h-4" /> },
    ];

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm mb-2">
                        <CalendarDays className="w-3 h-3 mr-1.5" /> Academic Module
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Jadwal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Mengajar</span>
                    </h2>
                </div>
                <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>
            </div>
        }>
            <Head title="Jadwal Mengajar" />

            <div className="pb-10 space-y-6">
                {activeTab === 'manage' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Teacher Selector & Import/Export */}
                        <Card className="border border-white shadow-sm rounded-[1.5rem] bg-white/80 backdrop-blur-xl p-5 flex flex-col lg:flex-row justify-between gap-4 items-center">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-2/3">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-sm">Pilih Guru</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tampilkan jadwal mingguan guru</p>
                                    </div>
                                </div>
                                <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
                                    className="flex-1 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4">
                                    <option value="">— Pilih Guru —</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.position})</option>)}
                                </select>
                            </div>
                            
                            {selectedTeacher && (
                                <div className="flex gap-2 w-full lg:w-auto">
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                                    <Button onClick={handleExport} variant="outline" className="flex-1 lg:flex-none border-slate-200 hover:bg-slate-50 font-bold h-11 rounded-xl text-indigo-600">
                                        <Download className="w-4 h-4 mr-2" /> Export Template
                                    </Button>
                                    {canManage && (
                                        <Button onClick={handleImportClick} className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-700 font-bold h-11 rounded-xl shadow-lg shadow-indigo-200">
                                            <Upload className="w-4 h-4 mr-2" /> Import Excel
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Card>

                        {selectedTeacher && (
                            <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                                <CardHeader className="border-b border-slate-100 p-6">
                                    <CardTitle className="text-lg font-black text-slate-900">Grid Jadwal Mingguan</CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {canManage ? 'Klik sel kosong untuk menambah jadwal • Klik jadwal untuk edit/hapus' : 'Tampilan Jadwal Mengajar Guru (Read-Only)'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[900px]">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                                    <th className="py-3 px-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest w-24">Hari</th>
                                                    {hours.map(([h, slot]) => (
                                                        <th key={h} className="py-3 px-1 text-center">
                                                            <div className="text-[10px] font-black text-indigo-600 uppercase">Jam {h}</div>
                                                            <div className="text-[9px] font-bold text-slate-400">{slot.start}-{slot.end}</div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {days.map(([d, dayName]) => (
                                                    <tr key={d} className="border-b border-slate-50 hover:bg-slate-50/30">
                                                        <td className="py-2 px-3">
                                                            <span className="font-black text-slate-700 text-sm">{dayName}</span>
                                                        </td>
                                                        {hours.map(([h]) => {
                                                            const slot = getSlot(parseInt(d), parseInt(h));
                                                            return (
                                                                <td key={h} className="py-1.5 px-1">
                                                                    {slot ? (
                                                                        canManage ? (
                                                                            <button onClick={() => openEdit(slot)} className="w-full group">
                                                                                <div className={`bg-gradient-to-br ${hashColor(slot.subject)} text-white rounded-xl p-2 text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer min-h-[52px] flex flex-col items-center justify-center relative overflow-hidden`}>
                                                                                    <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider line-clamp-1">{slot.subject}</div>
                                                                                    <div className="text-[11px] font-black line-clamp-1">{slot.class_name}</div>
                                                                                    
                                                                                    {/* Hover Overlay Delete */}
                                                                                    <div onClick={(e) => { e.stopPropagation(); openDelete(slot); }} 
                                                                                         className="absolute inset-0 bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                                                        <Trash2 className="w-4 h-4 text-white" />
                                                                                    </div>
                                                                                </div>
                                                                            </button>
                                                                        ) : (
                                                                            <div className={`bg-gradient-to-br ${hashColor(slot.subject)} text-white rounded-xl p-2 text-center shadow-md min-h-[52px] flex flex-col items-center justify-center relative overflow-hidden`}>
                                                                                <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider line-clamp-1">{slot.subject}</div>
                                                                                <div className="text-[11px] font-black line-clamp-1">{slot.class_name}</div>
                                                                            </div>
                                                                        )
                                                                    ) : (
                                                                        canManage ? (
                                                                            <button onClick={() => openAdd(parseInt(d), parseInt(h))} className="w-full min-h-[52px] border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-center group">
                                                                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                                            </button>
                                                                        ) : (
                                                                            <div className="w-full min-h-[52px] border border-slate-100/80 rounded-xl bg-slate-50/40 flex items-center justify-center">
                                                                                <span className="text-[10px] font-bold text-slate-300">-</span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}

                {activeTab === 'monitor' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Kelas', value: monitorStats.total, gradient: 'from-blue-500 to-indigo-600', icon: <School className="w-20 h-20" /> },
                                { label: 'Kelas Terisi', value: monitorStats.filled, gradient: 'from-emerald-500 to-teal-600', icon: <CheckCircle2 className="w-20 h-20" /> },
                                { label: 'Kelas Kosong', value: monitorStats.empty, gradient: 'from-rose-500 to-pink-600', icon: <XCircle className="w-20 h-20" /> },
                            ].map((c, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <Card className={`bg-gradient-to-br ${c.gradient} text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative hover:shadow-xl hover:-translate-y-0.5 transition-all`}>
                                        <div className="absolute -right-4 -bottom-4 opacity-10">{c.icon}</div>
                                        <CardContent className="p-5 relative z-10">
                                            <p className="text-white/70 font-bold mb-1 uppercase tracking-wider text-[10px]">{c.label}</p>
                                            <h3 className="text-3xl font-black">{c.value} <span className="text-sm font-medium opacity-70">Sesi</span></h3>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 p-6">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                    <div>
                                        <CardTitle className="text-lg font-black text-slate-900">
                                            Monitor Kelas — {todayDow >= 1 && todayDow <= 5 ? dayName : 'Hari Libur'}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            {todayDow >= 1 && todayDow <= 5 ? 'Status presensi guru pada setiap jam pelajaran hari ini' : 'Tidak ada jadwal karena hari libur'}
                                        </CardDescription>
                                    </div>
                                    
                                    {todayDow >= 1 && todayDow <= 5 && (
                                        <div className="flex flex-wrap gap-2">
                                            <div className="relative">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <Input 
                                                    placeholder="Cari guru, mapel..." 
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium focus-visible:ring-indigo-500 w-full sm:w-48 shadow-sm"
                                                />
                                            </div>
                                            <select 
                                                value={filterStatus} 
                                                onChange={e => setFilterStatus(e.target.value)}
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-3 shadow-sm"
                                            >
                                                <option value="all">Semua Status</option>
                                                <option value="hadir">Hadir (✅)</option>
                                                <option value="kosong">Kelas Kosong (⚠️)</option>
                                            </select>
                                            <select 
                                                value={filterHour} 
                                                onChange={e => setFilterHour(e.target.value)}
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-3 shadow-sm"
                                            >
                                                <option value="all">Semua Jam</option>
                                                {hours.map(([h]) => <option key={h} value={h}>Jam ke-{h}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {todayDow >= 1 && todayDow <= 5 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                                    <th className="py-4 px-6 text-left text-xs font-black text-slate-500 uppercase">Jam</th>
                                                    <th className="py-4 px-4 text-left text-xs font-black text-slate-500 uppercase">Guru</th>
                                                    <th className="py-4 px-4 text-left text-xs font-black text-slate-500 uppercase">Mapel</th>
                                                    <th className="py-4 px-4 text-left text-xs font-black text-slate-500 uppercase">Kelas</th>
                                                    <th className="py-4 px-4 text-center text-xs font-black text-slate-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTodaySchedules.length > 0 ? filteredTodaySchedules.map((ts, i) => (
                                                    <tr key={i} className={`border-b border-slate-50 transition-colors ${!ts.has_attended ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                                                        <td className="py-3 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-indigo-400" />
                                                                <span className="font-black text-indigo-600">Jam {ts.hour_number}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold">{hourSlots[ts.hour_number]?.start}-{hourSlots[ts.hour_number]?.end}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-slate-800">{ts.teacher_name}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-black text-white bg-gradient-to-r ${hashColor(ts.subject)}`}>{ts.subject}</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="font-bold text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{ts.class_name}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {ts.has_attended ? (
                                                                <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.8)' }}></span>HADIR
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 shadow-sm animate-pulse">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" style={{ boxShadow: '0 0 8px rgba(225,29,72,0.8)' }}></span>KELAS KOSONG
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan={5} className="py-16 text-center">
                                                        <Filter className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                                        <p className="font-bold text-slate-500">Tidak ada jadwal yang sesuai filter</p>
                                                    </td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-16 text-center">
                                        <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                        <p className="font-bold text-slate-500">Hari ini bukan hari kerja</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={o => !o && setIsFormOpen(false)}>
                <DialogContent className="max-w-lg rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-7 text-white relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 opacity-20"><Sparkles className="w-36 h-36" /></div>
                        <DialogTitle className="text-2xl font-black relative z-10">{editingSlot ? 'Edit Jadwal' : 'Tambah Jadwal'}</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium mt-1 relative z-10">
                            {dayLabels[data.day_of_week]}, Jam ke-{data.hour_number} ({hourSlots[data.hour_number]?.start} - {hourSlots[data.hour_number]?.end})
                        </DialogDescription>
                    </div>
                    <form onSubmit={handleSubmit} className="p-7 bg-slate-50 space-y-5">
                        {errors.message && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold">{errors.message}</div>}
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Mata Pelajaran <span className="text-rose-500">*</span></Label>
                            <Input value={data.subject} onChange={e => setData('subject', e.target.value)} placeholder="Contoh: PAIBP, Matematika"
                                className="rounded-xl border-slate-200 h-11 font-semibold focus-visible:ring-indigo-500 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Kelas <span className="text-rose-500">*</span></Label>
                            <select value={data.school_class_id} onChange={e => setData('school_class_id', e.target.value)}
                                className="w-full h-11 rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4 shadow-sm">
                                <option value="">— Pilih Kelas —</option>
                                {schoolClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
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
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-5"><Trash2 className="w-8 h-8 text-rose-600" /></div>
                    <DialogTitle className="text-xl font-black text-slate-900 mb-2">Hapus Jadwal?</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-6">
                        Jadwal <b>{editingSlot?.subject}</b> di <b>{editingSlot?.class_name}</b> akan dihapus.
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
