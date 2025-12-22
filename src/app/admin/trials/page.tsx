'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Calendar, DollarSign, CheckCircle, XCircle, Users } from 'lucide-react'

// Types
interface Trial {
    id: number
    name: string
    phone: string
    date: string
    price: number
    isPaid: boolean
    status: string // scheduled, completed, missed, cancelled
    teacher: { id: number, name: string } | null
}

interface Teacher { id: number, name: string }

export default function TrialsPage() {
    const [trials, setTrials] = useState<Trial[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form
    const [form, setForm] = useState({
        name: '',
        phone: '',
        date: '',
        time: '14:00',
        teacherId: ''
    })

    useEffect(() => {
        fetchTrials()
        fetchTeachers()
    }, [])

    const fetchTrials = async () => {
        const res = await fetch('/api/trials')
        const data = await res.json()
        if (data.success) setTrials(data.data)
        setIsLoading(false)
    }

    const fetchTeachers = async () => {
        const res = await fetch('/api/users/teachers')
        const data = await res.json()
        if (Array.isArray(data)) setTeachers(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Combine Date & Time
            const dateTime = new Date(`${form.date}T${form.time}`)

            const res = await fetch('/api/trials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    date: dateTime.toISOString(),
                    teacherId: form.teacherId
                })
            })

            if (res.ok) {
                alert('Пробный урок запланирован!')
                setIsModalOpen(false)
                fetchTrials()
            } else {
                alert('Ошибка')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleMarkPaid = async (id: number) => {
        if (!confirm('Подтвердить оплату 1500 тг?')) return
        try {
            const res = await fetch('/api/trials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isPaid: true })
            })
            if (res.ok) fetchTrials()
        } catch (error) { alert('Err') }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try {
            const res = await fetch('/api/trials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            if (res.ok) fetchTrials()
        } catch (error) { alert('Err') }
    }

    // Separate Upcoming and Past
    const now = new Date()
    const upcoming = trials.filter(t => new Date(t.date) >= now || t.status === 'scheduled')
    const history = trials.filter(t => new Date(t.date) < now && t.status !== 'scheduled')

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} title="Пробные Уроки" />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Запись на пробные (1500 ₸)</h1>
                    <Button variant="primary" leftIcon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
                        Записать
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Upcoming */}
                    <section>
                        <h2 className="text-lg font-bold text-[var(--text-secondary)] mb-4">Ближайшие записи</h2>
                        {upcoming.length === 0 ? (
                            <div className="text-[var(--text-muted)] italic">Нет запланированных уроков</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {upcoming.map(trial => (
                                    <Card key={trial.id} className="relative group border-l-4 border-l-[var(--primary)]">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-[var(--text)]">{trial.name}</h3>
                                                <p className="text-sm text-[var(--text-muted)]">{trial.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-[var(--text)]">
                                                    {new Date(trial.date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-[var(--text-muted)]">
                                                    {new Date(trial.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
                                            <div className="flex items-center gap-1">
                                                <Users size={14} />
                                                <span>{trial.teacher?.name || 'Преподаватель не назначен'}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                                            {trial.isPaid ? (
                                                <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded">
                                                    <CheckCircle size={14} /> Оплачено
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkPaid(trial.id)}
                                                    className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                                >
                                                    <XCircle size={14} /> Не оплачено
                                                </button>
                                            )}

                                            <select
                                                className="bg-[var(--surface-hover)] border-none text-xs rounded px-2 py-1 outline-none cursor-pointer"
                                                value={trial.status}
                                                onChange={(e) => handleStatusChange(trial.id, e.target.value)}
                                            >
                                                <option value="scheduled">Запланировано</option>
                                                <option value="completed">Проведено</option>
                                                <option value="missed">Пропущено</option>
                                                <option value="cancelled">Отменено</option>
                                            </select>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border)]">
                        <div className="p-6 border-b border-[var(--border)]">
                            <h2 className="text-xl font-bold text-[var(--text)]">Новая запись</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Имя</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Телефон</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Дата</label>
                                    <input type="date" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                        value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Время</label>
                                    <input type="time" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                        value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Преподаватель</label>
                                <select className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                    value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                                    <option value="">Выберите...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                                Стоимость: <strong>1500 ₸</strong> (по умолчанию)
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Отмена</Button>
                                <Button type="submit" variant="primary" className="flex-1">Записать</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
