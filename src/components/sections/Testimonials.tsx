'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { clsx } from 'clsx'
import Card from '../ui/Card'

interface TestimonialsProps {
    translations: Record<string, unknown>
}

const testimonials = [
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

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

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
                <div className="relative max-w-4xl mx-auto">
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
                    <Card className="relative overflow-hidden">
                        {/* Quote Icon */}
                        <Quote className="absolute top-6 right-6 w-16 h-16 text-[var(--primary)]/10" />

                        <div className="flex flex-col md:flex-row items-center gap-6 p-2">
                            {/* Avatar */}
                            <div className="shrink-0">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                                    <div className="w-full h-full rounded-full bg-[var(--surface)] flex items-center justify-center text-3xl font-bold text-[var(--primary)]">
                                        {testimonials[currentIndex].name.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                {/* Rating */}
                                <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            className={clsx(
                                                i < testimonials[currentIndex].rating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                            )}
                                        />
                                    ))}
                                </div>

                                {/* Text */}
                                <p className="text-[var(--text)] text-lg leading-relaxed mb-4">
                                    &ldquo;{testimonials[currentIndex].text}&rdquo;
                                </p>

                                {/* Author */}
                                <div>
                                    <h4 className="font-semibold text-[var(--text)]">
                                        {testimonials[currentIndex].name}
                                    </h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {testimonials[currentIndex].course}
                                    </p>
                                </div>
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
        </section>
    )
}
