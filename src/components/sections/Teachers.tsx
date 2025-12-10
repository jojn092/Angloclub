'use client'

import { Mail, Instagram } from 'lucide-react'
import Card from '../ui/Card'

interface TeachersProps {
    translations: Record<string, unknown>
}

const teachers = [
    {
        name: 'Алина Смаилова',
        role: 'Senior Teacher',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400',
        description: 'CELTA Certified, 8 лет опыта. Специализируется на IELTS и Business English.',
    },
    {
        name: 'Michael Brown',
        role: 'Native Speaker',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400',
        description: 'Преподаватель из США. Ведет разговорные клубы и Advanced уровни.',
    },
    {
        name: 'Динара Алиева',
        role: 'Kids Teacher',
        image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=400&h=400',
        description: 'Эксперт по методике преподавания детям. Делает каждый урок увлекательной игрой (3 года опыта).',
    },
    {
        name: 'Ержан Куанышев',
        role: 'General English',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400',
        description: 'Помогает преодолеть языковой барьер с первого занятия. (5 лет опыта).',
    },
]

export default function Teachers({ translations }: TeachersProps) {
    const t = (translations.teachers || {}) as Record<string, string>

    return (
        <section className="section bg-[var(--surface)]" id="teachers">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                        {t.title || 'Наши преподаватели'}
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
                            className="group overflow-hidden bg-[var(--background)] hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={teacher.image}
                                    alt={teacher.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-4">
                                    <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                                        <Instagram size={20} />
                                    </button>
                                    <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 text-center">
                                <h3 className="text-lg font-bold text-[var(--text)] mb-1">
                                    {teacher.name}
                                </h3>
                                <div className="inline-block px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-3">
                                    {teacher.role}
                                </div>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                                    {teacher.description}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
