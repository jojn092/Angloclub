'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote, X } from 'lucide-react'
import { clsx } from 'clsx'
import Card from '../ui/Card'

interface TestimonialsProps {
    translations: Record<string, unknown>
}

interface Testimonial {
    id: string
    name: string
    photo?: string
    course: string
    rating: number
    text: string
    certificate?: string
}

const testimonials: Testimonial[] = [
    {
        id: '1',
        name: 'Айгерим Сейтова',
        photo: '/images/testimonials/1.jpg',
        course: 'IELTS Preparation',
        rating: 5,
        text: 'Благодаря AngloClub я сдала IELTS на 7.5! Преподаватели профессионально подготовили меня ко всем секциям экзамена. Особенно помогли занятия по Speaking.',
    },
    {
        id: '2',
        name: 'Арман Касымов',
        photo: '/images/testimonials/2.jpg',
        course: 'Business English',
        rating: 5,
        text: 'Курс бизнес-английского помог мне получить повышение на работе. Теперь уверенно провожу переговоры с иностранными партнерами.',
    },
    {
        id: 'new-1',
        name: 'Сабина',
        course: 'IELTS Preparation',
        rating: 5,
        text: 'Хотела бы поделится своим опытом подготовки к IELTS. Начала подготовку за 2 месяца до сдачи экзамена, ходила 3 часа каждую неделю к преподавателю Сагынай. Уроки проходили интересно, за весь период я заметно повысила свой разговорный английский. Сам экзамен у меня был 08.11, по результатам которых я получила общий балл 7.5 🥳🥳🥳. Безмерно благодарна, спасибо вам!! Всем советую прекрасного преподавателя Сагынай👍',
        certificate: '/images/testimonials/sabina_ielts.png'
    },
    {
        id: '3',
        name: 'Мадина Ахметова',
        photo: '/images/testimonials/3.jpg',
        course: 'Английский для детей',
        rating: 5,
        text: 'Мой сын с удовольствием ходит на занятия. За полгода его уровень значительно вырос, появился интерес к языку.',
    },
    {
        id: '4',
        name: 'Данияр Нурланов',
        photo: '/images/testimonials/4.jpg',
        course: 'General English',
        rating: 5,
        text: 'Отличная атмосфера и методика обучения. Преподаватели всегда помогают преодолеть языковой барьер.',
    },
]

export default function Testimonials({ translations }: TestimonialsProps) {
    const t = (translations.testimonials || {}) as Record<string, string>
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const current = testimonials[currentIndex]

    return (
        <section className="section bg-[var(--surface)]">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                        {t.title || 'Отзывы студентов'}
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg">
                        {t.subtitle || 'Что говорят о нас'}
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-4" />
                </div>

                {/* Slider Container */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Navigation Buttons */}
                    <button
                        onClick={prev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-10 h-10 rounded-full bg-[var(--background)] shadow-lg flex items-center justify-center text-[var(--text)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={next}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-10 h-10 rounded-full bg-[var(--background)] shadow-lg flex items-center justify-center text-[var(--text)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Testimonial Card */}
                    <Card className="relative overflow-hidden p-0">
                        {/* Quote Icon */}
                        <Quote className="absolute top-6 right-6 w-16 h-16 text-[var(--primary)]/10" />

                        <div className={clsx("flex flex-col md:flex-row gap-6 p-8", current.certificate ? "items-start" : "items-center")}>
                            {/* Avatar or Certificate Preview */}
                            <div className="shrink-0 flex flex-col items-center gap-4">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                                    <div className="w-full h-full rounded-full bg-[var(--surface)] flex items-center justify-center overflow-hidden">
                                        {current.photo ? (
                                            <img src={current.photo} alt={current.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-[var(--primary)]">
                                                {current.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {current.certificate && (
                                    <div className="hidden md:block w-48 relative group cursor-pointer" onClick={() => setSelectedImage(current.certificate!)}>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                            <span className="text-white text-xs font-bold">Увеличить</span>
                                        </div>
                                        <img
                                            src={current.certificate}
                                            alt="Certificate"
                                            className="w-full rounded-lg shadow-md border border-[var(--border)]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                {/* Rating */}
                                <div className="flex items-center justify-center md:justify-start gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            className={clsx(
                                                i < current.rating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                            )}
                                        />
                                    ))}
                                </div>

                                {/* Text */}
                                <p className="text-[var(--text)] text-lg leading-relaxed italic">
                                    &ldquo;{current.text}&rdquo;
                                </p>

                                {/* Author */}
                                <div>
                                    <h4 className="font-semibold text-[var(--text)] text-xl">
                                        {current.name}
                                    </h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {current.course}
                                    </p>
                                </div>

                                {/* Mobile Certificate */}
                                {current.certificate && (
                                    <div className="md:hidden mt-4 cursor-pointer" onClick={() => setSelectedImage(current.certificate!)}>
                                        <p className="text-sm text-[var(--text-muted)] mb-2">Нажмите для просмотра сертификата:</p>
                                        <div className="relative">
                                            <img
                                                src={current.certificate}
                                                alt="Certificate"
                                                className="w-full max-w-[200px] mx-auto rounded-lg shadow-md border border-[var(--border)]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Dots */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={clsx(
                                    'w-2.5 h-2.5 rounded-full transition-all',
                                    index === currentIndex
                                        ? 'bg-[var(--primary)] w-8'
                                        : 'bg-[var(--border)] hover:bg-[var(--text-muted)]'
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size certificate"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                </div>
            )}
        </section>
    )
}
