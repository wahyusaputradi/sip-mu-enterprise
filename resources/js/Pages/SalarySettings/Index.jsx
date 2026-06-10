import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Settings, Globe, Users, FileBadge, Sparkles, Edit2, Search, Briefcase, Calculator, Building, ChevronRight, CalendarDays, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function SalarySettingsIndex({ globalSettings, positions, employees, filters, payrollCutoffStartDate, payrollCutoffEndDate, payrollPaydayDate }) {
    const [activeTab, setActiveTab] = useState('global');
    const [searchTerm, setSearchTerm] = useState('');
    const [importModal, setImportModal] = useState(null); // 'global', 'positions', 'employees'

    const importForm = useForm({ file: null });

    const submitImport = (e) => {
        e.preventDefault();
        const routeName = `salary-settings.import-${importModal}`;
        importForm.transform(data => ({ ...data, month: filters.month, year: filters.year }));
        importForm.post(route(routeName), {
            preserveScroll: true,
            onSuccess: () => {
                setImportModal(null);
                importForm.reset();
                toast.success("Data berhasil diimpor.");
            },
            onError: () => toast.error("Gagal mengimpor data, periksa format file.")
        });
    };

    // Global Form
    const globalForm = useForm({
        allowance_homeroom: globalSettings.allowance_homeroom,
        allowance_ekskul_osis: globalSettings.allowance_ekskul_osis,
        allowance_ekskul_polsis: globalSettings.allowance_ekskul_polsis,
        allowance_ekskul_pramuka: globalSettings.allowance_ekskul_pramuka,
        allowance_ekskul_seni: globalSettings.allowance_ekskul_seni,
        allowance_ekskul_paskibra: globalSettings.allowance_ekskul_paskibra,
        allowance_ekskul_rohis: globalSettings.allowance_ekskul_rohis,
        base_salary_per_hour: globalSettings.base_salary_per_hour,
        substitute_allowance_per_hour: globalSettings.substitute_allowance_per_hour,
        absence_deduction_per_hour: globalSettings.absence_deduction_per_hour,
    });

    useEffect(() => {
        globalForm.setData({
            allowance_homeroom: globalSettings.allowance_homeroom,
            allowance_ekskul_osis: globalSettings.allowance_ekskul_osis,
            allowance_ekskul_polsis: globalSettings.allowance_ekskul_polsis,
            allowance_ekskul_pramuka: globalSettings.allowance_ekskul_pramuka,
            allowance_ekskul_seni: globalSettings.allowance_ekskul_seni,
            allowance_ekskul_paskibra: globalSettings.allowance_ekskul_paskibra,
            allowance_ekskul_rohis: globalSettings.allowance_ekskul_rohis,
            base_salary_per_hour: globalSettings.base_salary_per_hour,
            substitute_allowance_per_hour: globalSettings.substitute_allowance_per_hour,
            absence_deduction_per_hour: globalSettings.absence_deduction_per_hour,
        });
    }, [globalSettings]);

    const submitGlobal = (e) => {
        e.preventDefault();
        globalForm.transform(data => ({ ...data, month: filters.month, year: filters.year }));
        globalForm.put(route('salary-settings.update-global'), { 
            preserveScroll: true,
            onError: () => toast.error("Gagal menyimpan pengaturan global, periksa isian Anda.")
        });
    };

    // Position Edit State
    const [editingPosition, setEditingPosition] = useState(null);
    const positionForm = useForm({ allowance_jabatan: '', allowance_transport: '' });

    const openEditPosition = (pos) => {
        setEditingPosition(pos);
        positionForm.setData({
            allowance_jabatan: pos.allowance_jabatan,
            allowance_transport: pos.allowance_transport,
        });
    };

    const submitPosition = (e) => {
        e.preventDefault();
        positionForm.transform(data => ({ ...data, month: filters.month, year: filters.year }));
        positionForm.put(route('salary-settings.update-position', editingPosition.id), {
            preserveScroll: true,
            onSuccess: () => setEditingPosition(null),
            onError: () => toast.error("Gagal menyimpan tunjangan jabatan.")
        });
    };

    // Employee Edit State
    const [editingEmployee, setEditingEmployee] = useState(null);
    const employeeForm = useForm({ bpjs_deduction: '', cooperative_deduction: '', school_loan: '', bmt_loan: '' });

    const openEditEmployee = (emp) => {
        setEditingEmployee(emp);
        employeeForm.setData({
            bpjs_deduction: emp.bpjs_deduction,
            cooperative_deduction: emp.cooperative_deduction,
            school_loan: emp.school_loan,
            bmt_loan: emp.bmt_loan,
        });
    };

    const submitEmployee = (e) => {
        e.preventDefault();
        employeeForm.transform(data => ({ ...data, month: filters.month, year: filters.year }));
        employeeForm.put(route('salary-settings.update-employee', editingEmployee.id), {
            preserveScroll: true,
            onSuccess: () => setEditingEmployee(null),
            onError: () => toast.error("Gagal menyimpan potongan pegawai.")
        });
    };

    // Period Date Form
    const periodDateForm = useForm({ 
        payroll_payday_date: payrollPaydayDate || 1,
        month: filters.month,
        year: filters.year
    });

    const cutoffForm = useForm({
        payroll_cutoff_start_date: payrollCutoffStartDate || 26,
        payroll_cutoff_end_date: payrollCutoffEndDate || 25,
        month: filters.month,
        year: filters.year
    });

    useEffect(() => {
        periodDateForm.setData({
            payroll_payday_date: payrollPaydayDate || 1,
            month: filters.month,
            year: filters.year
        });
    }, [payrollPaydayDate, filters.month, filters.year]);

    useEffect(() => {
        cutoffForm.setData({
            payroll_cutoff_start_date: payrollCutoffStartDate || 26,
            payroll_cutoff_end_date: payrollCutoffEndDate || 25,
            month: filters.month,
            year: filters.year
        });
    }, [payrollCutoffStartDate, payrollCutoffEndDate, filters.month, filters.year]);

    const submitPeriodDate = (e) => {
        e.preventDefault();
        periodDateForm.put(route('salary-settings.update-period-date'), { 
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => alert("Tanggal Payday berhasil diperbarui!"),
            onError: (errors) => alert("Gagal menyimpan: " + JSON.stringify(errors))
        });
    };

    const submitCutoffDate = (e) => {
        e.preventDefault();
        cutoffForm.put(route('salary-settings.update-cutoff-date'), { 
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => alert("Jadwal Cut-off Presensi berhasil diperbarui!"),
            onError: (errors) => alert("Gagal menyimpan: " + JSON.stringify(errors))
        });
    };

    const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPositions = positions.filter(pos => pos.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const fieldStyle = "rounded-xl border-slate-200 h-11 font-semibold shadow-sm focus-visible:ring-indigo-500 transition-all duration-200";

    const handleFilterChange = (key, value) => {
        router.get(route('salary-settings.index'), {
            month: key === 'month' ? value : filters.month,
            year: key === 'year' ? value : filters.year
        }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Settings className="w-3 h-3 mr-1.5" />
                                Master Data Finansial
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Pengaturan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Gaji</span>
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60">
                        <select 
                            value={filters.month} 
                            onChange={e => handleFilterChange('month', e.target.value)}
                            className="h-10 border-none bg-slate-50 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select 
                            value={filters.year} 
                            onChange={e => handleFilterChange('year', e.target.value)}
                            className="h-10 border-none bg-slate-50 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            {[...Array(5)].map((_, i) => {
                                const y = new Date().getFullYear() - 2 + i;
                                return <option key={y} value={y}>{y}</option>
                            })}
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Gaji" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="pb-12 space-y-8">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
                        <div className="absolute -right-6 -top-6 opacity-20"><Globe className="w-32 h-32" /></div>
                        <CardContent className="p-8 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-indigo-100 font-bold mb-1">Total Parameter Global</p>
                                    <h3 className="text-4xl font-black">10</h3>
                                </div>
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><Calculator className="w-6 h-6 text-white" /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all">
                        <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity"><Building className="w-32 h-32 text-indigo-600" /></div>
                        <CardContent className="p-8 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-bold mb-1">Struktur Jabatan</p>
                                    <h3 className="text-4xl font-black text-slate-900">{positions.length}</h3>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-2xl"><Briefcase className="w-6 h-6 text-indigo-600" /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(244,63,94,0.1)] transition-all">
                        <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="w-32 h-32 text-rose-600" /></div>
                        <CardContent className="p-8 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-500 font-bold mb-1">Total Pegawai</p>
                                    <h3 className="text-4xl font-black text-slate-900">{employees.length}</h3>
                                </div>
                                <div className="p-3 bg-rose-50 rounded-2xl"><Users className="w-6 h-6 text-rose-600" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payroll Period Date Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-6">
                            <form onSubmit={submitCutoffDate} className="flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 shrink-0">
                                        <CalendarDays className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">Cut-Off Kehadiran</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Rentang tanggal untuk menarik data presensi, izin, cuti, dan jam mengajar.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <Label htmlFor="payroll_cutoff_start_date" className="text-sm font-bold text-slate-700 mb-1 block">Tanggal Mulai</Label>
                                        <select
                                            id="payroll_cutoff_start_date"
                                            value={cutoffForm.data.payroll_cutoff_start_date}
                                            onChange={e => cutoffForm.setData('payroll_cutoff_start_date', parseInt(e.target.value))}
                                            className="h-11 w-full border-slate-200 bg-slate-50/50 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 cursor-pointer"
                                        >
                                            {[...Array(31)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Tanggal {i + 1}</option>
                                            ))}
                                        </select>
                                        {cutoffForm.errors.payroll_cutoff_start_date && <p className="text-rose-500 text-xs font-bold mt-1">{cutoffForm.errors.payroll_cutoff_start_date}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="payroll_cutoff_end_date" className="text-sm font-bold text-slate-700 mb-1 block">Tanggal Akhir</Label>
                                        <select
                                            id="payroll_cutoff_end_date"
                                            value={cutoffForm.data.payroll_cutoff_end_date}
                                            onChange={e => cutoffForm.setData('payroll_cutoff_end_date', parseInt(e.target.value))}
                                            className="h-11 w-full border-slate-200 bg-slate-50/50 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 cursor-pointer"
                                        >
                                            {[...Array(31)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Tanggal {i + 1}</option>
                                            ))}
                                        </select>
                                        {cutoffForm.errors.payroll_cutoff_end_date && <p className="text-rose-500 text-xs font-bold mt-1">{cutoffForm.errors.payroll_cutoff_end_date}</p>}
                                    </div>
                                </div>
                                <Button type="submit" disabled={cutoffForm.processing} className="mt-auto w-full rounded-xl font-bold h-11 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200">
                                    {cutoffForm.processing ? 'Menyimpan...' : 'Simpan Cut-Off'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-6">
                            <form onSubmit={submitPeriodDate} className="flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 shrink-0">
                                        <CalendarDays className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">Jadwal Payday</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Hari di mana perusahaan mentransfer atau membayarkan gaji ke rekening pegawai.</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <Label htmlFor="payroll_payday_date" className="text-sm font-bold text-slate-700 mb-1 block">Tanggal Pembayaran (Gajian)</Label>
                                    <select
                                        id="payroll_payday_date"
                                        value={periodDateForm.data.payroll_payday_date}
                                        onChange={e => periodDateForm.setData('payroll_payday_date', parseInt(e.target.value))}
                                        className="h-11 w-full border-slate-200 bg-slate-50/50 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                    >
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>Tanggal {i + 1}</option>
                                        ))}
                                    </select>
                                    {periodDateForm.errors.payroll_payday_date && <p className="text-rose-500 text-xs font-bold mt-1">{periodDateForm.errors.payroll_payday_date}</p>}
                                </div>
                                <Button type="submit" disabled={periodDateForm.processing} className="mt-auto w-full rounded-xl font-bold h-11 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200">
                                    {periodDateForm.processing ? 'Menyimpan...' : 'Simpan Payday'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Custom Tabs Navigation */}
                <div className="flex space-x-2 p-1 bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm w-fit mx-auto md:mx-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('global')}
                        className={`flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            activeTab === 'global' 
                            ? 'bg-white text-indigo-600 shadow-[0_4px_15px_rgba(0,0,0,0.05)]' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Globe className="w-4 h-4 mr-2" /> Global System
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('positions')}
                        className={`flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            activeTab === 'positions' 
                            ? 'bg-white text-indigo-600 shadow-[0_4px_15px_rgba(0,0,0,0.05)]' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <FileBadge className="w-4 h-4 mr-2" /> Tunjangan Jabatan
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('employees')}
                        className={`flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            activeTab === 'employees' 
                            ? 'bg-white text-indigo-600 shadow-[0_4px_15px_rgba(0,0,0,0.05)]' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Users className="w-4 h-4 mr-2" /> Potongan Pegawai
                    </button>
                </div>

                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden min-h-[400px]">
                    <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            {activeTab === 'global' && (
                                <>
                                    <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                                        <Globe className="w-5 h-5 mr-2 text-indigo-600" /> Parameter Global
                                    </CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Mengatur tunjangan yang berlaku seragam untuk semua pegawai</CardDescription>
                                </>
                            )}
                            {activeTab === 'positions' && (
                                <>
                                    <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                                        <FileBadge className="w-5 h-5 mr-2 text-indigo-600" /> Berdasarkan Jabatan
                                    </CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Atur gaji pokok dan tunjangan secara massal</CardDescription>
                                </>
                            )}
                            {activeTab === 'employees' && (
                                <>
                                    <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-rose-600" /> Potongan Khusus Pegawai
                                    </CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Atur potongan unik per individu</CardDescription>
                                </>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {activeTab === 'global' && (
                                <>
                                    <a href={route('salary-settings.export-global', { month: filters.month, year: filters.year })} className="flex items-center px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export
                                    </a>
                                    <Button onClick={() => setImportModal('global')} variant="outline" size="sm" className="h-8 flex items-center px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Import
                                    </Button>
                                    <a href={route('salary-settings.template-global')} className="flex items-center px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors">
                                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Template
                                    </a>
                                </>
                            )}
                            {activeTab === 'positions' && (
                                <>
                                    <a href={route('salary-settings.export-positions', { month: filters.month, year: filters.year })} className="flex items-center px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export
                                    </a>
                                    <Button onClick={() => setImportModal('positions')} variant="outline" size="sm" className="h-8 flex items-center px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Import
                                    </Button>
                                    <a href={route('salary-settings.template-positions')} className="flex items-center px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors">
                                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Template
                                    </a>
                                </>
                            )}
                            {activeTab === 'employees' && (
                                <>
                                    <a href={route('salary-settings.export-employees', { month: filters.month, year: filters.year })} className="flex items-center px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export
                                    </a>
                                    <Button onClick={() => setImportModal('employees')} variant="outline" size="sm" className="h-8 flex items-center px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Import
                                    </Button>
                                    <a href={route('salary-settings.template-employees')} className="flex items-center px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors">
                                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Template
                                    </a>
                                </>
                            )}
                            
                            {(activeTab === 'employees' || activeTab === 'positions') && (
                                <div className="relative ml-0 sm:ml-2 mt-2 sm:mt-0 w-full sm:w-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                                        className="pl-9 h-8 w-full sm:w-48 rounded-lg border-slate-200 font-semibold bg-white text-xs"
                                        placeholder={activeTab === 'employees' ? "Cari pegawai..." : "Cari jabatan..."} 
                                    />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    
                    <CardContent className={activeTab === 'global' ? 'p-6 sm:p-8' : 'p-0'}>
                        <AnimatePresence mode="wait">
                            {/* TAB 1: GLOBAL SETTINGS */}
                            {activeTab === 'global' && (
                                <motion.div key="global" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                    <form onSubmit={submitGlobal} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Tunjangan Tambahan (Tugas) */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Tunjangan Pembina Ekskul & Kelas</h3>
                                                <div className="space-y-3">
                                                    <Label htmlFor="allowance_homeroom" className="font-bold text-slate-700">Wali Kelas (Rp)</Label>
                                                    <Input id="allowance_homeroom" type="number" value={globalForm.data.allowance_homeroom} onChange={e => globalForm.setData('allowance_homeroom', e.target.value)} className={`${fieldStyle} font-mono text-emerald-700 bg-slate-50/50`} />
                                                    {globalForm.errors.allowance_homeroom && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.allowance_homeroom}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="allowance_ekskul_osis" className="font-bold text-slate-700">Pembina OSIS (Rp)</Label>
                                                    <Input id="allowance_ekskul_osis" type="number" value={globalForm.data.allowance_ekskul_osis} onChange={e => globalForm.setData('allowance_ekskul_osis', e.target.value)} className={`${fieldStyle} font-mono text-emerald-700 bg-slate-50/50`} />
                                                    {globalForm.errors.allowance_ekskul_osis && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.allowance_ekskul_osis}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="allowance_ekskul_polsis" className="font-bold text-slate-700">Pembina Polsis (Rp)</Label>
                                                    <Input id="allowance_ekskul_polsis" type="number" value={globalForm.data.allowance_ekskul_polsis} onChange={e => globalForm.setData('allowance_ekskul_polsis', e.target.value)} className={`${fieldStyle} font-mono text-emerald-700 bg-slate-50/50`} />
                                                    {globalForm.errors.allowance_ekskul_polsis && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.allowance_ekskul_polsis}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="allowance_ekskul_pramuka" className="font-bold text-slate-700">Pembina Pramuka (Rp)</Label>
                                                    <Input id="allowance_ekskul_pramuka" type="number" value={globalForm.data.allowance_ekskul_pramuka} onChange={e => globalForm.setData('allowance_ekskul_pramuka', e.target.value)} className={`${fieldStyle} font-mono text-emerald-700 bg-slate-50/50`} />
                                                    {globalForm.errors.allowance_ekskul_pramuka && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.allowance_ekskul_pramuka}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="allowance_ekskul_seni" className="font-bold text-slate-700">Pembina Seni & Bahasa (Rp)</Label>
                                                    <Input id="allowance_ekskul_seni" type="number" value={globalForm.data.allowance_ekskul_seni} onChange={e => globalForm.setData('allowance_ekskul_seni', e.target.value)} className={`${fieldStyle} font-mono text-emerald-700 bg-slate-50/50`} />
                                                    {globalForm.errors.allowance_ekskul_seni && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.allowance_ekskul_seni}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="allowance_ekskul_paskibra" className="font-bold text-slate-700">Pembina Paskibra (Rp)</Label>
                                                    <Input id="allowance_ekskul_paskibra" type="number" value={globalForm.data.allowance_ekskul_paskibra} onChange={e => globalForm.setData('allowance_ekskul_paskibra', e.target.value)} className={`${fieldStyle} font-mono text-emerald-700 bg-slate-50/50`} />
                                                    {globalForm.errors.allowance_ekskul_paskibra && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.allowance_ekskul_paskibra}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="allowance_ekskul_rohis" className="font-bold text-slate-700">Pembina Rohis (Rp)</Label>
                                                    <Input id="allowance_ekskul_rohis" type="number" value={globalForm.data.allowance_ekskul_rohis} onChange={e => globalForm.setData('allowance_ekskul_rohis', e.target.value)} className={`${fieldStyle} font-mono text-emerald-700 bg-slate-50/50`} />
                                                    {globalForm.errors.allowance_ekskul_rohis && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.allowance_ekskul_rohis}</p>}
                                                </div>
                                            </div>

                                            {/* Tarif Gaji & Potongan */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Tarif Dasar (Per Jam)</h3>
                                                <div className="space-y-3">
                                                    <Label htmlFor="base_salary_per_hour" className="font-bold text-slate-700">Tarif Gaji Pokok (Rp/Jam)</Label>
                                                    <Input id="base_salary_per_hour" type="number" value={globalForm.data.base_salary_per_hour} onChange={e => globalForm.setData('base_salary_per_hour', e.target.value)} className={`${fieldStyle} font-mono text-indigo-700 bg-slate-50/50`} />
                                                    <p className="text-xs text-slate-500">Dikalikan total jam mengajar aktual.</p>
                                                    {globalForm.errors.base_salary_per_hour && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.base_salary_per_hour}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="substitute_allowance_per_hour" className="font-bold text-slate-700">Tarif Insentif Jam Ganti (Rp/Jam)</Label>
                                                    <Input id="substitute_allowance_per_hour" type="number" value={globalForm.data.substitute_allowance_per_hour} onChange={e => globalForm.setData('substitute_allowance_per_hour', e.target.value)} className={`${fieldStyle} font-mono text-indigo-700 bg-slate-50/50`} />
                                                    <p className="text-xs text-slate-500">Gaji bagi guru pengganti (Inval).</p>
                                                    {globalForm.errors.substitute_allowance_per_hour && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.substitute_allowance_per_hour}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="absence_deduction_per_hour" className="font-bold text-slate-700">Tarif Potongan Absensi/Alpha (Rp/Jam)</Label>
                                                    <Input id="absence_deduction_per_hour" type="number" value={globalForm.data.absence_deduction_per_hour} onChange={e => globalForm.setData('absence_deduction_per_hour', e.target.value)} className={`${fieldStyle} font-mono text-rose-600 bg-slate-50/50`} />
                                                    <p className="text-xs text-slate-500">Dikalikan total jam tidak hadir tanpa keterangan.</p>
                                                    {globalForm.errors.absence_deduction_per_hour && <p className="text-rose-500 text-xs font-bold">{globalForm.errors.absence_deduction_per_hour}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                            <Button type="submit" disabled={globalForm.processing} className="rounded-xl font-bold h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                                                {globalForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan Global'}
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* TAB 2: POSITION BASED */}
                            {activeTab === 'positions' && (
                                <motion.div key="positions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                                <TableRow>
                                                    <TableHead className="font-black text-slate-900 px-6 py-5">Jabatan</TableHead>
                                                    <TableHead className="font-black text-slate-900 hidden md:table-cell">T. Jabatan</TableHead>
                                                    <TableHead className="font-black text-slate-900 hidden md:table-cell">T. Transport</TableHead>
                                                    <TableHead className="font-black text-slate-900 text-center">Pegawai</TableHead>
                                                    <TableHead className="font-black text-slate-900 text-right px-6">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredPositions.length > 0 ? filteredPositions.map(pos => (
                                                    <TableRow key={pos.id} className="hover:bg-slate-50/80 transition-colors cursor-default group border-b border-slate-50/50">
                                                        <TableCell className="px-6 py-5">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                                                    <Briefcase className="w-5 h-5 text-indigo-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{pos.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell font-mono text-indigo-600 font-semibold">{formatRupiah(pos.allowance_jabatan)}</TableCell>
                                                        <TableCell className="hidden md:table-cell font-mono text-indigo-600 font-semibold">{formatRupiah(pos.allowance_transport)}</TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="inline-flex items-center text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{pos.employees_count} Orang</span>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <Button onClick={() => openEditPosition(pos)} variant="outline" size="sm" className="h-8 rounded-lg font-bold border-slate-200 text-indigo-600 hover:bg-indigo-50">
                                                                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-medium">Tidak ada jabatan yang sesuai pencarian.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB 3: EMPLOYEES BASED */}
                            {activeTab === 'employees' && (
                                <motion.div key="employees" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                                <TableRow>
                                                    <TableHead className="font-black text-slate-900 px-6 py-5">Profil Pegawai</TableHead>
                                                    <TableHead className="font-black text-slate-900 hidden md:table-cell">Jabatan</TableHead>
                                                    <TableHead className="font-black text-slate-900 hidden lg:table-cell">Potongan BPJS</TableHead>
                                                    <TableHead className="font-black text-slate-900 hidden sm:table-cell">Total Pinjaman</TableHead>
                                                    <TableHead className="font-black text-slate-900 text-right px-6">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredEmployees.map(emp => {
                                                    const totalPinjaman = parseFloat(emp.school_loan||0) + parseFloat(emp.bmt_loan||0) + parseFloat(emp.cooperative_deduction||0);
                                                    return (
                                                    <TableRow key={emp.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50/50">
                                                        <TableCell className="px-6 py-5">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                    {emp.photo_path ? (
                                                                        <img src={emp.photo_url} alt={emp.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-slate-400 font-bold text-base sm:text-lg">{emp.name.charAt(0)}</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{emp.name}</p>
                                                                    <p className="text-xs font-semibold text-slate-500 font-mono mt-0.5">{emp.nik || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md text-xs border border-indigo-100">
                                                                {emp.position?.name || '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell font-mono text-rose-600 font-semibold">{formatRupiah(emp.bpjs_deduction)}</TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <span className="font-mono text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-md text-xs border border-rose-100">
                                                                {formatRupiah(totalPinjaman)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <Button onClick={() => openEditEmployee(emp)} variant="outline" size="sm" className="h-8 rounded-lg font-bold border-slate-200 text-indigo-600 hover:bg-indigo-50">
                                                                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Potongan
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )})}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Position Edit Modal */}
            <Dialog open={!!editingPosition} onOpenChange={open => !open && setEditingPosition(null)}>
                <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white relative">
                        <div className="absolute -right-8 -top-8 opacity-20"><Sparkles className="w-32 h-32" /></div>
                        <DialogTitle className="text-xl font-black relative z-10">Tunjangan Jabatan</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium mt-1 relative z-10">Jabatan: <span className="font-bold text-white">{editingPosition?.name}</span></DialogDescription>
                    </div>
                    <form onSubmit={submitPosition} className="p-6 bg-slate-50 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="allowance_jabatan" className="font-bold text-slate-700">Tunjangan Jabatan (Rp)</Label>
                            <Input id="allowance_jabatan" type="number" value={positionForm.data.allowance_jabatan} onChange={e => positionForm.setData('allowance_jabatan', e.target.value)} className={`${fieldStyle} font-mono text-indigo-700`} />
                            {positionForm.errors.allowance_jabatan && <p className="text-rose-500 text-xs font-bold">{positionForm.errors.allowance_jabatan}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="allowance_transport" className="font-bold text-slate-700">Tunjangan Transportasi (Rp)</Label>
                            <Input id="allowance_transport" type="number" value={positionForm.data.allowance_transport} onChange={e => positionForm.setData('allowance_transport', e.target.value)} className={`${fieldStyle} font-mono text-indigo-700`} />
                            {positionForm.errors.allowance_transport && <p className="text-rose-500 text-xs font-bold">{positionForm.errors.allowance_transport}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                            <Button type="button" variant="outline" onClick={() => setEditingPosition(null)} className="rounded-xl font-bold h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={positionForm.processing} className="rounded-xl font-bold h-11 px-8 bg-indigo-600 text-white hover:bg-indigo-700">Simpan</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Employee Edit Modal */}
            <Dialog open={!!editingEmployee} onOpenChange={open => !open && setEditingEmployee(null)}>
                <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-6 text-white relative">
                        <div className="absolute -right-8 -top-8 opacity-20"><Sparkles className="w-32 h-32" /></div>
                        <DialogTitle className="text-xl font-black relative z-10">Potongan Pribadi</DialogTitle>
                        <DialogDescription className="text-rose-100 font-medium mt-1 relative z-10">Pegawai: <span className="font-bold text-white">{editingEmployee?.name}</span></DialogDescription>
                    </div>
                    <form onSubmit={submitEmployee} className="p-6 bg-slate-50 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bpjs" className="font-bold text-slate-700">Potongan BPJS (Rp)</Label>
                            <Input id="bpjs" type="number" value={employeeForm.data.bpjs_deduction} onChange={e => employeeForm.setData('bpjs_deduction', e.target.value)} className={`${fieldStyle} font-mono text-rose-600`} />
                            {employeeForm.errors.bpjs_deduction && <p className="text-rose-500 text-xs font-bold">{employeeForm.errors.bpjs_deduction}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="koperasi" className="font-bold text-slate-700">Potongan Koperasi (Rp)</Label>
                            <Input id="koperasi" type="number" value={employeeForm.data.cooperative_deduction} onChange={e => employeeForm.setData('cooperative_deduction', e.target.value)} className={`${fieldStyle} font-mono text-rose-600`} />
                            {employeeForm.errors.cooperative_deduction && <p className="text-rose-500 text-xs font-bold">{employeeForm.errors.cooperative_deduction}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sekolah" className="font-bold text-slate-700">Pinjaman Sekolah (Rp)</Label>
                            <Input id="sekolah" type="number" value={employeeForm.data.school_loan} onChange={e => employeeForm.setData('school_loan', e.target.value)} className={`${fieldStyle} font-mono text-rose-600`} />
                            {employeeForm.errors.school_loan && <p className="text-rose-500 text-xs font-bold">{employeeForm.errors.school_loan}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bmt" className="font-bold text-slate-700">Pinjaman BMT (Rp)</Label>
                            <Input id="bmt" type="number" value={employeeForm.data.bmt_loan} onChange={e => employeeForm.setData('bmt_loan', e.target.value)} className={`${fieldStyle} font-mono text-rose-600`} />
                            {employeeForm.errors.bmt_loan && <p className="text-rose-500 text-xs font-bold">{employeeForm.errors.bmt_loan}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                            <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)} className="rounded-xl font-bold h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={employeeForm.processing} className="rounded-xl font-bold h-11 px-8 bg-rose-600 text-white hover:bg-rose-700">Simpan</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Import Modal */}
            <Dialog open={!!importModal} onOpenChange={open => !open && setImportModal(null)}>
                <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white relative">
                        <div className="absolute -right-8 -top-8 opacity-20"><Upload className="w-32 h-32" /></div>
                        <DialogTitle className="text-xl font-black relative z-10">Import Data Excel</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium mt-1 relative z-10">
                            Pilih file Excel yang telah diisi sesuai template untuk bulan {filters.month}/{filters.year}.
                        </DialogDescription>
                    </div>
                    <form onSubmit={submitImport} className="p-6 bg-slate-50 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file" className="font-bold text-slate-700">Pilih File (.xlsx, .xls)</Label>
                            <Input 
                                id="file" 
                                type="file" 
                                accept=".xlsx,.xls"
                                onChange={e => importForm.setData('file', e.target.files[0])} 
                                className={`${fieldStyle} cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`} 
                            />
                            {importForm.errors.file && <p className="text-rose-500 text-xs font-bold">{importForm.errors.file}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                            <Button type="button" variant="outline" onClick={() => setImportModal(null)} className="rounded-xl font-bold h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={importForm.processing} className="rounded-xl font-bold h-11 px-8 bg-indigo-600 text-white hover:bg-indigo-700">Upload</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
