import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export default function ThemeToggle({ variant = "dropdown", className = "" }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!mounted) {
        return (
            <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
        );
    }

    const modes = [
        { id: 'light', label: 'Terang', icon: <Sun className="w-4 h-4 text-amber-500" /> },
        { id: 'dark', label: 'Gelap', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
        { id: 'system', label: 'Sistem', icon: <Laptop className="w-4 h-4 text-slate-400 dark:text-slate-300" /> },
    ];

    const currentIcon = resolvedTheme === 'dark' 
        ? <Moon className="w-4 h-4 text-indigo-400" /> 
        : <Sun className="w-4 h-4 text-amber-500" />;

    // Render Pill Switcher variant
    if (variant === "pills") {
        return (
            <div className={`inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 ${className}`}>
                {modes.map((m) => {
                    const isActive = theme === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => setTheme(m.id)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                isActive
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                        </button>
                    );
                })}
            </div>
        );
    }

    // Default Dropdown Button Variant
    return (
        <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Pilih Tema"
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-md transition-all duration-200 focus:outline-none flex items-center justify-center"
            >
                <motion.div
                    key={resolvedTheme}
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                >
                    {currentIcon}
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 z-50 py-1.5 overflow-hidden"
                    >
                        <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Pilihan Tema
                        </div>

                        {modes.map((m) => {
                            const isSelected = theme === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setTheme(m.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                                        isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        {m.icon}
                                        <span>{m.label}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[3]" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
