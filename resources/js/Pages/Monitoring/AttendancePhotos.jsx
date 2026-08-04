import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Camera, MapPin, Calendar, Clock, CheckCircle2, 
    Trash2, Download, Search, Image as ImageIcon, 
    ExternalLink, HardDrive, Info, Check, Eye,
    LayoutGrid, LayoutList, Grid3X3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AttendancePhotos({ photos, campusLocations, stats, filters }) {
    const { auth } = usePage().props;
    const userRoles = auth?.user?.roles || (auth?.user?.role ? [auth.user.role] : []);
    const canDeletePhoto = userRoles.some(r => ['Super Admin', 'Kurikulum', 'Absensi'].includes(r));

    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [photoType, setPhotoType] = useState(filters.photo_type || 'all');
    const [campusId, setCampusId] = useState(filters.campus_location_id || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || 12);

    // UI States
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'compact', 'table'
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null); // stores single photo being deleted {type, id}
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Apply Filter Function
    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(route('monitoring.photos.index'), {
            search,
            start_date: startDate,
            end_date: endDate,
            photo_type: photoType,
            campus_location_id: campusId === 'all' ? '' : campusId,
            per_page: perPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Handle Per Page Dropdown Change directly triggers reload
    const handlePerPageChange = (value) => {
        setPerPage(value);
        router.get(route('monitoring.photos.index'), {
            search,
            start_date: startDate,
            end_date: endDate,
            photo_type: photoType,
            campus_location_id: campusId === 'all' ? '' : campusId,
            per_page: value
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Reset Filters
    const handleReset = () => {
        setSearch('');
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setPhotoType('all');
        setCampusId('all');
        setPerPage(12);

        router.get(route('monitoring.photos.index'), {
            search: '',
            start_date: today,
            end_date: today,
            photo_type: 'all',
            campus_location_id: '',
            per_page: 12
        });
    };

    // Bulk selection logic
    const handleSelectPhoto = (photo) => {
        if (selectedPhotos.some(p => p.unique_key === photo.unique_key)) {
            setSelectedPhotos(selectedPhotos.filter(p => p.unique_key !== photo.unique_key));
        } else {
            setSelectedPhotos([...selectedPhotos, photo]);
        }
    };

    const handleSelectAll = () => {
        if (selectedPhotos.length === photos.data.length) {
            setSelectedPhotos([]);
        } else {
            setSelectedPhotos(photos.data);
        }
    };

    // Single Photo Delete
    const handleDeleteSingle = () => {
        if (!isDeleting) return;
        router.delete(route('monitoring.photos.destroy', { type: isDeleting.type, id: isDeleting.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Foto presensi berhasil dihapus.');
                setSelectedPhotos(selectedPhotos.filter(p => !(p.id === isDeleting.id && p.type === isDeleting.type)));
                setIsDeleting(null);
            },
            onError: () => {
                toast.error('Gagal menghapus foto.');
            }
        });
    };

    // Bulk Photo Delete
    const handleDeleteBulk = () => {
        if (selectedPhotos.length === 0) return;
        router.post(route('monitoring.photos.bulk-destroy'), {
            photos: selectedPhotos.map(p => ({ id: p.id, type: p.type }))
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${selectedPhotos.length} foto presensi berhasil dihapus.`);
                setSelectedPhotos([]);
                setIsBulkDeleting(false);
            },
            onError: () => {
                toast.error('Gagal menghapus foto secara massal.');
            }
        });
    };

    const handleBulkDownload = async () => {
        if (selectedPhotos.length === 0) return;
        
        const toastId = toast.loading('Menyiapkan kompresi ZIP untuk unduhan...');
        
        try {
            const formattedPhotos = selectedPhotos.map(p => ({
                id: p.id,
                type: p.type || 'daily_in',
            }));

            const response = await axios.post(route('monitoring.photos.download'), {
                photos: formattedPhotos
            }, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            let fileName = `Unduh_Foto_Presensi_${new Date().toISOString().slice(0, 10)}.zip`;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    fileName = matches[1].replace(/['"]/g, '');
                }
            }
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('ZIP foto presensi berhasil diunduh.', { id: toastId });
        } catch (error) {
            console.error(error);
            let errorMsg = 'Gagal mengunduh ZIP presensi.';
            
            if (error.response && error.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errData = JSON.parse(reader.result);
                        toast.error(errData.message || errorMsg, { id: toastId });
                    } catch (e) {
                        toast.error(errorMsg, { id: toastId });
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error(errorMsg, { id: toastId });
            }
        }
    };


    // Visual badge styles for photo types
    const getTypeStyles = (type) => {
        switch (type) {
            case 'daily_in':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'daily_out':
                return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
            case 'teaching':
                return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Camera className="w-3.5 h-3.5 mr-1.5" /> Media Audit
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Kelola Foto <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Presensi</span>
                        </h2>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm shrink-0 self-start md:self-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-md scale-100'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" /> Grid
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                viewMode === 'compact'
                                    ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-md scale-100'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Grid3X3 className="w-3.5 h-3.5" /> Compact
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-md scale-100'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <LayoutList className="w-3.5 h-3.5" /> Tabel
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Kelola Foto Presensi" />

            <div className="space-y-8 pb-12">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white dark:bg-card border-slate-100 dark:border-border rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-500"><ImageIcon className="w-32 h-32" /></div>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                                <ImageIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Foto Ditampilkan</p>
                                <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">{stats.total_count} <span className="text-xs font-semibold text-slate-400">File</span></h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-card border-slate-100 dark:border-border rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-500"><HardDrive className="w-32 h-32" /></div>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                                <HardDrive className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Ukuran Storage</p>
                                <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">{stats.total_size_human}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-card border-slate-100 dark:border-border rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-500"><CheckCircle2 className="w-32 h-32" /></div>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Terpilih untuk Aksi</p>
                                <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">{selectedPhotos.length} <span className="text-xs font-semibold text-slate-400">Terpilih</span></h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Panel */}
                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-white dark:border-border rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                    <CardHeader className="p-6 pb-4 border-b border-slate-50/50 dark:border-border bg-white/50 dark:bg-card/50 rounded-t-[2rem]">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center"><Search className="w-5 h-5 mr-2 text-indigo-500" /> Filter & Pencarian</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                            <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs">Cari Pegawai / Guru</Label>
                                <Input 
                                    placeholder="Masukkan nama pegawai..." 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)}
                                    className="rounded-xl border-slate-200 dark:border-border bg-slate-50/50 dark:bg-secondary/30 focus-visible:ring-indigo-500 focus-visible:bg-white h-11 font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs">Tanggal Mulai</Label>
                                <Input 
                                    type="date"
                                    value={startDate} 
                                    onChange={e => setStartDate(e.target.value)}
                                    className="rounded-xl border-slate-200 dark:border-border bg-slate-50/50 dark:bg-secondary/30 h-11 font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs">Tanggal Selesai</Label>
                                <Input 
                                    type="date"
                                    value={endDate} 
                                    onChange={e => setEndDate(e.target.value)}
                                    className="rounded-xl border-slate-200 dark:border-border bg-slate-50/50 dark:bg-secondary/30 h-11 font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs">Jenis Foto</Label>
                                <Select value={photoType} onValueChange={setPhotoType}>
                                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-border bg-slate-50/50 dark:bg-secondary/30 h-11 font-semibold text-sm">
                                        <SelectValue placeholder="Pilih Jenis" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all" className="font-semibold">Semua Jenis</SelectItem>
                                        <SelectItem value="daily_in" className="font-semibold">Presensi Masuk</SelectItem>
                                        <SelectItem value="daily_out" className="font-semibold">Presensi Pulang</SelectItem>
                                        <SelectItem value="teaching" className="font-semibold">Presensi Mengajar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs">Lokasi Kampus</Label>
                                <Select value={campusId} onValueChange={setCampusId}>
                                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-border bg-slate-50/50 dark:bg-secondary/30 h-11 font-semibold text-sm">
                                        <SelectValue placeholder="Pilih Lokasi" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all" className="font-semibold">Semua Lokasi</SelectItem>
                                        {campusLocations.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)} className="font-semibold">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs">Tampilkan</Label>
                                <Select value={String(perPage)} onValueChange={val => handlePerPageChange(Number(val))}>
                                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-border bg-slate-50/50 dark:bg-secondary/30 h-11 font-semibold text-sm">
                                        <SelectValue placeholder="Jumlah Per Halaman" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="12" className="font-semibold">12 data / hal</SelectItem>
                                        <SelectItem value="24" className="font-semibold">24 data / hal</SelectItem>
                                        <SelectItem value="50" className="font-semibold">50 data / hal</SelectItem>
                                        <SelectItem value="100" className="font-semibold">100 data / hal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6 flex justify-end gap-3 pt-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleReset}
                                    className="rounded-xl font-bold h-11 px-6 border-slate-200"
                                >
                                    Reset
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="rounded-xl font-bold h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none"
                                >
                                    Terapkan Filter
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Bulk Actions Panel */}
                {photos.data.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-card border border-slate-100 dark:border-border p-5 rounded-3xl gap-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center justify-center h-5 w-5 rounded border border-slate-300 dark:border-border text-white focus:outline-none hover:border-indigo-500 transition-colors bg-white dark:bg-card relative"
                            >
                                {selectedPhotos.length === photos.data.length && (
                                    <div className="h-3 w-3 bg-indigo-600 rounded flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>
                                )}
                            </button>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Pilih Semua ({selectedPhotos.length} terpilih)
                            </span>
                        </div>
                        
                        <AnimatePresence>
                            {selectedPhotos.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-3 w-full sm:w-auto"
                                >
                                    {canDeletePhoto && (
                                        <Button
                                            onClick={() => setIsBulkDeleting(true)}
                                            variant="outline"
                                            className="rounded-xl font-bold border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-10 w-full sm:w-auto px-4"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Hapus Terpilih
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleBulkDownload}
                                        className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-full sm:w-auto px-5 shadow-md shadow-emerald-100 dark:shadow-none"
                                    >
                                        <Download className="w-4 h-4 mr-2" /> Unduh ZIP Terpilih
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Photo Gallery Container */}
                {photos.data.length > 0 ? (
                    viewMode === 'table' ? (
                        <div className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-[2rem] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-secondary/20 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">
                                            <th className="p-4 w-12 text-center">
                                                <button
                                                    onClick={handleSelectAll}
                                                    className="flex items-center justify-center h-4 w-4 mx-auto rounded border border-slate-300 dark:border-border text-white focus:outline-none bg-white dark:bg-card relative"
                                                >
                                                    {selectedPhotos.length === photos.data.length && (
                                                        <div className="h-2.5 w-2.5 bg-indigo-600 rounded flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>
                                                    )}
                                                </button>
                                            </th>
                                            <th className="p-4 w-20">Foto</th>
                                            <th className="p-4">Pegawai / Guru</th>
                                            <th className="p-4 w-36">Tipe Presensi</th>
                                            <th className="p-4 w-44">Waktu</th>
                                            <th className="p-4 w-48">Lokasi Kampus</th>
                                            <th className="p-4 w-28 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-border text-xs">
                                        {photos.data.map((photo) => {
                                            const isSelected = selectedPhotos.some(p => p.unique_key === photo.unique_key);
                                            return (
                                                <tr 
                                                    key={photo.unique_key}
                                                    className={`hover:bg-slate-50/50 dark:hover:bg-secondary/10 transition-colors ${
                                                        isSelected ? 'bg-indigo-50/20 dark:bg-indigo-500/5' : ''
                                                    }`}
                                                >
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleSelectPhoto(photo)}
                                                            className={`flex items-center justify-center h-5 w-5 mx-auto rounded border transition-all ${
                                                                isSelected 
                                                                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                                    : 'bg-white dark:bg-card border-slate-300 dark:border-border hover:border-indigo-500'
                                                            }`}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                        </button>
                                                    </td>
                                                    <td className="p-4">
                                                        <div 
                                                            onClick={() => setPreviewPhoto(photo)}
                                                            className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-secondary/30 relative overflow-hidden border border-slate-100 dark:border-border cursor-pointer group/thumb shadow-sm"
                                                        >
                                                            {photo.photo_url ? (
                                                                <img 
                                                                    src={photo.photo_url} 
                                                                    alt={photo.employee_name} 
                                                                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-5 h-5" /></div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]" title={photo.employee_name}>
                                                            {photo.employee_name}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{photo.employee_nip}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeStyles(photo.type)}`}>
                                                            {photo.type_label}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                                                            {new Date(photo.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                                                            {photo.time} WIB
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-semibold text-slate-500 dark:text-slate-400 max-w-[180px] truncate" title={photo.campus_name}>
                                                        <div className="flex items-center truncate">
                                                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                                                            {photo.campus_name}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button 
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setPreviewPhoto(photo)}
                                                                className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            {canDeletePhoto && (
                                                                <Button 
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setIsDeleting({ type: photo.type, id: photo.id })}
                                                                    className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : viewMode === 'compact' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {photos.data.map((photo) => {
                                const isSelected = selectedPhotos.some(p => p.unique_key === photo.unique_key);
                                return (
                                    <motion.div 
                                        key={photo.unique_key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className={`relative group bg-white dark:bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                                            isSelected ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-100 dark:border-border'
                                        }`}
                                    >
                                        {/* Select Box Toggle */}
                                        <div className="absolute top-2.5 left-2.5 z-20">
                                            <button
                                                onClick={() => handleSelectPhoto(photo)}
                                                className={`flex items-center justify-center h-5 w-5 rounded-lg border transition-all ${
                                                    isSelected 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                        : 'bg-white/80 backdrop-blur-md border-slate-300 hover:border-indigo-500 shadow-sm'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </button>
                                        </div>

                                        {/* Thumbnail Photo with overlay */}
                                        <div className="aspect-square w-full bg-slate-100 dark:bg-secondary/30 relative overflow-hidden">
                                            {photo.photo_url ? (
                                                <img 
                                                    src={photo.photo_url} 
                                                    alt={photo.employee_name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                            
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 z-10">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setPreviewPhoto(photo)} 
                                                    className="bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-bold h-8 px-2 text-[10px]"
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                                                </Button>
                                                {canDeletePhoto && (
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => setIsDeleting({ type: photo.type, id: photo.id })} 
                                                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Info - Highly Compact */}
                                        <div className="p-3 space-y-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className={`inline-flex items-center text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${getTypeStyles(photo.type)}`}>
                                                    {photo.type_label.replace('Presensi ', '')}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400">{photo.time}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight truncate text-[11px]" title={photo.employee_name}>{photo.employee_name}</h4>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {photos.data.map((photo) => {
                                const isSelected = selectedPhotos.some(p => p.unique_key === photo.unique_key);
                                return (
                                    <motion.div 
                                        key={photo.unique_key}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`relative group bg-white dark:bg-card border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                                            isSelected ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-100 dark:border-border'
                                        }`}
                                    >
                                        {/* Select Box Toggle */}
                                        <div className="absolute top-4 left-4 z-20">
                                            <button
                                                onClick={() => handleSelectPhoto(photo)}
                                                className={`flex items-center justify-center h-6 w-6 rounded-xl border transition-all ${
                                                    isSelected 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                        : 'bg-white/80 backdrop-blur-md border-slate-300 hover:border-indigo-500 shadow-sm'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>

                                        {/* Thumbnail Photo with overlay */}
                                        <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-secondary/30 relative overflow-hidden">
                                            {photo.photo_url ? (
                                                <img 
                                                    src={photo.photo_url} 
                                                    alt={photo.employee_name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                    <ImageIcon className="w-12 h-12" />
                                                    <span className="text-[10px] font-bold mt-2">FOTO KOSONG</span>
                                                </div>
                                            )}
                                            
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setPreviewPhoto(photo)} 
                                                    className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold h-9"
                                                >
                                                    <Eye className="w-4 h-4 mr-1.5" /> Detail
                                                </Button>
                                                {canDeletePhoto && (
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => setIsDeleting({ type: photo.type, id: photo.id })} 
                                                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold h-9"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Info */}
                                        <div className="p-5 space-y-3">
                                            <div>
                                                <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getTypeStyles(photo.type)}`}>
                                                    {photo.type_label}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight truncate">{photo.employee_name}</h4>
                                                <p className="text-xs font-semibold text-slate-400 mt-0.5">{photo.employee_nip}</p>
                                            </div>

                                            <div className="pt-2 border-t border-slate-50 dark:border-border flex flex-col gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                                                    {new Date(photo.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                                                    {photo.time} WIB
                                                </div>
                                                <div className="flex items-center truncate">
                                                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                                                    {photo.campus_name}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <Card className="border border-white dark:border-border rounded-[2rem] bg-white/80 dark:bg-card/80 backdrop-blur-xl p-16 text-center shadow-sm">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-16 h-16 mb-4 text-slate-200 dark:text-secondary" />
                            <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">Tidak ada foto presensi ditemukan</p>
                            <p className="text-xs text-slate-400 mt-1">Gunakan panel filter untuk mencari foto presensi di rentang tanggal lainnya.</p>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {photos.links.length > 3 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-1 bg-white/60 dark:bg-card/60 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-border backdrop-blur-sm">
                            {photos.links.map((link, i) => {
                                const label = link.label
                                    .replace('&laquo; Previous', 'Prev')
                                    .replace('Next &raquo;', 'Next');
                                
                                return (
                                    <Link
                                        key={i}
                                        disabled={!link.url}
                                        href={link.url || '#'}
                                        only={['photos']}
                                        preserveScroll
                                        preserveState
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                            link.active 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : !link.url 
                                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50' 
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox / Preview Modal */}
            <Dialog open={!!previewPhoto} onOpenChange={open => !open && setPreviewPhoto(null)}>
                <DialogContent className="max-w-[90vw] md:max-w-[75vw] lg:max-w-[65vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col md:flex-row h-[80vh] bg-white dark:bg-card">
                    {/* Left: Big Image */}
                    <div className="flex-1 bg-slate-950 dark:bg-black flex items-center justify-center relative overflow-hidden h-[45%] md:h-full">
                        {previewPhoto?.photo_url ? (
                            <img 
                                src={previewPhoto.photo_url} 
                                alt={previewPhoto.employee_name} 
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-white text-center flex flex-col items-center">
                                <ImageIcon className="w-16 h-16 opacity-30" />
                                <span className="text-xs font-bold mt-2">Gambar tidak tersedia</span>
                            </div>
                        )}
                        <span className={`absolute top-4 left-4 inline-flex items-center text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-md ${getTypeStyles(previewPhoto?.type)}`}>
                            {previewPhoto?.type_label}
                        </span>
                    </div>

                    {/* Right: Sidebar Metadata */}
                    <div className="w-full md:w-[350px] p-6 bg-slate-50 dark:bg-card border-t md:border-t-0 md:border-l border-slate-100 dark:border-border flex flex-col justify-between overflow-y-auto h-[55%] md:h-full">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Detail Pegawai</h3>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black">
                                        {previewPhoto?.employee_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight">{previewPhoto?.employee_name}</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">NIP/NIK: {previewPhoto?.employee_nip}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-border" />

                            <div>
                                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Detail Presensi</h3>
                                <div className="mt-3 space-y-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center">
                                        <Info className="w-4.5 h-4.5 mr-3 text-slate-400 shrink-0" />
                                        <span>{previewPhoto?.description}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4.5 h-4.5 mr-3 text-slate-400 shrink-0" />
                                        <span>{previewPhoto?.date ? new Date(previewPhoto.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4.5 h-4.5 mr-3 text-slate-400 shrink-0" />
                                        <span>Pukul {previewPhoto?.time} WIB</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="w-4.5 h-4.5 mr-3 text-slate-400 shrink-0" />
                                        <span>Kampus: {previewPhoto?.campus_name}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-border" />

                            {previewPhoto?.latitude && (
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                        <span>Koordinat GPS</span>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${previewPhoto.latitude},${previewPhoto.longitude}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center font-bold"
                                        >
                                            Lihat Peta <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    </h3>
                                    <div className="mt-3 bg-slate-100/50 dark:bg-secondary/20 p-3 rounded-2xl border border-slate-100 dark:border-border text-xs font-semibold text-slate-500 dark:text-slate-400 space-y-1">
                                        <p>Latitude: <span className="font-mono text-slate-800 dark:text-slate-200">{previewPhoto.latitude}</span></p>
                                        <p>Longitude: <span className="font-mono text-slate-800 dark:text-slate-200">{previewPhoto.longitude}</span></p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Detail Berkas</h3>
                                <div className="mt-3 bg-slate-100/50 dark:bg-secondary/20 p-3 rounded-2xl border border-slate-100 dark:border-border text-xs font-semibold text-slate-500 dark:text-slate-400 space-y-1">
                                    <p className="truncate">Path: <span className="font-mono text-slate-800 dark:text-slate-200" title={previewPhoto?.photo_path}>{previewPhoto?.photo_path}</span></p>
                                    <p>Ukuran: <span className="font-mono text-slate-800 dark:text-slate-200">{previewPhoto?.size_human}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-border mt-6">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setPreviewPhoto(null)}
                                className="w-full rounded-xl font-bold h-11 border-slate-200"
                            >
                                Tutup
                            </Button>
                            {canDeletePhoto && (
                                <Button 
                                    type="button" 
                                    onClick={() => {
                                        setPreviewPhoto(null);
                                        setIsDeleting({ type: previewPhoto.type, id: previewPhoto.id });
                                    }}
                                    className="bg-rose-600 hover:bg-rose-700 text-white w-full rounded-xl font-bold h-11"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Single Delete Modal */}
            <Dialog open={!!isDeleting} onOpenChange={open => !open && setIsDeleting(null)}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-6 text-center bg-white dark:bg-card">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-500/10 mb-6 text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white mb-2">Hapus Foto Permanen?</DialogTitle>
                    <DialogDescription className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6">
                        Tindakan ini akan menghapus berkas foto fisik dari server secara permanen dan menyetel kolom database foto presensi menjadi kosong. Aksi ini tidak dapat dibatalkan.
                    </DialogDescription>
                    <div className="flex justify-center gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDeleting(null)} 
                            className="w-full rounded-xl font-bold h-11 border-slate-200"
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={handleDeleteSingle} 
                            className="w-full rounded-xl font-bold h-11 bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            Hapus Sekarang
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Bulk Delete Modal */}
            <Dialog open={isBulkDeleting} onOpenChange={setIsBulkDeleting}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-6 text-center bg-white dark:bg-card">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-500/10 mb-6 text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white mb-2">Hapus {selectedPhotos.length} Foto?</DialogTitle>
                    <DialogDescription className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6">
                        Apakah Anda yakin ingin menghapus {selectedPhotos.length} berkas foto yang terpilih secara permanen? File fisik di server akan dibersihkan untuk menghemat penyimpanan.
                    </DialogDescription>
                    <div className="flex justify-center gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsBulkDeleting(false)} 
                            className="w-full rounded-xl font-bold h-11 border-slate-200"
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={handleDeleteBulk} 
                            className="w-full rounded-xl font-bold h-11 bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            Hapus Massal
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
