import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Download, Calculator, Banknote, CalendarDays, Wallet, FileText, Send, Eye, CheckCircle, Search, Users, AlertCircle, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Index({ payrolls, summary, filters }) {
    const { data, setData, post, processing } = useForm({
        month: filters.month.toString(),
        year: filters.year.toString(),
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [tableMonth, setTableMonth] = useState(filters.month.toString());
    const [tableYear, setTableYear] = useState(filters.year.toString());

    const itemsPerPage = 50;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setTableMonth(filters.month.toString());
        setTableYear(filters.year.toString());
    }, [filters.month, filters.year]);

    const handleGenerate = (e) => {
        e.preventDefault();
        post(route('payroll.generate'), {
            onSuccess: () => {
                // Update table filters to match the generated month
                setTableMonth(data.month);
                setTableYear(data.year);
            }
        });
    };

    const handleFilterChange = (type, value) => {
        let newMonth = tableMonth;
        let newYear = tableYear;
        
        if (type === 'month') {
            newMonth = value;
            setTableMonth(value);
        } else if (type === 'year') {
            newYear = value;
            setTableYear(value);
        }

        router.get(route('payroll.index'), { month: newMonth, year: newYear }, { preserveState: true, preserveScroll: true });
    };

    const handleBulkApprove = () => {
        const ids = payrolls.filter(p => p.status === 'pending').map(p => p.id);
        if (ids.length > 0) {
            router.post(route('payroll.bulk-update-status'), { ids, status: 'paid' }, { preserveScroll: true });
        }
    };

    const [isBulkSending, setIsBulkSending] = useState(false);
    const handleBulkWhatsApp = () => {
        setIsBulkSending(true);
        router.post(route('payroll.whatsapp.bulk'), { month: tableMonth, year: tableYear }, { 
            preserveScroll: true,
            onFinish: () => setIsBulkSending(false)
        });
    };

    const handleSingleWhatsApp = (id) => {
        router.post(route('payroll.whatsapp', id), {}, { preserveScroll: true });
    };

    const filteredPayrolls = payrolls.filter(p => 
        p.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.employee?.position?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, tableMonth, tableYear]);

    const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
    const paginatedPayrolls = filteredPayrolls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
    };

    const months = [
        { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
        { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Banknote className="w-3 h-3 mr-1.5" />
                                Finance & Accounting
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Sistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Penggajian</span>
                        </h2>
                    </div>
                    {payrolls.some(p => p.status === 'pending') && (
                        <Button 
                            onClick={handleBulkApprove}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold px-6 shadow-lg shadow-slate-200"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Setujui Semua (Paid)
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Payroll" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pb-8"
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-blue-50 to-white overflow-hidden relative group transition-all hover:shadow-xl">
                            <div className="absolute right-0 top-0 opacity-5 transition-transform duration-500 group-hover:scale-110 translate-x-4 -translate-y-4">
                                <Users className="w-32 h-32 text-blue-600" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex flex-col space-y-4">
                                    <div className="p-3 bg-blue-500 text-white rounded-2xl w-max shadow-lg shadow-blue-500/30">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Total Pegawai</p>
                                        <p className="text-3xl font-black text-slate-900">{summary?.total_employees || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-emerald-50 to-white overflow-hidden relative group transition-all hover:shadow-xl">
                            <div className="absolute right-0 top-0 opacity-5 transition-transform duration-500 group-hover:scale-110 translate-x-4 -translate-y-4">
                                <Banknote className="w-32 h-32 text-emerald-600" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex flex-col space-y-4">
                                    <div className="p-3 bg-emerald-500 text-white rounded-2xl w-max shadow-lg shadow-emerald-500/30">
                                        <Banknote className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Gaji Bersih</p>
                                        <p className="text-2xl font-black text-slate-900 truncate" title={formatRupiah(summary?.total_net_salary || 0)}>{formatRupiah(summary?.total_net_salary || 0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-amber-50 to-white overflow-hidden relative group transition-all hover:shadow-xl">
                            <div className="absolute right-0 top-0 opacity-5 transition-transform duration-500 group-hover:scale-110 translate-x-4 -translate-y-4">
                                <AlertCircle className="w-32 h-32 text-amber-600" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex flex-col space-y-4">
                                    <div className="p-3 bg-amber-500 text-white rounded-2xl w-max shadow-lg shadow-amber-500/30">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Pending</p>
                                        <p className="text-3xl font-black text-slate-900">{summary?.total_pending || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative group transition-all hover:shadow-xl">
                            <div className="absolute right-0 top-0 opacity-5 transition-transform duration-500 group-hover:scale-110 translate-x-4 -translate-y-4">
                                <CheckCircle className="w-32 h-32 text-indigo-600" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex flex-col space-y-4">
                                    <div className="p-3 bg-indigo-500 text-white rounded-2xl w-max shadow-lg shadow-indigo-500/30">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Telah Dibayar</p>
                                        <p className="text-3xl font-black text-slate-900">{summary?.total_paid || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Generate Payroll Card */}
                    <div className="lg:col-span-4">
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                            <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10">
                                <Wallet className="w-64 h-64" />
                            </div>
                            <CardHeader className="relative z-10 p-8 pb-4">
                                <CardTitle className="text-2xl font-black flex items-center">
                                    <Calculator className="w-6 h-6 mr-3 text-emerald-400" />
                                    Generate Payroll Bulanan
                                </CardTitle>
                                <CardDescription className="text-slate-400 font-medium text-sm mt-2 max-w-2xl">
                                    Sistem akan secara otomatis menarik data kehadiran, jabatan, dan potongan untuk kalkulasi massal.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10 p-8 pt-0">
                                <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6">
                                    <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-end gap-4 w-full xl:w-auto bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md shadow-inner">
                                        <div className="space-y-2 w-full sm:w-48">
                                            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Periode Bulan</label>
                                            <Select value={data.month} onValueChange={v => setData('month', v)}>
                                                <SelectTrigger className="h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl focus:ring-emerald-500 font-bold">
                                                    <SelectValue placeholder="Pilih Bulan" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-700 bg-slate-800 text-white shadow-2xl">
                                                    {months.map(m => (
                                                        <SelectItem key={m.value} value={m.value} className="font-semibold focus:bg-emerald-500 focus:text-white cursor-pointer rounded-lg">
                                                            {m.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 w-full sm:w-32">
                                            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Tahun</label>
                                            <Input 
                                                type="number" 
                                                value={data.year} 
                                                onChange={e => setData('year', e.target.value)} 
                                                className="h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl focus-visible:ring-emerald-500 font-bold"
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            disabled={processing} 
                                            className="h-12 px-8 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
                                        >
                                            {processing ? 'Memproses...' : 'Generate Gaji'}
                                        </Button>
                                    </form>

                                    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl w-full xl:w-80 flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0"><Settings className="w-6 h-6" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-white mb-1">Cek Parameter Gaji</p>
                                            <Link href={route('salary-settings.index', { month: data.month, year: data.year })} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center">
                                                Lihat Pengaturan {months.find(m => m.value == data.month)?.label} <ChevronRight className="w-3 h-3 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payroll Table */}
                    <div className="lg:col-span-4">
                        <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <CardTitle className="text-xl font-black text-slate-900">Data Payroll Pegawai</CardTitle>
                                        <Button 
                                            onClick={handleBulkWhatsApp} 
                                            disabled={isBulkSending}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md font-bold h-8 px-3 text-xs"
                                        >
                                            <Send className="w-3 h-3 mr-2" />
                                            {isBulkSending ? 'Mengirim...' : 'Kirim WA Massal'}
                                        </Button>
                                    </div>
                                    <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                                        Menampilkan data periode {months.find(m => m.value == filters.month)?.label} {filters.year}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Select value={tableMonth} onValueChange={(v) => handleFilterChange('month', v)}>
                                            <SelectTrigger className="w-full sm:w-32 h-10 rounded-xl border-slate-200 bg-white font-semibold focus:ring-emerald-500">
                                                <SelectValue placeholder="Bulan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map(m => (
                                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input 
                                            type="number" 
                                            value={tableYear}
                                            onChange={(e) => handleFilterChange('year', e.target.value)}
                                            className="w-full sm:w-24 h-10 rounded-xl border-slate-200 bg-white font-semibold focus-visible:ring-emerald-500"
                                            placeholder="Tahun"
                                        />
                                    </div>
                                    <div className="relative w-full sm:w-48">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input 
                                            placeholder="Cari pegawai..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent border-b-slate-100">
                                                <TableHead className="font-black text-slate-900 px-6 lg:px-8 py-5">Pegawai & Jabatan</TableHead>
                                                <TableHead className="font-black text-slate-900">Penghasilan Bersih</TableHead>
                                                <TableHead className="font-black text-slate-900 text-center">Status</TableHead>
                                                <TableHead className="font-black text-slate-900 text-right px-6 lg:px-8">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {filteredPayrolls.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                                            Belum ada data payroll untuk periode ini. Silakan generate terlebih dahulu.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedPayrolls.map((p) => (
                                                        <motion.tr 
                                                            key={p.id}
                                                            layout
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="group hover:bg-slate-50/50 transition-colors border-b-slate-50"
                                                        >
                                                            <TableCell className="px-6 lg:px-8 py-4">
                                                                <div className="flex items-center space-x-4">
                                                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-black shadow-inner">
                                                                        {p.employee?.name ? p.employee.name.charAt(0) : 'U'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-900">{p.employee?.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.employee?.position?.name}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-black text-emerald-600">
                                                                    {formatRupiah(p.net_salary)}
                                                                </span>
                                                                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Gross Pay: <span className="font-bold">{formatRupiah(p.gross_salary)}</span></p>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${p.status === 'paid' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                                                                    {p.status === 'paid' ? 'Paid' : 'Pending'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="px-6 lg:px-8 text-right">
                                                                <div className="flex items-center justify-end space-x-2">
                                                                    <Link href={route('payroll.edit', p.id)}>
                                                                        <Button variant="outline" size="icon" title="Sesuaikan Gaji" className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100">
                                                                            <Calculator className="w-4 h-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={route('payroll.show', p.id)}>
                                                                        <Button variant="outline" size="icon" title="Lihat Detail Slip" className="h-9 w-9 rounded-xl">
                                                                            <Eye className="w-4 h-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    <a href={route('payroll.slip', p.id)} target="_blank">
                                                                        <Button variant="outline" size="icon" title="Download PDF" className="h-9 w-9 rounded-xl">
                                                                            <FileText className="w-4 h-4" />
                                                                        </Button>
                                                                    </a>
                                                                    <Button 
                                                                        onClick={() => handleSingleWhatsApp(p.id)}
                                                                        variant="outline" 
                                                                        size="icon" 
                                                                        title="Kirim ke WhatsApp" 
                                                                        className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                                    >
                                                                        <Send className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))
                                                )}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
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
                    </div>
                </div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
