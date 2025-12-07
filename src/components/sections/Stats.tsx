'use client'

import AnimatedCounter from '../ui/AnimatedCounter'
import { GraduationCap, Calendar, Users, BookOpen } from 'lucide-react'

interface StatsProps {
    translations: Record<string, unknown>
}

export default function Stats({ translations }: StatsProps) {
    const t = (translations.stats || {}) as Record<string, string>

    const stats = [
        {
            icon: Users,
            value: 500,
            suffix: '+',
            label: t.students || 'Студентов',
            color: 'text-blue-500',
        },
        {
            icon: Calendar,
            value: 10,
            suffix: '+',
            label: t.years || 'Лет опыта',
            color: 'text-purple-500',
        },
        {
            icon: GraduationCap,
            value: 2000,
            suffix: '+',
            label: t.graduates || 'Выпускников',
            color: 'text-orange-500',
        },
        {
            icon: BookOpen,
            value: 15,
            suffix: '',
            label: t.courses || 'Курсов',
            color: 'text-green-500',
        },
    ]

    return (
        <section className="py-16 bg-gradient-to-br from-primary via-secondary to-purple-700 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="container mx-auto px-4 relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            {/* Icon */}
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <stat.icon size={28} className="text-white" />
                            </div>

                            {/* Counter */}
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                <AnimatedCounter
                                    end={stat.value}
                                    suffix={stat.suffix}
                                    duration={2000}
                                />
                            </div>

                            {/* Label */}
                            <p className="text-white/80 text-sm md:text-base font-medium">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
