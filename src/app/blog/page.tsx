import Link from 'next/link'
import { Metadata } from 'next'
import { blogPosts } from '@/lib/blogData'
import { ArrowRight, Calendar, Clock } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Блог об изучении английского | AngloClub Astana',
    description: 'Полезные статьи, советы по подготовке к IELTS и изучению английского языка от экспертов AngloClub.',
}

export default function BlogIndex() {
    return (
        <main className="min-h-screen bg-[var(--background)] pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text)]">
                    Блог AngloClub
                </h1>
                <p className="text-xl text-[var(--text-muted)] mb-12 max-w-2xl">
                    Советы экспертов, стратегии подготовки к экзаменам и интересные факты об английском языке.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <article key={post.slug} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                            <div className="aspect-video bg-[var(--surface-hover)] relative overflow-hidden">
                                {/* Placeholder for real images if they don't load */}
                                <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] bg-gray-200 dark:bg-gray-800">
                                    {post.category}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                                    <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded-full">
                                        {post.category}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {post.readTime}
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold mb-3 text-[var(--text)] line-clamp-2">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-[var(--primary)] transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>

                                <p className="text-[var(--text-muted)] mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                                    <span className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                                        <Calendar size={14} />
                                        {post.date}
                                    </span>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="flex items-center gap-1 text-[var(--primary)] font-medium hover:gap-2 transition-all"
                                    >
                                        Читать <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    )
}
