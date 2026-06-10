import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, CheckCircle2, Clock, GraduationCap, CalendarDays, LogOut, ShieldAlert, AlertTriangle, Unlock, Navigation, CalendarOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export default function Presensi({
    requiresDailyAttendance, hasTeachingSchedule, isGuruMurni,
    isHoliday, holidayInfo,
    today, currentTime, attendance, schedules,
    campusLocations, settings, dailyCheckinBlocked, dailyCheckinBlockReason,
    dailyCheckinTooEarly, dailyCheckinEarlyTime,
    dailyCheckoutAvailable, dailyCheckoutBlocked, dailyCheckoutBlockReason,
    activeUnlocks, userRoles
}) {
    const { auth } = usePage().props;
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraError, setCameraError] = useState(null);
    const [stream, setStream] = useState(null);
    const [location, setLocation] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [distanceToCampus, setDistanceToCampus] = useState(null);
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const [processing, setProcessing] = useState(false);
    const watchIdRef = useRef(null);
    const [locationAccuracy, setLocationAccuracy] = useState(null);

    useEffect(() => {
        startCamera();
        getLocation();
        return () => {
            stopCamera();
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (location && selectedCampus) {
            const d = haversineDistance(location.latitude, location.longitude, selectedCampus.latitude, selectedCampus.longitude);
            setDistanceToCampus(Math.round(d));
            setIsWithinRadius(d <= selectedCampus.radius);
        }
    }, [location, selectedCampus]);

    const haversineDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const isInsecure = window.location.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(window.location.hostname);
                setCameraError(isInsecure
                    ? 'Kamera tidak tersedia. Akses kamera memerlukan koneksi HTTPS yang aman.'
                    : 'Browser tidak mendukung akses kamera. Pastikan Anda menggunakan browser modern dan mengizinkan akses kamera.');
                return;
            }
            const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(ms);
            if (videoRef.current) videoRef.current.srcObject = ms;
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan di browser Anda.');
        }
    };
    const stopCamera = () => { if (stream) stream.getTracks().forEach(t => t.stop()); };

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Browser tidak mendukung GPS. Pastikan browser Anda mengizinkan akses lokasi.");
            return;
        }
        watchIdRef.current = navigator.geolocation.watchPosition(
            (p) => {
                setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude });
                setLocationAccuracy(p.coords.accuracy);
            },
            (err) => {
                console.error('GPS error:', err);
                toast.error("Gagal mendapatkan lokasi GPS. Pastikan GPS aktif dan izin lokasi sudah diberikan.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const v = videoRef.current, c = canvasRef.current;
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext('2d').drawImage(v, 0, 0);
        const url = c.toDataURL('image/jpeg', 0.8);
        setPhotoData(url);
    };
    const retakePhoto = () => setPhotoData(null);

    const GPS_ACCURACY_THRESHOLD = 60;
    const isGpsAccurate = locationAccuracy !== null && locationAccuracy <= GPS_ACCURACY_THRESHOLD;
    const canSubmit = photoData && location && selectedCampus && isWithinRadius && !processing && isGpsAccurate;

    const addWatermark = async (imageSrc, actionText) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                // Draw original image
                ctx.drawImage(img, 0, 0);
                
                // Draw watermark background gradient
                const gradient = ctx.createLinearGradient(0, canvas.height - 160, 0, canvas.height);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.6)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, canvas.height - 160, canvas.width, 160);
                
                // Text settings
                ctx.fillStyle = 'white';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                
                const padX = 20;
                let currentY = canvas.height - 120;

                // 1. App / School Name
                ctx.font = 'bold 24px sans-serif';
                ctx.fillStyle = '#6EE7B7'; // emerald-300
                ctx.fillText('SIP-MU ENTERPRISE', padX, currentY);
                currentY += 28;
                
                // 2. Employee Name
                ctx.font = 'bold 20px sans-serif';
                ctx.fillStyle = 'white';
                ctx.fillText(auth?.user?.name || 'Pegawai', padX, currentY);
                currentY += 24;
                
                // 3. Timestamp & Action Text
                ctx.font = 'bold 16px monospace';
                ctx.fillStyle = '#FCD34D'; // amber-300
                const now = new Date();
                const timeString = now.toLocaleString('id-ID');
                ctx.fillText(`${timeString} | ${actionText}`, padX, currentY);
                currentY += 22;
                
                // 4. Location & Radius Info
                ctx.font = '14px monospace';
                ctx.fillStyle = '#CBD5E1'; // slate-300
                ctx.fillText(`Loc: ${location?.latitude?.toFixed(6)}, ${location?.longitude?.toFixed(6)}`, padX, currentY);
                currentY += 18;
                ctx.fillText(`Campus: ${selectedCampus?.name || 'Unknown'} (${distanceToCampus}m)`, padX, currentY);
                
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.src = imageSrc;
        });
    };

    const handleCheckIn = async () => {
        if (!canSubmit) return;
        setProcessing(true);
        const watermarkedPhoto = await addWatermark(photoData, 'Presensi Masuk');
        router.post(route('attendance.check-in'), {
            latitude: location.latitude, longitude: location.longitude,
            campus_location_id: selectedCampus.id, photo: watermarkedPhoto
        }, { onSuccess: () => { toast.success('Presensi masuk berhasil!'); router.reload(); }, onError: (e) => { if(e.message) toast.error(e.message); setProcessing(false); }, onFinish: () => setProcessing(false) });
    };

    const handleCheckOut = async () => {
        if (!canSubmit) return;
        setProcessing(true);
        const watermarkedPhoto = await addWatermark(photoData, 'Presensi Pulang');
        router.post(route('attendance.check-out'), {
            latitude: location.latitude, longitude: location.longitude,
            campus_location_id: selectedCampus.id, photo: watermarkedPhoto
        }, { onSuccess: () => { toast.success('Presensi pulang berhasil!'); router.reload(); }, onError: (e) => { if(e.message) toast.error(e.message); setProcessing(false); }, onFinish: () => setProcessing(false) });
    };

    const handleGuruPresensi = async (scheduleId, keX) => {
        if (!canSubmit) return;
        setProcessing(true);
        const watermarkedPhoto = await addWatermark(photoData, `Jam Mengajar Ke-${keX}`);
        router.post(route('attendance.guru'), {
            teaching_schedule_id: scheduleId,
            latitude: location.latitude, longitude: location.longitude,
            campus_location_id: selectedCampus.id, photo: watermarkedPhoto
        }, { onSuccess: () => { toast.success('Presensi jam pelajaran berhasil!'); retakePhoto(); router.reload(); }, onError: (e) => { if(e.message) toast.error(e.message); setProcessing(false); }, onFinish: () => setProcessing(false) });
    };

    const modeLabel = isGuruMurni ? 'Guru' : (hasTeachingSchedule && requiresDailyAttendance ? 'Hybrid (Harian + Mengajar)' : 'Harian');

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                            <Navigation className="w-3 h-3 mr-1.5" /> Live Attendance
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest">
                            Mode: {modeLabel}
                        </span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Presensi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Harian</span>
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium">{today}</p>
                </div>
            </div>
        }>
            <Head title="Presensi Harian" />

            {/* Holiday Banner */}
            {isHoliday && (
                <div className="max-w-7xl mx-auto mb-8">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-amber-100/50">
                        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                            <CalendarOff className="w-10 h-10 text-amber-600" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black text-amber-900">Hari Libur 🎉</h3>
                            <p className="text-amber-700 font-bold mt-1 text-lg">{holidayInfo?.name || 'Hari Libur Nasional'}</p>
                            <p className="text-amber-600 mt-2 text-sm">Seluruh proses presensi tidak dilakukan pada hari libur. Hari ini dianggap hadir dan dihitung pada rekap presensi serta penggajian.</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {!isHoliday && (
            <>
            {/* Guru Murni Info Banner */}
            {isGuruMurni && (
                <div className="max-w-7xl mx-auto mb-8">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-[2rem] p-6 flex items-center gap-5 shadow-lg shadow-indigo-100/50">
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                            <GraduationCap className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-indigo-900">Mode Guru Murni</h3>
                            <p className="text-indigo-700/80 text-sm font-medium mt-0.5">Anda hanya diwajibkan melakukan presensi <strong>per sesi kelas</strong> (jam mengajar). Presensi harian (masuk/keluar) tidak berlaku untuk Anda.</p>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">

                {/* ══ LEFT: Camera + Location ══ */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Location Picker */}
                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-sky-50 to-indigo-50 border-b border-sky-100 p-5">
                            <CardTitle className="flex items-center text-base font-black text-sky-900">
                                <MapPin className="w-5 h-5 mr-2 text-sky-600" /> Pilih Lokasi Presensi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {campusLocations.map((c) => {
                                const isSelected = selectedCampus?.id === c.id;
                                let dist = null, within = false;
                                if (location) {
                                    dist = Math.round(haversineDistance(location.latitude, location.longitude, c.latitude, c.longitude));
                                    within = dist <= c.radius;
                                }
                                return (
                                    <button key={c.id} onClick={() => setSelectedCampus(c)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Radius: {c.radius}m</p>
                                            </div>
                                            <div className="text-right">
                                                {location ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${within ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                                        {within ? '✓ Dalam Radius' : `✗ ${dist}m`}
                                                    </span>
                                                ) : <span className="text-xs text-slate-400">Mencari GPS...</span>}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            {selectedCampus && !isWithinRadius && location && (
                                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-rose-700">Di Luar Radius!</p>
                                        <p className="text-xs text-rose-600 mt-1">Jarak Anda {distanceToCampus}m dari {selectedCampus.name}. Batas radius {selectedCampus.radius}m. Presensi tidak dapat dilakukan.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Camera */}
                    <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden sticky top-32">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-5">
                            <CardTitle className="flex items-center text-base font-black text-slate-800">
                                <Camera className="w-5 h-5 mr-2 text-indigo-600" /> Swa Foto (Live Photo)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="space-y-4">
                                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                                    {cameraError ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800">
                                            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
                                                <Camera className="w-8 h-8 text-rose-400" />
                                            </div>
                                            <p className="text-white font-bold text-sm mb-2">Kamera Tidak Tersedia</p>
                                            <p className="text-slate-400 text-xs leading-relaxed">{cameraError}</p>
                                            <Button type="button" onClick={() => { setCameraError(null); startCamera(); }}
                                                className="mt-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20">
                                                Coba Lagi
                                            </Button>
                                        </div>
                                    ) : !photoData ? (
                                        <>
                                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                                            <div className="absolute inset-0 border-2 border-dashed border-white/20 m-4 rounded-xl pointer-events-none" />
                                            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                                                <Button type="button" onClick={capturePhoto} disabled={!selectedCampus || !isWithinRadius}
                                                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/40 backdrop-blur-md border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all transform hover:scale-110 flex items-center justify-center p-0 disabled:opacity-50">
                                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-inner">
                                                        <Camera className="w-6 h-6 text-indigo-600" />
                                                    </div>
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <img src={photoData} alt="Captured" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button type="button" onClick={retakePhoto} variant="secondary" className="rounded-xl font-bold bg-white text-indigo-700 hover:bg-slate-100 shadow-xl">
                                                    <Camera className="w-4 h-4 mr-2" /> Ulangi Foto
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                                            <MapPin className={`w-5 h-5 ${location ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Live Location GPS</p>
                                            {location ? (
                                                <p className="text-[13px] font-mono font-medium text-slate-700 truncate">
                                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                                </p>
                                            ) : <p className="text-[13px] font-medium text-rose-500">Mencari lokasi GPS...</p>}
                                        </div>
                                    </div>
                                    
                                    {/* GPS Accuracy Indicator */}
                                    {locationAccuracy !== null && (
                                        <div className={`mt-1 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                                            locationAccuracy <= 60 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                : locationAccuracy <= 100 
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            <div className="flex items-center">
                                                {locationAccuracy <= 60 ? (
                                                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 mr-1.5" />
                                                )}
                                                <span>Akurasi GPS: {Math.round(locationAccuracy)}m</span>
                                            </div>
                                            <span>
                                                {locationAccuracy <= 60 ? 'Sinyal Baik' : locationAccuracy <= 100 ? 'Sinyal Sedang' : 'Sinyal Buruk'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ══ RIGHT: Attendance Actions ══ */}
                <div className="lg:col-span-7 space-y-6">

                    {/* ═══ TEACHING SCHEDULE SECTION ═══ */}
                    {hasTeachingSchedule && schedules && (
                        <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-6">
                                <CardTitle className="text-xl font-black text-indigo-900 flex items-center">
                                    <GraduationCap className="w-6 h-6 mr-3 text-indigo-600" /> Jadwal Mengajar Hari Ini
                                </CardTitle>
                                <CardDescription className="text-indigo-700/70 font-medium mt-1">
                                    Presensi wajib di setiap jam pelajaran. Toleransi keterlambatan: {settings.batas_terlambat} menit dari jam mulai.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {schedules.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                            <CalendarDays className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-700">Tidak Ada Jadwal</h3>
                                        <p className="text-slate-500">Anda tidak memiliki jadwal mengajar pada hari ini.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {schedules.map((s, idx) => (
                                            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${s.has_attended ? 'bg-emerald-50/30' : s.blocked ? 'bg-rose-50/30' : 'hover:bg-slate-50'}`}>
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border shadow-sm shrink-0 ${
                                                        s.has_attended ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : s.blocked ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : 'bg-white text-indigo-600 border-slate-200'
                                                    }`}>{s.hour_number}</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-base flex items-center flex-wrap gap-2">
                                                            {s.subject}
                                                            {s.is_inval && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                                                                    INVAL: {s.original_teacher_name}
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                                            Kelas {s.school_class?.name || '-'} • {s.time_start} - {s.time_end}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center sm:justify-end">
                                                    {s.has_attended ? (
                                                        <div className="flex flex-col items-end">
                                                            <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center border border-emerald-200 shadow-sm">
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Hadir
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 font-bold mt-1">Pukul {s.attendance_time}</span>
                                                        </div>
                                                    ) : s.blocked ? (
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <div className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center border border-rose-200">
                                                                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Terblokir
                                                            </div>
                                                            <span className="text-[10px] text-rose-500 font-medium max-w-[200px] text-right">{s.block_reason}</span>
                                                        </div>
                                                    ) : s.not_yet ? (
                                                        <div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200">
                                                            <Clock className="w-3.5 h-3.5 mr-1 inline" /> Belum Dimulai
                                                        </div>
                                                    ) : (
                                                        <Button onClick={() => handleGuruPresensi(s.id, s.hour_number)} disabled={!canSubmit}
                                                            className="rounded-xl font-bold shadow-[0_4px_15px_rgba(99,102,241,0.2)] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all hover:-translate-y-0.5">
                                                            Presensi Jam ke-{s.hour_number}
                                                        </Button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* ═══ DAILY ATTENDANCE SECTION ═══ */}
                    {requiresDailyAttendance && (
                        <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 p-6">
                                <CardTitle className="text-xl font-black text-emerald-900 flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-emerald-600" /> Presensi Harian {hasTeachingSchedule ? '(Kantor)' : ''}
                                </CardTitle>
                                <CardDescription className="text-emerald-700/70 font-medium">
                                    Jam Masuk: {settings.jam_masuk} • Jam Keluar: {settings.jam_keluar} • Toleransi: {settings.batas_terlambat} menit
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                {/* Blocked Alert Check-in */}
                                {dailyCheckinBlocked && !attendance?.check_in && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
                                        <div className="p-2 bg-rose-100 rounded-xl shrink-0"><ShieldAlert className="w-6 h-6 text-rose-600" /></div>
                                        <div>
                                            <h4 className="font-black text-rose-800 text-sm">Akses Presensi Masuk Diblokir</h4>
                                            <p className="text-rose-600 text-sm mt-1">{dailyCheckinBlockReason}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Blocked Alert Check-out */}
                                {dailyCheckoutBlocked && attendance?.check_in && !attendance?.check_out && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
                                        <div className="p-2 bg-rose-100 rounded-xl shrink-0"><ShieldAlert className="w-6 h-6 text-rose-600" /></div>
                                        <div>
                                            <h4 className="font-black text-rose-800 text-sm">Akses Presensi Pulang Diblokir</h4>
                                            <p className="text-rose-600 text-sm mt-1">{dailyCheckoutBlockReason}</p>
                                        </div>
                                    </div>
                                )}

                                {activeUnlocks && activeUnlocks.filter(u => ['daily_checkin', 'daily_checkout'].includes(u.type)).length > 0 && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Unlock className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <p className="text-sm font-bold text-emerald-700">
                                                Akses dibuka oleh {activeUnlocks.find(u => ['daily_checkin', 'daily_checkout'].includes(u.type))?.unlocked_by_name}
                                            </p>
                                        </div>
                                        {activeUnlocks.find(u => ['daily_checkin', 'daily_checkout'].includes(u.type))?.expires_at && (
                                            <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                                                Batas: {new Date(activeUnlocks.find(u => ['daily_checkin', 'daily_checkout'].includes(u.type)).expires_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Check-in */}
                                    <div className="flex flex-col h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                                        {attendance?.check_in && (
                                            <div className="absolute top-0 right-0 p-3 bg-emerald-50 text-emerald-600 rounded-bl-2xl font-bold text-xs flex items-center border-b border-l border-emerald-100">
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sukses
                                            </div>
                                        )}
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-black text-lg text-slate-800 mb-1">Presensi Masuk</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-6 flex-1">
                                            {attendance?.check_in ? `Tercatat pada pukul ${attendance.check_in} WIB` : 'Belum melakukan presensi masuk hari ini.'}
                                        </p>
                                        <Button onClick={handleCheckIn}
                                            disabled={processing || !!attendance?.check_in || !canSubmit || dailyCheckinBlocked || dailyCheckinTooEarly}
                                            className={`w-full rounded-xl font-bold h-12 ${
                                                attendance?.check_in || dailyCheckinBlocked || dailyCheckinTooEarly
                                                ? 'bg-slate-100 text-slate-400 border-none'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5'
                                            } transition-all duration-300`}>
                                            {attendance?.check_in ? 'Sudah Presensi Masuk' : dailyCheckinBlocked ? 'Akses Diblokir' : dailyCheckinTooEarly ? `Belum Waktunya (Buka ${dailyCheckinEarlyTime})` : 'Check In Sekarang'}
                                        </Button>
                                    </div>

                                    {/* Check-out */}
                                    <div className="flex flex-col h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                                        {attendance?.check_out && (
                                            <div className="absolute top-0 right-0 p-3 bg-emerald-50 text-emerald-600 rounded-bl-2xl font-bold text-xs flex items-center border-b border-l border-emerald-100">
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sukses
                                            </div>
                                        )}
                                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
                                            <LogOut className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-black text-lg text-slate-800 mb-1">Presensi Pulang</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-6 flex-1">
                                            {attendance?.check_out ? `Tercatat pada pukul ${attendance.check_out} WIB` : 'Silakan presensi pulang setelah jam kerja selesai.'}
                                        </p>
                                        <Button onClick={handleCheckOut}
                                            disabled={processing || !attendance?.check_in || !!attendance?.check_out || !canSubmit || (!dailyCheckoutAvailable && !dailyCheckoutBlocked) || dailyCheckoutBlocked}
                                            className={`w-full rounded-xl font-bold h-12 ${
                                                attendance?.check_out || !attendance?.check_in || dailyCheckoutBlocked
                                                ? 'bg-slate-100 text-slate-400 border-none'
                                                : 'bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 shadow-[0_8px_20px_rgba(225,29,72,0.3)] hover:-translate-y-0.5'
                                            } transition-all duration-300`}>
                                            {attendance?.check_out ? 'Sudah Presensi Pulang' : dailyCheckoutBlocked ? 'Akses Diblokir' : !dailyCheckoutAvailable ? `Belum Jam Pulang (${settings.jam_keluar})` : 'Check Out Sekarang'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `.mirror { transform: scaleX(-1); }` }} />
            </>
            )}

        </AuthenticatedLayout>
    );
}
