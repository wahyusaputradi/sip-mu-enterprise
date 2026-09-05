import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, PlusCircle, Paperclip, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentLeaveRequests({ auth, student, leaveRequests }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'sick',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        attachment: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student-portal.leave-requests.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">✓ Disetujui</span>;
            case 'rejected':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">✗ Ditolak</span>;
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">⏳ Menunggu Persetujuan</span>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pengajuan Izin/Sakit — ${student.name}`} />

            <div className="space-y-6 pb-12">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Pengajuan Izin & Sakit Online
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Formulir pengajuan izin/sakit mandiri siswa beserta konfirmasi persetujuan Wali Kelas
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" /> Ajukan Izin / Sakit Baru
                    </Button>
                </div>

                {/* Leave Requests Table */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Riwayat Pengajuan Izin Siswa</CardTitle>
                        <CardDescription className="text-xs font-semibold text-slate-500">Daftar seluruh permohonan izin/sakit yang pernah diajukan</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {leaveRequests.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 font-semibold">
                                    Belum ada permohonan izin atau sakit yang diajukan.
                                </div>
                            ) : (
                                leaveRequests.map((req) => (
                                    <div key={req.id} className="p-6 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${req.type === 'sick' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'}`}>
                                                    {req.type === 'sick' ? '🏥 Sakit' : '📜 Izin'}
                                                </span>
                                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                                    {req.start_date} s.d. {req.end_date}
                                                </h4>
                                            </div>
                                            {getStatusBadge(req.status)}
                                        </div>

                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Alasan: <span className="text-slate-800 dark:text-slate-200">{req.reason}</span>
                                        </p>

                                        {req.attachment_url && (
                                            <div>
                                                <a
                                                    href={req.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                >
                                                    <Paperclip className="w-3.5 h-3.5 mr-1" /> Lihat Lampiran Surat Dokter / Ortu
                                                </a>
                                            </div>
                                        )}

                                        {req.status === 'rejected' && req.rejection_reason && (
                                            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 font-semibold">
                                                Alasan Penolakan: {req.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Create Leave Request */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[460px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Form Pengajuan Izin / Sakit</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-semibold pt-1">
                                Isi permohonan izin atau sakit mandiri untuk {student.name} ({student.school_class?.name}).
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div>
                                <Label className="text-xs font-bold mb-1 block">Tipe Keterangan*</Label>
                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sick">🏥 Sakit (Surat Dokter / Ortu)</SelectItem>
                                        <SelectItem value="permit">📜 Izin (Acara Keluarga / Dinas)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Tanggal Mulai*</Label>
                                    <Input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                        className="rounded-xl h-11"
                                    />
                                    {errors.start_date && <p className="text-xs text-rose-500 mt-1">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <Label className="text-xs font-bold mb-1 block">Tanggal Selesai*</Label>
                                    <Input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                        className="rounded-xl h-11"
                                    />
                                    {errors.end_date && <p className="text-xs text-rose-500 mt-1">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold mb-1 block">Alasan Alasan Izin / Sakit*</Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Sakit demam tinggi, ada surat keterangan dokter"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    required
                                    className="rounded-xl h-11"
                                />
                                {errors.reason && <p className="text-xs text-rose-500 mt-1">{errors.reason}</p>}
                            </div>

                            <div>
                                <Label className="text-xs font-bold mb-1 block">Unggah Lampiran Surat (Foto / PDF)</Label>
                                <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setData('attachment', e.target.files[0])}
                                    className="rounded-xl cursor-pointer"
                                />
                                {errors.attachment && <p className="text-xs text-rose-500 mt-1">{errors.attachment}</p>}
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl font-bold w-full sm:w-auto h-11 px-6">Batal</Button>
                            <Button type="submit" disabled={processing} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto h-11 px-6 shadow-lg shadow-indigo-600/20">Kirim Permohonan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
