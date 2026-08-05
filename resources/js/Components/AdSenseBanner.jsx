import { useEffect } from 'react';

export default function AdSenseBanner({ 
    client = "ca-pub-XXXXXXXXXXXXXXXX", // Ganti dengan Google AdSense Publisher ID Anda
    slot = "XXXXXXXXXX",               // Ganti dengan Ad Slot ID Anda
    format = "auto",
    responsive = "true",
    className = "my-6 text-center overflow-hidden" 
}) {
    useEffect(() => {
        try {
            if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.warn("Google AdSense initialization error:", e);
        }
    }, []);

    // Placeholder preview container untuk pengujian lokal sebelum akun AdSense disetujui
    if (client.includes('XXXXXXXXXXXXXXXX')) {
        return (
            <div className="my-6 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/10 border border-dashed border-indigo-200 dark:border-indigo-500/20 text-center shadow-sm transition-all">
                <div className="flex items-center justify-center space-x-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <p className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                        📢 Slot Iklan Google AdSense (Ready Container)
                    </p>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Unit iklan responsif Google AdSense secara otomatis tampil di area ini setelah Publisher ID (<code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 py-0.5 rounded text-indigo-800 dark:text-indigo-300">ca-pub-XXXXXXXX</code>) dimasukkan.
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client={client}
                 data-ad-slot={slot}
                 data-ad-format={format}
                 data-full-width-responsive={responsive}>
            </ins>
        </div>
    );
}
