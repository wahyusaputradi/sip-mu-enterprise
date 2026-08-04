import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, X, Share, PlusSquare, MoreVertical, CheckCircle2, HelpCircle } from 'lucide-react';

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect standalone / installed mode
        const inStandaloneMode = 
            window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        setIsStandalone(inStandaloneMode);
        if (inStandaloneMode) return;

        // Detect user agent
        const ua = window.navigator.userAgent.toLowerCase();
        const iosDevice = /iphone|ipad|ipod/.test(ua);
        const mobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua) || window.innerWidth <= 1024;

        setIsIos(iosDevice);
        setIsMobile(mobileDevice);

        // Capture Chrome/Android PWA prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if redirected from install parameter
        if (window.location.search.includes('install=true')) {
            setShowPrompt(true);
            setShowGuideModal(true);
        }

        // Always trigger prompt banner on mobile devices after 1.5 seconds
        const timer = setTimeout(() => {
            const dismissed = localStorage.getItem('pwa_prompt_dismissed_session');
            if (!dismissed) {
                setShowPrompt(true);
            }
        }, 1500);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearTimeout(timer);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        } else {
            // Show step-by-step browser guide modal for browsers without direct prompt API
            setShowGuideModal(true);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed_session', 'true');
    };

    if (isStandalone || !showPrompt) return null;

    return (
        <>
            {/* Floating Banner */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.95 }}
                    transition={{ duration: 0.35, type: 'spring' }}
                    className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-5 rounded-3xl bg-slate-900/95 text-white border border-slate-800 shadow-2xl shadow-slate-950/60 backdrop-blur-xl"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-white">Install Aplikasi Mobile</h4>
                                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
                                    SIP MU Enterprise
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                            aria-label="Tutup"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="text-xs text-slate-300 mb-4 leading-relaxed font-medium">
                        {isIos ? (
                            <>Tambahkan aplikasi ke layar utama iPhone/iPad Anda untuk presensi & notifikasi yang lebih cepat tanpa perlu membuka browser.</>
                        ) : (
                            <>Pasang aplikasi SIP MU Enterprise di smartphone Anda untuk akses instan cepat, offline caching, dan notifikasi presensi.</>
                        )}
                    </p>

                    {isIos ? (
                        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-[11px] text-slate-300 space-y-2 mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="flex h-5 w-5 rounded-full bg-indigo-600 text-white items-center justify-center font-bold text-[10px]">1</span>
                                <span>Tekan ikon <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-400" /> di Safari.</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="flex h-5 w-5 rounded-full bg-indigo-600 text-white items-center justify-center font-bold text-[10px]">2</span>
                                <span>Pilih <strong>"Tambah ke Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-indigo-400" />.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all duration-200"
                            >
                                <Download className="w-4 h-4" />
                                <span>Install Aplikasi</span>
                            </button>
                            <a
                                href="/download-apk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                                title="Download File APK Android"
                            >
                                <span>Download APK</span>
                            </a>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Guide Modal for Manual Menu Installation */}
            <AnimatePresence>
                {showGuideModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <HelpCircle className="w-6 h-6 text-indigo-400" />
                                    <h3 className="font-extrabold text-base">Panduan Install PWA Mobile</h3>
                                </div>
                                <button onClick={() => setShowGuideModal(false)} className="p-1 text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                                Browser Anda memerlukan konfirmasi manual melalui menu browser untuk memasang aplikasi ke layar utama:
                            </p>

                            <div className="space-y-3 mb-6 text-xs text-slate-200">
                                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                                    <div>
                                        <p className="font-bold text-white">Buka Menu Browser</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Tekan ikon titik tiga <MoreVertical className="w-3.5 h-3.5 inline text-indigo-400" /> di pojok kanan atas browser Chrome/Edge/Samsung Internet.</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                                    <div>
                                        <p className="font-bold text-white">Pilih "Install Aplikasi" / "Add to Home Screen"</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Pilih menu <strong>"Install Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-start space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                                    <div>
                                        <p className="font-bold text-white">Konfirmasi Instalasi</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Tekan <strong>Install / Tambahkan</strong>. Ikon aplikasi akan langsung muncul di layar HP Anda.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowGuideModal(false)}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-extrabold rounded-2xl text-xs transition-colors"
                                >
                                    Saya Mengerti
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
