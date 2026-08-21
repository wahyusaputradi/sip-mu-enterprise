import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/Context/LanguageContext';

export default function LanguageToggle({ className = "" }) {
    const { language, setLanguage } = useLanguage();

    const options = [
        { code: 'id', label: 'ID' },
        { code: 'en', label: 'EN' },
    ];

    return (
        <div 
            className={`relative inline-flex items-center bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-full p-1 shadow-inner select-none ${className}`}
            role="region"
            aria-label="Language Selector"
        >
            {options.map((opt) => {
                const isActive = language === opt.code;
                return (
                    <button
                        key={opt.code}
                        type="button"
                        onClick={() => setLanguage(opt.code)}
                        aria-pressed={isActive}
                        className={`relative z-10 px-3.5 py-1 text-xs font-bold transition-colors duration-200 focus:outline-none flex items-center justify-center ${
                            isActive
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeLanguagePill"
                                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-sm"
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                        )}
                        <span className="relative z-10">{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
