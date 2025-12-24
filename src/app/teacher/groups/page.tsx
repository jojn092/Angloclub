'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TeacherHeader from '@/components/teacher/TeacherHeader'
import Card from '@/components/ui/Card'
import { GraduationCap, Users, BookOpen, Clock, ArrowRight } from 'lucide-react'

interface Group {
    id: number
    name: string
    course: { name: string }
    room: { name: string } | null
    _count: { students: number }
}

export default function TeacherGroupsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/teacher/groups')
            .then(async res => {
                if (!res.ok) throw new Error(res.statusText);
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('SERVER RESPONSE:', text);
                    throw new Error('Invalid JSON');
                }
            })
            .then(data => {
                if (data.success) setGroups(data.data)
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="space-y-6">

            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                        <GraduationCap className="text-[var(--primary)]" />
                        Мои Группы
                    </h1>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Загрузка...</div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-muted)]">
                        У вас пока нет активных групп
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <Link key={group.id} href={`/teacher/groups/${group.id}`} className="block group">
                                <Card className="h-full hover:shadow-lg transition-shadow border-[var(--border)] group-hover:border-[var(--primary)]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <GraduationCap size={24} />
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-hover)] text-[var(--text-secondary)]">
                                            ID: {group.id}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-[var(--text)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                                        {group.name}
                                    </h3>

                                    <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={16} className="text-[var(--primary)]" />
                                            <span>{group.course?.name || 'Без курса'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-[var(--primary)]" />
                                            <span>{group._count?.students || 0} студентов</span>
                                        </div>
                                        {group.room && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                                </div>
                                                <span>{group.room.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center text-sm font-medium text-[var(--primary)]">
                                        <span>Открыть группу</span>
                                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
