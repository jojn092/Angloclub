'use client'

import { Award, Users, BookOpen, Target } from 'lucide-react'
import Card from '../ui/Card'

interface FeaturesProps {
    translations: Record<string, unknown>
}

export default function Features({ translations }: FeaturesProps) {
    const t = (translations.features || {}) as Record<string, Record<string, string> | string>

    const features = [
        {
            icon: Award,
            title: (t.experience as Record<string, string>)?.title || '10+ лет опыта',
            description: (t.experience as Record<string, string>)?.description || 'Проверенная методика преподавания английского языка',
            color: 'from-blue-500 to-indigo-600',
        },
        {
            icon: Users,
            title: (t.teachers as Record<string, string>)?.title || 'Сертифицированные преподаватели',
            description: (t.teachers as Record<string, string>)?.description || 'CELTA, TESOL и международные сертификаты',
            color: 'from-purple-500 to-pink-600',
        },
        {
            icon: BookOpen,
            title: (t.groups as Record<string, string>)?.title || 'Мини-группы до 8 человек',
            description: (t.groups as Record<string, string>)?.description || 'Индивидуальный подход к каждому студенту',
            color: 'from-orange-500 to-red-600',
        },
        {
            icon: Target,
            title: (t.results as Record<string, string>)?.title || 'Гарантия результата',
            description: (t.results as Record<string, string>)?.description || 'Повышение уровня за 3-6 месяцев обучения',
            color: 'from-green-500 to-teal-600',
        },
    ]

    return (
        <section className="section bg-[var(--background)]">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                        {(t.title as string) || 'Почему выбирают нас'}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            variant="hover"
                            className="text-center group"
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon size={28} className="text-white" />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-[var(--text)] mb-3">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
