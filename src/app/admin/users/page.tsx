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
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form State
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'TEACHER'
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (res.ok) {
                alert('Пользователь создан ✅')
                setIsModalOpen(false)
                setForm({ name: '', email: '', password: '', role: 'TEACHER' })
                fetchUsers()
            } else {
                alert('Ошибка при создании')
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
                        onClick={() => setIsModalOpen(true)}
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
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash size={18} />
                            </button>
                        </Card>
                    ))}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border)]">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text)]">Новый пользователь</h2>
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
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Пароль</label>
                                <input type="text" required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
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
                            <Button type="submit" variant="primary" className="w-full">Создать</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
