'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Phone, AlertCircle } from 'lucide-react'

interface Debtor {
    id: number
    name: string
    phone: string
    balance: number
    groups: { name: string }[]
    payments: { date: string }[]
}

export default function DebtorsPage() {
    const [debtors, setDebtors] = useState<Debtor[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchDebtors()
    }, [])

    const fetchDebtors = async () => {
        try {
            const res = await fetch('/api/finance/debtors')
            const data = await res.json()
            if (data.success) setDebtors(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const totalDebt = debtors.reduce((sum, d) => sum + Math.abs(d.balance), 0)

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Задолженности</h1>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-sm text-red-600 block">Общий долг</span>
                        <span className="text-2xl font-bold text-red-700">{totalDebt.toLocaleString()} ₸</span>
                    </div>
                </div>

                <Card padding="none" className="overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Студент</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Телефон</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Группы</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Последняя оплата</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Долг</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">Загрузка...</td></tr>
                            ) : debtors.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">Должников нет! 🎉</td></tr>
                            ) : (
                                debtors.map(d => (
                                    <tr key={d.id} className="hover:bg-[var(--surface-hover)]">
                                        <td className="p-4 text-sm font-medium text-[var(--text)]">
                                            <a href={`/admin/students/${d.id}`} className="hover:text-[var(--primary)] flex items-center gap-2">
                                                <AlertCircle size={16} className="text-red-500" />
                                                {d.name}
                                            </a>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{d.phone}</td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{d.groups.map(g => g.name).join(', ')}</td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">
                                            {d.payments[0] ? new Date(d.payments[0].date).toLocaleDateString('ru-RU') : 'Никогда'}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-red-600">
                                            {d.balance.toLocaleString()} ₸
                                        </td>
                                        <td className="p-4 text-sm">
                                            <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline">
                                                <Phone size={14} /> Позвонить
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </main>
        </div>
    )
}
