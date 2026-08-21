import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { translations } from '@/lang/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    let serverTranslations = {};
    let serverLocale = 'id';
    
    try {
        const page = usePage();
        if (page && page.props) {
            serverTranslations = page.props.translations || {};
            serverLocale = page.props.locale || 'id';
        }
    } catch (e) {
        // Safe catch when rendered above Inertia App context
    }

    const [language, setLanguageState] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('app_locale');
            if (savedLang === 'id' || savedLang === 'en') {
                return savedLang;
            }
        }
        return serverLocale || 'id';
    });

    useEffect(() => {
        const savedLang = localStorage.getItem('app_locale');
        if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang) => {
        if (lang !== 'id' && lang !== 'en') return;
        setLanguageState(lang);
        localStorage.setItem('app_locale', lang);
        document.cookie = `app_locale=${lang}; path=/; max-age=31536000`;
    };

    const t = (key, params = {}) => {
        if (!key) return '';
        
        // Priority 1: Server-side Laravel Lang shared translations
        let text = serverTranslations[key];

        // Priority 2: React Dictionary direct key lookup
        const dict = translations[language] || translations['id'];
        if (!text) {
            text = dict[key];
        }

        // Priority 3: React Dictionary phrase mapping
        if (!text && dict.phrases && dict.phrases[key]) {
            text = dict.phrases[key];
        }

        // Fallback: Indonesian default key or raw key
        if (!text) {
            text = translations['id'][key] || key;
        }

        Object.keys(params).forEach((paramKey) => {
            text = text.replace(`:${paramKey}`, params[paramKey]);
        });

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
