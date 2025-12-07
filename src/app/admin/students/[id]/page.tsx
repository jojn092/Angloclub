'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useParams } from 'next/navigation'
import { ArrowLeft, User, Phone, Mail, Calendar, CreditCard, BookOpen } from 'lucide-react'

// Types
interface Student {
    id: number
    name: string
    phone: string
    email?: string
    balance: number
    groups: {
        id: number
        name: string
        course: { name: string }
    }[]
    payments: {
        id: number
        amount: number
        date: string
        method: string
        comment?: string
    }[]
    attendance: {
        id: number
        status: string
        lesson: {
            date: string
            topic?: string
        }
    }[]
}

export default function StudentProfilePage() {
    const params = useParams()
    const [student, setStudent] = useState<Student | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchStudent(Number(params.id))
        }
    }, [params.id])

    const fetchStudent = async (id: number) => {
        try {
            const res = await fetch(`/api/students/${id}`)
            const data = await res.json()
            if (data.success) {
                setStudent(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-[var(--background)] p-8 text-center">Загрузка...</div>
    if (!student) return <div className="min-h-screen bg-[var(--background)] p-8 text-center">Студент не найден</div>

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 hover:bg-transparent hover:text-[var(--primary)] text-[var(--text-muted)]"
                    onClick={() => window.location.href = '/admin/students'}
                    leftIcon={<ArrowLeft size={20} />}
                >
                    Назад к списку
                </Button>

                {/* Header Profile Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="md:col-span-2">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--text)]">{student.name}</h1>
                                    <div className="flex items-center gap-4 mt-1 text-[var(--text-secondary)]">
                                        <span className="flex items-center gap-1 text-sm"><Phone size={14} /> {student.phone}</span>
                                        {student.email && <span className="flex items-center gap-1 text-sm"><Mail size={14} /> {student.email}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm text-[var(--text-muted)]">Баланс</span>
                                <span className={`text-2xl font-bold ${student.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {student.balance.toLocaleString()} ₸
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-[var(--border)]">
                            <h3 className="text-sm font-bold text-[var(--text-muted)] mb-3 uppercase tracking-wider">Группы</h3>
                            <div className="flex flex-wrap gap-2">
                                {student.groups.length > 0 ? student.groups.map(g => (
                                    <span key={g.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                                        <BookOpen size={14} />
                                        {g.name} ({g.course.name})
                                    </span>
                                )) : <span className="text-[var(--text-muted)] text-sm">Не состоит в группах</span>}
                            </div>
                        </div>
                    </Card>

                    {/* Quick Stats / Actions */}
                    <Card>
                        <h3 className="text-lg font-bold text-[var(--text)] mb-4">Статистика</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-lg">
                                <span className="text-sm text-[var(--text-secondary)]">Посещений</span>
                                <span className="font-bold text-[var(--text)]">
                                    {student.attendance.filter(a => a.status === 'PRESENT').length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-lg">
                                <span className="text-sm text-[var(--text-secondary)]">Пропусков</span>
                                <span className="font-bold text-[var(--text)]">
                                    {student.attendance.filter(a => a.status === 'ABSENT').length}
                                </span>
                            </div>
                            <Button className="w-full mt-2" variant="outline" onClick={() => window.location.href = '/admin/payments'}>
                                Пополнить баланс
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance History */}
                    <Card padding="none" className="overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]">
                            <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                                <Calendar size={20} className="text-[var(--primary)]" />
                                История посещаемости
                            </h2>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-left bg-[var(--surface)]">
                                <thead className="bg-[#f9fafb] sticky top-0">
                                    <tr>
                                        <th className="p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Дата</th>
                                        <th className="p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {student.attendance.length === 0 ? (
                                        <tr><td colSpan={2} className="p-4 text-center text-sm text-[var(--text-muted)]">Записей нет</td></tr>
                                    ) : (
                                        student.attendance.map(a => (
                                            <tr key={a.id}>
                                                <td className="p-3 text-sm text-[var(--text)]">
                                                    {new Date(a.lesson?.date || '').toLocaleDateString('ru-RU')}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold 
                                                        ${a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                            a.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Payment History */}
                    <Card padding="none" className="overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]">
                            <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                                <CreditCard size={20} className="text-green-600" />
                                История платежей
                            </h2>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-left bg-[var(--surface)]">
                                <thead className="bg-[#f9fafb] sticky top-0">
                                    <tr>
                                        <th className="p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Дата</th>
                                        <th className="p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Сумма</th>
                                        <th className="p-3 text-xs font-medium text-[var(--text-muted)] uppercase">Метод</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {student.payments.length === 0 ? (
                                        <tr><td colSpan={3} className="p-4 text-center text-sm text-[var(--text-muted)]">Платежей нет</td></tr>
                                    ) : (
                                        student.payments.map(p => (
                                            <tr key={p.id}>
                                                <td className="p-3 text-sm text-[var(--text)]">
                                                    {new Date(p.date).toLocaleDateString('ru-RU')}
                                                </td>
                                                <td className="p-3 text-sm font-bold text-green-600">
                                                    +{p.amount.toLocaleString()} ₸
                                                </td>
                                                <td className="p-3 text-sm text-[var(--text-muted)] capitalize">
                                                    {p.method}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}
