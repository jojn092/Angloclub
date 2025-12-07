'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DollarSign, CheckCircle, Clock } from 'lucide-react'

interface PayrollItem {
    teacher: {
        id: number
        name: string
        email: string
    }
    lessonCount: number
    salary: number
    isPaid: boolean
}

export default function PayrollPage() {
    const [items, setItems] = useState<PayrollItem[]>([])
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
    const [isLoading, setIsLoading] = useState(true)

    // Payment Modal State
    const [selectedTeacher, setSelectedTeacher] = useState<PayrollItem | null>(null)
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [month])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/finance/payroll?month=${month}`)
            const data = await res.json()
            if (data.success) setItems(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePayClick = (item: PayrollItem) => {
        setSelectedTeacher(item)
        setAmount('') // Reset amount
    }

    const handleConfirmPay = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTeacher) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/finance/payroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedTeacher.teacher.id,
                    amount: Number(amount),
                    period: month
                })
            })

            if (res.ok) {
                alert('Зарплата выплачена ✅')
                setSelectedTeacher(null)
                fetchData() // Refresh
            } else {
                alert('Ошибка при выплате ❌')
            }
        } catch (error) {
            alert('Ошибка сети')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Зарплаты (Payroll)</h1>
                    <input
                        type="month"
                        className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                    />
                </div>

                <Card padding="none" className="overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Учитель</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Проведено уроков</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Расчетный период</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Статус</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)] text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">Загрузка...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">Нет учителей</td></tr>
                            ) : (
                                items.map(item => (
                                    <tr key={item.teacher.id} className="hover:bg-[var(--surface-hover)]">
                                        <td className="p-4">
                                            <div className="font-bold text-[var(--text)]">{item.teacher.name}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">{item.teacher.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-[var(--text)]">
                                                <Clock size={16} className="text-blue-500" />
                                                <span className="font-bold">{item.lessonCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{month}</td>
                                        <td className="p-4">
                                            {item.isPaid ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold gap-1">
                                                    <CheckCircle size={12} /> Оплачено: {item.salary.toLocaleString()} ₸
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs font-bold">
                                                    Не оплачено
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {!item.isPaid && (
                                                <Button size="sm" variant="primary" onClick={() => handlePayClick(item)}>
                                                    Выплатить <DollarSign size={14} className="ml-1" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </main>

            {/* Payment Modal */}
            {selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--surface)] w-full max-w-sm rounded-xl shadow-2xl border border-[var(--border)]">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[var(--text)]">Выплата зарплаты</h2>
                            <button onClick={() => setSelectedTeacher(null)} className="text-[var(--text-muted)]">✕</button>
                        </div>
                        <form onSubmit={handleConfirmPay} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Учитель</label>
                                <div className="text-[var(--text)] font-bold">{selectedTeacher.teacher.name}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Количество уроков</label>
                                <div className="text-[var(--text)]">{selectedTeacher.lessonCount}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Сумма к выплате (₸)</label>
                                <input
                                    type="number"
                                    required
                                    autoFocus
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] text-lg font-bold"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Обработка...' : 'Подтвердить выплату'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
