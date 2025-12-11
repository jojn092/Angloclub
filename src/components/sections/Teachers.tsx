'use client'

import { Mail, Instagram, GraduationCap, Clock, BookOpen, Award, Calendar } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface TeachersProps {
    translations: Record<string, unknown>
    onEnroll?: () => void
}

interface Teacher {
    name: string
    role: string
    image: string
    details: {
        label: string
        value: string
        icon: React.ElementType
    }[]
}

const teachers: Teacher[] = [
    {
        name: 'Мисс Мира',
        role: 'Магистр',
        image: '/images/teachers/mira.png',
        details: [
            { label: 'Образование', value: 'Astana International University (бакалавр), Eurasian National University (магистр)', icon: GraduationCap },
            { label: 'Опыт', value: '6 лет преподавания', icon: Clock },
            { label: 'Методы', value: 'подкасты, видео, разговорная практика', icon: BookOpen },
            { label: 'График', value: 'Пн, Ср, Пт, Сб, Вск / 9.00 - 21.00', icon: Calendar },
        ]
    },
    {
        name: 'Мисс Назерке',
        role: 'IELTS Expert',
        image: '/images/teachers/nazerke.png',
        details: [
            { label: 'Образование', value: 'Nazarbayev University', icon: GraduationCap },
            { label: 'Сертификаты', value: 'IELTS 7.0', icon: Award },
            { label: 'Сильные стороны', value: 'легко работает с подростками, делает уроки живыми', icon: BookOpen },
            { label: 'График', value: 'Пн, Ср, Пт / 16.00 - 21.00', icon: Calendar },
        ]
    },
    {
        name: 'Мисс Сагынай',
        role: 'IELTS & General',
        image: '/images/teachers/sagynay.png',
        details: [
            { label: 'Образование', value: 'Nazarbayev University – Bachelor of Medical Science', icon: GraduationCap },
            { label: 'Сертификаты', value: 'IELTS 7.0', icon: Award },
            { label: 'Специализация', value: 'IELTS & General English', icon: BookOpen },
            { label: 'График', value: 'Сб, Вск / 11:00-19:00', icon: Calendar },
        ]
    },
    {
        name: 'Мисс Алтынай',
        role: 'Педагог',
        image: '/images/teachers/altynay.png',
        details: [
            { label: 'Образование', value: 'ВКПК, Восточно-Казахстанский университет', icon: GraduationCap },
            { label: 'Опыт', value: '3+ года преподавания', icon: Clock },
            { label: 'Сильные стороны', value: 'максимум практики, игры, видео', icon: BookOpen },
            { label: 'График', value: 'Пн - Пт / 9.00- 21.00', icon: Calendar },
        ]
    },
]

export default function Teachers({ translations, onEnroll }: TeachersProps) {
    const t = (translations.teachers || {}) as Record<string, string>

    return (
        <section className="section bg-[var(--surface)]" id="teachers">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                        {t.title || 'Вдохновляющие преподаватели'}
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg">
                        {t.subtitle || 'Команда профессионалов, влюбленных в свое дело'}
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-4" />
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teachers.map((teacher, index) => (
                        <Card
                            key={index}
                            className="group flex flex-col h-full bg-[var(--background)] hover:shadow-xl transition-all duration-300 border-none ring-1 ring-[var(--border)]"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-gray-100">
                                <img
                                    src={teacher.image}
                                    alt={teacher.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        // Fallback if image fails (e.g. not matched yet)
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://ui-avatars.com/api/?name=' + teacher.name + '&background=random';
                                    }}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-lg font-bold">
                                        {teacher.name}
                                    </h3>
                                    <p className="text-white/80 text-sm font-medium">
                                        {teacher.role}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-grow flex flex-col gap-3">
                                {teacher.details.map((detail, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 min-w-4 text-[var(--primary)]">
                                            <detail.icon size={16} />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-[var(--text)] block text-xs uppercase tracking-wider opacity-70 mb-0.5">
                                                {detail.label}
                                            </span>
                                            <p className="text-[var(--text-muted)] leading-snug">
                                                {detail.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Filter/Button could go here */}
                            <div className="p-4 pt-0 mt-auto">
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={onEnroll}
                                >
                                    Записаться на пробный
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
