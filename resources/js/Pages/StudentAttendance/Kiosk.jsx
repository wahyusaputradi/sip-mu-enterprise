import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    QrCode, QrCode as QrIcon, Camera, Volume2, VolumeX, Wifi, WifiOff, 
    CheckCircle2, AlertTriangle, XCircle, Clock, Users, ArrowLeft, RefreshCw, Sparkles, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Kiosk({ settings, todayStats }) {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [useCamera, setUseCamera] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineBuffer, setOfflineBuffer] = useState([]);
    const [inputBuffer, setInputBuffer] = useState('');
    const [stats, setStats] = useState(todayStats);

    const inputRef = useRef(null);
    const cameraScannerRef = useRef(null);
    const isProcessingRef = useRef(false);

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
            setScanResult({
                mode: 'check_in',
                student: { name: 'Presensi Offline', nis: token, class_name: 'Buffer Local' },
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                status: 'present',
                message: 'Tersimpan di Buffer Offline. Akan dikirim otomatis saat terhubung internet.',
            });
            setLoading(false);
            setTimeout(() => { isProcessingRef.current = false; }, 1500);
            return;
        }

        try {
            const res = await axios.post(route('student-attendance.scan-qr'), { qr_token: token });
            if (res.data.success) {
                setScanResult(res.data);
                if (res.data.status === 'late') playSound('late');
                else playSound('success');

                // Update Stats (only if not already_scanned)
                if (!res.data.already_scanned) {
                    setStats((prev) => ({
                        ...prev,
                        checked_in: res.data.mode === 'check_in' ? prev.checked_in + 1 : prev.checked_in,
                        late: res.data.status === 'late' ? prev.late + 1 : prev.late,
                        checked_out: res.data.mode === 'check_out' ? prev.checked_out + 1 : prev.checked_out,
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

    const currentTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const currentDateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-4 md:p-8 relative overflow-hidden select-none">
            <Head title="Kiosk Gate Scanner Presensi Siswa" />

            {/* Glowing Accent Background */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Top Navbar */}
            <div className="flex items-center justify-between z-10">
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
                                    <WifiOff className="w-3.5 h-3.5 mr-1.5" /> Offline Mode ({offlineBuffer.length} Buffer)
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 text-white">
                            SIP-MU <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Student Scan</span>
                        </h1>
                    </div>
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

            {/* Main Center Area */}
            <div className="my-auto py-8 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
                
                {/* Stats Header Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Siswa</p>
                        <h4 className="text-2xl font-black text-white">{stats.total_students}</h4>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sudah Masuk</p>
                        <h4 className="text-2xl font-black text-emerald-400">{stats.checked_in}</h4>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Terlambat</p>
                        <h4 className="text-2xl font-black text-amber-400">{stats.late}</h4>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Sudah Pulang</p>
                        <h4 className="text-2xl font-black text-purple-400">{stats.checked_out}</h4>
                    </div>
                </div>

                {/* Scan Display Card */}
                <div className="w-full">
                    {useCamera ? (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
                            <h3 className="text-lg font-bold mb-4 text-indigo-400">Arahkan QR Code Kartu Pelajar ke Kamera</h3>
                            <div id="reader" className="w-full max-w-md bg-black rounded-2xl overflow-hidden"></div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
                            
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center justify-center space-y-4">
                                        <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin" />
                                        <p className="text-lg font-extrabold text-slate-300">Memproses Scan QR Code...</p>
                                    </motion.div>
                                ) : errorMsg ? (
                                    <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="py-8 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(244,63,94,0.3)]">
                                            <XCircle className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-2xl font-black text-rose-400 mb-2">Scan Gagal</h3>
                                        <p className="text-base text-slate-300 max-w-md font-medium">{errorMsg}</p>
                                    </motion.div>
                                ) : scanResult ? (
                                    <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="py-4 flex flex-col items-center">
                                        
                                        {/* Status Badge */}
                                        <div className="mb-6">
                                            {scanResult.status === 'blocked' ? (
                                                <span className="px-6 py-2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-sm uppercase tracking-widest flex items-center shadow-lg shadow-rose-500/10">
                                                    <XCircle className="w-5 h-5 mr-2 text-rose-400" /> Presensi Terblokir (Lewat Batas)
                                                </span>
                                            ) : scanResult.status === 'late' ? (
                                                <span className="px-6 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-sm uppercase tracking-widest flex items-center shadow-lg shadow-amber-500/10">
                                                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" /> Presensi Masuk (Terlambat)
                                                </span>
                                            ) : (
                                                <span className="px-6 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-sm uppercase tracking-widest flex items-center shadow-lg shadow-emerald-500/10">
                                                    <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" /> Presensi Berhasil ({scanResult.mode === 'check_in' ? 'Masuk' : 'Pulang'})
                                                </span>
                                            )}
                                        </div>

                                        {/* Student Details */}
                                        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-6">
                                            <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-slate-800 border-2 border-indigo-500/40 overflow-hidden shadow-2xl flex items-center justify-center text-3xl font-black text-indigo-400">
                                                {scanResult.student.photo ? (
                                                    <img src={scanResult.student.photo} alt={scanResult.student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    scanResult.student.name.charAt(0)
                                                )}
                                            </div>
                                            <div className="text-center md:text-left">
                                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{scanResult.student.class_name}</p>
                                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{scanResult.student.name}</h2>
                                                <p className="text-sm font-semibold text-slate-400 mt-1">NIS: {scanResult.student.nis}</p>
                                                <div className="mt-3 flex items-center justify-center md:justify-start space-x-2 text-slate-300 font-mono text-sm">
                                                    <Clock className="w-4 h-4 text-indigo-400" />
                                                    <span>Waktu Presensi: <strong className="text-white font-bold">{scanResult.time} WIB</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs font-semibold text-slate-400 italic bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-800">
                                            {scanResult.message}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                            <QrIcon className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2">SIAP MEMINDAI QR CODE</h3>
                                        <p className="text-slate-400 font-medium max-w-md text-sm leading-relaxed">
                                            Tempelkan / Arahkan QR Code Kartu Pelajar pada Scanner Gerbang untuk mencatat jam masuk atau pulang.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Manual Hidden / Barcode USB Input Listener */}
                            <form onSubmit={(e) => { e.preventDefault(); if (inputBuffer) handleScanProcess(inputBuffer); setInputBuffer(''); }} className="mt-6">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputBuffer}
                                    onChange={(e) => setInputBuffer(e.target.value)}
                                    placeholder="Atau ketik/scan NIS di sini lalu Enter..."
                                    className="w-full max-w-sm h-12 bg-slate-950/60 border border-slate-800 rounded-2xl text-center text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                />
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Realtime Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between z-10 pt-4 border-t border-slate-900 text-xs font-semibold text-slate-500">
                <div className="flex items-center space-x-2 mb-2 md:mb-0">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>SMK Manbaul Ulum Cirebon • High-Speed Student Attendance Gateway</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 font-mono">
                    <span>{currentDateStr}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-black">{currentTimeStr}</span>
                </div>
            </div>
        </div>
    );
}
