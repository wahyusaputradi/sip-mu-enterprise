import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, AlertCircle, Calculator, Banknote, Clock, ShieldAlert } from 'lucide-react';

export default function Edit({ payroll }) {
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
    };
    const { data, setData, put, processing, errors } = useForm({
        allowance_other: payroll.allowance_other || 0,
        deduction_other: payroll.deduction_other || 0,
        notes: payroll.notes || '',
    });

    const isPaid = payroll.status === 'paid';
    const isNotesRequired = Number(data.allowance_other) > 0 || Number(data.deduction_other) > 0;

    const baseNetSalary = Number(payroll.net_salary || 0) - Number(payroll.allowance_other || 0) + Number(payroll.deduction_other || 0);
    const previewNetSalary = baseNetSalary + (Number(data.allowance_other) || 0) - (Number(data.deduction_other) || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('payroll.update', payroll.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href={route('payroll.index')}>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h2 className="text-xl font-bold text-slate-900">Audit & Penyesuaian Payroll</h2>
                </div>
            }
        >
            <Head title="Audit Payroll" />

            <div className="py-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Reference Column */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border border-white shadow-xl rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                            <CardTitle className="text-lg font-black text-slate-900 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-slate-500" /> Referensi Kalkulasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 text-sm">
                            <div className="bg-emerald-50/50 p-6 border-b border-emerald-100">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Pemasukan</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-medium">1. Gaji Pokok</span>
                                        <span className="font-bold text-slate-900">{formatRupiah(payroll.details?.earnings?.base)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(payroll.details?.earnings?.jabatan > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">2. Tunjangan Jabatan</span>
                                        <span className="font-bold text-slate-900">{formatRupiah(payroll.details?.earnings?.jabatan)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(payroll.details?.earnings?.transport > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">3. Tunjangan Transport</span>
                                        <span className="font-bold text-slate-900">{formatRupiah(payroll.details?.earnings?.transport)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(payroll.details?.earnings?.ekskul > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">4. Tunjangan Ekskul</span>
                                        <span className="font-bold text-slate-900">{formatRupiah(payroll.details?.earnings?.ekskul)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(payroll.details?.earnings?.homeroom > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">5. Tunjangan Wali Kelas</span>
                                        <span className="font-bold text-slate-900">{formatRupiah(payroll.details?.earnings?.homeroom)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(Number(data.allowance_other) > 0) && 'opacity-40'}`}>
                                        <span className="text-emerald-600 font-bold">6. Tunjangan Manual</span>
                                        <span className="font-black text-emerald-700">+{formatRupiah(Number(data.allowance_other) || 0)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-rose-50/50 p-6 border-b border-rose-100">
                                <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-4">Potongan</h4>
                                <div className="space-y-3">
                                    <div className={`flex justify-between items-center ${!(payroll.details?.deductions?.alpha > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">7. Potongan Alpha</span>
                                        <span className="font-bold text-rose-600">-{formatRupiah(payroll.details?.deductions?.alpha)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(payroll.details?.deductions?.bpjs > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">8. Potongan BPJS</span>
                                        <span className="font-bold text-rose-600">-{formatRupiah(payroll.details?.deductions?.bpjs)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!((payroll.details?.deductions?.school_loan || 0) + (payroll.details?.deductions?.bmt_loan || 0) > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">9. Pinjaman BMT</span>
                                        <span className="font-bold text-rose-600">-{formatRupiah((payroll.details?.deductions?.school_loan || 0) + (payroll.details?.deductions?.bmt_loan || 0))}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(payroll.details?.deductions?.cooperative > 0) && 'opacity-40'}`}>
                                        <span className="text-slate-500 font-medium">10. Potongan Koperasi</span>
                                        <span className="font-bold text-rose-600">-{formatRupiah(payroll.details?.deductions?.cooperative)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center ${!(Number(data.deduction_other) > 0) && 'opacity-40'}`}>
                                        <span className="text-rose-600 font-bold">11. Potongan Manual</span>
                                        <span className="font-black text-rose-700">-{formatRupiah(Number(data.deduction_other) || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pratinjau Gaji Bersih</p>
                                <p className="text-2xl font-black text-slate-900">{formatRupiah(previewNetSalary)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-white shadow-xl rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Jam Mengajar</p>
                                    <p className="font-black text-slate-900">{payroll.details?.metadata?.teaching_hours || 0} Jam</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 mb-4">
                                <Clock className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Jam Ganti / Inval</p>
                                    <p className="font-black text-slate-900">{payroll.details?.metadata?.inval_hours || 0} Jam</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Jumlah Alpha</p>
                                    <p className="font-black text-slate-900">{payroll.details?.metadata?.alpha_days || 0} Hari</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Form Column */}
                <div className="md:col-span-2">
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <CardTitle className="text-2xl font-black">{payroll.employee?.name}</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase tracking-widest">
                                Periode {payroll.month}/{payroll.year} - {payroll.employee?.position?.name || 'Posisi Tidak Ditentukan'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            {isPaid ? (
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-8 flex items-start space-x-3 text-rose-800 text-sm">
                                    <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p>
                                        <b>Akses Terkunci:</b> Payroll ini telah berstatus <strong>PAID</strong> (Dibayar) dan tidak dapat lagi diubah. Silakan hubungi Super Admin jika terdapat kesalahan.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-start space-x-3 text-amber-800 text-sm">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p>
                                        <b>Audit Pratinjau:</b> Perubahan pada field di bawah akan ditambahkan ke total kalkulasi otomatis. Gunakan field "Lain-lain" untuk bonus, THR, denda, atau penyesuaian insidentil lainnya.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="allowance_other" className="text-xs font-black uppercase tracking-widest text-slate-500">Tunjangan Lain-lain (Bonus)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                                        <Input 
                                            id="allowance_other"
                                            type="number"
                                            disabled={isPaid}
                                            value={data.allowance_other}
                                            onChange={e => setData('allowance_other', e.target.value)}
                                            className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-emerald-500 font-bold text-lg"
                                        />
                                    </div>
                                    {Number(data.allowance_other) > 0 && <p className="text-xs font-bold text-emerald-600">~ {formatRupiah(data.allowance_other)}</p>}
                                    {errors.allowance_other && <p className="text-xs text-rose-500 font-bold">{errors.allowance_other}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deduction_other" className="text-xs font-black uppercase tracking-widest text-slate-500">Potongan Lain-lain (Denda/Kasus)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                                        <Input 
                                            id="deduction_other"
                                            type="number"
                                            disabled={isPaid}
                                            value={data.deduction_other}
                                            onChange={e => setData('deduction_other', e.target.value)}
                                            className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-rose-500 font-bold text-lg"
                                        />
                                    </div>
                                    {Number(data.deduction_other) > 0 && <p className="text-xs font-bold text-rose-600">~ {formatRupiah(data.deduction_other)}</p>}
                                    {errors.deduction_other && <p className="text-xs text-rose-500 font-bold">{errors.deduction_other}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-slate-500">
                                        Catatan Audit {isNotesRequired && <span className="text-rose-500">*</span>}
                                    </Label>
                                    <Textarea 
                                        id="notes"
                                        disabled={isPaid}
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Alasan penyesuaian manual..."
                                        className="rounded-xl border-slate-200 focus:ring-slate-500 min-h-[100px]"
                                    />
                                    {errors.notes && <p className="text-xs text-rose-500 font-bold">{errors.notes}</p>}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={processing || isPaid}
                                    className={`w-full h-14 ${isPaid ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 active:scale-95'} font-black rounded-2xl transition-all`}
                                >
                                    <Save className="w-5 h-5 mr-2" /> 
                                    {processing ? 'Menyimpan...' : 'Simpan & Kalkulasi Ulang'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
