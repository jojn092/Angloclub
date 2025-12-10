'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Trash, User } from 'lucide-react'

interface User {
    id: number
    name: string
    email: string
    role: string
    hourlyRate: number
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Form State
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'TEACHER',
        hourlyRate: 0
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (data.success) setUsers(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingUser(null)
        setForm({ name: '', email: '', password: '', role: 'TEACHER', hourlyRate: 0 })
        setIsModalOpen(true)
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setForm({
            name: user.name,
            email: user.email,
            password: '', // Leave empty to keep unchanged
            role: user.role,
            hourlyRate: user.hourlyRate
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const method = editingUser ? 'PUT' : 'POST'
            const body = editingUser
                ? { ...form, id: editingUser.id, password: form.password || undefined } // only send password if changed
                : form

            const res = await fetch('/api/admin/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                alert(editingUser ? 'Пользователь обновлен ✅' : 'Пользователь создан ✅')
                setIsModalOpen(false)
                fetchUsers()
            } else {
                alert('Ошибка')
            }
        } catch (error) {
            alert('Ошибка сети')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены?')) return
        await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
        fetchUsers()
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Пользователи</h1>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={20} />}
                        onClick={openCreateModal}
                    >
                        Добавить пользователя
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {users.map(user => (
                        <Card key={user.id} className="relative group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--text)]">{user.name}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(user)} className="text-gray-400 hover:text-[var(--primary)]">
                                    ✎
                                </button>
                                <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-600">
                                    <Trash size={18} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border)]">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text)]">
                                {editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)]">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Имя</label>
                                <input required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                                <input type="email" required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Почасовая ставка (тг/60мин)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                    value={form.hourlyRate || ''}
                                    onChange={e => setForm({ ...form, hourlyRate: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Пароль {editingUser && '(оставьте пустым чтобы не менять)'}</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required={!editingUser}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Роль</label>
                                <select className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="TEACHER">Учитель (Teacher)</option>
                                    <option value="ADMIN">Админ (Admin)</option>
                                    <option value="MANAGER">Менеджер (Manager)</option>
                                </select>
                            </div>
                            <Button type="submit" variant="primary" className="w-full">
                                {editingUser ? 'Сохранить изменения' : 'Создать'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
