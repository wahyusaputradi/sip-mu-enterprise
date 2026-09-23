import React, { useEffect } from 'react';

export default function AdSense({ 
    client = "ca-pub-1006393524825968", 
    slot = "1234567890", // User should replace this with actual slot
    format = "auto", 
    responsive = "true", 
    className = "" 
}) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return (
        <div className={"adsense-container overflow-hidden w-full my-6 flex justify-center bg-slate-100 dark:bg-slate-900 rounded-xl min-h-[100px] items-center text-slate-400 text-sm "}>
            <ins 
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
}
