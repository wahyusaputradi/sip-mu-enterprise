import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Calendar, User, ArrowLeft, Tag, Share2, BookOpen, Clock, ShieldCheck } from 'lucide-react';

export default function BlogDetail({ article, relatedArticles, auth }) {
    if (!article) return null;

    return (
        <PublicLayout title={article.title} auth={auth}>
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
                {/* Back Button */}
                <Link
                    href="/articles"
                    className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Daftar Artikel
                </Link>

                {/* Article Header */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                            {article.category}
                        </span>
                        <span className="text-slate-500 text-xs font-semibold">• {article.readTime}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-b border-slate-800 pb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                {article.author.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white">{article.author}</p>
                                <p className="text-[10px] text-slate-500">Tim Edukasi SIP MU</p>
                            </div>
                        </div>
                        <span className="hidden sm:inline text-slate-700">|</span>
                        <div className="flex items-center space-x-1.5">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span>Dipublikasikan: {article.date}</span>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-64 sm:h-96">
                    <img
                        src={article.image || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Article Main Body Content */}
                <div
                    className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 sm:p-10 rounded-3xl"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Related Articles Section */}
                {relatedArticles && relatedArticles.length > 0 && (
                    <div className="pt-10 border-t border-slate-800 space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-indigo-400" /> Artikel Terkait Lainnya
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedArticles.map((rel) => (
                                <Link
                                    key={rel.id}
                                    href={`/articles/${rel.slug}`}
                                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all block group"
                                >
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">{rel.category}</span>
                                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">{rel.title}</h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
