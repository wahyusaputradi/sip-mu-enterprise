import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    GraduationCap, 
    Users, 
    Save, 
    Loader2, 
    Calendar, 
    MapPin, 
    Phone, 
    CreditCard, 
    FileText, 
    Building2,
    ShieldCheck,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Profile({ student }) {
    const [activeTab, setActiveTab] = useState('siswa'); // 'siswa' | 'ayah' | 'ibu'

    const { data, setData, post, processing, errors } = useForm({
        // Data Siswa
        name: student.name || '',
        gender: student.gender || 'Laki-laki',
        pob: student.pob || '',
        dob: student.dob || '',
        nik: student.nik || '',
        address: student.address || '',
        rt: student.rt || '',
        rw: student.rw || '',
        village: student.village || '',
        district: student.district || '',
        regency: student.regency || '',
        kip_number: student.kip_number || '',
        previous_school: student.previous_school || '',
        family_card_number: student.family_card_number || '',
        student_phone: student.student_phone || '',

        // Data Ayah
        father_name: student.father_name || '',
        father_pob: student.father_pob || '',
        father_dob: student.father_dob || '',
        father_nik: student.father_nik || '',
        father_phone: student.father_phone || '',
        father_job: student.father_job || '',

        // Data Ibu
        mother_name: student.mother_name || '',
        mother_pob: student.mother_pob || '',
        mother_dob: student.mother_dob || '',
        mother_nik: student.mother_nik || '',
        mother_phone: student.mother_phone || '',
        mother_job: student.mother_job || '',
    });

    // Client-side numeric-only filter helper
    const handleNumericInput = (field, value, maxLen = 30) => {
        const clean = value.replace(/[^0-9]/g, '').slice(0, maxLen);
        setData(field, clean);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student-portal.profile.update'), {
            preserveScroll: true,
        });
    };

    const regencyOptions = [
        'Kabupaten Cirebon',
        'Kota Cirebon',
        'Kabupaten Indramayu',
        'Kabupaten Majalengka',
        'Kabupaten Kuningan',
        'Lainnya'
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Data Profil Siswa - SIP MU Enterprise" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Top Header Card */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                    <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-5">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                                <User className="w-10 h-10 text-indigo-300" />
                            </div>
                            <div>
                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/30 backdrop-blur-md rounded-full text-xs font-bold border border-indigo-300/20 mb-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Verifikasi Biodata Mandiri</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{student.name}</h1>
                                <p className="text-sm font-semibold text-indigo-200 mt-1 flex items-center space-x-3">
                                    <span>NIS: <strong className="text-white">{student.nis}</strong></span>
                                    <span>•</span>
                                    <span>Kelas: <strong className="text-white">{student.school_class ? student.school_class.name : '-'}</strong></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form Container */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tab Navigation Controls */}
                    <div className="p-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl flex items-center space-x-2 border border-slate-300/70 dark:border-slate-700 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setActiveTab('siswa')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
                                activeTab === 'siswa'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-300/40 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4 shrink-0" />
                            <span>1. Data Diri Siswa</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ayah')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
                                activeTab === 'ayah'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-300/40 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <User className="w-4 h-4 shrink-0" />
                            <span>2. Data Ayah Kandung</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ibu')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
                                activeTab === 'ibu'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-300/40 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <Users className="w-4 h-4 shrink-0" />
                            <span>3. Data Ibu Kandung</span>
                        </button>
                    </div>

                    {/* TAB 1: DATA DIRI SISWA */}
                    {activeTab === 'siswa' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                                    <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Biodata Pribadi Siswa</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lengkapi informasi pribadi dan domisili tempat tinggal siswa secara akurat.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {/* NIS (Readonly) */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nomor NIS (Terkunci)</Label>
                                    <div className="relative">
                                        <Input value={student.nis || ''} disabled className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 pr-10" />
                                        <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                {/* NISN (Readonly) */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nomor NISN (Terkunci)</Label>
                                    <div className="relative">
                                        <Input value={student.nisn || '-'} disabled className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 pr-10" />
                                        <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                {/* Kelas (Readonly) */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kelas / Rombel (Terkunci)</Label>
                                    <div className="relative">
                                        <Input value={student.school_class ? student.school_class.name : '-'} disabled className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 pr-10" />
                                        <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                {/* Nama Lengkap */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nama Lengkap Siswa *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama Lengkap sesuai Ijazah / KK..."
                                        className="font-bold"
                                    />
                                    {errors.name && <p className="text-rose-500 text-xs font-bold">{errors.name}</p>}
                                </div>

                                {/* Jenis Kelamin */}
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Jenis Kelamin *</Label>
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>

                                {/* NIK Siswa (16 Digit Angka) */}
                                <div className="space-y-2">
                                    <Label htmlFor="nik" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor NIK Siswa (16 Digit)</Label>
                                    <Input
                                        id="nik"
                                        value={data.nik}
                                        onChange={(e) => handleNumericInput('nik', e.target.value, 16)}
                                        placeholder="Nomor NIK KTP / KK (Angka)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.nik && <p className="text-rose-500 text-xs font-bold">{errors.nik}</p>}
                                </div>

                                {/* Tempat Lahir */}
                                <div className="space-y-2">
                                    <Label htmlFor="pob" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tempat Lahir</Label>
                                    <Input
                                        id="pob"
                                        value={data.pob}
                                        onChange={(e) => setData('pob', e.target.value)}
                                        placeholder="Kota / Kabupaten Lahir..."
                                    />
                                </div>

                                {/* Tanggal Lahir */}
                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tanggal Lahir</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={data.dob}
                                        onChange={(e) => setData('dob', e.target.value)}
                                    />
                                </div>

                                {/* Nomor KK (16 Digit Angka) */}
                                <div className="space-y-2">
                                    <Label htmlFor="family_card_number" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor Kartu Keluarga (KK)</Label>
                                    <Input
                                        id="family_card_number"
                                        value={data.family_card_number}
                                        onChange={(e) => handleNumericInput('family_card_number', e.target.value, 16)}
                                        placeholder="Nomor KK 16 Digit (Angka)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.family_card_number && <p className="text-rose-500 text-xs font-bold">{errors.family_card_number}</p>}
                                </div>

                                {/* Nomor HP Siswa (Angka) */}
                                <div className="space-y-2">
                                    <Label htmlFor="student_phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor HP Siswa / WhatsApp</Label>
                                    <Input
                                        id="student_phone"
                                        value={data.student_phone}
                                        onChange={(e) => handleNumericInput('student_phone', e.target.value, 15)}
                                        placeholder="08xxxxxxxxxx (Angka)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.student_phone && <p className="text-rose-500 text-xs font-bold">{errors.student_phone}</p>}
                                </div>

                                {/* Nomor KIP (Kartu Indonesia Pintar) */}
                                <div className="space-y-2">
                                    <Label htmlFor="kip_number" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor KIP (Kartu Indonesia Pintar)</Label>
                                    <Input
                                        id="kip_number"
                                        value={data.kip_number}
                                        onChange={(e) => setData('kip_number', e.target.value)}
                                        placeholder="Opsional (Contoh: KIP123456 / Alfanumerik)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.kip_number && <p className="text-rose-500 text-xs font-bold">{errors.kip_number}</p>}
                                </div>

                                {/* Sekolah Asal */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="previous_school" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Sekolah Asal (SMP / MTs)</Label>
                                    <Input
                                        id="previous_school"
                                        value={data.previous_school}
                                        onChange={(e) => setData('previous_school', e.target.value)}
                                        placeholder="Nama SMP / MTs Asal..."
                                    />
                                </div>

                                {/* Alamat Lengkap */}
                                <div className="space-y-2 sm:col-span-3">
                                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Alamat Lengkap Tempat Tinggal</Label>
                                    <Textarea
                                        id="address"
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Jalan, Blok, Dusun, Nomor Rumah..."
                                    />
                                </div>

                                {/* RT */}
                                <div className="space-y-2">
                                    <Label htmlFor="rt" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">RT (Angka)</Label>
                                    <Input
                                        id="rt"
                                        value={data.rt}
                                        onChange={(e) => handleNumericInput('rt', e.target.value, 5)}
                                        placeholder="Contoh: 001"
                                        className="font-mono"
                                    />
                                    {errors.rt && <p className="text-rose-500 text-xs font-bold">{errors.rt}</p>}
                                </div>

                                {/* RW */}
                                <div className="space-y-2">
                                    <Label htmlFor="rw" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">RW (Angka)</Label>
                                    <Input
                                        id="rw"
                                        value={data.rw}
                                        onChange={(e) => handleNumericInput('rw', e.target.value, 5)}
                                        placeholder="Contoh: 005"
                                        className="font-mono"
                                    />
                                    {errors.rw && <p className="text-rose-500 text-xs font-bold">{errors.rw}</p>}
                                </div>

                                {/* Kelurahan / Desa */}
                                <div className="space-y-2">
                                    <Label htmlFor="village" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Kelurahan / Desa</Label>
                                    <Input
                                        id="village"
                                        value={data.village}
                                        onChange={(e) => setData('village', e.target.value)}
                                        placeholder="Nama Kelurahan / Desa..."
                                    />
                                </div>

                                {/* Kecamatan */}
                                <div className="space-y-2">
                                    <Label htmlFor="district" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Kecamatan</Label>
                                    <Input
                                        id="district"
                                        value={data.district}
                                        onChange={(e) => setData('district', e.target.value)}
                                        placeholder="Nama Kecamatan..."
                                    />
                                </div>

                                {/* Kabupaten / Kota */}
                                <div className="space-y-2">
                                    <Label htmlFor="regency" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Kabupaten / Kota</Label>
                                    <Input
                                        id="regency"
                                        value={data.regency}
                                        onChange={(e) => setData('regency', e.target.value)}
                                        placeholder="Kabupaten / Kota..."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 2: DATA AYAH KANDUNG */}
                    {activeTab === 'ayah' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Biodata Ayah Kandung</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lengkapi informasi identitas dan nomor kontak Ayah Kandung siswa.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {/* Nama Lengkap Ayah */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="father_name" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nama Lengkap Ayah</Label>
                                    <Input
                                        id="father_name"
                                        value={data.father_name}
                                        onChange={(e) => setData('father_name', e.target.value)}
                                        placeholder="Nama Lengkap Ayah Kandung..."
                                        className="font-bold"
                                    />
                                </div>

                                {/* NIK Ayah (16 Digit Angka) */}
                                <div className="space-y-2">
                                    <Label htmlFor="father_nik" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor NIK Ayah (16 Digit)</Label>
                                    <Input
                                        id="father_nik"
                                        value={data.father_nik}
                                        onChange={(e) => handleNumericInput('father_nik', e.target.value, 16)}
                                        placeholder="NIK Ayah (Angka)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.father_nik && <p className="text-rose-500 text-xs font-bold">{errors.father_nik}</p>}
                                </div>

                                {/* Tempat Lahir Ayah */}
                                <div className="space-y-2">
                                    <Label htmlFor="father_pob" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tempat Lahir Ayah</Label>
                                    <Input
                                        id="father_pob"
                                        value={data.father_pob}
                                        onChange={(e) => setData('father_pob', e.target.value)}
                                        placeholder="Kota / Kabupaten Lahir Ayah..."
                                    />
                                </div>

                                {/* Tanggal Lahir Ayah */}
                                <div className="space-y-2">
                                    <Label htmlFor="father_dob" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tanggal Lahir Ayah</Label>
                                    <Input
                                        id="father_dob"
                                        type="date"
                                        value={data.father_dob}
                                        onChange={(e) => setData('father_dob', e.target.value)}
                                    />
                                </div>

                                {/* Nomor HP Ayah */}
                                <div className="space-y-2">
                                    <Label htmlFor="father_phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor HP Ayah / WhatsApp</Label>
                                    <Input
                                        id="father_phone"
                                        value={data.father_phone}
                                        onChange={(e) => handleNumericInput('father_phone', e.target.value, 15)}
                                        placeholder="08xxxxxxxxxx (Angka)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.father_phone && <p className="text-rose-500 text-xs font-bold">{errors.father_phone}</p>}
                                </div>

                                {/* Pekerjaan Ayah */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="father_job" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pekerjaan Ayah</Label>
                                    <Input
                                        id="father_job"
                                        value={data.father_job}
                                        onChange={(e) => setData('father_job', e.target.value)}
                                        placeholder="Karyawan Swasta, PNS, Wiraswasta, Buruh, dsb..."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 3: DATA IBU KANDUNG */}
                    {activeTab === 'ibu' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Biodata Ibu Kandung</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lengkapi informasi identitas dan nomor kontak Ibu Kandung siswa.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {/* Nama Lengkap Ibu */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="mother_name" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nama Lengkap Ibu</Label>
                                    <Input
                                        id="mother_name"
                                        value={data.mother_name}
                                        onChange={(e) => setData('mother_name', e.target.value)}
                                        placeholder="Nama Lengkap Ibu Kandung..."
                                        className="font-bold"
                                    />
                                </div>

                                {/* NIK Ibu (16 Digit Angka) */}
                                <div className="space-y-2">
                                    <Label htmlFor="mother_nik" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor NIK Ibu (16 Digit)</Label>
                                    <Input
                                        id="mother_nik"
                                        value={data.mother_nik}
                                        onChange={(e) => handleNumericInput('mother_nik', e.target.value, 16)}
                                        placeholder="NIK Ibu (Angka)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.mother_nik && <p className="text-rose-500 text-xs font-bold">{errors.mother_nik}</p>}
                                </div>

                                {/* Tempat Lahir Ibu */}
                                <div className="space-y-2">
                                    <Label htmlFor="mother_pob" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tempat Lahir Ibu</Label>
                                    <Input
                                        id="mother_pob"
                                        value={data.mother_pob}
                                        onChange={(e) => setData('mother_pob', e.target.value)}
                                        placeholder="Kota / Kabupaten Lahir Ibu..."
                                    />
                                </div>

                                {/* Tanggal Lahir Ibu */}
                                <div className="space-y-2">
                                    <Label htmlFor="mother_dob" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tanggal Lahir Ibu</Label>
                                    <Input
                                        id="mother_dob"
                                        type="date"
                                        value={data.mother_dob}
                                        onChange={(e) => setData('mother_dob', e.target.value)}
                                    />
                                </div>

                                {/* Nomor HP Ibu */}
                                <div className="space-y-2">
                                    <Label htmlFor="mother_phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nomor HP Ibu / WhatsApp</Label>
                                    <Input
                                        id="mother_phone"
                                        value={data.mother_phone}
                                        onChange={(e) => handleNumericInput('mother_phone', e.target.value, 15)}
                                        placeholder="08xxxxxxxxxx (Angka)..."
                                        className="font-mono font-bold"
                                    />
                                    {errors.mother_phone && <p className="text-rose-500 text-xs font-bold">{errors.mother_phone}</p>}
                                </div>

                                {/* Pekerjaan Ibu */}
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="mother_job" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pekerjaan Ibu</Label>
                                    <Input
                                        id="mother_job"
                                        value={data.mother_job}
                                        onChange={(e) => setData('mother_job', e.target.value)}
                                        placeholder="Ibu Rumah Tangga, Karyawan Swasta, PNS, dsb..."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Bottom Save Actions */}
                    <div className="flex items-center justify-end space-x-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center space-x-2"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Simpan Perubahan Profil</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
