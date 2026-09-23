import { useState, useMemo, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, Plus, Trash2, Edit2, ShieldAlert, Sparkles, Clock, GraduationCap, School, Search, CheckCircle2, Download, Upload, Square, CheckSquare , AlertTriangle, XCircle, FileText} from 'lucide-react';
import { motion } from 'framer-motion';

const SESSION_COLORS = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
];

const hashColor = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return SESSION_COLORS[Math.abs(h) % SESSION_COLORS.length];
};

export default function Index({ teachers, schoolClasses, schedules, sessionSlots, dayLabels, isExamMode, todaySchedules, monitorStats, todayDow, isHoliday, holidayInfo, isSpecialWorkday, specialWorkdayInfo }) {
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
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSession, setFilterSession] = useState('all');
    const [filterEmptyOnly, setFilterEmptyOnly] = useState(false);
    const [monitorSearchQuery, setMonitorSearchQuery] = useState('');
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Auto Refresh Logic
    useEffect(() => {
        let interval;
        if (activeTab === 'monitor') {
            interval = setInterval(() => {
                router.reload({
                    only: ['todaySchedules', 'monitorStats'],
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => setLastRefresh(new Date())
                });
            }, 15000);
        }
        return () => clearInterval(interval);
    }, [activeTab]);

    
    const tabs = [
        { id: 'manage', label: 'Kelola Jadwal', icon: <CalendarDays className="w-4 h-4" /> },
        { id: 'monitor', label: 'Monitor Hari Ini', icon: <AlertTriangle className="w-4 h-4" /> },
    ];

    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        employee_id: '',
        school_class_id: '',
        day_of_week: 1,
        session_number: 1,
        subject: '',
        room_name: '',
    });

    const teacherSchedules = useMemo(() => {
        if (!selectedTeacher) return schedules;
        return schedules.filter(s => s.employee_id == selectedTeacher);
    }, [selectedTeacher, schedules]);

    const filteredSchedules = useMemo(() => {
        if (!searchQuery) return teacherSchedules;
        const q = searchQuery.toLowerCase();
        return teacherSchedules.filter(s =>
            s.teacher_name.toLowerCase().includes(q) ||
            s.subject.toLowerCase().includes(q) ||
            s.class_name.toLowerCase().includes(q) ||
            (s.room_name && s.room_name.toLowerCase().includes(q))
        );
    }, [teacherSchedules, searchQuery]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Reset page when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTeacher]);

    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const paginatedSchedules = filteredSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Bulk delete state
    const [checkedIds, setCheckedIds] = useState([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    
    const handleBulkDelete = () => {
        router.post(route('exam-schedules.bulk-destroy'), { ids: checkedIds }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsBulkDeleteOpen(false);
                setCheckedIds([]);
            }
        });
    };

    const allChecked = paginatedSchedules.length > 0 && paginatedSchedules.every(s => checkedIds.includes(s.id));
    const toggleAll = () => {
        if (allChecked) {
            setCheckedIds(prev => prev.filter(id => !paginatedSchedules.find(s => s.id === id)));
        } else {
            const newIds = [...checkedIds];
            paginatedSchedules.forEach(s => {
                if (!newIds.includes(s.id)) newIds.push(s.id);
            });
            setCheckedIds(newIds);
        }
    };
    const toggleOne = (id) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);




    const getSlot = (teacherId, day, session) => {
        return schedules.find(s => s.employee_id == teacherId && s.day_of_week === day && s.session_number === session);
    };

    const openAdd = (teacherId = '', day = 1, session = 1) => {
        if (!canManage) return;
        clearErrors();
        reset();
        setData({
            employee_id: teacherId || selectedTeacher || (teachers[0]?.id || ''),
            school_class_id: '',
            day_of_week: day,
            session_number: session,
            subject: '',
            room_name: '',
        });
        setEditingSlot(null);
        setIsFormOpen(true);
    };

    const openEdit = (slot) => {
        if (!canManage) return;
        clearErrors();
        setEditingSlot(slot);
        setData({
            employee_id: slot.employee_id,
            school_class_id: slot.school_class_id || '',
            day_of_week: slot.day_of_week,
            session_number: slot.session_number,
            subject: slot.subject,
            room_name: slot.room_name || '',
        });
        setIsFormOpen(true);
    };

    const openDelete = (slot) => {
        if (!canManage) return;
        setEditingSlot(slot);
        setIsDeleteOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSlot) {
            put(route('exam-schedules.update', editingSlot.id), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        } else {
            post(route('exam-schedules.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        if (!editingSlot) return;
        destroy(route('exam-schedules.destroy', editingSlot.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setEditingSlot(null);
            }
        });
    };

    const handleTemplateDownload = () => {
        window.location.href = route('exam-schedules.template');
    };

    const handleExport = () => {
        const params = selectedTeacher ? { employee_id: selectedTeacher } : {};
        window.location.href = route('exam-schedules.export', params);
    };

    const handleImportClick = () => {
        if (!canManage) return;
        if (!selectedTeacher) {
            alert('Silakan pilih Guru Pengawas terlebih dahulu untuk mengimpor jadwal.');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!canManage || !file || !selectedTeacher) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('employee_id', selectedTeacher);

        router.post(route('exam-schedules.import'), formData, {
            onSuccess: () => {
                e.target.value = '';
            },
            onError: () => {
                e.target.value = '';
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Jadwal Pengawas Ujian (UTS/UAS)" />

            {/* Header section with Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-indigo-400" />
                        Jadwal Pengawas Ujian
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Kelola dan pantau jadwal pengawas ujian.</p>
                </div>
                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/80 w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>


            {activeTab === 'manage' && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <input type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="hidden"
            />

            <div className="py-6 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                                    <ShieldAlert className="w-6 h-6" />
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isExamMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isExamMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                                    {isExamMode ? 'Mode Ujian Aktif' : 'Mode Ujian Non-Aktif'}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Matriks Jadwal Pengawas Ujian
                            </h1>
                            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                                Kelola pembagian tugas pengawas Ujian Tengah/Akhir Semester (Sesi 1–4) untuk seluruh guru pengawas.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleTemplateDownload}
                                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700 rounded-2xl text-xs font-semibold px-4 py-2.5 flex items-center gap-2 shadow-md"
                            >
                                <Download className="w-4 h-4 text-indigo-400" /> Template Excel
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleExport}
                                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700 rounded-2xl text-xs font-semibold px-4 py-2.5 flex items-center gap-2 shadow-md"
                            >
                                <Download className="w-4 h-4 text-emerald-400" /> Export Excel
                            </Button>

                            {canManage && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleImportClick}
                                        className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700 rounded-2xl text-xs font-semibold px-4 py-2.5 flex items-center gap-2 shadow-md"
                                    >
                                        <Upload className="w-4 h-4 text-amber-400" /> Import Excel
                                    </Button>

                                    <Button
                                        onClick={() => openAdd()}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 rounded-2xl px-5 py-2.5 font-semibold text-xs flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Tambah Jadwal
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter & Controls */}
                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-xl rounded-3xl">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs font-medium text-slate-400 mb-1.5 block">Filter Guru Pengawas</Label>
                                <select
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                >
                                    <option value="">Semua Guru Pengawas</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.position})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs font-medium text-slate-400 mb-1.5 block">Pencarian Cepat</Label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                                    <Input
                                        type="text"
                                        placeholder="Cari guru, mata pelajaran, ruang..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 text-sm rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl w-full flex items-center justify-between text-xs text-indigo-300">
                                    <span>Total Slot Terjadwal:</span>
                                    <span className="font-bold text-sm text-indigo-400">{schedules.length} Sesi</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sesi Ujian Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(sessionSlots).map(([sessionNum, slotInfo]) => (
                        <div key={sessionNum} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold tracking-wider text-indigo-400 uppercase">Sesi {sessionNum}</span>
                                <Clock className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="text-lg font-black text-white mt-2">
                                {slotInfo.start} <span className="text-slate-500 font-normal text-xs">–</span> {slotInfo.end}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid View for Selected Teacher or List View */}
                {selectedTeacher ? (
                    <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-800/80">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-400" />
                                Matriks Mengawas Ujian: {teachers.find(t => t.id == selectedTeacher)?.name}
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                                Klik pada slot kosong untuk menambahkan jadwal pengawas, atau klik slot terisi untuk mengedit.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="py-3 px-4 w-32 font-bold">Hari</th>
                                        {Object.entries(sessionSlots).map(([sNum, sInfo]) => (
                                            <th key={sNum} className="py-3 px-4 text-center font-bold">
                                                Sesi {sNum} <br />
                                                <span className="text-[10px] text-slate-500 font-normal">{sInfo.start} - {sInfo.end}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {[1, 2, 3, 4, 5].map(day => (
                                        <tr key={day} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-4 text-sm font-bold text-slate-200">
                                                {dayLabels[day]}
                                            </td>
                                            {[1, 2, 3, 4].map(session => {
                                                const slot = getSlot(selectedTeacher, day, session);
                                                return (
                                                    <td key={session} className="py-3 px-2 text-center align-top">
                                                        {slot ? (
                                                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${hashColor(slot.subject)} text-white shadow-md relative group text-left cursor-pointer transition-transform hover:-translate-y-0.5`}>
                                                                <div className="text-xs font-bold truncate">{slot.subject}</div>
                                                                <div className="text-[11px] opacity-90 font-medium flex items-center gap-1 mt-1">
                                                                    <School className="w-3 h-3" /> {slot.class_name} {slot.room_name ? `(${slot.room_name})` : ''}
                                                                </div>

                                                                {canManage && (
                                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/40 p-1 rounded-lg backdrop-blur-md">
                                                                        <button onClick={(e) => { e.stopPropagation(); openEdit(slot); }} className="p-1 hover:text-indigo-300">
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button onClick={(e) => { e.stopPropagation(); openDelete(slot); }} className="p-1 hover:text-rose-300">
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            canManage ? (
                                                                <button
                                                                    onClick={() => openAdd(selectedTeacher, day, session)}
                                                                    className="w-full h-20 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center text-slate-600 hover:text-indigo-400 text-xs font-medium gap-1"
                                                                >
                                                                    <Plus className="w-4 h-4" /> Tambah Sesi
                                                                </button>
                                                            ) : (
                                                                <div className="w-full h-20 rounded-2xl border border-slate-800/40 bg-slate-950/40 flex items-center justify-center text-slate-600 text-xs">
                                                                    Kosong
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
                        </CardContent>
                    </Card>
                ) : (
                    <>
                      <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-800/80">
                            <CardTitle className="text-lg font-bold text-white flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-indigo-400" />
                                    Daftar Lengkap Jadwal Pengawas Ujian
                                </div>
                                {canManage && checkedIds.length > 0 && (
                                    <Button onClick={() => setIsBulkDeleteOpen(true)} variant="outline" className="rounded-xl border-rose-900/50 text-rose-500 font-bold hover:bg-rose-950/50 hover:text-rose-400 h-9">
                                        <Trash2 className="w-4 h-4 mr-2" /> Hapus Terpilih ({checkedIds.length})
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                        {canManage && (
                                            <th className="py-3.5 px-4 font-bold w-12">
                                                <button onClick={toggleAll} className="text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center">
                                                    {allChecked ? <CheckSquare className="w-5 h-5 text-indigo-400" /> : <Square className="w-5 h-5" />}
                                                </button>
                                            </th>
                                        )}
                                        <th className="py-3.5 px-6 font-bold">Guru Pengawas</th>
                                        <th className="py-3.5 px-4 font-bold">Hari</th>
                                        <th className="py-3.5 px-4 font-bold">Sesi</th>
                                        <th className="py-3.5 px-4 font-bold">Mata Pelajaran Ujian</th>
                                        <th className="py-3.5 px-4 font-bold">Kelas / Ruang</th>
                                        {canManage && <th className="py-3.5 px-6 text-right font-bold">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-sm">
                                    {paginatedSchedules.length > 0 ? (
                                        paginatedSchedules.map((slot) => (
                                            <tr key={slot.id} className={`hover:bg-slate-800/30 transition-colors ${checkedIds.includes(slot.id) ? 'bg-indigo-900/10' : ''}`}>
                                                {canManage && (
                                                    <td className="py-4 px-4 text-center">
                                                        <button onClick={() => toggleOne(slot.id)} className="text-slate-500 hover:text-indigo-400 transition-colors">
                                                            {checkedIds.includes(slot.id) ? <CheckSquare className="w-5 h-5 text-indigo-400" /> : <Square className="w-5 h-5" />}
                                                        </button>
                                                    </td>
                                                )}
                                                <td className="py-4 px-6 font-bold text-white">
                                                    {slot.teacher_name}
                                                </td>
                                                <td className="py-4 px-4 text-slate-300 font-medium">
                                                    {dayLabels[slot.day_of_week] || `Hari ${slot.day_of_week}`}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        Sesi {slot.session_number} ({sessionSlots[slot.session_number]?.start} - {sessionSlots[slot.session_number]?.end})
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-slate-200">
                                                    {slot.subject}
                                                </td>
                                                <td className="py-4 px-4 text-slate-300">
                                                    {slot.class_name} {slot.room_name ? `(${slot.room_name})` : ''}
                                                </td>
                                                {canManage && (
                                                    <td className="py-4 px-6 text-right space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEdit(slot)}
                                                            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl h-8 text-xs"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openDelete(slot)}
                                                            className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60 rounded-xl h-8 text-xs"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={canManage ? 7 : 5} className="py-12 text-center text-slate-500 text-sm">
                                                Belum ada jadwal pengawas ujian yang ditambahkan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                    
                    {!selectedTeacher && totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="flex items-center gap-1 bg-slate-900/60 p-2 rounded-2xl shadow-sm border border-slate-800 backdrop-blur-sm">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 text-slate-400 hover:bg-slate-800 disabled:hover:bg-transparent"
                                >Prev</button>
                                
                                {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                    let startPage = Math.max(1, currentPage - 2);
                                    if (startPage + 4 > totalPages) {
                                        startPage = Math.max(1, totalPages - 4);
                                    }
                                    let pageNum = startPage + i;
                                    return (
                                        <button
                                            key={`page-${pageNum}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                                        >{pageNum}</button>
                                    );
                                })}

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 text-slate-400 hover:bg-slate-800 disabled:hover:bg-transparent"
                                >Next</button>
                            </div>
                        </div>
                    )}
                      </>
                )}
            </div>

                </motion.div>
            )}

            {activeTab === 'monitor' && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Holiday Alert Banner */}
                    {isHoliday && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-[1.5rem] bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200/80 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-amber-600 dark:text-amber-500 font-bold text-lg">Hari Libur: {holidayInfo?.description}</h4>
                                <p className="text-amber-700/80 dark:text-amber-400/80 text-sm font-medium">Tidak ada jadwal ujian pada hari ini.</p>
                            </div>
                        </motion.div>
                    )}

                    {isSpecialWorkday && !isHoliday && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-[1.5rem] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">Acara Khusus: {specialWorkdayInfo?.name}</h4>
                                <p className="text-indigo-700/80 dark:text-indigo-300/80 text-sm font-medium">Ujian ditiadakan. Pegawai diperbolehkan pulang pada pukul {specialWorkdayInfo?.jam_keluar}.</p>
                            </div>
                        </motion.div>
                    )}

                    {!isExamMode && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-[1.5rem] bg-slate-800/50 border border-slate-700/80 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-700 text-slate-300 flex items-center justify-center font-bold shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-slate-300 font-bold text-lg">Bukan Periode Ujian</h4>
                                <p className="text-slate-400 text-sm font-medium">Hari ini tidak ada periode ujian UTS/UAS yang aktif di Kalender Akademik.</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Sesi Ujian', value: monitorStats?.total || 0, gradient: 'from-blue-500 to-indigo-600', icon: <School className="w-20 h-20" /> },
                            { label: 'Sesi Terisi', value: monitorStats?.filled || 0, gradient: 'from-emerald-500 to-teal-600', icon: <CheckCircle2 className="w-20 h-20" /> },
                            { label: 'Sesi Kosong', value: monitorStats?.empty || 0, gradient: 'from-rose-500 to-pink-600', icon: <XCircle className="w-20 h-20" /> },
                        ].map((c, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <Card className={`bg-gradient-to-br ${c.gradient} text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative hover:shadow-xl hover:-translate-y-0.5 transition-all`}>
                                    <div className="absolute -right-4 -bottom-4 opacity-10">{c.icon}</div>
                                    <CardContent className="p-5 relative z-10">
                                        <div className="text-white/80 font-bold text-sm mb-1 uppercase tracking-wider">{c.label}</div>
                                        <div className="text-4xl font-black">{c.value}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Filter and Content */}
                    <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-800/80">
                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                <div>
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                                        Monitor Pengawas
                                    </CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Status kehadiran pengawas ujian hari ini
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <Input
                                            placeholder="Cari guru, sesi, mapel..."
                                            value={monitorSearchQuery}
                                            onChange={(e) => setMonitorSearchQuery(e.target.value)}
                                            className="w-full sm:w-64 pl-9 h-10 bg-slate-950/50 border-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl placeholder:text-slate-500"
                                        />
                                    </div>
                                    <select
                                        value={filterSession}
                                        onChange={(e) => setFilterSession(e.target.value)}
                                        className="h-10 rounded-xl bg-slate-950/50 border-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-medium px-4 pr-8 appearance-none"
                                    >
                                        <option value="all">Semua Sesi</option>
                                        {[1, 2, 3, 4].map(s => <option key={s} value={s}>Sesi {s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-800">
                                {todaySchedules?.filter(s => {
                                    if (filterSession !== 'all' && s.session_number != filterSession) return false;
                                    if (filterEmptyOnly && s.has_attended) return false;
                                    
                                    if (monitorSearchQuery) {
                                        const q = monitorSearchQuery.toLowerCase();
                                        if (!s.teacher_name.toLowerCase().includes(q) &&
                                            !s.subject.toLowerCase().includes(q) &&
                                            !s.class_name.toLowerCase().includes(q) &&
                                            !s.room_name?.toLowerCase().includes(q)) {
                                            return false;
                                        }
                                    }
                                    return true;
                                }).sort((a, b) => {
                                    if (a.session_number === b.session_number) {
                                        return a.teacher_name.localeCompare(b.teacher_name);
                                    }
                                    return a.session_number - b.session_number;
                                }).map((s, i) => (
                                    <div key={i} className="p-4 sm:p-6 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                        <div className="flex items-center gap-6 flex-1 min-w-0">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Sesi</span>
                                                <span className="text-2xl font-black text-white leading-none">{s.session_number}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-lg truncate flex items-center gap-2">
                                                    {s.teacher_name}
                                                    {s.has_attended && (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        </span>
                                                    )}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5"><School className="w-3.5 h-3.5" /> {s.class_name} {s.room_name ? `(${s.room_name})` : ''}</div>
                                                    <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {s.subject}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto shrink-0 flex items-center gap-3">
                                            {s.has_attended ? (
                                                <div className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                                    <CheckCircle2 className="w-4 h-4" /> Berhasil Hadir
                                                </div>
                                            ) : (
                                                <div className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm">
                                                    <XCircle className="w-4 h-4" /> Belum Hadir
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!todaySchedules || todaySchedules.length === 0) && (
                                    <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
                                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                            <CalendarDays className="w-8 h-8 text-slate-700" />
                                        </div>
                                        <p className="font-semibold text-lg text-slate-400">Tidak ada jadwal ujian hari ini.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Modal Form Add / Edit */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl max-w-md p-6">
                    <DialogTitle className="text-xl font-bold text-white">
                        {editingSlot ? 'Edit Jadwal Pengawas Ujian' : 'Tambah Jadwal Pengawas Ujian'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                        Isi form di bawah ini untuk menentukan guru pengawas, hari, sesi, dan ruang ujian.
                    </DialogDescription>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {errors.message && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                                {errors.message}
                            </div>
                        )}

                        <div>
                            <Label className="text-xs text-slate-300">Guru Pengawas</Label>
                            <select
                                value={data.employee_id}
                                onChange={(e) => setData('employee_id', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            >
                                <option value="" disabled>Pilih Guru Pengawas</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.employee_id && <p className="text-xs text-rose-400 mt-1">{errors.employee_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-slate-300">Hari</Label>
                                <select
                                    value={data.day_of_week}
                                    onChange={(e) => setData('day_of_week', parseInt(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {[1, 2, 3, 4, 5].map(d => (
                                        <option key={d} value={d}>{dayLabels[d]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs text-slate-300">Sesi Ujian</Label>
                                <select
                                    value={data.session_number}
                                    onChange={(e) => setData('session_number', parseInt(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {Object.entries(sessionSlots).map(([sNum, sInfo]) => (
                                        <option key={sNum} value={sNum}>Sesi {sNum} ({sInfo.start}-{sInfo.end})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs text-slate-300">Mata Pelajaran Ujian</Label>
                            <Input
                                type="text"
                                placeholder="Contoh: Matematika Kejuruan"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-200 text-sm rounded-xl mt-1"
                                required
                            />
                            {errors.subject && <p className="text-xs text-rose-400 mt-1">{errors.subject}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-slate-300">Kelas</Label>
                                <select
                                    value={data.school_class_id}
                                    onChange={(e) => setData('school_class_id', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">(Opsional) Pilih Kelas</option>
                                    {schoolClasses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs text-slate-300">Ruang Ujian</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Lab Komputer 1 / Ruang 05"
                                    value={data.room_name}
                                    onChange={(e) => setData('room_name', e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-slate-200 text-sm rounded-xl mt-1"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                                className="bg-slate-800 text-slate-300 border-slate-700 rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl px-5"
                            >
                                {processing ? 'Menyimpan...' : (editingSlot ? 'Simpan Perubahan' : 'Tambah Jadwal')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl max-w-sm p-6">
                    <DialogTitle className="text-lg font-bold text-white">Hapus Jadwal Pengawas?</DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-2">
                        Apakah Anda yakin ingin menghapus jadwal mengawas <strong className="text-white">{editingSlot?.subject}</strong> untuk guru <strong className="text-white">{editingSlot?.teacher_name}</strong>? Action ini tidak dapat dibatalkan.
                    </DialogDescription>

                    <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="bg-slate-800 text-slate-300 border-slate-700 rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl px-4"
                        >
                            {processing ? 'Menghapus...' : 'Hapus Jadwal'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
