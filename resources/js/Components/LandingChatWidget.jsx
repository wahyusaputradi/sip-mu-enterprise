import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headset, X, Send, Trash2, MessageSquare, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor" />
    </svg>
);

const INITIAL_BOT_MESSAGE = {
    id: 1,
    sender: 'bot',
    text: 'Halo! Ada yang bisa saya bantu seputar produk atau layanan SIP MU Enterprise?',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTIONS = [
    "📍 Apa itu Presensi GPS?",
    "📝 Bagaimana cara pengajuan cuti?",
    "📅 Fitur Jadwal Mengajar & JTM",
    "📞 Kontak Admin Sekolah"
];

const KNOWLEDGE_BASE = [
    {
        keywords: ['presensi', 'absensi', 'gps', 'geofence', 'swafoto', 'selfie'],
        answer: 'SIP MU Enterprise menggunakan Geofencing GPS Presisi & Selfie Swafoto real-time. Presensi pegawai hanya dapat dilakukan di dalam radius lokasi resmi SMK Manbaul Ulum Cirebon.'
    },
    {
        keywords: ['cuti', 'izin', 'sakit', 'dinas', 'pulang cepat'],
        answer: 'Pengajuan cuti, izin pribadi, atau sakit dapat dilakukan secara online melalui menu Pengajuan Cuti/Izin dengan mengunggah bukti surat tugas atau surat dokter, kemudian disetujui berjenjang oleh Atasan/Kurikulum/Kepala Sekolah.'
    },
    {
        keywords: ['jadwal', 'mengajar', 'jtm', 'inval', 'guru'],
        answer: 'Sistem mencatat Jam Terjadwal Mengajar (JTM) guru secara otomatis dari Jam ke-1 hingga Jam ke-10, lengkap dengan fitur Bursa Guru Inval untuk menggantikan jam mengajar guru yang berhalangan hadir.'
    },
    {
        keywords: ['kontak', 'hubungi', 'wa', 'whatsapp', 'admin', 'telepon'],
        answer: 'Anda dapat menghubungi Tim Support/Admin SMK Manbaul Ulum Cirebon langsung via WhatsApp di 0812-3456-7890 atau email resmi smkmucirebon.sch.id.'
    },
    {
        keywords: ['halo', 'hai', 'selamat', 'pagi', 'siang', 'sore', 'malam'],
        answer: 'Selamat datang! Ada yang bisa saya bantu terkait produk atau layanan SIP MU Enterprise? Silakan tanya apa saja ya.'
    }
];

export default function LandingChatWidget() {
    const [waModalOpen, setWaModalOpen] = useState(false);
    const [botModalOpen, setBotModalOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const whatsappNumber = "6281234567890"; // Nomor WhatsApp Official Admin
    const whatsappMessage = encodeURIComponent("Halo Admin SIP MU Enterprise, saya ingin bertanya seputar layanan dan sistem sekolah...");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (botModalOpen) {
            scrollToBottom();
        }
    }, [messages, isTyping, botModalOpen]);

    const handleSendMessage = (textToSend = null) => {
        const text = textToSend || inputText;
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInputText('');
        setIsTyping(true);

        // Auto-reply logic
        setTimeout(() => {
            const lower = text.toLowerCase();
            let botReplyText = "Terima kasih atas pertanyaan Anda! Untuk informasi lebih rinci seputar SIP MU Enterprise, silakan hubungi tim CS kami via WhatsApp di tombol hijau bawah.";

            for (const item of KNOWLEDGE_BASE) {
                if (item.keywords.some(k => lower.includes(k))) {
                    botReplyText = item.answer;
                    break;
                }
            }

            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: botReplyText,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 700);
    };

    const handleClearChat = () => {
        setMessages([INITIAL_BOT_MESSAGE]);
    };

    const toggleWaModal = () => {
        setWaModalOpen(!waModalOpen);
        if (botModalOpen) setBotModalOpen(false);
    };

    const toggleBotModal = () => {
        setBotModalOpen(!botModalOpen);
        if (waModalOpen) setWaModalOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">

            {/* ════════════════════════════════════════════════════════════ */}
            {/* 1. WHATSAPP DIRECT CHAT POPUP & FLOATING BUTTON               */}
            {/* ════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {waModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25 }}
                        className="w-[90vw] sm:w-[350px] bg-white dark:bg-slate-900 rounded-[1.8rem] shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-slate-100 dark:border-slate-800 overflow-hidden mb-2"
                    >
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-purple-600 p-5 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-xl">
                                    <WhatsAppIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-extrabold text-base tracking-tight text-white leading-tight">
                                    SIP MU Enterprise Support
                                </h3>
                            </div>
                            <button
                                onClick={() => setWaModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body Message */}
                        <div className="p-6 space-y-5">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                Halo! Chat tim kami di WhatsApp untuk respons cepat seputar School System, Presensi Geofencing, atau layanan lainnya.
                            </p>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all flex items-center justify-center space-x-2 text-sm group"
                            >
                                <WhatsAppIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                <span>Chat via WhatsApp</span>
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WhatsApp Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleWaModal}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.4)] relative group transition-all"
                aria-label="WhatsApp Chat Support"
            >
                <WhatsAppIcon className="w-7 h-7 fill-current" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-pulse"></span>
            </motion.button>


            {/* ════════════════════════════════════════════════════════════ */}
            {/* 2. LIVE CHAT BOT MODAL & FLOATING BUTTON ("Tanya SIP MU")      */}
            {/* ════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {botModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="w-[92vw] sm:w-[380px] h-[520px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_15px_50px_rgba(0,0,0,0.22)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col mb-2 relative"
                    >
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-purple-600 p-4 px-5 text-white flex items-center justify-between shadow-md shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                    <Headset className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base tracking-tight text-white leading-none">
                                        Tanya SIP MU
                                    </h3>
                                    <span className="text-[10px] font-bold text-emerald-100 flex items-center mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 mr-1.5 animate-pulse"></span>
                                        Online Assistant
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <button
                                    onClick={handleClearChat}
                                    title="Hapus Riwayat Chat"
                                    className="p-2 hover:bg-black/20 rounded-xl text-white/80 hover:text-white transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setBotModalOpen(false)}
                                    className="p-2 hover:bg-black/20 rounded-xl text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/40">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[82%] p-3.5 px-4 text-sm font-medium leading-relaxed ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-none shadow-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none border border-slate-200/70 dark:border-slate-700 shadow-sm'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">
                                        {msg.time}
                                    </span>
                                </motion.div>
                            ))}

                            {/* Typing Indicator Animation */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 p-3 px-4 rounded-2xl rounded-tl-none border border-slate-200/70 dark:border-slate-700 w-max shadow-sm"
                                >
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                                </motion.div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Suggestions Chips */}
                        {messages.length <= 2 && !isTyping && (
                            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0">
                                {SUGGESTIONS.map((sug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(sug)}
                                        className="text-xs font-extrabold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-800/50 transition-colors shrink-0 flex items-center"
                                    >
                                        <span>{sug}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Chat Input Footer */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Tulis pertanyaan..."
                                    className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="w-11 h-11 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center justify-center shadow-md transition-all shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Chatbot Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleBotModal}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(147,51,234,0.4)] relative group transition-all"
                aria-label="Live AI Chatbot Assistant"
            >
                {botModalOpen ? (
                    <X className="w-7 h-7" />
                ) : (
                    <Headset className="w-7 h-7" />
                )}
            </motion.button>

        </div>
    );
}
