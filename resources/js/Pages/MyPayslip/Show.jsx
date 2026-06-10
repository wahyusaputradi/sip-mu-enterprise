import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Wallet, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function Show({ payroll }) {
    const { employee, details } = payroll;

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
    };

    const periodLabel = `${MONTHS[payroll.month]} ${payroll.year}`;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Link href={route('my-payslip.index')}>
                            <Button variant="outline" size="icon" className="rounded-full border-slate-200 hover:bg-slate-50">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center shadow-sm">
                                    <Wallet className="w-3 h-3 mr-1.5" /> Slip Gaji Pribadi
                                </span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Detail Slip <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{periodLabel}</span>
                            </h2>
                        </div>
                    </div>
                    <a href={route('my-payslip.download', payroll.id)} target="_blank">
                        <Button className="rounded-xl font-bold h-11 px-6 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                    </a>
                </div>
            }
        >
            <Head title={`Slip Gaji - ${periodLabel}`} />

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="py-6 max-w-4xl mx-auto pb-10">
                <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    {/* Header with employee info */}
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-100 p-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pegawai</p>
                                <h3 className="text-xl font-black text-slate-900">{employee.name}</h3>
                                <p className="text-sm font-bold text-slate-500 mt-0.5">
                                    {employee.positions?.map(p => p.name).join(', ') || employee.position?.name || '-'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Periode</p>
                                <h3 className="text-xl font-black text-slate-900">{periodLabel}</h3>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${payroll.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    {payroll.status === 'paid' ? 'Dibayar' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Earnings */}
                            <div>
                                <h4 className="font-black text-slate-900 border-b-2 border-emerald-200 pb-2 mb-4 flex justify-between items-center">
                                    <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-emerald-500" /> PENDAPATAN</span>
                                    <span className="text-emerald-600 text-sm">Earnings</span>
                                </h4>
                                <Table>
                                    <TableBody>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Gaji Pokok ({details?.metadata?.teaching_hours || 0} Jam)</TableCell>
                                            <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(details?.earnings?.base)}</TableCell>
                                        </TableRow>
                                        {details?.earnings?.inval > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Insentif Jam Ganti / Inval ({details?.metadata?.inval_hours || 0} Jam)</TableCell>
                                                <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(details?.earnings?.inval)}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Tunjangan Jabatan</TableCell>
                                            <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(details?.earnings?.jabatan)}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Tunjangan Transport</TableCell>
                                            <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(details?.earnings?.transport)}</TableCell>
                                        </TableRow>
                                        {details?.earnings?.homeroom > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Tunjangan Wali Kelas</TableCell>
                                                <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(details?.earnings?.homeroom)}</TableCell>
                                            </TableRow>
                                        )}
                                        {details?.earnings?.ekskul > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Tunjangan Ekskul ({details?.metadata?.extracurricular || 'Ekskul'})</TableCell>
                                                <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(details?.earnings?.ekskul)}</TableCell>
                                            </TableRow>
                                        )}
                                        {details?.earnings?.fixed_settings > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Tunjangan Lainnya (Sistem)</TableCell>
                                                <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(details?.earnings?.fixed_settings)}</TableCell>
                                            </TableRow>
                                        )}
                                        {(payroll.allowance_other > 0 || details?.earnings?.manual_other > 0) && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Tunjangan Manual (Bonus/THR)</TableCell>
                                                <TableCell className="py-2.5 pr-0 text-right font-bold text-slate-800">{formatRupiah(payroll.allowance_other || details?.earnings?.manual_other)}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="hover:bg-transparent border-t-2 border-slate-200 mt-2">
                                            <TableCell className="py-3 pl-0 font-black text-slate-900 uppercase">Gross Pay</TableCell>
                                            <TableCell className="py-3 pr-0 text-right font-black text-slate-900">{formatRupiah(payroll.gross_salary)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Deductions */}
                            <div>
                                <h4 className="font-black text-slate-900 border-b-2 border-rose-200 pb-2 mb-4 flex justify-between items-center">
                                    <span>POTONGAN</span>
                                    <span className="text-rose-600 text-sm">Deductions</span>
                                </h4>
                                <Table>
                                    <TableBody>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Alpha ({details?.metadata?.alpha_days || 0} Hari)</TableCell>
                                            <TableCell className="py-2.5 pr-0 text-right font-bold text-rose-600">{formatRupiah(details?.deductions?.alpha)}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2.5 pl-0 font-medium text-slate-700">BPJS</TableCell>
                                            <TableCell className="py-2.5 pr-0 text-right font-bold text-rose-600">{formatRupiah(details?.deductions?.bpjs)}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Pinjaman BMT / Sekolah</TableCell>
                                            <TableCell className="py-2.5 pr-0 text-right font-bold text-rose-600">{formatRupiah((details?.deductions?.bmt_loan || 0) + (details?.deductions?.school_loan || 0))}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Koperasi</TableCell>
                                            <TableCell className="py-2.5 pr-0 text-right font-bold text-rose-600">{formatRupiah(details?.deductions?.cooperative)}</TableCell>
                                        </TableRow>
                                        {details?.deductions?.fixed_settings > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Potongan Lainnya (Sistem)</TableCell>
                                                <TableCell className="py-2.5 pr-0 text-right font-bold text-rose-600">{formatRupiah(details?.deductions?.fixed_settings)}</TableCell>
                                            </TableRow>
                                        )}
                                        {(payroll.deduction_other > 0 || details?.deductions?.manual_other > 0) && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2.5 pl-0 font-medium text-slate-700">Potongan Manual (Denda/Kasus)</TableCell>
                                                <TableCell className="py-2.5 pr-0 text-right font-bold text-rose-600">{formatRupiah(payroll.deduction_other || details?.deductions?.manual_other)}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="hover:bg-transparent border-t-2 border-slate-200 mt-2">
                                            <TableCell className="py-3 pl-0 font-black text-slate-900 uppercase">Total Deductions</TableCell>
                                            <TableCell className="py-3 pr-0 text-right font-black text-rose-600">{formatRupiah(payroll.total_deductions)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Take Home Pay Banner */}
                        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2rem] p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl shadow-emerald-200/50">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">Take Home Pay</p>
                                <h2 className="text-sm font-medium text-emerald-50 mt-1">Gaji Bersih yang Diterima</h2>
                            </div>
                            <div className="text-4xl font-black">
                                {formatRupiah(payroll.net_salary)}
                            </div>
                        </div>

                        {/* Notes */}
                        {payroll.notes && (
                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Catatan</p>
                                <p className="text-sm font-medium text-amber-800">{payroll.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </AuthenticatedLayout>
    );
}
