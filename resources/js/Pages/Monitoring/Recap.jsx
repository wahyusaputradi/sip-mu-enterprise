import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Calendar, 
    Download, 
    Search, 
    Users, 
    CheckCircle2, 
    AlertTriangle, 
    FileText, 
    ClipboardList,
    Clock,
    XCircle,
    GraduationCap,
    Briefcase,
    ShieldAlert,
    Thermometer,
    UserX,
    FileSpreadsheet,
    Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Recap({ recapData, totalStats, filters, periodLabel }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [role, setRole] = useState(filters.role || 'all');

    const itemsPerPage = 50;
    const [currentPage, setCurrentPage] = useState(1);

    const handleFilterChange = () => {
        router.get(route('attendance.recap'), { month, year, role }, { preserveState: true, preserveScroll: true });
    };

    const handleExportExcel = () => {
        window.location.href = route('attendance.recap.export-excel', { month, year, role });
    };

    const handleExportPdf = () => {
        window.location.href = route('attendance.recap.export-pdf', { month, year, role });
    };

    useEffect(() => {
        handleFilterChange();
    }, [month, year, role]);

    const filteredData = recapData.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.nik && item.nik.includes(searchTerm))
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, month, year, role]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Monitoring-style gradient cards (same colors as Monitoring/Attendance.jsx)
    const summaryCards = [
        { label: 'Total Hadir', value: totalStats.present, icon: <CheckCircle2 className="w-28 h-28" />, gradient: 'from-emerald-500 to-teal-600', lightText: 'text-emerald-100' },
        { label: 'Terlambat', value: totalStats.late, icon: <AlertTriangle className="w-28 h-28" />, gradient: 'from-amber-500 to-orange-500', lightText: 'text-amber-100' },
        { label: 'Total Izin', value: totalStats.permit, icon: <ShieldAlert className="w-28 h-28" />, gradient: 'from-sky-500 to-blue-600', lightText: 'text-sky-100' },
        { label: 'Total Sakit', value: totalStats.sick, icon: <Thermometer className="w-28 h-28" />, gradient: 'from-purple-500 to-violet-600', lightText: 'text-purple-100' },
        { label: 'Total Alpha', value: totalStats.alpha, icon: <UserX className="w-28 h-28" />, gradient: 'from-rose-500 to-pink-600', lightText: 'text-rose-100' },
    ];

    const months = [
        { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
        { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
    ];

    const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <ClipboardList className="w-3 h-3 mr-1.5" />
                                Reporting System
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Rekap <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Presensi Bulanan</span>
                        </h2>
                        <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            Periode Aktif: <span className="text-indigo-600 font-bold ml-1">{periodLabel}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button 
                            onClick={handleExportExcel}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-5 font-bold flex items-center transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
                        </Button>
                        <Button 
                            onClick={handleExportPdf}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-5 font-bold flex items-center transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300"
                        >
                            <Printer className="w-4 h-4 mr-2" /> Export PDF
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Rekap Presensi" />

            <div className="space-y-8 pb-10">
                {/* Stats Grid — Monitoring Style Gradient Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {summaryCards.map((card, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.06 }}
                        >
                            <Card className={`bg-gradient-to-br ${card.gradient} text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative h-full hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}>
                                <div className="absolute -right-4 -bottom-4 opacity-10">{card.icon}</div>
                                <CardContent className="p-5 relative z-10">
                                    <p className={`${card.lightText} font-bold mb-1 uppercase tracking-wider text-[10px]`}>{card.label}</p>
                                    <h3 className="text-3xl font-black">{card.value} <span className="text-sm font-medium opacity-70">Orang</span></h3>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Filters and Table */}
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="p-6 lg:p-8 lg:pb-4 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative w-full lg:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder="Cari nama atau NIK..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-11 rounded-xl bg-slate-50/50 border-slate-200 h-11 text-sm font-semibold focus-visible:ring-indigo-500 w-full"
                                />
                            </div>
                            {/* Filters */}
                            <div className="flex items-center flex-wrap gap-3">
                                <select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4 min-w-[140px]"
                                >
                                    <option value="all">Semua Posisi</option>
                                    <option value="Guru">Khusus Guru</option>
                                    <option value="Staff">Khusus Staff</option>
                                </select>

                                <select 
                                    value={month} 
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4 min-w-[140px]"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>

                                <select 
                                    value={year} 
                                    onChange={(e) => setYear(e.target.value)}
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="py-5 px-6 font-black text-slate-800">Pegawai</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">Hadir</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">Telat</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">Izin</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">Sakit</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">Alpa</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Hadir (X)</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Hadir (XI)</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Hadir (XII)</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Hadir (Total)</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Izin</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Inval</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Libur</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center">JTM Alpa</TableHead>
                                        <TableHead className="font-black text-slate-800 text-center pr-6">JTM Terjadwal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((item, index) => (
                                                <motion.tr 
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: Math.min(index * 0.03, 0.5) }}
                                                    className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 group"
                                                >
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center text-indigo-600 font-black text-lg">
                                                                {item.photo_path ? (
                                                                    <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    item.name.charAt(0)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                                                                <div className="flex items-center space-x-2 mt-0.5">
                                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                                        {item.nik || '-'}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center text-slate-500">
                                                                        {item.is_guru ? <GraduationCap className="w-3 h-3 mr-1 text-indigo-500" /> : <Briefcase className="w-3 h-3 mr-1 text-amber-500" />}
                                                                        {item.position}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.8)' }}></span>
                                                            {item.present}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${item.late > 0 ? 'text-amber-600 bg-amber-50 border-amber-100/50' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                                            {item.late > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" style={{ boxShadow: '0 0 8px rgba(245,158,11,0.8)' }}></span>}
                                                            {item.late}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${item.permit > 0 ? 'text-sky-600 bg-sky-50 border-sky-100/50' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                                            {item.permit > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2" style={{ boxShadow: '0 0 8px rgba(14,165,233,0.8)' }}></span>}
                                                            {item.permit}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${item.sick > 0 ? 'text-purple-600 bg-purple-50 border-purple-100/50' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                                            {item.sick > 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" style={{ boxShadow: '0 0 8px rgba(168,85,247,0.8)' }}></span>}
                                                            {item.sick}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${item.alpha > 0 ? 'text-rose-600 bg-rose-50 border-rose-100/50' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                                            {item.alpha > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" style={{ boxShadow: '0 0 8px rgba(225,29,72,0.8)' }}></span>}
                                                            {item.alpha}
                                                        </span>
                                                        {item.alpha > 2 && (
                                                            <span className="ml-1.5 text-rose-500 animate-pulse" title="Peringatan: Alpha lebih dari 2 hari!">⚠️</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs shadow-sm">
                                                                {item.jtm_effective_10} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs shadow-sm">
                                                                {item.jtm_effective_11} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs shadow-sm">
                                                                {item.jtm_effective_12} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 text-xs shadow-sm">
                                                                {item.jtm_effective} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs shadow-sm">
                                                                {item.jtm_permit} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
<TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs shadow-sm">
                                                                {item.jtm_inval} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs shadow-sm">
                                                                {item.jtm_holiday} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.is_guru ? (
                                                            <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs shadow-sm">
                                                                {item.jtm_absent} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center pr-6">
                                                        {item.is_guru ? (
                                                            <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 text-xs shadow-sm">
                                                                {item.jtm_scheduled} JP
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 font-bold">—</span>
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={15} className="text-center py-16">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <Calendar className="w-12 h-12 mb-4 text-slate-200" />
                                                        <p className="font-bold text-slate-500 text-lg">Data tidak ditemukan</p>
                                                        <p className="text-sm font-medium mt-1">Coba ubah filter bulan atau tahun untuk melihat data lainnya.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 pb-6">
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

                        {/* Bottom Summary */}
                        {filteredData.length > 0 && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-500">
                                        Menampilkan <span className="text-indigo-600">{filteredData.length}</span> pegawai
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs font-bold">
                                        <span className="flex items-center text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Hadir: {totalStats.present}</span>
                                        <span className="flex items-center text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span> Telat: {totalStats.late}</span>
                                        <span className="flex items-center text-sky-600"><span className="w-2 h-2 rounded-full bg-sky-500 mr-1.5"></span> Izin: {totalStats.permit}</span>
                                        <span className="flex items-center text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span> Sakit: {totalStats.sick}</span>
                                        <span className="flex items-center text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span> Alpha: {totalStats.alpha}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
