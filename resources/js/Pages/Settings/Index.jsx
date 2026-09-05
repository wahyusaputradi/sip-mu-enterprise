import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings as SettingsIcon, CalendarPlus, Trash2, CalendarDays, Clock, Save, Building2, Timer } from 'lucide-react';
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Index({ settings, holidays, specialWorkdays = [] }) {
    const { data: settingData, setData: setSettingData, post: postSettings, processing: processingSettings, errors: settingErrors } = useForm({
        school_name: settings.school_name || 'SMK Manbaul Ulum Cirebon',
        jam_masuk: settings.jam_masuk || '07:00',
        jam_keluar: settings.jam_keluar || '14:40',
        batas_waktu_maksimal_terlambat: settings.batas_waktu_maksimal_terlambat || '10',
        buffer_presensi_masuk: settings.buffer_presensi_masuk || '10',
        buffer_presensi_keluar: settings.buffer_presensi_keluar || '10',
        teaching_late_tolerance: settings.teaching_late_tolerance || '15',
        count_holidays_as_present: settings.count_holidays_as_present !== undefined ? (settings.count_holidays_as_present === '1' || settings.count_holidays_as_present === 1 || settings.count_holidays_as_present === true) : true,
        liveness_detection_enabled: settings.liveness_detection_enabled !== undefined ? (settings.liveness_detection_enabled === '1' || settings.liveness_detection_enabled === 1 || settings.liveness_detection_enabled === true) : true,
        recap_cutoff_type: settings.recap_cutoff_type || 'calendar_month',
        recap_cutoff_day: settings.recap_cutoff_day || '20',
        student_jam_masuk: settings.student_jam_masuk || '07:00',
        student_jam_pulang: settings.student_jam_pulang || '15:00',
        student_batas_terlambat_menit: settings.student_batas_terlambat_menit || '15',
    });

    const { data: holidayData, setData: setHolidayData, post: postHoliday, reset: resetHoliday, processing: processingHoliday, errors: holidayErrors } = useForm({
        mode: 'single',
        date: '',
        start_date: '',
        end_date: '',
        description: '',
        is_national_holiday: true,
    });

    const { data: specialWorkdayData, setData: setSpecialWorkdayData, post: postSpecialWorkday, reset: resetSpecialWorkday, processing: processingSpecialWorkday, errors: specialWorkdayErrors } = useForm({
        date: '',
        name: '',
        jam_keluar: '12:00',
        disable_kbm: true,
    });

    const [activeTab, setActiveTab] = useState('umum');
    const [checkedHolidayIds, setCheckedHolidayIds] = useState([]);

    const toggleOneHoliday = (id) => {
        setCheckedHolidayIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const allHolidaysChecked = holidays && holidays.length > 0 && holidays.every(h => checkedHolidayIds.includes(h.id));
    
    const toggleAllHolidays = () => {
        if (allHolidaysChecked) {
            setCheckedHolidayIds([]);
        } else {
            setCheckedHolidayIds(holidays.map(h => h.id));
        }
    };

    const submitSettings = (e) => {
        e.preventDefault();
        postSettings(route('settings.update'), {
            onSuccess: () => toast.success("Pengaturan berhasil disimpan.")
        });
    };

    const submitHoliday = (e) => {
        e.preventDefault();
        postHoliday(route('holidays.store'), {
            onSuccess: () => {
                toast.success("Hari libur berhasil ditambahkan.");
                resetHoliday();
            }
        });
    };

    const submitSpecialWorkday = (e) => {
        e.preventDefault();
        postSpecialWorkday(route('special-workdays.store'), {
            onSuccess: () => {
                toast.success("Hari kerja khusus berhasil ditambahkan.");
                resetSpecialWorkday();
            }
        });
    };

    const handleDeleteSpecialWorkday = (id) => {
        if (confirm('Hapus hari kerja khusus ini?')) {
            router.delete(route('special-workdays.destroy', id), {
                onSuccess: () => toast.success("Hari kerja khusus berhasil dihapus.")
            });
        }
    };

    const handleDeleteHoliday = (id) => {
        if(confirm('Hapus hari libur ini?')) {
            router.delete(route('holidays.destroy', id), {
                onSuccess: () => {
                    toast.success("Hari libur berhasil dihapus.");
                    setCheckedHolidayIds(prev => prev.filter(x => x !== id));
                }
            });
        }
    };

    const handleBulkDeleteHolidays = () => {
        if (confirm(`Hapus ${checkedHolidayIds.length} hari libur yang terpilih?`)) {
            router.post(route('holidays.bulk-destroy'), { ids: checkedHolidayIds }, {
                onSuccess: () => {
                    toast.success("Hari libur terpilih berhasil dihapus.");
                    setCheckedHolidayIds([]);
                }
            });
        }
    };

    const tabs = [
        { id: 'umum', label: 'Konfigurasi Umum', icon: <SettingsIcon className="w-4 h-4 mr-2" /> },
        { id: 'libur', label: 'Manajemen Hari Libur', icon: <CalendarDays className="w-4 h-4 mr-2" /> },
        { id: 'khusus', label: 'Hari Kerja Khusus (Acara)', icon: <Clock className="w-4 h-4 mr-2" /> },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <SettingsIcon className="w-3 h-3 mr-1.5" />
                                Master Data
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Pengaturan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Sistem</span>
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Sistem" />

            <div className="pb-8 max-w-5xl mx-auto space-y-6">
                
                {/* Custom Tabs Navigation */}
                <div className="flex space-x-2 p-1 bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm w-fit mx-auto md:mx-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                activeTab === tab.id 
                                ? 'bg-white text-indigo-600 shadow-[0_4px_15px_rgba(0,0,0,0.05)]' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden min-h-[500px]">
                    <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                                {tabs.find(t => t.id === activeTab)?.icon}
                                <span className="ml-1">{tabs.find(t => t.id === activeTab)?.label}</span>
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                Konfigurasi parameter {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 lg:p-10 relative">
                        <AnimatePresence mode="wait">
                            
                            {activeTab === 'umum' && (
                                <motion.div 
                                    key="umum"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={submitSettings} className="space-y-8">
                                        {/* Organisasi */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold border-b border-slate-100 pb-2 text-slate-800 flex items-center">
                                                <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                                                Identitas Sekolah
                                            </h3>
                                            <div className="space-y-3">
                                                <Label className="font-bold text-slate-700">Nama Sekolah / Instansi</Label>
                                                <Input 
                                                    value={settingData.school_name} 
                                                    onChange={e => setSettingData('school_name', e.target.value)} 
                                                    className={`rounded-xl bg-slate-50/50 focus:bg-white ${settingErrors.school_name ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                    placeholder="Contoh: SMK Manbaul Ulum"
                                                />
                                                {settingErrors.school_name && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.school_name}</p>}
                                            </div>
                                        </div>

                                        {/* Jam Kerja */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold border-b border-slate-100 pb-2 text-slate-800 flex items-center mt-8">
                                                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                                                Kebijakan Waktu Presensi
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-slate-700 flex flex-col">
                                                        <span>Jam Masuk</span>
                                                        <span className="text-[10px] font-normal text-slate-500 mt-0.5">(Khusus Pegawai Selain Guru)</span>
                                                    </Label>
                                                    <Input 
                                                        type="time" 
                                                        value={settingData.jam_masuk} 
                                                        onChange={e => setSettingData('jam_masuk', e.target.value)} 
                                                        className={`rounded-xl bg-white ${settingErrors.jam_masuk ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                    />
                                                    {settingErrors.jam_masuk && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.jam_masuk}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-slate-700 flex flex-col">
                                                        <span>Jam Keluar</span>
                                                        <span className="text-[10px] font-normal text-slate-500 mt-0.5">(Khusus Pegawai Selain Guru)</span>
                                                    </Label>
                                                    <Input 
                                                        type="time" 
                                                        value={settingData.jam_keluar} 
                                                        onChange={e => setSettingData('jam_keluar', e.target.value)} 
                                                        className={`rounded-xl bg-white ${settingErrors.jam_keluar ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                    />
                                                    {settingErrors.jam_keluar && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.jam_keluar}</p>}
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/30">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-rose-700 flex flex-col">
                                                        <span>Batas Waktu Maksimal Terlambat (Menit)</span>
                                                        <span className="text-[10px] font-normal text-rose-500/80 mt-0.5">(Berlaku mutlak untuk SELURUH Pegawai / Guru)</span>
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            value={settingData.batas_waktu_maksimal_terlambat} 
                                                            onChange={e => setSettingData('batas_waktu_maksimal_terlambat', e.target.value)} 
                                                            className={`rounded-xl bg-white font-bold w-24 ${settingErrors.batas_waktu_maksimal_terlambat ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-rose-200 focus-visible:ring-rose-500 text-rose-700'}`}
                                                        />
                                                        <span className="text-sm font-bold text-rose-700">Menit</span>
                                                    </div>
                                                    {settingErrors.batas_waktu_maksimal_terlambat && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.batas_waktu_maksimal_terlambat}</p>}
                                                    <p className="text-xs font-semibold text-rose-500 mt-2 flex items-center">
                                                        <SettingsIcon className="w-3 h-3 mr-1" />
                                                        Presensi melewati batas menit ini otomatis ditandai sebagai Terlambat.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-indigo-700 flex flex-col">
                                                        <span>Waktu Awal Presensi Masuk Dibuka (Menit Sebelum Jam Masuk)</span>
                                                        <span className="text-[10px] font-normal text-indigo-500/80 mt-0.5">(Menentukan seberapa awal pegawai dapat melakukan presensi masuk)</span>
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            value={settingData.buffer_presensi_masuk} 
                                                            onChange={e => setSettingData('buffer_presensi_masuk', e.target.value)} 
                                                            className={`rounded-xl bg-white font-bold w-24 ${settingErrors.buffer_presensi_masuk ? 'border-indigo-500 focus-visible:ring-indigo-500 text-indigo-700' : 'border-indigo-200 focus-visible:ring-indigo-500 text-indigo-700'}`}
                                                        />
                                                        <span className="text-sm font-bold text-indigo-700">Menit</span>
                                                    </div>
                                                    {settingErrors.buffer_presensi_masuk && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.buffer_presensi_masuk}</p>}
                                                    <p className="text-xs font-semibold text-indigo-500 mt-2 flex items-center">
                                                        <SettingsIcon className="w-3 h-3 mr-1" />
                                                        Contoh: Jika diatur 15 menit dan jam masuk 07:00, maka presensi dibuka mulai pukul 06:45.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-purple-700 flex flex-col">
                                                        <span>Batas Akhir Presensi Pulang (Menit Setelah Jam Keluar)</span>
                                                        <span className="text-[10px] font-normal text-purple-500/80 mt-0.5">(Menentukan batas maksimal waktu keterlambatan presensi pulang)</span>
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            value={settingData.buffer_presensi_keluar} 
                                                            onChange={e => setSettingData('buffer_presensi_keluar', e.target.value)} 
                                                            className={`rounded-xl bg-white font-bold w-24 ${settingErrors.buffer_presensi_keluar ? 'border-purple-500 focus-visible:ring-purple-500 text-purple-700' : 'border-purple-200 focus-visible:ring-purple-500 text-purple-700'}`}
                                                        />
                                                        <span className="text-sm font-bold text-purple-700">Menit</span>
                                                    </div>
                                                    {settingErrors.buffer_presensi_keluar && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.buffer_presensi_keluar}</p>}
                                                    <p className="text-xs font-semibold text-purple-500 mt-2 flex items-center">
                                                        <SettingsIcon className="w-3 h-3 mr-1" />
                                                        Contoh: Jika diatur 30 menit dan jam keluar 14:40, maka batas akhir presensi pulang adalah pukul 15:10.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30">
                                                <div className="space-y-3">
                                                    <Label className="font-bold text-amber-700 flex flex-col">
                                                        <span className="flex items-center"><Timer className="w-4 h-4 mr-1.5" /> Toleransi Keterlambatan Mengajar (Menit)</span>
                                                        <span className="text-[10px] font-normal text-amber-500/80 mt-0.5">(Grace period sebelum kelas dianggap kosong pada Bursa Inval)</span>
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input 
                                                            type="number" 
                                                            min="0"
                                                            value={settingData.teaching_late_tolerance} 
                                                            onChange={e => setSettingData('teaching_late_tolerance', e.target.value)} 
                                                            className={`rounded-xl bg-white font-bold w-24 ${settingErrors.teaching_late_tolerance ? 'border-rose-500 focus-visible:ring-rose-500 text-rose-700' : 'border-amber-200 focus-visible:ring-amber-500 text-amber-700'}`}
                                                        />
                                                        <span className="text-sm font-bold text-amber-700">Menit</span>
                                                    </div>
                                                    {settingErrors.teaching_late_tolerance && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.teaching_late_tolerance}</p>}
                                                    <p className="text-xs font-semibold text-amber-500 mt-2 flex items-center">
                                                        <SettingsIcon className="w-3 h-3 mr-1" />
                                                        Jika guru belum presensi mengajar setelah melebihi batas menit ini, kelas otomatis muncul di Bursa Inval.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Kebijakan Waktu Presensi Siswa-Siswi */}
                                            <div className="space-y-4 pt-4">
                                                <h3 className="text-lg font-bold border-b border-slate-100 pb-2 text-slate-800 flex items-center mt-4">
                                                    <Clock className="w-5 h-5 mr-2 text-emerald-500" />
                                                    Kebijakan Waktu Presensi Siswa-Siswi
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30">
                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-emerald-800 flex flex-col">
                                                            <span>Jam Masuk Siswa</span>
                                                            <span className="text-[10px] font-normal text-emerald-600 mt-0.5">(Standar Gerbang Masuk)</span>
                                                        </Label>
                                                        <Input 
                                                            type="time" 
                                                            value={settingData.student_jam_masuk} 
                                                            onChange={e => setSettingData('student_jam_masuk', e.target.value)} 
                                                            className={`rounded-xl bg-white ${settingErrors.student_jam_masuk ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-emerald-200'}`}
                                                        />
                                                        {settingErrors.student_jam_masuk && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.student_jam_masuk}</p>}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-emerald-800 flex flex-col">
                                                            <span>Batas Toleransi Terlambat</span>
                                                            <span className="text-[10px] font-normal text-emerald-600 mt-0.5">(Grace period keterlambatan)</span>
                                                        </Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Input 
                                                                type="number" 
                                                                min="0"
                                                                value={settingData.student_batas_terlambat_menit} 
                                                                onChange={e => setSettingData('student_batas_terlambat_menit', e.target.value)} 
                                                                className={`rounded-xl bg-white font-bold w-24 ${settingErrors.student_batas_terlambat_menit ? 'border-rose-500 focus-visible:ring-rose-500 text-rose-700' : 'border-emerald-200 text-emerald-800'}`}
                                                            />
                                                            <span className="text-sm font-bold text-emerald-800">Menit</span>
                                                        </div>
                                                        {settingErrors.student_batas_terlambat_menit && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.student_batas_terlambat_menit}</p>}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-emerald-800 flex flex-col">
                                                            <span>Jam Pulang Siswa</span>
                                                            <span className="text-[10px] font-normal text-emerald-600 mt-0.5">(Standar Gerbang Pulang)</span>
                                                        </Label>
                                                        <Input 
                                                            type="time" 
                                                            value={settingData.student_jam_pulang} 
                                                            onChange={e => setSettingData('student_jam_pulang', e.target.value)} 
                                                            className={`rounded-xl bg-white ${settingErrors.student_jam_pulang ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-emerald-200'}`}
                                                        />
                                                        {settingErrors.student_jam_pulang && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.student_jam_pulang}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Kebijakan Libur Kerja */}
                                            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <Label className="font-bold text-slate-700 flex flex-col text-base">
                                                            <span>Hitung Hari Libur sebagai Kehadiran (Hadir Kerja)</span>
                                                        </Label>
                                                        <p className="text-xs text-slate-500 font-semibold max-w-xl">
                                                            Jika diaktifkan, seluruh hari libur (nasional/sekolah) di luar Sabtu & Minggu akan otomatis dihitung hadir kerja pada rekapitulasi presensi. Jika dinonaktifkan, hari libur tidak akan dihitung hadir kerja.
                                                        </p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer ml-4">
                                                        <input 
                                                            type="checkbox" 
                                                            id="count_holidays_as_present"
                                                            checked={settingData.count_holidays_as_present}
                                                            onChange={e => setSettingData('count_holidays_as_present', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <label htmlFor="count_holidays_as_present" className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer"></label>
                                                    </div>
                                                </div>
                                                {settingErrors.count_holidays_as_present && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.count_holidays_as_present}</p>}
                                            </div>

                                            {/* Kebijakan Liveness Detection */}
                                            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <Label className="font-bold text-slate-700 flex flex-col text-base">
                                                            <span>Verifikasi Wajah Aktif (Liveness Detection)</span>
                                                        </Label>
                                                        <p className="text-xs text-slate-500 font-semibold max-w-xl">
                                                            Jika diaktifkan, pegawai wajib melakukan gerakan tengok kanan untuk verifikasi keaktifan wajah sebelum mengambil foto. Jika dinonaktifkan, pegawai dapat langsung berfoto selfie biasa.
                                                        </p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer ml-4">
                                                        <input 
                                                            type="checkbox" 
                                                            id="liveness_detection_enabled"
                                                            checked={settingData.liveness_detection_enabled}
                                                            onChange={e => setSettingData('liveness_detection_enabled', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <label htmlFor="liveness_detection_enabled" className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer"></label>
                                                    </div>
                                                </div>
                                                {settingErrors.liveness_detection_enabled && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.liveness_detection_enabled}</p>}
                                            </div>

                                            {/* Cutoff & Periode Rekap Presensi */}
                                            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-slate-700 flex flex-col text-base">
                                                        <span>Tipe Periode Rekap Presensi</span>
                                                    </Label>
                                                    <p className="text-xs text-slate-500 font-semibold">
                                                        Pilih bagaimana rentang tanggal bulanan untuk laporan rekapitulasi kehadiran dan jam tatap muka ditentukan.
                                                    </p>
                                                    <select
                                                        value={settingData.recap_cutoff_type}
                                                        onChange={e => setSettingData('recap_cutoff_type', e.target.value)}
                                                        className="w-full md:w-80 rounded-xl border border-slate-200 bg-white p-3 font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    >
                                                        <option value="calendar_month">Bulanan Penuh (Tanggal 1 s.d. Akhir Bulan)</option>
                                                        <option value="custom_date">Tanggal Cutoff Kustom (Siklus Bulanan Kustom)</option>
                                                    </select>
                                                    {settingErrors.recap_cutoff_type && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.recap_cutoff_type}</p>}
                                                </div>

                                                <AnimatePresence>
                                                    {settingData.recap_cutoff_type === 'custom_date' && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden space-y-3 pt-2"
                                                        >
                                                            <Label className="font-bold text-slate-700 flex flex-col">
                                                                <span>Tanggal Cutoff Presensi (1 - 28)</span>
                                                                <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                                                                    Contoh: Jika diatur tanggal 20, periode Juli 2026 akan dihitung dari 21 Juni s.d. 20 Juli.
                                                                </span>
                                                            </Label>
                                                            <div className="flex items-center space-x-2">
                                                                <Input 
                                                                    type="number" 
                                                                    min="1"
                                                                    max="28"
                                                                    value={settingData.recap_cutoff_day} 
                                                                    onChange={e => setSettingData('recap_cutoff_day', e.target.value)} 
                                                                    className={`rounded-xl bg-white font-bold w-24 ${settingErrors.recap_cutoff_day ? 'border-rose-500 focus-visible:ring-rose-500 text-rose-700' : 'border-slate-200 focus-visible:ring-indigo-500 text-slate-700'}`}
                                                                />
                                                                <span className="text-sm font-bold text-slate-600">Setiap Bulan</span>
                                                            </div>
                                                            {settingErrors.recap_cutoff_day && <p className="text-xs text-rose-500 font-bold mt-1">{settingErrors.recap_cutoff_day}</p>}
                                                            <p className="text-xs font-semibold text-amber-600 flex items-center bg-amber-50 border border-amber-100 p-3 rounded-lg">
                                                                ⚠️ Tanggal cutoff dibatasi dari 1 hingga 28 demi keselamatan perhitungan pada bulan Februari yang tidak memiliki tanggal 29, 30, atau 31.
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                                            <Button 
                                                type="submit" 
                                                disabled={processingSettings} 
                                                className="rounded-xl font-bold h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_10px_25px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5"
                                            >
                                                <Save className="w-5 h-5 mr-2" /> Simpan Pengaturan
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'libur' && (
                                <motion.div 
                                    key="libur"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-1">
                                            <div className="bg-slate-50/80 border border-slate-200 p-6 rounded-[1.5rem]">
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-6">
                                                    <CalendarPlus className="mr-2 h-5 w-5 text-indigo-500" />
                                                    Tambah Libur
                                                </h3>
                                                <form onSubmit={submitHoliday} className="space-y-5">
                                                    {/* Mode Switcher */}
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-slate-700">Tipe Input Hari Libur</Label>
                                                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
                                                            <button
                                                                type="button"
                                                                onClick={() => setHolidayData('mode', 'single')}
                                                                className={`py-2 text-xs font-bold rounded-lg transition-all ${holidayData.mode === 'single' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Satu Hari
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setHolidayData('mode', 'range')}
                                                                className={`py-2 text-xs font-bold rounded-lg transition-all ${holidayData.mode === 'range' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800'}`}
                                                            >
                                                                Rentang Tanggal
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {holidayData.mode === 'single' ? (
                                                        <div className="space-y-3">
                                                            <Label className="font-bold text-slate-700">Tanggal</Label>
                                                            <Input 
                                                                type="date" 
                                                                required
                                                                value={holidayData.date} 
                                                                onChange={e => setHolidayData('date', e.target.value)} 
                                                                className={`rounded-xl bg-white ${holidayErrors.date ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                            />
                                                            {holidayErrors.date && <p className="text-xs text-rose-500 font-bold mt-1">{holidayErrors.date}</p>}
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div className="space-y-3">
                                                                <Label className="font-bold text-slate-700">Tanggal Mulai</Label>
                                                                <Input 
                                                                    type="date" 
                                                                    required
                                                                    value={holidayData.start_date} 
                                                                    onChange={e => setHolidayData('start_date', e.target.value)} 
                                                                    className={`rounded-xl bg-white ${holidayErrors.start_date ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                                />
                                                                {holidayErrors.start_date && <p className="text-xs text-rose-500 font-bold mt-1">{holidayErrors.start_date}</p>}
                                                            </div>
                                                            <div className="space-y-3">
                                                                <Label className="font-bold text-slate-700">Tanggal Selesai</Label>
                                                                <Input 
                                                                    type="date" 
                                                                    required
                                                                    min={holidayData.start_date}
                                                                    value={holidayData.end_date} 
                                                                    onChange={e => setHolidayData('end_date', e.target.value)} 
                                                                    className={`rounded-xl bg-white ${holidayErrors.end_date ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                                />
                                                                {holidayErrors.end_date && <p className="text-xs text-rose-500 font-bold mt-1">{holidayErrors.end_date}</p>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <Label className="font-bold text-slate-700">Keterangan Libur</Label>
                                                        <Input 
                                                            placeholder="Contoh: Idul Fitri..."
                                                            required
                                                            value={holidayData.description} 
                                                            onChange={e => setHolidayData('description', e.target.value)} 
                                                            className={`rounded-xl bg-white ${holidayErrors.description ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                        />
                                                        {holidayErrors.description && <p className="text-xs text-rose-500 font-bold mt-1">{holidayErrors.description}</p>}
                                                    </div>
                                                    <div className="flex items-center space-x-3 pt-2 p-3 bg-white rounded-xl border border-slate-200">
                                                        <Checkbox 
                                                            id="is_national" 
                                                            checked={holidayData.is_national_holiday}
                                                            onCheckedChange={(checked) => setHolidayData('is_national_holiday', checked)}
                                                            className="w-5 h-5 rounded text-indigo-600"
                                                        />
                                                        <Label htmlFor="is_national" className="font-bold text-slate-700 cursor-pointer text-sm">
                                                            Libur Nasional (Tgl Merah)
                                                        </Label>
                                                    </div>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={processingHoliday} 
                                                        className="w-full rounded-xl font-bold h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition-all"
                                                    >
                                                        Tambahkan
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-[1.5rem] mb-6 flex items-start gap-3">
                                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
                                                    <CalendarDays className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-emerald-800 text-sm">Informasi Presensi</h4>
                                                    <p className="text-xs font-semibold text-emerald-600/80 mt-1">Pada hari libur yang tercatat, sistem akan otomatis mencatat status LIBUR bagi seluruh pegawai dan tidak menghitung ketidakhadiran pada rekap presensi bulanan.</p>
                                                </div>
                                            </div>

                                            {checkedHolidayIds.length > 0 && (
                                                <div className="flex justify-between items-center mb-4 bg-rose-50/50 border border-rose-100 p-3.5 rounded-2xl">
                                                    <span className="text-sm font-bold text-rose-700">Terpilih {checkedHolidayIds.length} hari libur</span>
                                                    <Button 
                                                        type="button"
                                                        onClick={handleBulkDeleteHolidays}
                                                        variant="outline" 
                                                        className="rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm h-10 px-4"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Hapus Terpilih
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden bg-white">
                                                <Table>
                                                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead className="w-12 px-6">
                                                                <Checkbox 
                                                                    checked={allHolidaysChecked}
                                                                    onCheckedChange={toggleAllHolidays}
                                                                    className="w-5 h-5 rounded text-indigo-600"
                                                                />
                                                            </TableHead>
                                                            <TableHead className="font-black text-slate-800 py-4">Tanggal</TableHead>
                                                            <TableHead className="font-black text-slate-800">Keterangan</TableHead>
                                                            <TableHead className="font-black text-slate-800">Jenis Libur</TableHead>
                                                            <TableHead className="font-black text-slate-800 text-right px-6">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {holidays && holidays.length > 0 ? (
                                                            holidays.map((holiday) => (
                                                                <TableRow key={holiday.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                                                    <TableCell className="px-6 py-4 w-12">
                                                                        <Checkbox 
                                                                            checked={checkedHolidayIds.includes(holiday.id)}
                                                                            onCheckedChange={() => toggleOneHoliday(holiday.id)}
                                                                            className="w-5 h-5 rounded text-indigo-600"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="font-bold text-slate-700 py-4">
                                                                        {new Date(holiday.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </TableCell>
                                                                    <TableCell className="font-semibold text-slate-600">
                                                                        {holiday.description}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {holiday.is_national_holiday ? 
                                                                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                                                                                Libur Nasional
                                                                            </span> : 
                                                                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                                                                                Kebijakan Sekolah
                                                                            </span>
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right px-6">
                                                                        <Button 
                                                                            type="button"
                                                                            variant="outline" 
                                                                            size="icon" 
                                                                            onClick={() => handleDeleteHoliday(holiday.id)}
                                                                            className="h-8 w-8 rounded-lg border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={5} className="text-center py-12">
                                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                                        <CalendarDays className="w-10 h-10 mb-3 text-slate-200" />
                                                                        <p className="font-bold text-slate-500">Belum ada data hari libur.</p>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'khusus' && (
                                <motion.div 
                                    key="khusus"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-6 lg:p-10 space-y-6"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-1">
                                            <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-200/80 space-y-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-base">Tambah Hari Kerja Khusus</h3>
                                                        <p className="text-xs text-slate-500 font-semibold">Acara sekolah / Lomba / Jam pulang khusus</p>
                                                    </div>
                                                </div>

                                                <form onSubmit={submitSpecialWorkday} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-slate-700">Tanggal Acara <span className="text-rose-500">*</span></Label>
                                                        <Input 
                                                            type="date" 
                                                            required
                                                            value={specialWorkdayData.date} 
                                                            onChange={e => setSpecialWorkdayData('date', e.target.value)} 
                                                            className={`rounded-xl bg-white ${specialWorkdayErrors.date ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                        />
                                                        {specialWorkdayErrors.date && <p className="text-xs text-rose-500 font-bold mt-1">{specialWorkdayErrors.date}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-slate-700">Nama Acara / Kegiatan <span className="text-rose-500">*</span></Label>
                                                        <Input 
                                                            placeholder="Contoh: Lomba Kemerdekaan RI..."
                                                            required
                                                            value={specialWorkdayData.name} 
                                                            onChange={e => setSpecialWorkdayData('name', e.target.value)} 
                                                            className={`rounded-xl bg-white ${specialWorkdayErrors.name ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                        />
                                                        {specialWorkdayErrors.name && <p className="text-xs text-rose-500 font-bold mt-1">{specialWorkdayErrors.name}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-slate-700">Jam Pulang Khusus <span className="text-rose-500">*</span></Label>
                                                        <Input 
                                                            type="time"
                                                            required
                                                            value={specialWorkdayData.jam_keluar} 
                                                            onChange={e => setSpecialWorkdayData('jam_keluar', e.target.value)} 
                                                            className={`rounded-xl bg-white ${specialWorkdayErrors.jam_keluar ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                                        />
                                                        <p className="text-[11px] font-semibold text-slate-400">Jam pulang khusus untuk presensi harian pada tanggal ini.</p>
                                                        {specialWorkdayErrors.jam_keluar && <p className="text-xs text-rose-500 font-bold mt-1">{specialWorkdayErrors.jam_keluar}</p>}
                                                    </div>

                                                    <div className="flex items-center space-x-3 pt-2 p-3 bg-white rounded-xl border border-slate-200">
                                                        <Checkbox 
                                                            id="disable_kbm" 
                                                            checked={specialWorkdayData.disable_kbm}
                                                            onCheckedChange={(checked) => setSpecialWorkdayData('disable_kbm', checked)}
                                                            className="w-5 h-5 rounded text-indigo-600"
                                                        />
                                                        <Label htmlFor="disable_kbm" className="font-bold text-slate-700 cursor-pointer text-sm">
                                                            Bebas KBM (Jadwal Mengajar Diliburkan)
                                                        </Label>
                                                    </div>

                                                    <Button 
                                                        type="submit" 
                                                        disabled={processingSpecialWorkday} 
                                                        className="w-full rounded-xl font-bold h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition-all"
                                                    >
                                                        Simpan Hari Kerja Khusus
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded-[1.5rem] mb-6 flex items-start gap-3">
                                                <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-amber-900 text-sm">Fungsi Hari Kerja Khusus</h4>
                                                    <p className="text-xs font-semibold text-amber-800/80 mt-1">
                                                        Digunakan untuk acara sekolah (seperti Lomba 17-an, Jalan Santai, dsb.) di mana pegawai/guru/karyawan tetap **Wajib Presensi Harian Masuk & Pulang**, namun jam pulang disesuaikan dan kegiatan KBM dapat dibebaskan tanpa dianggap *Kelas Kosong* / *Pulang Cepat*.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden bg-white">
                                                <Table>
                                                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead className="font-black text-slate-800 py-4 px-6">Tanggal</TableHead>
                                                            <TableHead className="font-black text-slate-800">Nama Acara</TableHead>
                                                            <TableHead className="font-black text-slate-800">Jam Pulang Khusus</TableHead>
                                                            <TableHead className="font-black text-slate-800">Status KBM</TableHead>
                                                            <TableHead className="font-black text-slate-800 text-right px-6">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {specialWorkdays && specialWorkdays.length > 0 ? (
                                                            specialWorkdays.map((sw) => (
                                                                <TableRow key={sw.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                                                    <TableCell className="font-bold text-slate-700 py-4 px-6">
                                                                        {new Date(sw.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </TableCell>
                                                                    <TableCell className="font-extrabold text-slate-800">
                                                                        {sw.name}
                                                                    </TableCell>
                                                                    <TableCell className="font-bold text-indigo-600">
                                                                        {sw.jam_keluar} WIB
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {sw.disable_kbm ? 
                                                                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                                                                KBM Diliburkan
                                                                            </span> : 
                                                                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                                                                KBM Berjalan
                                                                            </span>
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right px-6">
                                                                        <Button 
                                                                            type="button"
                                                                            variant="outline" 
                                                                            size="icon" 
                                                                            onClick={() => handleDeleteSpecialWorkday(sw.id)}
                                                                            className="h-8 w-8 rounded-lg border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={5} className="text-center py-12">
                                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                                        <Clock className="w-10 h-10 mb-3 text-slate-200" />
                                                                        <p className="font-bold text-slate-500">Belum ada data hari kerja khusus.</p>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
