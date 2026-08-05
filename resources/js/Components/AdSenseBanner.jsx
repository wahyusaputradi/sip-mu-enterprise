import { useEffect } from 'react';

export default function AdSenseBanner({ 
    client = import.meta.env.VITE_ADSENSE_CLIENT || "ca-pub-1006393524825968",
    slot = import.meta.env.VITE_ADSENSE_SLOT || "",
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

    return (
        <div className={className}>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client={client}
                 {...(slot ? { 'data-ad-slot': slot } : {})}
                 data-ad-format={format}
                 data-full-width-responsive={responsive}>
            </ins>
        </div>
    );
}
