'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Search, User, X } from 'lucide-react'

interface Student {
    id: number
    name: string
    phone: string
    balance: number
    groups: { name: string }[]
}

interface Group {
    id: number
    name: string
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        groupIds: [] as number[]
    })

    useEffect(() => {
        fetchStudents()
        fetchGroups() // Pre-load groups for dropdown
    }, [search])

    const fetchStudents = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)

            const res = await fetch(`/api/students?${params}`)
            const data = await res.json()
            if (data.success) {
                setStudents(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups')
            const data = await res.json()
            if (data.success) setGroups(data.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                alert('Студент создан')
                setIsModalOpen(false)
                setFormData({ name: '', phone: '', email: '', groupIds: [] })
                fetchStudents()
            } else {
                alert(data.error || 'Ошибка')
            }
        } catch (error) {
            alert('Ошибка')
        }
    }

    const toggleGroupSelection = (id: number) => {
        setFormData(prev => {
            if (prev.groupIds.includes(id)) {
                return { ...prev, groupIds: prev.groupIds.filter(gId => gId !== id) }
            } else {
                return { ...prev, groupIds: [...prev.groupIds, id] }
            }
        })
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Студенты</h1>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={20} />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Добавить студента
                    </Button>
                </div>

                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                        <input
                            type="text"
                            placeholder="Поиск по имени или телефону..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Card padding="none" className="overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Имя</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Телефон</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Группы</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Баланс</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">Загрузка...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">Студенты не найдены</td></tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.id} className="hover:bg-[var(--surface-hover)] group">
                                        <td className="p-4 text-sm font-medium text-[var(--text)] flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{student.phone}</td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">
                                            {student.groups.map(g => g.name).join(', ') || '-'}
                                        </td>
                                        <td className={`p-4 text-sm font-bold ${student.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            {student.balance.toLocaleString()} ₸
                                        </td>
                                        <td className="p-4 text-sm">
                                            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/admin/students/${student.id}`}>
                                                Профиль
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--surface)] w-full max-w-lg rounded-xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text)]">Новый студент</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Имя</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Телефон</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email (необязательно)</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Добавить в группы</label>
                                <div className="border border-[var(--border)] rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                                    {groups.map(g => (
                                        <div
                                            key={g.id}
                                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--surface-hover)] rounded cursor-pointer"
                                            onClick={() => toggleGroupSelection(g.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.groupIds.includes(g.id)}
                                                readOnly
                                                className="rounded border-[var(--border)] text-[var(--primary)]"
                                            />
                                            <span className="text-sm text-[var(--text)]">{g.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                    Отмена
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1">
                                    Создать
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
