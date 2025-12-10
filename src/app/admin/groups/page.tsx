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
    const [students, setStudents] = useState<{ id: number, name: string }[]>([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [editForm, setEditForm] = useState({
        isActive: true,
        studentId: ''
    })

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

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students')
            const data = await res.json()
            if (data.success) setStudents(data.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleEditClick = (group: Group) => {
        // Since Group interface in this file doesn't have isActive, we assume logic or fetch it.
        // But schema has it. We need to update the interface locally if not present or cast it.
        // Let's assume the API returns it.
        setSelectedGroup(group)
        setEditForm({
            isActive: (group as any).isActive ?? true,
            studentId: ''
        })
        fetchStudents()
        setIsEditModalOpen(true)
    }

    const handleSaveGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedGroup) return

        try {
            const res = await fetch(`/api/groups`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedGroup.id,
                    isActive: editForm.isActive,
                    addStudentId: editForm.studentId ? Number(editForm.studentId) : undefined
                })
            })

            if (res.ok) {
                alert('Группа обновлена')
                setIsEditModalOpen(false)
                fetchGroups()
            } else {
                alert('Ошибка при сохранении')
            }
        } catch (error) {
            alert('Ошибка')
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
                            <Card key={group.id} className="hover:border-[var(--primary)] transition-colors group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                                            {group.name}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{group.level}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-bold mb-2 block ${(group as any).isActive ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                            {(group as any).isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(group)}>
                                            Ред.
                                        </Button>
                                    </div>
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

            {/* Edit Modal */}
            {isEditModalOpen && selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border)]">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text)]">Редактировать группу</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-muted)]">✕</button>
                        </div>
                        <form onSubmit={handleSaveGroup} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Название</label>
                                <div className="text-[var(--text)] font-bold">{selectedGroup.name}</div>
                            </div>

                            {/* Status Toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-4 h-4 text-[var(--primary)] rounded border-[var(--border)]"
                                    checked={editForm.isActive}
                                    onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-[var(--text)]">Активная группа</label>
                            </div>

                            {/* Add Student */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Добавить студента</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={editForm.studentId}
                                    onChange={e => setEditForm({ ...editForm, studentId: e.target.value })}
                                >
                                    <option value="">Выберите студента...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    Выберите студента, чтобы добавить его в эту группу.
                                </p>
                            </div>

                            <Button type="submit" variant="primary" className="w-full">
                                Сохранить
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
