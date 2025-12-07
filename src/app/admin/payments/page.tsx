'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Search } from 'lucide-react'

interface Payment {
    id: number
    amount: number
    date: string
    method: string
    comment: string
    student: { name: string }
}

interface Student {
    id: number
    name: string
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        method: 'cash',
        comment: '',
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        fetchPayments()
        fetchStudents()
    }, [])

    const fetchPayments = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/payments')
            const data = await res.json()
            if (data.success) {
                setPayments(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStudents = async () => {
        // Need a lightweight student list. 
        // Using existing /api/students might be heavy if paginated, but fine for MVP.
        try {
            const res = await fetch('/api/students?limit=100') // fetch first 100 for dropdown
            const data = await res.json()
            if (data.success) {
                setStudents(data.data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.studentId || !formData.amount) return alert('Fill required fields')

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (data.success) {
                alert('Платеж принят!')
                setIsModalOpen(false)
                fetchPayments()
                setFormData({
                    studentId: '',
                    amount: '',
                    method: 'cash',
                    comment: '',
                    date: new Date().toISOString().split('T')[0]
                })
            } else {
                alert(data.error || 'Ошибка')
            }
        } catch (error) {
            alert('Error')
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Финансы платежи</h1>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={20} />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Принять оплату
                    </Button>
                </div>

                <Card padding="none" className="overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">ID</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Студент</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Сумма</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Метод</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Дата</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Комментарий</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">Загрузка...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">История пуста</td></tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id} className="hover:bg-[var(--surface-hover)]">
                                        <td className="p-4 text-sm text-[var(--text)]">#{p.id}</td>
                                        <td className="p-4 text-sm font-medium text-[var(--text)]">{p.student.name}</td>
                                        <td className="p-4 text-sm text-green-600 font-bold">+{p.amount.toLocaleString()} ₸</td>
                                        <td className="p-4 text-sm text-[var(--text-muted)] capitalize">{p.method}</td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">
                                            {new Date(p.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{p.comment || '-'}</td>
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
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text)]">Принять оплату</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Студент</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    required
                                    value={formData.studentId}
                                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                >
                                    <option value="">Выберите студента</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Сумма (₸)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Метод</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        value={formData.method}
                                        onChange={e => setFormData({ ...formData, method: e.target.value })}
                                    >
                                        <option value="cash">Наличные</option>
                                        <option value="card">Карта / Kaspi</option>
                                        <option value="transfer">Перевод</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Дата</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Комментарий</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    rows={3}
                                    value={formData.comment}
                                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                    Отмена
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1">
                                    Сохранить
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
