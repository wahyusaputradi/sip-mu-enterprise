import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ChevronLeft, Save, Briefcase, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

export default function Create({ positions }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nik: '',
        nik_kependudukan: '',
        position_ids: [],
        primary_position_id: '',
        email: '',
        status: 'active',
        nuptk: '',
        birth_place: '',
        birth_date: '',
        gender: '',
        phone: '',
        photo: null,
        join_date: '',
        education: '',
        subject: '',
        ukg_number: '',
        teaching_hours: '',
        is_homeroom_teacher: false,
        homeroom_class: '',
        is_extracurricular_builder: false,
        extracurricular_name: '',
    });

    const [photoPreview, setPhotoPreview] = useState(null);
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
        post(route('employees.store'));
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
                        <Link href={route('employees.index')} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-2">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Pegawai
                        </Link>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Tambah <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pegawai</span>
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Tambah Pegawai" />

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
                                    Lengkapi informasi {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} pegawai
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
                                                            <span className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600">Unggah Foto</span>
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
                                                    <Label htmlFor="nik" className="font-bold text-slate-700">ID Pegawai <span className="text-rose-500">*</span></Label>
                                                    <Input id="nik" value={data.nik} onChange={e => setData('nik', e.target.value)} placeholder="ID Pegawai" className="rounded-xl font-mono" />
                                                    {errors.nik && <p className="text-rose-500 text-xs font-bold">{errors.nik}</p>}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="nik_kependudukan" className="font-bold text-slate-700">NIK (Nomor Induk Kependudukan)</Label>
                                                    <Input id="nik_kependudukan" value={data.nik_kependudukan} onChange={e => setData('nik_kependudukan', e.target.value)} placeholder="Nomor Induk Kependudukan" className="rounded-xl font-mono" />
                                                    {errors.nik_kependudukan && <p className="text-rose-500 text-xs font-bold">{errors.nik_kependudukan}</p>}
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
                                            <Label className="font-bold text-slate-700">Jabatan <span className="text-rose-500">*</span> <span className="text-xs text-slate-400 font-normal">(bisa pilih lebih dari satu untuk rangkap jabatan)</span></Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {positions.map(pos => {
                                                    const isChecked = data.position_ids.includes(pos.id);
                                                    const isPrimary = data.primary_position_id == pos.id;
                                                    return (
                                                        <div key={pos.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                            isChecked 
                                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                                        }`}>
                                                            <label className="flex items-center space-x-3 cursor-pointer flex-1">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        let newIds;
                                                                        if (e.target.checked) {
                                                                            newIds = [...data.position_ids, pos.id];
                                                                        } else {
                                                                            newIds = data.position_ids.filter(id => id !== pos.id);
                                                                        }
                                                                        setData(d => ({
                                                                            ...d,
                                                                            position_ids: newIds,
                                                                            primary_position_id: newIds.length === 1 ? newIds[0] : (newIds.includes(d.primary_position_id) ? d.primary_position_id : (newIds[0] || '')),
                                                                        }));
                                                                    }}
                                                                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-4 h-4"
                                                                />
                                                                <span className={`text-sm font-bold ${isChecked ? 'text-indigo-700' : 'text-slate-700'}`}>{pos.name}</span>
                                                            </label>
                                                            {isChecked && data.position_ids.length > 1 && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setData('primary_position_id', pos.id)}
                                                                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${isPrimary ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                                                                >
                                                                    {isPrimary ? '★ Utama' : 'Jadikan Utama'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {errors.position_ids && <p className="text-rose-500 text-xs font-bold">{errors.position_ids}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="status" className="font-bold text-slate-700">Status Keaktifan <span className="text-rose-500">*</span></Label>
                                            <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Pilih status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active" className="text-emerald-600 font-bold">Aktif</SelectItem>
                                                    <SelectItem value="inactive" className="text-rose-600 font-bold">Non-aktif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-rose-500 text-xs font-bold">{errors.status}</p>}
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

                                        <div className="col-span-1 md:col-span-2 pt-4 pb-2">
                                            <h4 className="font-bold text-slate-800 text-lg border-b pb-2">Khusus Guru (Opsional)</h4>
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
                                                    <label className="flex items-center space-x-3 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={data.is_homeroom_teacher}
                                                            onChange={e => setData('is_homeroom_teacher', e.target.checked)}
                                                            className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-5 h-5"
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
                                                                    <Label htmlFor="homeroom_class" className="text-xs font-bold text-slate-500">Pilih / Isi Kelas</Label>
                                                                    <Input id="homeroom_class" value={data.homeroom_class} onChange={e => setData('homeroom_class', e.target.value)} placeholder="Contoh: X-A" className="rounded-xl" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                                                    <label className="flex items-center space-x-3 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={data.is_extracurricular_builder}
                                                            onChange={e => setData('is_extracurricular_builder', e.target.checked)}
                                                            className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-5 h-5"
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
                                                                    <Label htmlFor="extracurricular_name" className="text-xs font-bold text-slate-500">Pilih Pembina Ekskul</Label>
                                                                    <Select value={data.extracurricular_name} onValueChange={(val) => setData('extracurricular_name', val)}>
                                                                        <SelectTrigger className="rounded-xl bg-white">
                                                                            <SelectValue placeholder="Pilih Ekstrakurikuler..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Pembina Ekskul Osis">Pembina Ekskul Osis</SelectItem>
                                                                            <SelectItem value="Pembina Ekskul Polsis">Pembina Ekskul Polsis</SelectItem>
                                                                            <SelectItem value="Pembina Ekskul Pramuka">Pembina Ekskul Pramuka</SelectItem>
                                                                            <SelectItem value="Pembina Ekskul Seni & Bahasa">Pembina Ekskul Seni & Bahasa</SelectItem>
                                                                            <SelectItem value="Pembina Ekskul Paskibra">Pembina Ekskul Paskibra</SelectItem>
                                                                            <SelectItem value="Pembina Ekskul Rohis">Pembina Ekskul Rohis</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
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
                        <Link href={route('employees.index')}>
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
                            <Save className="w-5 h-5 mr-2" /> Simpan Pegawai
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
