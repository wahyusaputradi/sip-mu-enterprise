import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Send, Printer } from 'lucide-react';

export default function Show({ payroll }) {
    const { employee, details } = payroll;

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('payroll.index')}>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <h2 className="text-xl font-bold text-slate-900">Detail Slip Gaji - {employee.name}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <a href={route('payroll.whatsapp', payroll.id)} target="_blank">
                            <Button variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100">
                                <Send className="w-4 h-4 mr-2" /> WhatsApp
                            </Button>
                        </a>
                        <a href={route('payroll.slip', payroll.id)} target="_blank">
                            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                                <Printer className="w-4 h-4 mr-2" /> Cetak PDF
                            </Button>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Slip Gaji - ${employee.name}`} />

            <div className="py-8 max-w-4xl mx-auto">
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden mb-8">
                    <CardHeader className="bg-slate-50 border-b p-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pegawai</p>
                                <h3 className="text-lg font-black text-slate-900">{employee.name}</h3>
                                <p className="text-sm font-medium text-slate-600">{employee.position?.name}</p>
                                <p className="text-sm font-mono text-slate-500">{employee.nik}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Periode</p>
                                <h3 className="text-lg font-black text-slate-900">{details.metadata?.period || `${payroll.month}/${payroll.year}`}</h3>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payroll.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {payroll.status}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Earnings */}
                            <div>
                                <h4 className="font-black text-slate-900 border-b pb-2 mb-4 flex justify-between">
                                    <span>PENDAPATAN</span>
                                    <span className="text-emerald-600">Earnings</span>
                                </h4>
                                <Table>
                                    <TableBody>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2 pl-0 font-medium">Gaji Pokok ({details.metadata?.teaching_hours || 0} Jam)</TableCell>
                                            <TableCell className="py-2 pr-0 text-right">{formatRupiah(details.earnings?.base)}</TableCell>
                                        </TableRow>
                                        {details.earnings?.inval > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2 pl-0 font-medium">Insentif Jam Ganti / Inval ({details.metadata?.inval_hours || 0} Jam)</TableCell>
                                                <TableCell className="py-2 pr-0 text-right">{formatRupiah(details.earnings?.inval)}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2 pl-0 font-medium">Tunjangan Jabatan</TableCell>
                                            <TableCell className="py-2 pr-0 text-right">{formatRupiah(details.earnings?.jabatan)}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2 pl-0 font-medium">Tunjangan Transport</TableCell>
                                            <TableCell className="py-2 pr-0 text-right">{formatRupiah(details.earnings?.transport)}</TableCell>
                                        </TableRow>
                                        {details.earnings?.homeroom > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2 pl-0 font-medium">Tunjangan Wali Kelas</TableCell>
                                                <TableCell className="py-2 pr-0 text-right">{formatRupiah(details.earnings?.homeroom)}</TableCell>
                                            </TableRow>
                                        )}
                                        {details.earnings?.ekskul > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2 pl-0 font-medium">Tunjangan Ekskul ({details.metadata?.extracurricular || 'Ekskul'})</TableCell>
                                                <TableCell className="py-2 pr-0 text-right">{formatRupiah(details.earnings?.ekskul)}</TableCell>
                                            </TableRow>
                                        )}
                                        {details.earnings?.fixed_settings > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2 pl-0 font-medium">Tunjangan Lainnya (Sistem)</TableCell>
                                                <TableCell className="py-2 pr-0 text-right">{formatRupiah(details.earnings?.fixed_settings)}</TableCell>
                                            </TableRow>
                                        )}
                                        {(payroll.allowance_other > 0 || details.earnings?.manual_other > 0) && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2 pl-0 font-medium">Tunjangan Manual (Bonus/THR)</TableCell>
                                                <TableCell className="py-2 pr-0 text-right">{formatRupiah(payroll.allowance_other || details.earnings?.manual_other)}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="hover:bg-transparent border-t mt-2">
                                            <TableCell className="py-3 pl-0 font-black text-slate-900 uppercase">Gross Pay</TableCell>
                                            <TableCell className="py-3 pr-0 text-right font-black text-slate-900">{formatRupiah(payroll.gross_salary)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Deductions */}
                            <div>
                                <h4 className="font-black text-slate-900 border-b pb-2 mb-4 flex justify-between">
                                    <span>POTONGAN</span>
                                    <span className="text-rose-600">Deductions</span>
                                </h4>
                                <Table>
                                    <TableBody>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2 pl-0 font-medium">Alpha ({details.metadata?.alpha_days || 0} Hari)</TableCell>
                                            <TableCell className="py-2 pr-0 text-right text-rose-600">{formatRupiah(details.deductions?.alpha)}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2 pl-0 font-medium">BPJS</TableCell>
                                            <TableCell className="py-2 pr-0 text-right text-rose-600">{formatRupiah(details.deductions?.bpjs)}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2 pl-0 font-medium">Pinjaman BMT / Sekolah</TableCell>
                                            <TableCell className="py-2 pr-0 text-right text-rose-600">{formatRupiah((details.deductions?.bmt_loan || 0) + (details.deductions?.school_loan || 0))}</TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableCell className="py-2 pl-0 font-medium">Koperasi</TableCell>
                                            <TableCell className="py-2 pr-0 text-right text-rose-600">{formatRupiah(details.deductions?.cooperative)}</TableCell>
                                        </TableRow>
                                        {details.deductions?.fixed_settings > 0 && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2 pl-0 font-medium">Potongan Lainnya (Sistem)</TableCell>
                                                <TableCell className="py-2 pr-0 text-right text-rose-600">{formatRupiah(details.deductions?.fixed_settings)}</TableCell>
                                            </TableRow>
                                        )}
                                        {(payroll.deduction_other > 0 || details.deductions?.manual_other > 0) && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="py-2 pl-0 font-medium">Potongan Manual (Denda/Kasus)</TableCell>
                                                <TableCell className="py-2 pr-0 text-right text-rose-600">{formatRupiah(payroll.deduction_other || details.deductions?.manual_other)}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="hover:bg-transparent border-t mt-2">
                                            <TableCell className="py-3 pl-0 font-black text-slate-900 uppercase">Total Deductions</TableCell>
                                            <TableCell className="py-3 pr-0 text-right font-black text-rose-600">{formatRupiah(payroll.total_deductions)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="mt-12 bg-emerald-600 rounded-3xl p-8 text-white flex justify-between items-center shadow-lg shadow-emerald-200">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Take Home Pay</p>
                                <h2 className="text-sm font-medium text-emerald-50 mt-1">Gaji Bersih yang Diterima</h2>
                            </div>
                            <div className="text-4xl font-black">
                                {formatRupiah(payroll.net_salary)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
