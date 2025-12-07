'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TeacherHeader from '@/components/teacher/TeacherHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Calendar, User, Check, X, Save } from 'lucide-react'
import { clsx } from 'clsx'

interface Student {
    id: number
    name: string
}

interface Group {
    id: number
    name: string
    course: { name: string }
    students: Student[]
}

interface AttendanceState {
    [studentId: number]: 'PRESENT' | 'ABSENT' | 'EXCUSED'
}

export default function TeacherGroupPage() {
    const params = useParams()
    const id = params.id

    const [group, setGroup] = useState<Group | null>(null)
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [attendance, setAttendance] = useState<AttendanceState>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchGroup()
    }, [id])

    const fetchGroup = async () => {
        try {
            const res = await fetch(`/api/groups/${id}`)
            const data = await res.json()
            if (data.success) {
                setGroup(data.data)
                // Initialize attendance as PRESENT by default? Or empty?
                // Let's initialize empty
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleStatus = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }))
    }

    const handleSave = async () => {
        if (!process.env.NEXT_PUBLIC_API_URL && !window.location.origin) return

        setIsSaving(true)
        try {
            // Prepare payload
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId: Number(studentId),
                status
            }))

            const res = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: Number(id),
                    date,
                    records
                })
            })

            if (res.ok) {
                alert('Посещаемость сохранена ✅')
            } else {
                alert('Ошибка при сохранении ❌')
            }
        } catch (error) {
            console.error(error)
            alert('Ошибка сети')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="p-8 text-center text-[var(--text-muted)]">Загрузка...</div>
    if (!group) return <div className="p-8 text-center text-red-500">Группа не найдена</div>

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <TeacherHeader onLogout={() => window.location.href = '/admin/login'} />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text)]">{group.name}</h1>
                        <p className="text-[var(--text-secondary)]">{group.course.name}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                        <Calendar size={20} className="text-[var(--text-muted)]" />
                        <input
                            type="date"
                            className="bg-transparent border-none text-[var(--text)] focus:ring-0"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-bold text-[var(--text)]">Список студентов</h2>
                        <span className="text-sm text-[var(--text-muted)]">Отмечено: {Object.keys(attendance).length} / {group.students.length}</span>
                    </div>

                    <div className="space-y-2">
                        {group.students.map(student => (
                            <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-hover)] bg-[var(--background)] border border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {student.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-[var(--text)]">{student.name}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(student.id, 'PRESENT')}
                                        className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            attendance[student.id] === 'PRESENT'
                                                ? "bg-green-500 text-white shadow-md"
                                                : "bg-[var(--surface)] text-[var(--text-muted)] hover:bg-green-100 hover:text-green-600"
                                        )}
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(student.id, 'ABSENT')}
                                        className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            attendance[student.id] === 'ABSENT'
                                                ? "bg-red-500 text-white shadow-md"
                                                : "bg-[var(--surface)] text-[var(--text-muted)] hover:bg-red-100 hover:text-red-600"
                                        )}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <Button
                            variant="primary"
                            className="w-full justify-center py-3 text-lg"
                            leftIcon={<Save size={20} />}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Сохранение...' : 'Сохранить посещаемость'}
                        </Button>
                    </div>
                </Card>
            </main>
        </div>
    )
}
