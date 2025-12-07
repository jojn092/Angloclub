'use client'

import { useState, useEffect } from 'react'
import TeacherHeader from '@/components/teacher/TeacherHeader'
import Card from '@/components/ui/Card'
import { Users, Clock, MapPin } from 'lucide-react'

interface Group {
    id: number
    name: string
    level: string
    course: { name: string }
    room: { name: string } | null
    _count: { students: number }
}

export default function TeacherPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // We need an API that returns ONLY user's groups
        // For now, let's reuse /api/groups but filter by current user logic? 
        // No, standard /api/groups returns ALL. We need /api/teacher/groups or pass ?teacherId=me
        // Let's modify fetch to handle this or just fetch all and rely on API filtering if we implement it.
        // For MVP, I'll fetch /api/groups which returns ALL and I can't filter without auth info in client which I don't have easily.
        // Better: Create /api/teacher/groups endpoint.
        fetch('/api/teacher/groups')
            .then(res => res.json())
            .then(data => {
                if (data.success) setGroups(data.data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/admin/login'
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <TeacherHeader onLogout={handleLogout} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Мои группы</h2>

                {loading ? (
                    <div className="text-center py-12">Загрузка...</div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-muted)]">У вас пока нет групп</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {groups.map(g => (
                            <Card key={g.id} className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => window.location.href = `/teacher/groups/${g.id}`}>
                                <h3 className="text-xl font-bold text-[var(--text)] flex justify-between">
                                    {g.name}
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{g.course.name}</span>
                                </h3>
                                <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} /> {g._count.students} студентов
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} /> {g.room?.name || 'Без аудитории'}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
