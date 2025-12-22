'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Search } from 'lucide-react'

// Interfaces
interface Exam {
    id: number
    date: string
    type: string
    listening: number
    reading: number
    writing: number
    speaking: number
    overall: number
    student: { id: number, name: string }
    comment?: string
}

interface Student { id: number, name: string }

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form
    const [form, setForm] = useState({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        type: 'IELTS',
        listening: '6.0',
        reading: '6.0',
        writing: '6.0',
        speaking: '6.0',
        comment: ''
    })

    useEffect(() => {
        fetchExams()
        fetchStudents()
    }, [])

    const fetchExams = async () => {
        const res = await fetch('/api/exams')
        const data = await res.json()
        if (data.success) setExams(data.data)
        setIsLoading(false)
    }

    const fetchStudents = async () => {
        const res = await fetch('/api/students')
        const data = await res.json()
        if (data.success) setStudents(data.data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (res.ok) {
                alert('Результат сохранен!')
                setIsModalOpen(false)
                fetchExams()
            } else {
                alert('Ошибка')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} title="Пробные Экзамены" />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Результаты Mock Exams</h1>
                    <Button variant="primary" leftIcon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
                        Добавить результат
                    </Button>
                </div>

                <Card padding="none" className="overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Дата</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Студент</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)]">Тип</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)] text-center">L</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)] text-center">R</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)] text-center">W</th>
                                <th className="p-4 text-sm font-medium text-[var(--text-muted)] text-center">S</th>
                                <th className="p-4 text-sm font-bold text-[var(--text)] text-center">Overall</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr><td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">Загрузка...</td></tr>
                            ) : exams.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">Результатов пока нет</td></tr>
                            ) : (
                                exams.map(exam => (
                                    <tr key={exam.id} className="hover:bg-[var(--surface-hover)]">
                                        <td className="p-4 text-sm text-[var(--text)]">{new Date(exam.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm font-medium text-[var(--text)]">{exam.student.name}</td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{exam.type}</td>
                                        <td className="p-4 text-center text-sm">{exam.listening}</td>
                                        <td className="p-4 text-center text-sm">{exam.reading}</td>
                                        <td className="p-4 text-center text-sm">{exam.writing}</td>
                                        <td className="p-4 text-center text-sm">{exam.speaking}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded font-bold text-sm ${exam.overall >= 7.0 ? 'bg-green-100 text-green-700' :
                                                    exam.overall >= 6.0 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {exam.overall}
                                            </span>
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
                    <div className="bg-[var(--surface)] w-full max-w-lg rounded-xl shadow-2xl border border-[var(--border)]">
                        <div className="p-6 border-b border-[var(--border)]">
                            <h2 className="text-xl font-bold text-[var(--text)]">Новый результат</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Студент</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border bg-[var(--background)]"
                                    required
                                    value={form.studentId}
                                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                                >
                                    <option value="">Выберите студента</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Listening</label>
                                    <input type="number" step="0.5" max="9" min="0" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                        value={form.listening} onChange={e => setForm({ ...form, listening: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Reading</label>
                                    <input type="number" step="0.5" max="9" min="0" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                        value={form.reading} onChange={e => setForm({ ...form, reading: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Writing</label>
                                    <input type="number" step="0.5" max="9" min="0" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                        value={form.writing} onChange={e => setForm({ ...form, writing: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Speaking</label>
                                    <input type="number" step="0.5" max="9" min="0" className="w-full px-4 py-2 border rounded-lg bg-[var(--background)]"
                                        value={form.speaking} onChange={e => setForm({ ...form, speaking: e.target.value })} required />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Отмена</Button>
                                <Button type="submit" variant="primary" className="flex-1">Сохранить</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
