import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    QrCode as QrIcon, Camera, Volume2, VolumeX, Wifi, WifiOff, 
    CheckCircle2, AlertTriangle, XCircle, Clock, ArrowLeft, RefreshCw, ShieldCheck,
    History
} from 'lucide-react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Constants
const OFFLINE_STORAGE_KEY = 'kiosk_offline_buffer';
const MAX_RECENT_SCANS = 5;

export default function Kiosk({ settings, todayStats }) {
    const [scanResult, setScanResult] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [useCamera, setUseCamera] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineBuffer, setOfflineBuffer] = useState(() => {
        try {
            const saved = localStorage.getItem(OFFLINE_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [inputBuffer, setInputBuffer] = useState('');
    const [stats, setStats] = useState(todayStats);
    const [currentTime, setCurrentTime] = useState(new Date());

    const inputRef = useRef(null);
    const cameraScannerRef = useRef(null);
    const isProcessingRef = useRef(false);

    // Live Clock Update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Persist Offline Buffer
    useEffect(() => {
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineBuffer));
    }, [offlineBuffer]);

    // Audio Chime Synthesizer using Web Audio API
    const playSound = (type) => {
        if (isMuted) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'success') {
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
            } else if (type === 'late') {
                osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
                osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.15); // C#5
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
            } else {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                gain.gain.setValueAtTime(0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            console.error('Audio synthesis failed', e);
        }
    };

    // Monitor Online / Offline status
    useEffect(() => {
        const handleOnline = () => { setIsOnline(true); syncOfflineData(); };
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [offlineBuffer]);

    // Fast USB Barcode Listener (HID Keyboard Listener)
    useEffect(() => {
        let timer;
        const handleKeyDown = (e) => {
            if (useCamera) return;
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            
            if (e.key === 'Enter') {
                if (inputBuffer.trim()) {
                    handleScanProcess(inputBuffer.trim());
                    setInputBuffer('');
                }
            } else if (e.key.length === 1) {
                setInputBuffer((prev) => prev + e.key);
                clearTimeout(timer);
                timer = setTimeout(() => setInputBuffer(''), 1000);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
        };
    }, [inputBuffer, useCamera, isOnline]);

    const addToRecent = (scanData) => {
        setRecentScans(prev => {
            const newArray = [scanData, ...prev];
            return newArray.slice(0, MAX_RECENT_SCANS);
        });
    };

    // Handle Scan Submission (Online vs Offline Buffer)
    const handleScanProcess = async (token) => {
        if (loading || isProcessingRef.current) return;
        isProcessingRef.current = true;
        setLoading(true);
        setErrorMsg(null);

        if (!isOnline) {
            // Store scan in offline buffer
            const offlineItem = { qr_token: token, timestamp: new Date().toISOString() };
            setOfflineBuffer((prev) => [...prev, offlineItem]);
            playSound('success');
            
            const resultData = {
                mode: 'check_in',
                student: { name: 'Presensi Offline', nis: token, class_name: 'Buffer Local' },
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                status: 'present',
                message: 'Tersimpan di Buffer Offline. Akan dikirim otomatis saat terhubung internet.',
                id: Date.now() // temporary ID
            };
            
            setScanResult(resultData);
            addToRecent(resultData);
            setLoading(false);
            setTimeout(() => { isProcessingRef.current = false; }, 1500);
            return;
        }

        try {
            const res = await axios.post(route('student-attendance.scan-qr'), { qr_token: token });
            if (res.data.success) {
                const resultData = { ...res.data, id: Date.now() };
                setScanResult(resultData);
                addToRecent(resultData);
                
                if (resultData.status === 'late') playSound('late');
                else playSound('success');

                // Update Stats (only if not already_scanned)
                if (!resultData.already_scanned) {
                    setStats((prev) => ({
                        ...prev,
                        checked_in: resultData.mode === 'check_in' ? prev.checked_in + 1 : prev.checked_in,
                        late: resultData.status === 'late' ? prev.late + 1 : prev.late,
                        checked_out: resultData.mode === 'check_out' ? prev.checked_out + 1 : prev.checked_out,
                    }));
                }
            }
        } catch (err) {
            playSound('error');
            const data = err.response?.data;
            const msg = data?.message || 'Kartu QR / NIS tidak valid.';
            if (data?.status === 'blocked') {
                setScanResult({
                    status: 'blocked',
                    student: data.student,
                    message: data.message,
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                });
            } else {
                setErrorMsg(msg);
            }
        } finally {
            setLoading(false);
            setTimeout(() => { isProcessingRef.current = false; }, 1500);
        }
    };

    // Camera Scanner Lifecycle
    useEffect(() => {
        if (useCamera) {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render((decodedText) => {
                handleScanProcess(decodedText);
            }, (error) => {});
            cameraScannerRef.current = scanner;

            return () => {
                scanner.clear().catch(e => {});
            };
        }
    }, [useCamera]);

    const syncOfflineData = async () => {
        if (offlineBuffer.length === 0) return;
        try {
            await axios.post(route('student-attendance.sync-offline'), { scans: offlineBuffer });
            setOfflineBuffer([]);
        } catch (e) {
            console.error('Failed to sync offline buffer', e);
        }
    };

    const currentTimeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const currentDateStr = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col relative overflow-hidden select-none">
            <Head title="Kiosk Gate Scanner Presensi Siswa" />

            {/* Glowing Accent Background */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none"></div>

            {/* Top Navbar */}
            <div className="flex items-center justify-between z-10 p-4 md:p-6 pb-0">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.visit(route('student-attendance.monitoring'))} className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest flex items-center">
                                <QrIcon className="w-3.5 h-3.5 mr-1.5" /> Kiosk Gate Terminal
                            </span>
                            {isOnline ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest flex items-center">
                                    <Wifi className="w-3.5 h-3.5 mr-1.5" /> Online
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest flex items-center animate-pulse">
                                    <WifiOff className="w-3.5 h-3.5 mr-1.5" /> Offline ({offlineBuffer.length})
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1 text-white">
                            SIP-MU <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Student Scan</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-3xl font-black text-white tracking-tight">{currentTimeStr}</span>
                        <span className="text-xs font-semibold text-slate-400">{currentDateStr}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                            {isMuted ? <VolumeX className="w-6 h-6 text-rose-400" /> : <Volume2 className="w-6 h-6 text-emerald-400" />}
                        </button>
                        <button onClick={() => setUseCamera(!useCamera)} className={`p-3 border rounded-2xl transition-all ${useCamera ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'}`}>
                            <Camera className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Split Screen Main Content */}
            <div className="flex-1 flex flex-col xl:flex-row z-10 p-4 md:p-6 gap-6 h-full min-h-[500px]">
                
                {/* LEFT SIDE: Stats & Main Scanner */}
                <div className="flex-1 flex flex-col w-full xl:w-2/3 h-full gap-6">
                    {/* Stats Header Bar */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center shadow-lg">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Siswa</p>
                            <h4 className="text-2xl md:text-3xl font-black text-white">{stats.total_students}</h4>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center shadow-lg">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sudah Masuk</p>
                            <h4 className="text-2xl md:text-3xl font-black text-emerald-400">{stats.checked_in}</h4>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center shadow-lg">
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Terlambat</p>
                            <h4 className="text-2xl md:text-3xl font-black text-amber-400">{stats.late}</h4>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center shadow-lg">
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Sudah Pulang</p>
                            <h4 className="text-2xl md:text-3xl font-black text-purple-400">{stats.checked_out}</h4>
                        </div>
                    </div>

                    {/* Scan Display Card */}
                    <div className="flex-1 w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                        
                        {useCamera ? (
                            <div className="w-full flex flex-col items-center">
                                <h3 className="text-lg font-bold mb-4 text-indigo-400 flex items-center"><Camera className="w-5 h-5 mr-2" /> Kamera Aktif</h3>
                                <div id="reader" className="w-full max-w-md bg-black rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl"></div>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-4">
                                        <RefreshCw className="w-20 h-20 text-indigo-500 animate-spin" />
                                        <p className="text-xl font-extrabold text-slate-300">Memproses...</p>
                                    </motion.div>
                                ) : errorMsg ? (
                                    <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                                        <div className="w-28 h-28 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(244,63,94,0.3)]">
                                            <XCircle className="w-14 h-14" />
                                        </div>
                                        <h3 className="text-3xl font-black text-rose-400 mb-3">Scan Gagal</h3>
                                        <p className="text-lg text-slate-300 max-w-md font-medium text-center">{errorMsg}</p>
                                    </motion.div>
                                ) : scanResult ? (
                                    <motion.div key="result" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
                                        
                                        {/* Status Badge */}
                                        <div className="mb-6">
                                            {scanResult.status === 'blocked' ? (
                                                <span className="px-6 py-2.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-sm uppercase tracking-widest flex items-center shadow-lg shadow-rose-500/10">
                                                    <XCircle className="w-5 h-5 mr-2 text-rose-400" /> Terblokir (Lewat Batas)
                                                </span>
                                            ) : scanResult.status === 'late' ? (
                                                <span className="px-6 py-2.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-sm uppercase tracking-widest flex items-center shadow-lg shadow-amber-500/10">
                                                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" /> Presensi Masuk (Terlambat)
                                                </span>
                                            ) : (
                                                <span className="px-6 py-2.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-sm uppercase tracking-widest flex items-center shadow-lg shadow-emerald-500/10">
                                                    <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" /> Presensi Berhasil ({scanResult.mode === 'check_in' ? 'Masuk' : 'Pulang'})
                                                </span>
                                            )}
                                        </div>

                                        {/* Student Details */}
                                        <div className="flex flex-col md:flex-row items-center justify-center w-full space-y-6 md:space-y-0 md:space-x-10 mb-6">
                                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-slate-800 border-4 border-indigo-500/40 overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.2)] flex items-center justify-center text-5xl font-black text-indigo-400 shrink-0">
                                                {scanResult.student?.photo ? (
                                                    <img src={scanResult.student.photo} alt={scanResult.student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    scanResult.student?.name?.charAt(0) || '?'
                                                )}
                                            </div>
                                            <div className="text-center md:text-left">
                                                <p className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest mb-1">{scanResult.student?.class_name || '-'}</p>
                                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">{scanResult.student?.name || 'Unknown'}</h2>
                                                <p className="text-lg font-semibold text-slate-400 mt-2">NIS: {scanResult.student?.nis || '-'}</p>
                                                <div className="mt-4 inline-flex items-center justify-center bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
                                                    <Clock className="w-5 h-5 text-indigo-400 mr-2" />
                                                    <span className="text-slate-300 font-mono text-base">Waktu: <strong className="text-white font-bold">{scanResult.time} WIB</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        {scanResult.message && (
                                            <p className="text-sm font-semibold text-slate-400 italic bg-slate-800/50 px-5 py-2.5 rounded-xl border border-slate-800 mt-2">
                                                {scanResult.message}
                                            </p>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                                        <div className="w-32 h-32 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_60px_rgba(99,102,241,0.2)]">
                                            <QrIcon className="w-16 h-16" />
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-3">SIAP MEMINDAI QR CODE</h3>
                                        <p className="text-slate-400 font-medium max-w-md text-base leading-relaxed text-center">
                                            Tempelkan / Arahkan QR Code Kartu Pelajar pada Scanner Gerbang untuk mencatat jam masuk atau pulang.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* Hidden USB Fallback Form */}
                        {!useCamera && (
                            <form onSubmit={(e) => { e.preventDefault(); if (inputBuffer) handleScanProcess(inputBuffer); setInputBuffer(''); }} className="mt-8 opacity-50 focus-within:opacity-100 transition-opacity">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputBuffer}
                                    onChange={(e) => setInputBuffer(e.target.value)}
                                    placeholder="Atau ketik/scan NIS di sini lalu Enter..."
                                    className="w-full max-w-sm h-12 bg-slate-950/80 border border-slate-800 rounded-2xl text-center text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                                />
                            </form>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Live Feed */}
                <div className="w-full xl:w-1/3 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <h3 className="text-lg font-black text-white flex items-center">
                            <History className="w-5 h-5 mr-2 text-indigo-400" />
                            Live Scan Feed
                        </h3>
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">Real-time</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        <AnimatePresence>
                            {recentScans.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-40 text-slate-500">
                                    <Clock className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Belum ada riwayat scan</p>
                                </motion.div>
                            ) : (
                                recentScans.map((scan) => (
                                    <motion.div
                                        key={scan.id}
                                        initial={{ opacity: 0, x: 50, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 flex items-center shadow-md relative overflow-hidden"
                                    >
                                        {/* Colored Left Border based on status */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                            scan.status === 'late' ? 'bg-amber-500' : 
                                            scan.status === 'blocked' ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`}></div>

                                        <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 mr-4 border border-slate-700">
                                            {scan.student?.photo ? (
                                                <img src={scan.student.photo} alt={scan.student.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-400">
                                                    {scan.student?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-sm truncate">{scan.student?.name}</h4>
                                            <p className="text-xs text-slate-400 font-medium truncate">{scan.student?.class_name} • {scan.student?.nis}</p>
                                        </div>
                                        
                                        <div className="flex flex-col items-end shrink-0 ml-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-1 ${
                                                scan.status === 'late' ? 'bg-amber-500/10 text-amber-400' : 
                                                scan.status === 'blocked' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                                {scan.time}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{scan.mode === 'check_in' ? 'Masuk' : 'Pulang'}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* Bottom Realtime Footer */}
            <div className="flex items-center justify-between z-10 px-4 py-3 md:px-6 md:py-4 bg-slate-950/80 border-t border-slate-900 text-xs font-semibold text-slate-500">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>SMK Manbaul Ulum Cirebon • High-Speed Student Attendance Gateway</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #334155;
                    border-radius: 20px;
                }
            `}} />
        </div>
    );
}
