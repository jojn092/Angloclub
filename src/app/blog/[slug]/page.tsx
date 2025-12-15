import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/lib/blogData'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = blogPosts.find((p) => p.slug === slug)

    if (!post) {
        return {
            title: 'Статья не найдена',
        }
    }

    return {
        title: `${post.title} | Блог AngloClub`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        }
    }
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params
    const post = blogPosts.find((p) => p.slug === slug)

    if (!post) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-[var(--background)] pt-24 pb-12">
            <article className="container mx-auto px-4 max-w-3xl">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Вернуться в блог
                </Link>

                <header className="mb-8">
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
                        <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full font-medium">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={16} /> {post.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={16} /> {post.date}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-[var(--text)] mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-3 pb-8 border-b border-[var(--border)]">
                        <div className="w-10 h-10 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-muted)]">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-[var(--text)]">{post.author}</p>
                            <p className="text-xs text-[var(--text-muted)]">Автор AngloClub</p>
                        </div>
                    </div>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    {/* 
              In a real app, we'd use a markdown parser. 
              Since our data is simple HTML-like strings, we render directly.
              WARNING: Only use this with trusted content.
            */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <div className="mt-12 pt-8 border-t border-[var(--border)]">
                    <h3 className="text-xl font-bold mb-4 text-[var(--text)]">Понравилась статья?</h3>
                    <p className="text-[var(--text-muted)] mb-6">
                        Запишитесь на пробный урок, чтобы применить знания на практике!
                    </p>
                    <Link href="/#lead-form">
                        <button className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors">
                            Записаться на урок
                        </button>
                    </Link>
                </div>
            </article>
        </main>
    )
}

// Generate static params for all posts
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }))
}
