import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Search, Lock, UserCheck, KeyRound, ShieldAlert, ArrowRight, Save, Trash2, ShieldCheck, Mail, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserAuthorityIndex({ users, roles, filters, auth }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkResetModalOpen, setIsBulkResetModalOpen] = useState(false);
    const [selectedUsersForBulk, setSelectedUsersForBulk] = useState([]);
    
    // Timer for debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(route('user-authority.index'), { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filters.search]);

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        email: '',
        password: '',
        roles: [],
        bypass_liveness: false,
    });

    const openEditModal = (user) => {
        setSelectedUser(user);
        setData({
            email: user.email,
            password: '',
            roles: user.roles || [],
            bypass_liveness: !!user.bypass_liveness,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setTimeout(() => {
            setSelectedUser(null);
            reset();
        }, 300);
    };

    const toggleRole = (roleName) => {
        const newRoles = data.roles.includes(roleName)
            ? data.roles.filter(r => r !== roleName)
            : [...data.roles, roleName];
        setData('roles', newRoles);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('user-authority.update', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const toggleBulkSelect = (userId) => {
        setSelectedUsersForBulk(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsersForBulk.length === users.data.length) {
            setSelectedUsersForBulk([]);
        } else {
            setSelectedUsersForBulk(users.data.map(u => u.id));
        }
    };

    const confirmBulkReset = () => {
        router.post(route('user-authority.bulk-reset-password'), { user_ids: selectedUsersForBulk }, {
            onSuccess: () => {
                setSelectedUsersForBulk([]);
                setIsBulkResetModalOpen(false);
            },
            preserveScroll: true
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Role description maps
    const roleDescriptions = {
        'Super Admin': { mgmt: 'Memberikan akses penuh tanpa batas ke seluruh fitur sistem.', personal: '(Pengecualian Presensi)' },
        'Bendahara': { mgmt: 'Memberikan akses ke fitur data pegawai dan jabatan.', personal: 'Data profil, presensi harian, pengajuan izin, rekap presensi' },
        'Absensi': { mgmt: 'Memberikan akses untuk mengelola data kehadiran/edit dan rekap absensi.', personal: 'Data profil, presensi harian, pengajuan izin, rekap presensi' },
        'Kepala Sekolah': { mgmt: 'Memberikan akses untuk monitoring laporan dan evaluasi kinerja.', personal: 'Data profil, presensi harian, pengajuan izin, rekap presensi' },
        'Kurikulum': { mgmt: 'Memberikan akses untuk mengelola SDM, jadwal, dan struktur jabatan.', personal: 'Data profil, presensi harian, pengajuan izin, rekap presensi' },
        'Guru': { mgmt: '(Hanya Area Pribadi)', personal: 'Dashboard, data profil, presensi harian, pengajuan izin, rekap presensi' },
        'Karyawan': { mgmt: '(Hanya Area Pribadi)', personal: 'Dashboard, data profil, presensi harian, pengajuan izin, rekap presensi' },
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <ShieldCheck className="w-3 h-3 mr-1.5" />
                                Access Control
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Otoritas <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">User</span>
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Otoritas User" />

            <div className="space-y-8 pb-8">
                {/* Search & Actions */}
                <Card className="border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/60 backdrop-blur-xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input 
                                    type="text" 
                                    placeholder="Cari nama pegawai atau email..." 
                                    className="pl-12 h-12 rounded-2xl bg-white/80 border-slate-200 focus:ring-indigo-500 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <AnimatePresence>
                                {selectedUsersForBulk.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <Button 
                                            variant="destructive"
                                            className="h-12 rounded-2xl px-6 bg-rose-500 hover:bg-rose-600 shadow-[0_8px_20px_rgba(244,63,94,0.3)]"
                                            onClick={() => setIsBulkResetModalOpen(true)}
                                        >
                                            <KeyRound className="w-4 h-4 mr-2" />
                                            Reset Password ({selectedUsersForBulk.length})
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>

                {/* User Table */}
                <Card className="border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-100/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12 pl-6 py-5">
                                        <Checkbox 
                                            checked={selectedUsersForBulk.length > 0 && selectedUsersForBulk.length === users.data.length}
                                            onCheckedChange={toggleSelectAll}
                                            className="rounded border-slate-300 data-[state=checked]:bg-indigo-600"
                                        />
                                    </TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5">Nama Pegawai</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5">Jabatan</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5">Email Login</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5">Role Saat Ini</TableHead>
                                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5 text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? users.data.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 border-b border-slate-50/50 transition-colors">
                                        <TableCell className="pl-6">
                                            <Checkbox 
                                                checked={selectedUsersForBulk.includes(user.id)}
                                                onCheckedChange={() => toggleBulkSelect(user.id)}
                                                className="rounded border-slate-300 data-[state=checked]:bg-indigo-600"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4 py-1">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-black shadow-inner border border-white">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-semibold text-slate-600">
                                                {user.employee?.position?.name || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-slate-500 text-sm font-medium">
                                                <Mail className="w-4 h-4 mr-2 opacity-50" />
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {user.bypass_liveness && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                                        ⚡ Bypass Wajah
                                                    </span>
                                                )}
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((role, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                                                        No Access
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-10 w-10 p-0 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-slate-400"
                                                onClick={() => openEditModal(user)}
                                            >
                                                <Lock className="w-5 h-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                                            Tidak ada data pengguna ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-1 bg-white/60 p-2 rounded-2xl shadow-sm border border-white/50 backdrop-blur-sm">
                            {users.links.map((link, idx) => {
                                const isPrevious = link.label.includes('Previous');
                                const isNext = link.label.includes('Next');
                                const label = isPrevious ? 'Prev' : (isNext ? 'Next' : link.label);
                                
                                return link.url ? (
                                    <button
                                        key={idx}
                                        onClick={() => router.get(link.url)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                            link.active 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: label }}></span>
                                    </button>
                                ) : (
                                    <span key={idx} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300" dangerouslySetInnerHTML={{ __html: label }}></span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Authority Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-none sm:max-w-none md:max-w-none w-[98vw] md:w-[95vw] h-[98vh] md:h-[95vh] max-h-[98vh] overflow-hidden bg-slate-50/95 backdrop-blur-xl border-white/50 p-0 rounded-[2rem] shadow-2xl flex flex-col gap-0">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 text-white relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                        <div className="relative z-10">
                            <DialogTitle className="text-3xl font-black mb-2 flex items-center text-white tracking-tight">
                                <ShieldCheck className="w-8 h-8 mr-4 text-indigo-300" /> Konfigurasi Hak Akses
                            </DialogTitle>
                            <DialogDescription className="text-indigo-200 text-sm font-medium flex items-center">
                                <UserCheck className="w-4 h-4 mr-2 opacity-70" /> Kelola profil, kredensial login, dan hierarki peran untuk pengguna terpilih.
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-8 space-y-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <form id="editAuthorityForm" onSubmit={submitEdit} className="space-y-10">
                            {/* SECTION 1: Profil & Akun */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="h-10 w-1.5 bg-indigo-500 rounded-r-full -ml-8 mr-6"></div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Profil & Kredensial</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    {/* Display Info (ID Card Style) */}
                                    <div className="md:col-span-5">
                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden h-full flex flex-col justify-center">
                                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-50 to-purple-50"></div>
                                            <div className="relative z-10 flex flex-col items-center text-center">
                                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-xl border-4 border-white mb-4">
                                                    {getInitials(selectedUser?.name)}
                                                </div>
                                                <p className="font-black text-slate-900 text-xl tracking-tight">{selectedUser?.name}</p>
                                                <p className="text-sm text-indigo-600 font-bold mt-1.5 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">{selectedUser?.employee?.position?.name || 'Belum Ada Jabatan'}</p>
                                                
                                                <div className={`mt-6 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 ${selectedUser?.email_verified_at ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                                    <CheckCircle className="w-4 h-4" />
                                                    {selectedUser?.email_verified_at ? 'Akun Terverifikasi' : 'Akun Aktif'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="md:col-span-7 space-y-6">
                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 h-full">
                                            <div className="space-y-3">
                                                <Label className="text-slate-700 font-bold flex items-center text-sm">
                                                    <Mail className="w-4 h-4 mr-2 text-indigo-500" /> Email Akun Utama
                                                </Label>
                                                <Input 
                                                    type="email" 
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                                                    required
                                                />
                                                {errors.email && <p className="text-rose-500 text-xs font-bold mt-1">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-slate-700 font-bold flex items-center justify-between text-sm">
                                                    <span className="flex items-center"><KeyRound className="w-4 h-4 mr-2 text-indigo-500" /> Ubah Password Baru</span>
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">Opsional</span>
                                                </Label>
                                                <Input 
                                                    type="password" 
                                                    value={data.password}
                                                    onChange={e => setData('password', e.target.value)}
                                                    className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                    placeholder="Kosongkan jika tidak diubah"
                                                />
                                                {errors.password && <p className="text-rose-500 text-xs font-bold mt-1">{errors.password}</p>}
                                                <p className="text-xs text-slate-400 font-medium">Biarkan kosong jika Anda tidak ingin mengganti password saat ini.</p>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                                <Label className="text-slate-700 font-bold flex items-center text-sm">
                                                    <UserCheck className="w-4 h-4 mr-2 text-indigo-500" /> Pengecualian Verifikasi Presensi
                                                </Label>
                                                <div className="flex items-start space-x-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                                                    <Checkbox 
                                                        id="bypass_liveness"
                                                        checked={data.bypass_liveness}
                                                        onCheckedChange={(checked) => setData('bypass_liveness', !!checked)}
                                                        className="mt-0.5"
                                                    />
                                                    <label htmlFor="bypass_liveness" className="text-xs font-bold text-slate-800 cursor-pointer select-none leading-relaxed">
                                                        Bypass Verifikasi Wajah (Bebaskan Gerakan Tengok Kanan)
                                                        <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                                            Aktifkan untuk mengizinkan akun ini mengambil foto swafoto langsung tanpa wajib melakukan gerakan tengok kanan.
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* SECTION 2: Otoritas Peran */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="h-10 w-1.5 bg-purple-500 rounded-r-full -ml-8 mr-6"></div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Otoritas & Akses Sistem</h3>
                                </div>

                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-5 rounded-2xl flex items-start shadow-sm">
                                    <div className="p-2 bg-amber-100 rounded-xl mr-4 shrink-0 mt-0.5">
                                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-900 font-black text-sm tracking-tight mb-1">ATURAN KRITIKAL PRESENSI</h4>
                                        <p className="text-amber-700/80 text-sm leading-relaxed font-medium">
                                            Semua user role diwajibkan melakukan presensi harian menggunakan <b className="text-amber-900">Live Photo</b> dan <b className="text-amber-900">Live Location</b>. <br/>
                                            <span className="inline-block mt-1 bg-white/60 px-2 py-0.5 rounded text-amber-800 text-xs font-bold border border-amber-200">Kecuali: Role Super Admin tidak diwajibkan melakukan presensi.</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {roles.map((role) => {
                                        const isSelected = data.roles.includes(role.name);
                                        const desc = roleDescriptions[role.name] || { mgmt: 'Akses khusus module tertentu.', personal: 'Akses standar.' };
                                        
                                        return (
                                            <motion.div 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                key={role.id}
                                                onClick={() => toggleRole(role.name)}
                                                className={`relative p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer overflow-hidden ${
                                                    isSelected 
                                                    ? 'border-indigo-500 bg-white shadow-[0_8px_20px_rgba(99,102,241,0.12)]' 
                                                    : 'border-slate-200 bg-white hover:border-indigo-300 shadow-sm'
                                                }`}
                                            >
                                                {/* Selection background tint */}
                                                {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none"></div>}
                                                
                                                {/* Selection indicator */}
                                                <div className="absolute top-6 right-6 z-10">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-slate-50'
                                                    }`}>
                                                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                    </div>
                                                </div>

                                                <div className="pr-10 relative z-10">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            <Shield className="w-5 h-5" />
                                                        </div>
                                                        <h4 className={`font-black text-lg tracking-tight ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                                                            {role.name}
                                                        </h4>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                                                            <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest block mb-1">Area Manajemen</span>
                                                            <span className="text-slate-700 text-xs font-medium leading-relaxed block">{desc.mgmt}</span>
                                                        </div>
                                                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                                                            <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest block mb-1">Area Pribadi</span>
                                                            <span className="text-slate-700 text-xs font-medium leading-relaxed block">{desc.personal}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                {errors.roles && <p className="text-rose-500 text-sm font-semibold mt-2 px-2 bg-rose-50 inline-block py-1 rounded-md">{errors.roles}</p>}
                            </motion.div>
                        </form>
                    </div>

                    <DialogFooter className="p-6 bg-white border-t border-slate-100 flex-shrink-0 flex sm:justify-between items-center gap-4 rounded-b-[2rem]">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={closeEditModal}
                            className="rounded-xl h-12 px-6 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            form="editAuthorityForm"
                            disabled={processing}
                            className="rounded-xl h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Hak Akses'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Bulk Reset Confirmation Modal */}
            <Dialog open={isBulkResetModalOpen} onOpenChange={setIsBulkResetModalOpen}>
                <DialogContent className="max-w-md bg-white p-0 rounded-[2rem] overflow-hidden border-0 shadow-2xl">
                    <div className="bg-rose-500 p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-black text-white">Reset Password Massal</DialogTitle>
                    </div>
                    <div className="p-6 text-center">
                        <DialogDescription className="text-slate-600 font-medium text-base">
                            Anda akan mereset password untuk <span className="font-black text-rose-600">{selectedUsersForBulk.length} pengguna</span> yang dipilih menjadi password default (<b>password</b>).<br/><br/>
                            Apakah Anda yakin ingin melanjutkan tindakan ini?
                        </DialogDescription>
                    </div>
                    <DialogFooter className="p-6 pt-0 flex sm:justify-center gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsBulkResetModalOpen(false)}
                            className="rounded-xl h-12 px-6 font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={confirmBulkReset}
                            className="rounded-xl h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-200"
                        >
                            <KeyRound className="w-4 h-4 mr-2" />
                            Ya, Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800;900&display=swap');
                :root { --font-sans: 'Plus Jakarta Sans', sans-serif; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em; background-color: #F4F7FB; }
            `}} />
        </AuthenticatedLayout>
    );
}
