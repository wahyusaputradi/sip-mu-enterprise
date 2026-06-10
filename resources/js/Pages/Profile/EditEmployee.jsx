import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ChevronLeft, Save, Briefcase, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export default function EditEmployee({ employee }) {
    const { data, setData, post, processing, errors } = useForm({
        name: employee.name || '',
        nik: employee.nik || '',
        nik_kependudukan: employee.nik_kependudukan || '',
        email: employee.user?.email || '',
        status: employee.status || 'active',
        nuptk: employee.nuptk || '',
        birth_place: employee.birth_place || '',
        birth_date: employee.birth_date ? employee.birth_date.substring(0, 10) : '',
        gender: employee.gender || '',
        phone: employee.phone || '',
        photo: null,
        join_date: employee.join_date ? employee.join_date.substring(0, 10) : '',
        education: employee.education || '',
        subject: employee.subject || '',
        ukg_number: employee.ukg_number || '',
        teaching_hours: employee.teaching_hours || '',
        is_homeroom_teacher: employee.is_homeroom_teacher == 1,
        homeroom_class: employee.homeroom_class || '',
        is_extracurricular_builder: employee.is_extracurricular_builder == 1,
        extracurricular_name: employee.extracurricular_name || '',
    });

    const [photoPreview, setPhotoPreview] = useState(employee.photo_path ? employee.photo_url : null);
    const photoInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('pribadi');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    const tabs = [
        { id: 'pribadi', label: 'Data Pribadi', icon: <Users className="w-4 h-4 mr-2" /> },
        { id: 'kepegawaian', label: 'Kepegawaian', icon: <Briefcase className="w-4 h-4 mr-2" /> },
        { id: 'tambahan', label: 'Tugas Tambahan', icon: <ClipboardList className="w-4 h-4 mr-2" /> },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href={route('dashboard')} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-2">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
                        </Link>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Profil Saya</span>
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Edit Profil Saya" />

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

                <form onSubmit={submit}>
                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden min-h-[500px]">
                        <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6 lg:px-10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                                    {tabs.find(t => t.id === activeTab)?.icon}
                                    <span className="ml-1">{tabs.find(t => t.id === activeTab)?.label}</span>
                                </CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Perbarui informasi {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} pegawai
                                </CardDescription>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 lg:p-10 relative">
                            <AnimatePresence mode="wait">
                                
                                {activeTab === 'pribadi' && (
                                    <motion.div 
                                        key="pribadi"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* Photo Upload Area */}
                                            <div className="w-full md:w-1/3 space-y-4">
                                                <Label className="font-bold text-slate-700">Foto Profil</Label>
                                                <div 
                                                    onClick={() => photoInputRef.current.click()}
                                                    className="relative aspect-square w-full max-w-[240px] mx-auto rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                                                >
                                                    {photoPreview ? (
                                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600">Unggah Foto Baru</span>
                                                            <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</span>
                                                        </>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        ref={photoInputRef}
                                                        onChange={handlePhotoChange}
                                                        accept="image/*"
                                                        className="hidden" 
                                                    />
                                                </div>
                                                {errors.photo && <p className="text-rose-500 text-xs font-bold text-center">{errors.photo}</p>}
                                            </div>

                                            {/* Basic Info */}
                                            <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3 md:col-span-2">
                                                    <Label htmlFor="name" className="font-bold text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></Label>
                                                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama lengkap beserta gelar..." className="rounded-xl" />
                                                    {errors.name && <p className="text-rose-500 text-xs font-bold">{errors.name}</p>}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="nik" className="font-bold text-slate-700">ID Pegawai</Label>
                                                    <Input id="nik" value={data.nik} disabled placeholder="ID Pegawai" className="rounded-xl font-mono bg-slate-100 cursor-not-allowed" />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="nik_kependudukan" className="font-bold text-slate-700">NIK (Nomor Induk Kependudukan)</Label>
                                                    <Input id="nik_kependudukan" value={data.nik_kependudukan} disabled placeholder="Nomor Induk Kependudukan" className="rounded-xl font-mono bg-slate-100 cursor-not-allowed" />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="nuptk" className="font-bold text-slate-700">NUPTK</Label>
                                                    <Input id="nuptk" value={data.nuptk} onChange={e => setData('nuptk', e.target.value)} placeholder="Opsional" className="rounded-xl font-mono" />
                                                    {errors.nuptk && <p className="text-rose-500 text-xs font-bold">{errors.nuptk}</p>}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="birth_place" className="font-bold text-slate-700">Tempat Lahir</Label>
                                                    <Input id="birth_place" value={data.birth_place} onChange={e => setData('birth_place', e.target.value)} placeholder="Kota kelahiran..." className="rounded-xl" />
                                                    {errors.birth_place && <p className="text-rose-500 text-xs font-bold">{errors.birth_place}</p>}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="birth_date" className="font-bold text-slate-700">Tanggal Lahir</Label>
                                                    <Input id="birth_date" type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} className="rounded-xl" />
                                                    {errors.birth_date && <p className="text-rose-500 text-xs font-bold">{errors.birth_date}</p>}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="gender" className="font-bold text-slate-700">Jenis Kelamin <span className="text-rose-500">*</span></Label>
                                                    <Select value={data.gender} onValueChange={(val) => setData('gender', val)}>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.gender && <p className="text-rose-500 text-xs font-bold">{errors.gender}</p>}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="phone" className="font-bold text-slate-700">No. HP / WhatsApp</Label>
                                                    <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="08..." className="rounded-xl" />
                                                    {errors.phone && <p className="text-rose-500 text-xs font-bold">{errors.phone}</p>}
                                                </div>
                                                
                                                <div className="space-y-3 md:col-span-2 mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                    <Label htmlFor="email" className="font-bold text-slate-700">Akun Login Aplikasi (Email)</Label>
                                                    <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="email@sekolah.com" className="rounded-xl" />
                                                    <p className="text-xs text-slate-500 mt-2">Jika diisi, sistem akan membuatkan akun login mandiri dengan password default <code className="bg-slate-200 px-1 rounded">password123</code></p>
                                                    {errors.email && <p className="text-rose-500 text-xs font-bold">{errors.email}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'kepegawaian' && (
                                    <motion.div 
                                        key="kepegawaian"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="space-y-3 md:col-span-2">
                                            <Label className="font-bold text-slate-700">Jabatan <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 ml-2 font-bold">Hanya Super Admin yang dapat mengubah</span></Label>
                                            <div className="flex gap-2 flex-wrap">
                                                {(employee.positions || []).length > 0 ? (
                                                    employee.positions.map((pos) => (
                                                        <span key={pos.id} className={`px-3 py-2 rounded-xl text-sm font-bold border ${
                                                            pos.pivot?.is_primary 
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                            {pos.pivot?.is_primary && '★ '}{pos.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Belum ada jabatan</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="font-bold text-slate-700">Status Keaktifan</Label>
                                            <Input value={employee.status === 'active' ? 'Aktif' : 'Non-aktif'} disabled className="rounded-xl bg-slate-100 cursor-not-allowed" />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="join_date" className="font-bold text-slate-700">Tanggal Bergabung</Label>
                                            <Input id="join_date" type="date" value={data.join_date} onChange={e => setData('join_date', e.target.value)} className="rounded-xl" />
                                            <p className="text-[10px] text-slate-500">Masa kerja akan dihitung otomatis dari tanggal ini.</p>
                                            {errors.join_date && <p className="text-rose-500 text-xs font-bold">{errors.join_date}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="education" className="font-bold text-slate-700">Pendidikan Terakhir</Label>
                                            <Input id="education" value={data.education} onChange={e => setData('education', e.target.value)} placeholder="Contoh: S1 Pendidikan..." className="rounded-xl" />
                                            {errors.education && <p className="text-rose-500 text-xs font-bold">{errors.education}</p>}
                                        </div>

                                        <div className="col-span-1 md:col-span-2 pt-4 pb-2 flex items-center justify-between">
                                            <h4 className="font-bold text-slate-800 text-lg border-b pb-2 w-full flex items-center justify-between">
                                                <span>Khusus Guru (Opsional)</span>
                                            </h4>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="subject" className="font-bold text-slate-700">Mata Pelajaran</Label>
                                            <Input id="subject" value={data.subject} onChange={e => setData('subject', e.target.value)} placeholder="Mata pelajaran yang diampu..." className="rounded-xl" />
                                            {errors.subject && <p className="text-rose-500 text-xs font-bold">{errors.subject}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="teaching_hours" className="font-bold text-slate-700">Jam Mengajar (Per Minggu)</Label>
                                            <Input id="teaching_hours" type="number" min="0" value={data.teaching_hours} onChange={e => setData('teaching_hours', e.target.value)} placeholder="Contoh: 24" className="rounded-xl" />
                                            {errors.teaching_hours && <p className="text-rose-500 text-xs font-bold">{errors.teaching_hours}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="ukg_number" className="font-bold text-slate-700">No. UKG</Label>
                                            <Input id="ukg_number" value={data.ukg_number} onChange={e => setData('ukg_number', e.target.value)} placeholder="Nomor UKG..." className="rounded-xl font-mono" />
                                            {errors.ukg_number && <p className="text-rose-500 text-xs font-bold">{errors.ukg_number}</p>}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'tambahan' && (
                                    <motion.div 
                                        key="tambahan"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6 max-w-lg">
                                                <h4 className="font-bold text-slate-800 text-lg border-b pb-2">Tugas Tambahan</h4>
                                                
                                                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                                                    <label className="flex items-center space-x-3 cursor-not-allowed">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={data.is_homeroom_teacher}
                                                            disabled
                                                            className="rounded border-slate-300 text-slate-400 shadow-sm focus:ring-slate-500 w-5 h-5 cursor-not-allowed"
                                                        />
                                                        <span className="font-bold text-slate-700">Sebagai Wali Kelas</span>
                                                    </label>
                                                    
                                                    <AnimatePresence>
                                                        {data.is_homeroom_teacher && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="pt-2 pl-8 space-y-2">
                                                                    <Label className="text-xs font-bold text-slate-500">Kelas</Label>
                                                                    <Input value={data.homeroom_class} disabled className="rounded-xl bg-slate-100 cursor-not-allowed" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                                                    <label className="flex items-center space-x-3 cursor-not-allowed">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={data.is_extracurricular_builder}
                                                            disabled
                                                            className="rounded border-slate-300 text-slate-400 shadow-sm focus:ring-slate-500 w-5 h-5 cursor-not-allowed"
                                                        />
                                                        <span className="font-bold text-slate-700">Sebagai Pembina Eskul</span>
                                                    </label>
                                                    
                                                    <AnimatePresence>
                                                        {data.is_extracurricular_builder && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="pt-2 pl-8 space-y-2">
                                                                    <Label className="text-xs font-bold text-slate-500">Pembina Ekskul</Label>
                                                                    <Input value={data.extracurricular_name} disabled className="rounded-xl bg-slate-100 cursor-not-allowed" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex items-center justify-end space-x-4">
                        <Link href={route('dashboard')}>
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="rounded-xl font-bold h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
                            >
                                Batal
                            </Button>
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="rounded-xl font-bold h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_10px_25px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5"
                        >
                            <Save className="w-5 h-5 mr-2" /> Simpan Profil
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
