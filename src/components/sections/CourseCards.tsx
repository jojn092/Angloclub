import { useState } from 'react'
import { Baby, GraduationCap, Briefcase, Globe2, MessageSquare, Zap, X } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface CourseCardsProps {
    translations: Record<string, unknown>
    onEnroll: (course: string) => void
}

const courses = [
    {
        id: 'kids',
        icon: Baby,
        color: 'from-pink-500 to-rose-600',
        price: 34900,
    },
    {
        id: 'teens',
        icon: GraduationCap,
        color: 'from-blue-500 to-indigo-600',
        price: 34900,
    },
    {
        id: 'adults',
        icon: Briefcase,
        color: 'from-purple-500 to-violet-600',
        price: 34900,
    },
    {
        id: 'ielts',
        icon: Globe2,
        color: 'from-emerald-500 to-teal-600',
        price: 80000,
    },
    {
        id: 'online',
        icon: MessageSquare,
        color: 'from-orange-500 to-amber-600',
        price: 45000,
    },
    {
        id: 'individual',
        icon: Zap,
        color: 'from-red-500 to-pink-600',
        price: 70000,
    },
]

export default function CourseCards({ translations, onEnroll }: CourseCardsProps) {
    const t = (translations.courses || {}) as Record<string, unknown>
    const tTexts = t as Record<string, Record<string, string> | string>
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

    const getCourseText = (courseId: string, field: string) => {
        const courseData = tTexts[courseId] as Record<string, string>
        return courseData?.[field] || ''
    }

    const handleEnroll = (courseId: string) => {
        const title = getCourseText(courseId, 'title')
        onEnroll(title || courseId)
        setSelectedCourse(null)
    }

    return (
        <section className="section bg-[var(--background)]" id="courses">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                        {(tTexts.title as string) || 'Наши курсы'}
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                        {(tTexts.subtitle as string) || 'Выберите программу, которая подходит именно вам'}
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-4" />
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => {
                        const title = getCourseText(course.id, 'title')
                        const ages = getCourseText(course.id, 'ages')
                        const description = getCourseText(course.id, 'description')

                        return (
                            <Card
                                key={course.id}
                                variant="hover"
                                className="group relative overflow-hidden flex flex-col"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${course.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-4`}>
                                    <course.icon size={28} className="text-white" />
                                </div>

                                {/* Title & Ages */}
                                <div className="mb-3">
                                    <h3 className="text-xl font-bold text-[var(--text)] mb-1">
                                        {title || course.id}
                                    </h3>
                                    {ages && (
                                        <span className="inline-block px-2 py-1 text-xs font-medium bg-[var(--surface-hover)] rounded-full text-[var(--text-muted)]">
                                            {ages}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed flex-grow">
                                    {description}
                                </p>

                                {/* Price */}
                                <div className="mb-4 pt-4 border-t border-[var(--border)]">
                                    <span className="text-sm text-[var(--text-muted)]">
                                        {(tTexts.from as string) || 'от'}{' '}
                                    </span>
                                    <span className="text-2xl font-bold text-[var(--primary)]">
                                        {course.price.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)]"> ₸/мес</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleEnroll(course.id)}
                                        className="flex-1"
                                    >
                                        {(tTexts.enroll as string) || 'Записаться'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedCourse(course.id)}
                                    >
                                        {(tTexts.details as string) || 'Подробнее'}
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>

                {/* Package Offer */}
                <div className="mt-12 p-6 md:p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-[var(--border)]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text)] mb-2">
                                🎁 Специальные пакеты со скидкой
                            </h3>
                            <p className="text-[var(--text-muted)]">
                                Курс + Разговорный клуб = <span className="text-[var(--accent)] font-semibold">-20%</span>{' '}
                                | Семейный пакет (2 ребенка) = <span className="text-[var(--accent)] font-semibold">-15%</span>
                            </p>
                        </div>
                        <Button variant="accent" size="lg" onClick={() => onEnroll('Special Offer')}>
                            Узнать подробнее
                        </Button>
                    </div>
                </div>
            </div>

            {/* Course Details Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all" onClick={() => setSelectedCourse(null)}>
                    <div className="bg-[var(--surface)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        {(() => {
                            const course = courses.find(c => c.id === selectedCourse)!
                            const title = getCourseText(course.id, 'title')
                            const description = getCourseText(course.id, 'description')
                            const details = (tTexts[course.id] as Record<string, any>)?.fullDescription || description // Fallback to short desc if full not avail

                            return (
                                <>
                                    <div className={`p-6 bg-gradient-to-br ${course.color} relative`}>
                                        <button
                                            onClick={() => setSelectedCourse(null)}
                                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
                                            <course.icon size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                                        <p className="text-white/90 font-medium">
                                            {course.price.toLocaleString()} ₸/мес
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-[var(--text)]">О курсе:</h4>
                                            <p className="text-[var(--text-muted)] leading-relaxed">
                                                {description}
                                            </p>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                                                    Мини-группы до 8 человек
                                                </li>
                                                <li className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                                                    Интерактивная платформа
                                                </li>
                                                <li className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                                                    Разговорная практика
                                                </li>
                                            </ul>
                                        </div>
                                        <Button variant="primary" className="w-full" size="lg" onClick={() => handleEnroll(course.id)}>
                                            Записаться на курс
                                        </Button>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>
            )}
        </section>
    )
}
