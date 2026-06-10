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

export default function Index({ settings, holidays }) {
    const { data: settingData, setData: setSettingData, post: postSettings, processing: processingSettings, errors: settingErrors } = useForm({
        school_name: settings.school_name || 'SMK Manbaul Ulum Cirebon',
        jam_masuk: settings.jam_masuk || '07:00',
        jam_keluar: settings.jam_keluar || '14:40',
        batas_waktu_maksimal_terlambat: settings.batas_waktu_maksimal_terlambat || '10',
        teaching_late_tolerance: settings.teaching_late_tolerance || '15',
    });

    const { data: holidayData, setData: setHolidayData, post: postHoliday, reset: resetHoliday, processing: processingHoliday, errors: holidayErrors } = useForm({
        date: '',
        description: '',
        is_national_holiday: true,
    });

    const [activeTab, setActiveTab] = useState('umum');

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

    const handleDeleteHoliday = (id) => {
        if(confirm('Hapus hari libur ini?')) {
            router.delete(route('holidays.destroy', id), {
                onSuccess: () => toast.success("Hari libur berhasil dihapus.")
            });
        }
    };

    const tabs = [
        { id: 'umum', label: 'Konfigurasi Umum', icon: <SettingsIcon className="w-4 h-4 mr-2" /> },
        { id: 'libur', label: 'Manajemen Hari Libur', icon: <CalendarDays className="w-4 h-4 mr-2" /> },
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
                                                        className="w-full rounded-xl font-bold h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
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
                                                    <h4 className="font-bold text-emerald-800 text-sm">Informasi Payroll</h4>
                                                    <p className="text-xs font-semibold text-emerald-600/80 mt-1">Pada hari libur yang tercatat, sistem akan otomatis mencatat status HADIR penuh bagi seluruh pegawai pada perhitungan gaji bulanan.</p>
                                                </div>
                                            </div>

                                            <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden bg-white">
                                                <Table>
                                                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead className="font-black text-slate-800 py-4 px-6">Tanggal</TableHead>
                                                            <TableHead className="font-black text-slate-800">Keterangan</TableHead>
                                                            <TableHead className="font-black text-slate-800">Jenis Libur</TableHead>
                                                            <TableHead className="font-black text-slate-800 text-right px-6">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {holidays && holidays.length > 0 ? (
                                                            holidays.map((holiday) => (
                                                                <TableRow key={holiday.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                                                    <TableCell className="font-bold text-slate-700 px-6 py-4">
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
                                                                <TableCell colSpan={4} className="text-center py-12">
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
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
