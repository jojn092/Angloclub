'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Users, BookOpen, Clock } from 'lucide-react'

// Define Group Interface
interface Group {
    id: number
    name: string
    level: string
    course: { name: string }
    teacher: { name: string }
    _count: { students: number }
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups')
            const data = await res.json()
            if (data.success) setGroups(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Группы</h1>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={20} />}
                        onClick={() => window.location.href = '/admin/groups/new'}
                    >
                        Создать группу
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-[var(--text-muted)]">Загрузка...</div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-muted)] border rounded-xl border-dashed border-[var(--border)]">
                        Групп пока нет. Создайте первую!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <Card key={group.id} className="hover:border-[var(--primary)] transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                                            {group.name}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{group.level}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold">
                                        Active
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-[var(--text-muted)]">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} />
                                        <span>{group.course.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} />
                                        <span>{group.teacher.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>{group._count.students} студентов</span>
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
