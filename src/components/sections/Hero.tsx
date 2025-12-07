'use client'

import { ArrowRight, MessageCircle, ClipboardCheck } from 'lucide-react'
import Button from '../ui/Button'

interface HeroProps {
    translations: Record<string, unknown>
    onEnrollClick: () => void
    onTestClick?: () => void
}

export default function Hero({ translations, onEnrollClick, onTestClick }: HeroProps) {
    const t = (translations.hero || {}) as Record<string, string>

    return (
        <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white/20 rounded-xl rotate-12 animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-40 left-20 w-12 h-12 border-2 border-white/20 rounded-full animate-pulse" />
                <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-accent/30 rounded-lg rotate-45 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Открыт набор на новый семестр
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        {t.title || 'Английский в Астане'}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl sm:text-2xl text-white/90 mb-4 font-medium">
                        {t.subtitle || 'Запишитесь на бесплатный пробный урок'}
                    </p>

                    {/* Description */}
                    <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                        {t.description || 'Современные методики, опытные преподаватели, результат с первого занятия'}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            variant="accent"
                            size="lg"
                            onClick={onEnrollClick}
                            rightIcon={<ArrowRight size={20} />}
                            className="w-full sm:w-auto"
                        >
                            {t.cta || 'Записаться'}
                        </Button>

                        <a
                            href="https://wa.me/77001234567"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto"
                        >
                            <Button
                                variant="whatsapp"
                                size="lg"
                                leftIcon={<MessageCircle size={20} />}
                                className="w-full"
                            >
                                {t.whatsapp || 'WhatsApp'}
                            </Button>
                        </a>

                        {onTestClick && (
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={onTestClick}
                                leftIcon={<ClipboardCheck size={20} />}
                                className="w-full sm:w-auto border-white/30 text-white hover:bg-white hover:text-primary"
                            >
                                {t.test || 'Пройти тест'}
                            </Button>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Бесплатный пробный урок</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Сертифицированные преподаватели</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Гарантия результата</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                    <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
                </div>
            </div>
        </section>
    )
}
