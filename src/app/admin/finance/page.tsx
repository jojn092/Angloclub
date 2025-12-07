'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { clsx } from 'clsx'

interface Stats {
    income: number
    expense: number
    profit: number
    month: string
}

interface Transaction {
    id: string
    date: string
    amount: number
    type: 'income' | 'expense'
    category: string
    description: string
    method?: string
}

export default function FinancePage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

    const [form, setForm] = useState({
        amount: '',
        category: 'Rent',
        description: '',
        date: new Date().toISOString().slice(0, 10)
    })

    useEffect(() => {
        fetchData()
    }, [month])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [statsRes, transRes] = await Promise.all([
                fetch(`/api/finance/stats?month=${month}`),
                fetch('/api/finance/transactions?limit=100')
            ])
            const sData = await statsRes.json()
            const tData = await transRes.json()

            if (sData.success) setStats(sData.data)
            if (tData.success) setTransactions(tData.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (res.ok) {
                alert('Расход добавлен')
                setIsModalOpen(false)
                setForm({ ...form, amount: '', description: '' })
                fetchData() // Refresh stats
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
                    <h1 className="text-2xl font-bold text-[var(--text)]">Движение средств (ДДС)</h1>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => window.location.href = '/admin/finance/debtors'}
                        >
                            Список должников
                        </Button>
                        <input
                            type="month"
                            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                        />
                        <Button
                            variant="primary"
                            leftIcon={<Plus size={20} />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Добавить расход
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700 mb-1">Доходы</p>
                                <h3 className="text-2xl font-bold text-green-800">
                                    +{stats?.income.toLocaleString() || 0} ₸
                                </h3>
                            </div>
                            <div className="p-2 bg-white/50 rounded-lg text-green-600">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-700 mb-1">Расходы</p>
                                <h3 className="text-2xl font-bold text-red-800">
                                    -{stats?.expense.toLocaleString() || 0} ₸
                                </h3>
                            </div>
                            <div className="p-2 bg-white/50 rounded-lg text-red-600">
                                <TrendingDown size={24} />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Прибыль</p>
                                <h3 className={clsx("text-2xl font-bold", (stats?.profit || 0) >= 0 ? "text-blue-800" : "text-red-600")}>
                                    {(stats?.profit || 0) > 0 ? '+' : ''}{stats?.profit.toLocaleString() || 0} ₸
                                </h3>
                            </div>
                            <div className="p-2 bg-white/50 rounded-lg text-blue-600">
                                <Wallet size={24} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions Table */}
                <Card padding="none" className="overflow-hidden">
                    <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
                        <h2 className="text-lg font-bold text-[var(--text)]">История операций</h2>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Дата</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Тип</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Категория</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Описание</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Сумма</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">Операций нет</td></tr>
                            ) : (
                                transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-[var(--surface-hover)]">
                                        <td className="p-4 text-sm text-[var(--text)]">
                                            {new Date(t.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-xs font-bold",
                                                t.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {t.type === 'income' ? 'Приход' : 'Расход'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm"><span className="text-[var(--text-secondary)]">{t.category}</span></td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{t.description || '-'}</td>
                                        <td className={clsx("p-4 text-sm font-bold", t.type === 'income' ? "text-green-600" : "text-red-600")}>
                                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ₸
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
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border)]">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text)]">Добавить расход</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)]">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Сумма</label>
                                <input type="number" required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Категория</label>
                                <select className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="Rent">Аренда</option>
                                    <option value="Salary">Зарплата</option>
                                    <option value="Marketing">Маркетинг</option>
                                    <option value="Office">Офис</option>
                                    <option value="Utilities">Коммунальные</option>
                                    <option value="Other">Прочее</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Дата</label>
                                <input type="date" className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Описание</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <Button type="submit" variant="primary" className="w-full">Сохранить</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
