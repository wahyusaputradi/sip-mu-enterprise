import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    ShieldCheck, 
    Search, 
    Lock, 
    UserCheck, 
    KeyRound, 
    ShieldAlert, 
    Save, 
    Users, 
    GraduationCap, 
    QrCode, 
    RefreshCw, 
    Phone, 
    CheckCircle2, 
    XCircle, 
    Filter, 
    UserX,
    Building2,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserAuthorityIndex({ 
    users = { data: [] }, 
    roles = [], 
    employeeStats = {}, 
    students = { data: [] }, 
    studentStats = {}, 
    classes = [], 
    activeTab: initialTab = 'employees', 
    filters = {} 
}) {
    const [activeTab, setActiveTab] = useState(initialTab || 'employees');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || 'all');
    const [selectedStudentStatus, setSelectedStudentStatus] = useState(filters.status || 'all');

    // Modals Employee
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isBulkResetPasswordModalOpen, setIsBulkResetPasswordModalOpen] = useState(false);
    const [selectedUsersForBulk, setSelectedUsersForBulk] = useState([]);

    // Modals Student
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentToRegenerateQr, setStudentToRegenerateQr] = useState(null);
    const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
    const [isSingleRegenerateQrModalOpen, setIsSingleRegenerateQrModalOpen] = useState(false);
    const [isBulkRegenerateQrModalOpen, setIsBulkRegenerateQrModalOpen] = useState(false);
    const [isBulkStudentStatusModalOpen, setIsBulkStudentStatusModalOpen] = useState(false);
    const [isBulkResetStudentPasswordModalOpen, setIsBulkResetStudentPasswordModalOpen] = useState(false);
    const [selectedStudentsForBulk, setSelectedStudentsForBulk] = useState([]);
    const [bulkTargetStatus, setBulkTargetStatus] = useState('active');

    // Debounced search & filter handler
    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                searchTerm !== (filters.search || '') || 
                selectedClass !== (filters.class_id || 'all') || 
                selectedStudentStatus !== (filters.status || 'all')
            ) {
                router.get(
                    route('user-authority.index'), 
                    { 
                        tab: activeTab,
                        search: searchTerm || undefined, 
                        class_id: selectedClass !== 'all' ? selectedClass : undefined,
                        status: selectedStudentStatus !== 'all' ? selectedStudentStatus : undefined,
                    }, 
                    { preserveState: true, replace: true }
                );
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedClass, selectedStudentStatus, activeTab]);

    // Handle Tab Switch
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setSelectedUsersForBulk([]);
        setSelectedStudentsForBulk([]);
        router.get(
            route('user-authority.index'),
            { tab: tabName },
            { preserveState: true, replace: true }
        );
    };

    // Employee Form
    const userForm = useForm({
        email: '',
        password: '',
        roles: [],
        bypass_liveness: false,
        bypass_geofencing: false,
    });

    const openEditUserModal = (user) => {
        setSelectedUser(user);
        userForm.setData({
            email: user.email,
            password: '',
            roles: user.roles || [],
            bypass_liveness: !!user.bypass_liveness,
            bypass_geofencing: !!user.bypass_geofencing,
        });
        userForm.clearErrors();
        setIsEditUserModalOpen(true);
    };

    const submitUserEdit = (e) => {
        e.preventDefault();
        userForm.put(route('user-authority.update', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditUserModalOpen(false),
        });
    };

    const toggleUserRole = (roleName) => {
        const currentRoles = userForm.data.roles;
        const newRoles = currentRoles.includes(roleName)
            ? currentRoles.filter(r => r !== roleName)
            : [...currentRoles, roleName];
        userForm.setData('roles', newRoles);
    };

    const toggleBulkUserSelect = (userId) => {
        setSelectedUsersForBulk(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleSelectAllUsers = () => {
        if (selectedUsersForBulk.length === users.data.length) {
            setSelectedUsersForBulk([]);
        } else {
            setSelectedUsersForBulk(users.data.map(u => u.id));
        }
    };

    const confirmBulkResetPassword = () => {
        router.post(route('user-authority.bulk-reset-password'), { user_ids: selectedUsersForBulk }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedUsersForBulk([]);
                setIsBulkResetPasswordModalOpen(false);
            }
        });
    };

    // Student Form
    const studentForm = useForm({
        status: 'active',
        parent_phone: '',
        regenerate_qr: false,
    });

    const openEditStudentModal = (student) => {
        setSelectedStudent(student);
        studentForm.setData({
            status: student.status || 'active',
            parent_phone: student.parent_phone || '',
            regenerate_qr: false,
        });
        studentForm.clearErrors();
        setIsEditStudentModalOpen(true);
    };

    const submitStudentEdit = (e) => {
        e.preventDefault();
        studentForm.put(route('user-authority.students.update', selectedStudent.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditStudentModalOpen(false),
        });
    };

    const openSingleRegenerateQrModal = (student) => {
        setStudentToRegenerateQr(student);
        setIsSingleRegenerateQrModalOpen(true);
    };

    const confirmSingleRegenerateQr = () => {
        if (!studentToRegenerateQr) return;
        router.put(route('user-authority.students.update', studentToRegenerateQr.id), {
            status: studentToRegenerateQr.status,
            parent_phone: studentToRegenerateQr.parent_phone,
            regenerate_qr: true,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSingleRegenerateQrModalOpen(false);
                setStudentToRegenerateQr(null);
            }
        });
    };

    const toggleBulkStudentSelect = (studentId) => {
        setSelectedStudentsForBulk(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const toggleSelectAllStudents = () => {
        if (selectedStudentsForBulk.length === students.data.length) {
            setSelectedStudentsForBulk([]);
        } else {
            setSelectedStudentsForBulk(students.data.map(s => s.id));
        }
    };

    const confirmBulkRegenerateQr = () => {
        router.post(route('user-authority.students.bulk-regenerate-qr'), { student_ids: selectedStudentsForBulk }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStudentsForBulk([]);
                setIsBulkRegenerateQrModalOpen(false);
            }
        });
    };

    const confirmBulkUpdateStudentStatus = () => {
        router.post(route('user-authority.students.bulk-update-status'), { 
            student_ids: selectedStudentsForBulk,
            status: bulkTargetStatus 
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStudentsForBulk([]);
                setIsBulkStudentStatusModalOpen(false);
            }
        });
    };

    const confirmBulkResetStudentPassword = () => {
        router.post(route('user-authority.students.bulk-reset-password'), { student_ids: selectedStudentsForBulk }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStudentsForBulk([]);
                setIsBulkResetStudentPasswordModalOpen(false);
            }
        });
    };

    const roleDescriptions = {
        'Super Admin': 'Akses penuh tanpa batas ke seluruh fitur sistem.',
        'Kepala Sekolah': 'Monitoring laporan, presensi, evaluasi kinerja sekolah.',
        'Kurikulum': 'Pengelolaan SDM, data kelas, jadwal mengajar & presensi siswa.',
        'Bendahara': 'Pengelolaan data pegawai, jabatan, dan struktur kepegawaian.',
        'Absensi': 'Monitoring presensi pegawai & verifikasi foto kehadiran.',
        'Guru': 'Presensi harian, jadwal mengajar, persetujuan izin/sakit siswa.',
        'Karyawan': 'Presensi harian, data profil pribadi, dan rekap absensi.',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <ShieldCheck className="w-3 h-3 mr-1.5" /> Access Control & Credentials
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Otoritas <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">User & Kredensial</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Pusat tata kelola peran pegawai serta manajemen kredensial & akses presensi siswa-siswi.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Otoritas User" />

            <div className="space-y-6 pb-8">
                {/* Modern Navigation Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl w-fit">
                    <button
                        onClick={() => handleTabChange('employees')}
                        className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2.5 ${
                            activeTab === 'employees'
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Otoritas Pegawai, Guru & Karyawan
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                            {employeeStats.total_users || 0}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('students')}
                        className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2.5 ${
                            activeTab === 'students'
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Otoritas & Akses Siswa-Siswi
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black">
                            {studentStats.total_students || 0}
                        </span>
                    </button>
                </div>

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB 1: PEGAWAI / GURU / KARYAWAN                   */}
                {/* ══════════════════════════════════════════════════ */}
                {activeTab === 'employees' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Total Akun Pegawai</p>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{employeeStats.total_users || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Terdaftar di sistem</p>
                                    </div>
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Super Administrator</p>
                                        <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{employeeStats.total_super_admin || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Akses penuh sistem</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Tenaga Pendidik (Guru)</p>
                                        <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{employeeStats.total_guru || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Guru & Wali Kelas</p>
                                    </div>
                                    <div className="p-3 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xl">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Presensi Ter-Bypass</p>
                                        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{employeeStats.total_bypassed || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Bypass GPS / Swafoto</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                                        <ShieldAlert className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search & Actions Toolbar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    type="text" 
                                    placeholder="Cari nama pegawai, email..." 
                                    className="pl-10 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {selectedUsersForBulk.length > 0 && (
                                <Button 
                                    onClick={() => setIsBulkResetPasswordModalOpen(true)}
                                    className="h-10 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center gap-2 shadow-sm"
                                >
                                    <KeyRound className="w-4 h-4" /> Reset Password Massal ({selectedUsersForBulk.length})
                                </Button>
                            )}
                        </div>

                        {/* Employee Table */}
                        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                                            <TableRow className="border-b border-slate-200/80 dark:border-slate-800">
                                                <TableHead className="w-12 py-4 px-4 text-center">
                                                    <Checkbox 
                                                        checked={selectedUsersForBulk.length === users.data.length && users.data.length > 0}
                                                        onCheckedChange={toggleSelectAllUsers}
                                                    />
                                                </TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pegawai & Jabatan</TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Email Akun</TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Peran / Role Systems</TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Pengecualian Presensi</TableHead>
                                                <TableHead className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {users.data && users.data.length > 0 ? (
                                                users.data.map((user) => (
                                                    <TableRow key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                                        <TableCell className="py-4 px-4 text-center">
                                                            <Checkbox 
                                                                checked={selectedUsersForBulk.includes(user.id)}
                                                                onCheckedChange={() => toggleBulkUserSelect(user.id)}
                                                            />
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user.name}</h4>
                                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                                        {user.employee?.position?.name || 'Staf Sekolah'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300">
                                                            {user.email}
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {user.roles && user.roles.length > 0 ? (
                                                                    user.roles.map((r, idx) => (
                                                                        <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                                                                            {r}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-[11px] text-slate-400 italic">Tanpa Peran</span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {user.bypass_geofencing ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                                        GPS Bypass
                                                                    </span>
                                                                ) : null}
                                                                {user.bypass_liveness ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-200">
                                                                        Foto Bypass
                                                                    </span>
                                                                ) : null}
                                                                {!user.bypass_geofencing && !user.bypass_liveness && (
                                                                    <span className="text-[11px] text-slate-400">-</span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 px-5 text-right">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => openEditUserModal(user)}
                                                                className="h-8 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                                                            >
                                                                Edit Otoritas
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                        Tidak ada akun pegawai ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {users.links && users.links.length > 3 && (
                                    <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                                        <div className="text-xs text-slate-500">
                                            Menampilkan {users.from || 0} - {users.to || 0} dari {users.total || 0} pegawai
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {users.links.map((link, idx) => (
                                                <button
                                                    key={idx}
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                                                        link.active
                                                            ? 'bg-indigo-600 text-white font-bold'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                                    } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB 2: SISWA-SISWI                                 */}
                {/* ══════════════════════════════════════════════════ */}
                {activeTab === 'students' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                        {/* KPI Cards Student */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Total Siswa Terdaftar</p>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{studentStats.total_students || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Keseluruhan siswa-siswi</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Siswa Aktif Presensi</p>
                                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{studentStats.active_students || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Dapat melakukan scan QR</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">Siswa Non-Aktif / Pindah</p>
                                        <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{studentStats.inactive_students || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Non-aktif / Lulus / Pindah</p>
                                    </div>
                                    <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
                                        <UserX className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">QR Token Tergenerasi</p>
                                        <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{studentStats.qr_token_registered || 0}</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Kredensial aktif scanner</p>
                                    </div>
                                    <div className="p-3 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xl">
                                        <QrCode className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search & Class Filter Toolbar */}
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        type="text" 
                                        placeholder="Cari nama siswa, NIS, No. WA..." 
                                        className="pl-10 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="w-full sm:w-[180px]">
                                    <Select 
                                        value={selectedClass} 
                                        onValueChange={(val) => setSelectedClass(val)}
                                    >
                                        <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Pilih Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Kelas</SelectItem>
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full sm:w-[150px]">
                                    <Select 
                                        value={selectedStudentStatus} 
                                        onValueChange={(val) => setSelectedStudentStatus(val)}
                                    >
                                        <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Status Siswa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="inactive">Non-Aktif</SelectItem>
                                            <SelectItem value="graduated">Lulus</SelectItem>
                                            <SelectItem value="moved">Pindah</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedStudentsForBulk.length > 0 && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button 
                                        onClick={() => setIsBulkRegenerateQrModalOpen(true)}
                                        className="h-10 px-3 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate QR ({selectedStudentsForBulk.length})
                                    </Button>

                                    <Button 
                                        onClick={() => setIsBulkStudentStatusModalOpen(true)}
                                        className="h-10 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                                    >
                                        Ubah Status ({selectedStudentsForBulk.length})
                                    </Button>

                                    <Button 
                                        onClick={() => setIsBulkResetStudentPasswordModalOpen(true)}
                                        className="h-10 px-3 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                                    >
                                        <KeyRound className="w-3.5 h-3.5" /> Reset Password ({selectedStudentsForBulk.length})
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Student Table */}
                        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                                            <TableRow className="border-b border-slate-200/80 dark:border-slate-800">
                                                <TableHead className="w-12 py-4 px-4 text-center">
                                                    <Checkbox 
                                                        checked={selectedStudentsForBulk.length === students.data.length && students.data.length > 0}
                                                        onCheckedChange={toggleSelectAllStudents}
                                                    />
                                                </TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Siswa & Kelas</TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">No. WhatsApp Ortu</TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Token Kredensial QR</TableHead>
                                                <TableHead className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status Akses</TableHead>
                                                <TableHead className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Aksi Kredensial</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {students.data && students.data.length > 0 ? (
                                                students.data.map((student) => (
                                                    <TableRow key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                                        <TableCell className="py-4 px-4 text-center">
                                                            <Checkbox 
                                                                checked={selectedStudentsForBulk.includes(student.id)}
                                                                onCheckedChange={() => toggleBulkStudentSelect(student.id)}
                                                            />
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/50 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{student.name}</h4>
                                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                                                        <span>NIS: {student.nis}</span>
                                                                        <span>•</span>
                                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                                            {student.school_class?.name || student.schoolClass?.name || '-'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4">
                                                            {student.parent_phone ? (
                                                                <a 
                                                                    href={`https://wa.me/${student.parent_phone.replace(/[^0-9]/g, '')}`} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                                                                >
                                                                    <Phone className="w-3.5 h-3.5" /> {student.parent_phone}
                                                                </a>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400 italic">Belum diisi</span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                                                                    {student.qr_token || 'BELUM SET'}
                                                                </code>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 px-4 text-center">
                                                            {student.status === 'active' && (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                                    Aktif
                                                                </span>
                                                            )}
                                                            {student.status === 'inactive' && (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                                    Non-Aktif
                                                                </span>
                                                            )}
                                                            {student.status === 'graduated' && (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                                                    Lulus
                                                                </span>
                                                            )}
                                                            {student.status === 'moved' && (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                                                    Pindah
                                                                </span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="py-4 px-5 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => openSingleRegenerateQrModal(student)}
                                                                    title="Regenerate QR Token Baru"
                                                                    className="h-8 px-2 text-xs border-sky-200 text-sky-600 hover:bg-sky-50 rounded-lg flex items-center gap-1 font-bold"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" /> QR Token
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => openEditStudentModal(student)}
                                                                    className="h-8 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                                                                >
                                                                    Edit Akses
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                        Tidak ada data siswa ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {students.links && students.links.length > 3 && (
                                    <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                                        <div className="text-xs text-slate-500">
                                            Menampilkan {students.from || 0} - {students.to || 0} dari {students.total || 0} siswa
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {students.links.map((link, idx) => (
                                                <button
                                                    key={idx}
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                                                        link.active
                                                            ? 'bg-indigo-600 text-white font-bold'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                                    } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════ */}
            {/* MODALS SECTION                                     */}
            {/* ══════════════════════════════════════════════════ */}

            {/* Modal Edit User (Pegawai) */}
            <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
                <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Edit Otoritas Pegawai — {selectedUser?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Atur peran (roles) dan penyesuaian izin presensi pegawai ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitUserEdit} className="space-y-4 my-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Email Login *</Label>
                            <Input 
                                type="email" 
                                value={userForm.data.email}
                                onChange={(e) => userForm.setData('email', e.target.value)}
                                className="h-10 text-xs rounded-xl"
                            />
                            {userForm.errors.email && <p className="text-[11px] text-rose-500">{userForm.errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Password Baru (Opsional)</Label>
                            <Input 
                                type="password" 
                                placeholder="Kosongkan jika tidak ingin diubah"
                                value={userForm.data.password}
                                onChange={(e) => userForm.setData('password', e.target.value)}
                                className="h-10 text-xs rounded-xl"
                            />
                        </div>

                        {/* Roles Selection */}
                        <div className="space-y-2 pt-1">
                            <Label className="text-xs font-bold">Peran / Roles System *</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                                {roles.map((r) => (
                                    <div key={r.id} className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <Checkbox 
                                            id={`role-${r.id}`}
                                            checked={userForm.data.roles.includes(r.name)}
                                            onCheckedChange={() => toggleUserRole(r.name)}
                                            className="mt-0.5"
                                        />
                                        <div className="grid gap-0.5 leading-none">
                                            <label htmlFor={`role-${r.id}`} className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                                                {r.name}
                                            </label>
                                            <p className="text-[10px] text-slate-500">
                                                {roleDescriptions[r.name] || 'Akses modul terdaftar.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bypass Toggles */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Label className="text-xs font-bold text-slate-900 dark:text-white">Pengecualian Proteksi Presensi</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50">
                                    <Checkbox 
                                        checked={userForm.data.bypass_geofencing}
                                        onCheckedChange={(val) => userForm.setData('bypass_geofencing', !!val)}
                                    />
                                    <span className="text-xs font-semibold">Bypass Geofencing</span>
                                </label>

                                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50">
                                    <Checkbox 
                                        checked={userForm.data.bypass_liveness}
                                        onCheckedChange={(val) => userForm.setData('bypass_liveness', !!val)}
                                    />
                                    <span className="text-xs font-semibold">Bypass Liveness</span>
                                </label>
                            </div>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditUserModalOpen(false)} className="rounded-xl text-xs">
                                Batal
                            </Button>
                            <Button type="submit" disabled={userForm.processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm">
                                {userForm.processing ? 'Menyimpan...' : 'Simpan Otoritas'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Bulk Reset Password Pegawai */}
            <Dialog open={isBulkResetPasswordModalOpen} onOpenChange={setIsBulkResetPasswordModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-amber-600 flex items-center gap-2">
                            <KeyRound className="w-5 h-5" /> Reset Password Massal
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Reset password untuk {selectedUsersForBulk.length} pegawai terpilih ke default password (<code>password</code>).
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsBulkResetPasswordModalOpen(false)} className="rounded-xl text-xs">
                            Batal
                        </Button>
                        <Button onClick={confirmBulkResetPassword} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl">
                            Konfirmasi Reset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Student Credentials */}
            <Dialog open={isEditStudentModalOpen} onOpenChange={setIsEditStudentModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600" /> Edit Akses Siswa — {selectedStudent?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            NIS: {selectedStudent?.nis} • Kelas: {selectedStudent?.school_class?.name || selectedStudent?.schoolClass?.name || '-'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitStudentEdit} className="space-y-4 my-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Status Akses Presensi *</Label>
                            <Select 
                                value={studentForm.data.status}
                                onValueChange={(val) => studentForm.setData('status', val)}
                            >
                                <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif (Bisa Presensi Kiosk)</SelectItem>
                                    <SelectItem value="inactive">Non-Aktif (Di-Suspend)</SelectItem>
                                    <SelectItem value="graduated">Lulus</SelectItem>
                                    <SelectItem value="moved">Pindah Sekolah</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold">No. WhatsApp Orang Tua</Label>
                            <Input 
                                type="text"
                                placeholder="Contoh: 08123456789"
                                value={studentForm.data.parent_phone}
                                onChange={(e) => studentForm.setData('parent_phone', e.target.value)}
                                className="h-10 text-xs rounded-xl"
                            />
                        </div>

                        <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800/40">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox 
                                    checked={studentForm.data.regenerate_qr}
                                    onCheckedChange={(val) => studentForm.setData('regenerate_qr', !!val)}
                                />
                                <div>
                                    <span className="text-xs font-bold text-sky-800 dark:text-sky-300">Regenerate QR Token Baru</span>
                                    <p className="text-[10px] text-sky-600 dark:text-sky-400">Buat ulang token jika kartu QR siswa hilang / rusak.</p>
                                </div>
                            </label>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditStudentModalOpen(false)} className="rounded-xl text-xs">
                                Batal
                            </Button>
                            <Button type="submit" disabled={studentForm.processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm">
                                {studentForm.processing ? 'Menyimpan...' : 'Simpan Kredensial'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Single Regenerate QR Token Siswa */}
            <Dialog open={isSingleRegenerateQrModalOpen} onOpenChange={setIsSingleRegenerateQrModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-sky-600 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" /> Regenerate QR Token Siswa
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                            Apakah Anda yakin ingin me-regenerate QR Token baru untuk siswa <strong className="text-slate-900 dark:text-white">{studentToRegenerateQr?.name}</strong> (NIS: {studentToRegenerateQr?.nis})? Token lama tidak akan bisa digunakan lagi untuk presensi.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsSingleRegenerateQrModalOpen(false)} className="rounded-xl text-xs">
                            Batal
                        </Button>
                        <Button onClick={confirmSingleRegenerateQr} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl">
                            Konfirmasi Regenerate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Bulk Regenerate QR Token Siswa */}
            <Dialog open={isBulkRegenerateQrModalOpen} onOpenChange={setIsBulkRegenerateQrModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-sky-600 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" /> Regenerate QR Token Massal
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Regenerate QR Token untuk {selectedStudentsForBulk.length} siswa terpilih. Token lama tidak akan bisa di-scan lagi.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsBulkRegenerateQrModalOpen(false)} className="rounded-xl text-xs">
                            Batal
                        </Button>
                        <Button onClick={confirmBulkRegenerateQr} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl">
                            Konfirmasi Regenerate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Bulk Update Student Status */}
            <Dialog open={isBulkStudentStatusModalOpen} onOpenChange={setIsBulkStudentStatusModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-indigo-600 flex items-center gap-2">
                            <Users className="w-5 h-5" /> Ubah Status Siswa Massal
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Ubah status keaktifan untuk {selectedStudentsForBulk.length} siswa terpilih.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-3 space-y-2">
                        <Label className="text-xs font-bold">Pilih Status Baru</Label>
                        <Select value={bulkTargetStatus} onValueChange={(val) => setBulkTargetStatus(val)}>
                            <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Non-Aktif</SelectItem>
                                <SelectItem value="graduated">Lulus</SelectItem>
                                <SelectItem value="moved">Pindah</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsBulkStudentStatusModalOpen(false)} className="rounded-xl text-xs">
                            Batal
                        </Button>
                        <Button onClick={confirmBulkUpdateStudentStatus} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Bulk Reset Student Password */}
            <Dialog open={isBulkResetStudentPasswordModalOpen} onOpenChange={setIsBulkResetStudentPasswordModalOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                            <KeyRound className="w-5 h-5" /> Reset Password Siswa Massal
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Reset password akun login untuk {selectedStudentsForBulk.length} siswa terpilih ke default password (<code>password</code>).
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsBulkResetStudentPasswordModalOpen(false)} className="rounded-xl text-xs">
                            Batal
                        </Button>
                        <Button onClick={confirmBulkResetStudentPassword} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl">
                            Konfirmasi Reset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
