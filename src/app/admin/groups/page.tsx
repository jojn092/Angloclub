'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Users, BookOpen, Clock, Trash2, X } from 'lucide-react'

// Define Interfaces
interface Group {
    id: number
    name: string
    level: string
    isActive: boolean
    course: { name: string }
    teacher: { id: number, name: string }
    room: { id: number, name: string } | null
    students: { id: number, name: string }[]
    _count: { students: number }
}

interface Teacher { id: number, name: string }
interface Room { id: number, name: string }
interface Student { id: number, name: string }

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [students, setStudents] = useState<Student[]>([]) // All students for adding
    const [isLoading, setIsLoading] = useState(true)

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: '',
        teacherId: '',
        roomId: '',
        isActive: true,
        studentsToAdd: [] as string[], // Selected IDs to add
        studentsToRemove: [] as number[] // IDs to remove
    })

    useEffect(() => {
        Promise.all([
            fetchGroups(),
            fetchTeachers(),
            fetchRooms(),
            fetchStudents()
        ]).finally(() => setIsLoading(false))
    }, [])

    const fetchGroups = async () => {
        const res = await fetch('/api/groups')
        const data = await res.json()
        if (data.success) setGroups(data.data)
    }

    const fetchTeachers = async () => {
        const res = await fetch('/api/users/teachers')
        const data = await res.json()
        if (Array.isArray(data)) setTeachers(data)
    }

    const fetchRooms = async () => {
        const res = await fetch('/api/rooms')
        const data = await res.json()
        if (data.success) setRooms(data.data)
    }

    const fetchStudents = async () => {
        const res = await fetch('/api/students')
        const data = await res.json()
        if (data.success) setStudents(data.data)
    }

    const handleEditClick = (group: Group) => {
        setSelectedGroup(group)
        setEditForm({
            name: group.name,
            teacherId: group.teacher.id.toString(),
            roomId: group.room?.id.toString() || '',
            isActive: group.isActive,
            studentsToAdd: [],
            studentsToRemove: []
        })
        setIsEditModalOpen(true)
    }

    const handleSaveGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedGroup) return

        try {
            const body = {
                id: selectedGroup.id,
                name: editForm.name,
                teacherId: Number(editForm.teacherId),
                roomId: editForm.roomId ? Number(editForm.roomId) : null,
                isActive: editForm.isActive,
                addStudentIds: editForm.studentsToAdd.map(Number),
                removeStudentIds: editForm.studentsToRemove
            }

            const res = await fetch(`/api/groups`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                alert('Группа успешно обновлена!')
                setIsEditModalOpen(false)
                fetchGroups()
            } else {
                alert('Ошибка при сохранении')
            }
        } catch (error) {
            alert('Ошибка сети')
        }
    }

    // Toggle student for removal in the list
    const toggleRemoveStudent = (studentId: number) => {
        if (editForm.studentsToRemove.includes(studentId)) {
            setEditForm(prev => ({ ...prev, studentsToRemove: prev.studentsToRemove.filter(id => id !== studentId) }))
        } else {
            setEditForm(prev => ({ ...prev, studentsToRemove: [...prev.studentsToRemove, studentId] }))
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Управление Группами</h1>
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
                        Групп пока нет.
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
                                        <span className={`px-2 py-1 rounded text-xs font-bold mb-2 block ${group.isActive ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                            {group.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(group)}>
                                            Редактировать
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[var(--surface)] w-full max-w-2xl rounded-xl shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--surface)] z-10">
                            <h2 className="text-xl font-bold text-[var(--text)]">Редактирование группы</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X /></button>
                        </div>

                        <form onSubmit={handleSaveGroup} className="p-6 space-y-6">
                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Название</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Статус</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        value={editForm.isActive ? 'true' : 'false'}
                                        onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                                    >
                                        <option value="true">Активна</option>
                                        <option value="false">Архив</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Преподаватель</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        value={editForm.teacherId}
                                        onChange={e => setEditForm({ ...editForm, teacherId: e.target.value })}
                                    >
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Аудитория</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        value={editForm.roomId}
                                        onChange={e => setEditForm({ ...editForm, roomId: e.target.value })}
                                    >
                                        <option value="">Без аудитории</option>
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <hr className="border-[var(--border)]" />

                            {/* Students Management */}
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text)] mb-4">Участники</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Добавить студентов</label>
                                    <select
                                        multiple
                                        className="w-full h-32 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        value={editForm.studentsToAdd}
                                        onChange={e => {
                                            // Handle multiple select
                                            const options = Array.from(e.target.selectedOptions, option => option.value)
                                            setEditForm({ ...editForm, studentsToAdd: options })
                                        }}
                                    >
                                        {students.filter(s => !selectedGroup.students.some(gs => gs.id === s.id)).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Зажмите Ctrl (Windows) или Cmd (Mac) для выбора нескольких.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Текущие студенты (нажмите корзину для удаления)</label>
                                    <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
                                        {selectedGroup.students.length === 0 && <div className="p-4 text-sm text-[var(--text-muted)]">В группе нет студентов</div>}
                                        {selectedGroup.students.map(student => (
                                            <div key={student.id} className={
                                                `p-3 flex justify-between items-center ${editForm.studentsToRemove.includes(student.id) ? 'bg-red-50 opacity-50' : ''}`
                                            }>
                                                <span className="text-[var(--text)]">{student.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRemoveStudent(student.id)}
                                                    className={`p-2 rounded-full ${editForm.studentsToRemove.includes(student.id) ? 'text-red-600 bg-red-100' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'}`}
                                                >
                                                    {editForm.studentsToRemove.includes(student.id) ? 'Вернуть' : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                                    Отмена
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1">
                                    Сохранить изменения
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
