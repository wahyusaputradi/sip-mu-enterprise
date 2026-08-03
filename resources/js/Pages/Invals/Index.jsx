import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    CalendarClock, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    User, 
    BookOpen, 
    GraduationCap, 
    MapPin, 
    Info, 
    AlertCircle,
    Plus,
    Trash2,
    Search
} from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ auth, date, lowongan = [], invals, canApprove, employees, filters = {} }) {
    const [selectedDate, setSelectedDate] = useState(date);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const [historyStartDate, setHistoryStartDate] = useState(filters?.history_start_date || '');
    const [historyEndDate, setHistoryEndDate] = useState(filters?.history_end_date || '');
    const [historyStatus, setHistoryStatus] = useState(filters?.history_status || '');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterHour, setFilterHour] = useState('');

    const uniqueClasses = Array.from(new Set(lowongan.map(item => item.school_class?.name).filter(Boolean))).sort();
    const uniqueHours = Array.from(new Set(lowongan.map(item => item.hour_number).filter(Boolean))).sort((a, b) => a - b);

    const filteredLowongan = lowongan.filter(item => {
        const matchesSearch = 
            !searchTerm ||
            item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.school_class?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesClass = !filterClass || item.school_class?.name === filterClass;
        const matchesHour = !filterHour || String(item.hour_number) === filterHour;
        
        return matchesSearch && matchesClass && matchesHour;
    });

    const { data, setData, post, processing, reset, errors } = useForm({
        date: date,
        absent_employee_id: '',
        teaching_schedule_id: '',
        substitute_employee_id: auth.user.employee?.id || '',
        reason: 'Menggantikan kelas',
    });

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setSearchTerm('');
        setFilterClass('');
        setFilterHour('');
        
        const queryParams = { date: newDate };
        if (historyStartDate) queryParams.history_start_date = historyStartDate;
        if (historyEndDate) queryParams.history_end_date = historyEndDate;
        if (historyStatus) queryParams.history_status = historyStatus;

        router.get(route('invals.index'), queryParams, { preserveState: true });
    };

    const handleFilterChange = (params) => {
        const queryParams = {
            date: selectedDate,
            history_start_date: params.hasOwnProperty('history_start_date') ? params.history_start_date : historyStartDate,
            history_end_date: params.hasOwnProperty('history_end_date') ? params.history_end_date : historyEndDate,
            history_status: params.hasOwnProperty('history_status') ? params.history_status : historyStatus,
        };

        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === '' || queryParams[key] === null) {
                delete queryParams[key];
            }
        });

        router.get(route('invals.index'), queryParams, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setHistoryStartDate('');
        setHistoryEndDate('');
        setHistoryStatus('');
        router.get(route('invals.index'), { date: selectedDate }, { preserveState: true });
    };

    const openClaimModal = (schedule) => {
        setSelectedSchedule(schedule);
        setData({
            ...data,
            date: selectedDate,
            absent_employee_id: schedule.employee_id,
            teaching_schedule_id: schedule.id,
            substitute_employee_id: canApprove ? '' : (auth.user.employee?.id || ''),
        });
        setIsClaimModalOpen(true);
    };

    const submitClaim = (e) => {
        e.preventDefault();
        post(route('invals.store'), {
            onSuccess: () => {
                setIsClaimModalOpen(false);
                reset();
            }
        });
    };

    const approveInval = (id) => {
        if (confirm('Setujui pengajuan Inval ini?')) {
            router.post(route('invals.approve', id));
        }
    };

    const rejectInval = (id) => {
        if (confirm('Tolak pengajuan Inval ini?')) {
            router.post(route('invals.reject', id));
        }
    };

    const deleteInval = (id) => {
        if (confirm('Hapus/Batalkan pengajuan Inval ini?')) {
            router.delete(route('invals.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                            Bursa Inval <span className="text-indigo-600 dark:text-indigo-400">Jam Ganti</span>
                        </h2>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                            Ambil jam kelas yang kosong hari ini
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-card p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-border">
                        <label className="text-xs font-bold text-slate-500 uppercase px-2">Tanggal:</label>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={handleDateChange}
                            className="text-sm border-0 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                        />
                    </div>
                </div>
            }
        >
            <Head title="Bursa Inval" />

            <div className="space-y-8">
                {/* Lowongan Inval Section */}
                <div className="bg-white dark:bg-card rounded-[2rem] border border-slate-100 dark:border-border shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-border bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                <CalendarClock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Lowongan Inval Tersedia</h3>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Kelas kosong yang butuh guru pengganti untuk tanggal {selectedDate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {lowongan.length === 0 ? (
                            <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-black text-slate-700 dark:text-slate-300">Semua Kelas Aman!</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Tidak ada guru yang berhalangan hadir pada tanggal ini.</p>
                            </div>
                        ) : (
                            <>
                                {/* Bilah Pencarian & Filter Lowongan */}
                                <div className="mb-6 flex flex-col md:flex-row gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                                    {/* Kolom Pencarian Teks */}
                                    <div className="flex-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Cari mapel, guru asli, atau kelas..."
                                            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                                        />
                                    </div>

                                    {/* Dropdown Filter Kelas */}
                                    <div className="w-full md:w-48">
                                        <select
                                            value={filterClass}
                                            onChange={(e) => setFilterClass(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            <option value="">Semua Kelas</option>
                                            {uniqueClasses.map((cls) => (
                                                <option key={cls} value={cls}>Kelas {cls}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dropdown Filter Jam */}
                                    <div className="w-full md:w-48">
                                        <select
                                            value={filterHour}
                                            onChange={(e) => setFilterHour(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            <option value="">Semua Jam</option>
                                            {uniqueHours.map((hr) => (
                                                <option key={hr} value={hr}>Jam ke-{hr}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tombol Reset Filter */}
                                    {(searchTerm || filterClass || filterHour) && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilterClass('');
                                                setFilterHour('');
                                            }}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>

                                {/* Daftar Lowongan */}
                                {filteredLowongan.length === 0 ? (
                                    <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-black text-slate-700 dark:text-slate-300">Hasil Pencarian Tidak Ditemukan</p>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                                            Tidak ada lowongan inval yang cocok dengan kata kunci atau filter Anda.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredLowongan.map((schedule) => (
                                            <div key={schedule.id} className="group p-5 bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                                        Jam ke-{schedule.hour_number}
                                                    </div>
                                                    <div className="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1.5" />
                                                        {schedule.school_class?.name}
                                                    </div>
                                                </div>
                                                
                                                <h4 className="text-lg font-black text-slate-800 dark:text-white mb-1">{schedule.subject}</h4>
                                                
                                                <div className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                                                    <User className="w-4 h-4 mr-2 opacity-50" />
                                                    <span>Guru Asli: <span className="text-slate-700 dark:text-slate-300">{schedule.employee?.name}</span></span>
                                                </div>
                                                
                                                <button
                                                    onClick={() => openClaimModal(schedule)}
                                                    className="w-full flex items-center justify-center p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-600/20 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5 mr-2" />
                                                    Ambil Inval Ini
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* History Inval Section */}
                <div className="bg-white dark:bg-card rounded-[2rem] border border-slate-100 dark:border-border shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-800/20 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Riwayat Klaim Inval</h3>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Daftar jam ganti yang diajukan {canApprove ? 'seluruh pegawai' : 'oleh Anda'}{!historyStartDate && !historyEndDate ? ` (Tanggal ${selectedDate})` : ''}</p>
                        </div>
                        
                        {/* History Filters */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase px-1">Mulai:</label>
                                <input 
                                    type="date" 
                                    value={historyStartDate} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setHistoryStartDate(val);
                                        handleFilterChange({ history_start_date: val });
                                    }}
                                    className="text-xs border-0 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold p-1.5"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase px-1">Selesai:</label>
                                <input 
                                    type="date" 
                                    value={historyEndDate} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setHistoryEndDate(val);
                                        handleFilterChange({ history_end_date: val });
                                    }}
                                    className="text-xs border-0 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold p-1.5"
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase px-1">Status:</label>
                                <select 
                                    value={historyStatus} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setHistoryStatus(val);
                                        handleFilterChange({ history_status: val });
                                    }}
                                    className="text-xs border-0 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold p-1.5 pr-8"
                                >
                                    <option value="">Semua</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>

                            {(historyStartDate || historyEndDate || historyStatus) && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 text-xs font-black rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-border">
                                    <th className="p-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                                    <th className="p-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Detail Kelas</th>
                                    <th className="p-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Guru Pengganti</th>
                                    <th className="p-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="p-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-border text-sm font-medium">
                                {invals.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold">
                                            Belum ada data riwayat Inval.
                                        </td>
                                    </tr>
                                ) : (
                                    invals.data.map((inval) => (
                                        <tr key={inval.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-bold">
                                                {inval.date}
                                            </td>
                                            <td className="p-5">
                                                <p className="font-black text-slate-800 dark:text-white">{inval.teaching_schedule?.subject}</p>
                                                <p className="text-xs text-slate-500 mt-1 font-bold">
                                                    Kelas {inval.teaching_schedule?.school_class?.name} • Jam ke-{inval.teaching_schedule?.hour_number}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-widest text-rose-500 mt-1 font-black">
                                                    Menggantikan: {inval.absent_employee?.name || 'Pegawai Tidak Ditemukan'}
                                                </p>
                                            </td>
                                            <td className="p-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                        {inval.substitute_employee?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{inval.substitute_employee?.name || 'Pegawai Tidak Ditemukan'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 whitespace-nowrap">
                                                {inval.status === 'approved' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Disetujui
                                                        </span>
                                                        {inval.approver && (
                                                            <span className="text-[10px] font-bold text-slate-500">
                                                                Oleh: {inval.approver.name} {inval.approver.roles?.length > 0 ? `(${inval.approver.roles[0].name})` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {inval.status === 'rejected' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                                                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Ditolak
                                                        </span>
                                                        {inval.approver && (
                                                            <span className="text-[10px] font-bold text-slate-500">
                                                                Oleh: {inval.approver.name} {inval.approver.roles?.length > 0 ? `(${inval.approver.roles[0].name})` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {inval.status === 'pending' && (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                                        <Clock className="w-3.5 h-3.5 mr-1.5" /> Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {inval.status === 'pending' && inval.can_be_approved && (
                                                        <>
                                                            <button 
                                                                onClick={() => approveInval(inval.id)} 
                                                                title="Setujui Pengajuan"
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white dark:hover:border-emerald-600 transition-all duration-200 shadow-sm"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => rejectInval(inval.id)} 
                                                                title="Tolak Pengajuan"
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 transition-all duration-200 shadow-sm"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {(inval.status === 'pending' || inval.can_be_approved) && (
                                                        <button 
                                                            onClick={() => deleteInval(inval.id)} 
                                                            title="Hapus / Batalkan Pengajuan"
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 dark:hover:border-rose-900/50 transition-all duration-200 shadow-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {invals.links && invals.links.length > 3 && (
                        <div className="flex justify-center p-6 border-t border-slate-100 dark:border-border">
                            <div className="flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 p-2 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800/50 backdrop-blur-sm">
                                {invals.links.map((link, idx) => {
                                    const isPrevious = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');
                                    const label = isPrevious ? 'Prev' : (isNext ? 'Next' : link.label);
                                    
                                    const handlePageClick = () => {
                                        if (!link.url) return;
                                        router.get(link.url, {}, { preserveState: true });
                                    };

                                    return link.url ? (
                                        <button
                                            key={idx}
                                            onClick={handlePageClick}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                link.active 
                                                    ? 'bg-indigo-600 text-white shadow-md' 
                                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'
                                            }`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }}></span>
                                        </button>
                                    ) : (
                                        <span key={idx} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 dark:text-slate-700" dangerouslySetInnerHTML={{ __html: label }}></span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Claim */}
            <Modal show={isClaimModalOpen} onClose={() => setIsClaimModalOpen(false)}>
                <form onSubmit={submitClaim} className="p-6 md:p-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center">
                        <CalendarClock className="w-6 h-6 mr-3 text-indigo-500" />
                        Ambil Jadwal Inval
                    </h3>

                    {selectedSchedule && (
                        <div className="mb-6 p-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                            <h4 className="font-black text-indigo-900 dark:text-indigo-300 text-lg mb-2">{selectedSchedule.subject}</h4>
                            <div className="flex flex-col gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Kelas {selectedSchedule.school_class?.name}</div>
                                <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Jam ke-{selectedSchedule.hour_number}</div>
                                <div className="flex items-center"><User className="w-4 h-4 mr-2" /> Guru Asli: {selectedSchedule.employee?.name}</div>
                            </div>
                        </div>
                    )}

                    {canApprove && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Guru Pengganti (Anda sebagai Admin):</label>
                            <select
                                value={data.substitute_employee_id}
                                onChange={e => setData('substitute_employee_id', e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-indigo-500 text-sm font-semibold"
                                required
                            >
                                <option value="">-- Pilih Pegawai --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                            {errors.substitute_employee_id && <p className="text-red-500 text-xs mt-1 font-bold">{errors.substitute_employee_id}</p>}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Keterangan:</label>
                        <input
                            type="text"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-indigo-500 text-sm font-semibold"
                            placeholder="Contoh: Menggantikan jam kosong"
                            required
                        />
                        {errors.reason && <p className="text-red-500 text-xs mt-1 font-bold">{errors.reason}</p>}
                    </div>

                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <SecondaryButton onClick={() => setIsClaimModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>Konfirmasi Ambil Inval</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
