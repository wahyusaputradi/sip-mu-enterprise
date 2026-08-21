import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { BookOpen, Calendar, User, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';

export default function BlogIndex({ articles, auth }) {
    return (
        <PublicLayout title="Portal Artikel & Edukasi Digital Sekolah" auth={auth}>
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                        <BookOpen className="w-4 h-4" />
                        <span>Pusat Artikel, Panduan & Wawasan Edukasi</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        Artikel & Informasi <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Digital Sekolah</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Pelajari berbagai artikel panduan presensi modern, efisiensi tata kelola sekolah kejuruan, teknologi Geofencing GPS, dan inovasi pendidikan digital di SMK Manbaul Ulum Cirebon.
                    </p>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles && articles.length > 0 ? (
                        articles.map((art) => (
                            <article
                                key={art.id}
                                className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/40 transition-all flex flex-col group shadow-xl"
                            >
                                <div className="h-48 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                                    <img
                                        src={art.image || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop"}
                                        alt={art.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-indigo-600/90 text-white rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                                        {art.category}
                                    </span>
                                </div>

                                <div className="p-6 flex flex-col flex-grow space-y-4">
                                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-indigo-400" /> {art.date}</span>
                                        <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1 text-purple-400" /> {art.author}</span>
                                    </div>

                                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                                        {art.title}
                                    </h2>

                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-grow">
                                        {art.summary}
                                    </p>

                                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-slate-500">{art.readTime}</span>
                                        <Link
                                            href={`/articles/${art.slug}`}
                                            className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center transition-colors"
                                        >
                                            Baca Selengkapnya <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            Belum ada artikel publik yang diterbitkan.
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
