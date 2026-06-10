import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, Wallet, FileText, CheckCircle2, Clock, Sparkles, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_MAP = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    paid: { label: 'Dibayar', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

export default function Index({ payslips, filters, employee }) {
    const [year, setYear] = useState(filters.year);

    const applyFilter = (y) => {
        router.get(route('my-payslip.index'), { year: y }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm mb-2">
                        <Wallet className="w-3 h-3 mr-1.5" /> Area Pribadi
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Slip <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Gaji Saya</span>
                    </h2>
                </div>
                <select value={year} onChange={e => { setYear(e.target.value); applyFilter(e.target.value); }}
                    className="h-11 rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 px-4 shadow-sm">
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        }>
            <Head title="Slip Gaji Saya" />

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pb-10 space-y-6">
                {/* Summary Stats */}
                {payslips.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative">
                            <div className="absolute -right-2 -bottom-2 opacity-10"><CreditCard className="w-14 h-14" /></div>
                            <CardContent className="p-5 relative z-10">
                                <p className="text-white/70 font-bold uppercase tracking-wider text-[9px]">Total Slip</p>
                                <h3 className="text-3xl font-black">{payslips.length} <span className="text-sm font-medium opacity-70">bulan</span></h3>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative">
                            <div className="absolute -right-2 -bottom-2 opacity-10"><CheckCircle2 className="w-14 h-14" /></div>
                            <CardContent className="p-5 relative z-10">
                                <p className="text-white/70 font-bold uppercase tracking-wider text-[9px]">Sudah Dibayar</p>
                                <h3 className="text-3xl font-black">{payslips.filter(p => p.status === 'paid').length}</h3>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[1.5rem] border-none shadow-lg overflow-hidden relative">
                            <div className="absolute -right-2 -bottom-2 opacity-10"><Clock className="w-14 h-14" /></div>
                            <CardContent className="p-5 relative z-10">
                                <p className="text-white/70 font-bold uppercase tracking-wider text-[9px]">Pending</p>
                                <h3 className="text-3xl font-black">{payslips.filter(p => p.status !== 'paid').length}</h3>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Payslip List */}
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 p-6">
                        <CardTitle className="text-lg font-black text-slate-900">Daftar Slip Gaji — {year}</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Riwayat gaji bulanan Anda</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="py-4 px-6 text-left text-xs font-black text-slate-500 uppercase">Periode</th>
                                        <th className="py-4 px-4 text-right text-xs font-black text-slate-500 uppercase">Gaji Pokok</th>
                                        <th className="py-4 px-4 text-right text-xs font-black text-slate-500 uppercase">Tunjangan</th>
                                        <th className="py-4 px-4 text-right text-xs font-black text-slate-500 uppercase">Potongan</th>
                                        <th className="py-4 px-4 text-right text-xs font-black text-slate-500 uppercase">Gaji Bersih</th>
                                        <th className="py-4 px-4 text-center text-xs font-black text-slate-500 uppercase">Status</th>
                                        <th className="py-4 px-4 text-center text-xs font-black text-slate-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payslips.length > 0 ? payslips.map((slip, i) => {
                                        const st = STATUS_MAP[slip.status] || STATUS_MAP.draft;
                                        const period = `${MONTHS[slip.month]} ${slip.year}`;
                                        return (
                                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3.5 px-6 font-bold text-slate-800">{period}</td>
                                                <td className="py-3.5 px-4 text-right font-bold text-slate-700">{formatCurrency(slip.gross_salary)}</td>
                                                <td className="py-3.5 px-4 text-right font-bold text-emerald-600">+{formatCurrency(slip.allowance_other)}</td>
                                                <td className="py-3.5 px-4 text-right font-bold text-rose-600">-{formatCurrency(slip.total_deductions)}</td>
                                                <td className="py-3.5 px-4 text-right font-black text-slate-900">{formatCurrency(slip.net_salary)}</td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`inline-flex text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${st.color}`}>{st.label}</span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Link href={route('my-payslip.show', slip.id)}>
                                                            <button className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors">
                                                                <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                                                            </button>
                                                        </Link>
                                                        <a href={route('my-payslip.download', slip.id)} target="_blank">
                                                            <button className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                                                                <Download className="w-3.5 h-3.5 mr-1" /> PDF
                                                            </button>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={7} className="py-16 text-center">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                            <p className="font-bold text-slate-500">Belum ada slip gaji pada tahun ini</p>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AuthenticatedLayout>
    );
}
