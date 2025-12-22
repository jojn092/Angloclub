'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface Student {
    id: number
    name: string
}

interface Group {
    id: number
    name: string
    students: Student[]
}

export default function AttendancePage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [attendance, setAttendance] = useState<Record<number, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Derive selectedGroup from groups and selectedGroupId
    const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null

    useEffect(() => {
        fetchGroups()
    }, [])

    useEffect(() => {
        if (selectedGroupId) {
            fetchAttendance()
        }
    }, [selectedGroupId, date])

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups')
            const data = await res.json()
            if (data.success) {
                setGroups(data.data)
                if (data.data.length > 0 && !selectedGroupId) {
                    setSelectedGroupId(data.data[0].id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch groups', error)
        }
    }

    const fetchAttendance = async () => {
        if (!selectedGroupId) return
        setIsLoading(true)
        try {
            const res = await fetch(`/api/attendance?groupId=${selectedGroupId}&date=${date}`)
            const data = await res.json()

            const newAttendance: Record<number, string> = {}
            if (data.success) {
                data.data.forEach((r: any) => {
                    newAttendance[r.studentId] = r.status
                })
            }
            setAttendance(newAttendance)
        } catch (error) {
            console.error('Failed to fetch attendance', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!selectedGroupId) return
        setIsSaving(true)
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId: Number(studentId),
                status
            }))

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: selectedGroupId,
                    date,
                    records
                })
            })

            if (res.ok) {
                alert('Посещаемость сохранена')
            } else {
                const data = await res.json()
                alert(data.error || 'Ошибка сохранения')
            }
        } catch (error) {
            alert('Ошибка сети')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Журнал посещаемости</h1>

                <Card className="mb-6">
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Группа</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                value={selectedGroupId || ''}
                                onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                            >
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Дата</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                            Сохранить
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (!selectedGroup) return
                                const newAttendance = { ...attendance }
                                selectedGroup.students.forEach(s => {
                                    newAttendance[s.id] = 'PRESENT'
                                })
                                setAttendance(newAttendance)
                            }}
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                            Все присутствуют
                        </Button>
                    </div>
                </Card>

                {/* Grid of students */}
                <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-[var(--text-muted)] flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin mb-2" />
                            Загрузка...
                        </div>
                    ) : selectedGroup ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f9fafb] border-b border-[var(--border)]">
                                    <tr>
                                        <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">Студент</th>
                                        <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {selectedGroup.students.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="p-8 text-center text-[var(--text-muted)]">
                                                В этой группе нет студентов.
                                            </td>
                                        </tr>
                                    )}
                                    {selectedGroup.students.map((student) => {
                                        const status = attendance[student.id] || 'PRESENT' // Default to present
                                        return (
                                            <tr key={student.id} className="hover:bg-[var(--surface-hover)]">
                                                <td className="p-4 font-medium text-[var(--text)]">{student.name}</td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {[
                                                            { value: 'PRESENT', label: 'Присутствует', style: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' },
                                                            { value: 'ABSENT', label: 'Отсутствует', style: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' },
                                                            { value: 'LATE', label: 'Опоздал', style: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200' },
                                                            { value: 'EXCUSED', label: 'Уважительная', style: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' },
                                                        ].map((opt) => {
                                                            const isSelected = status === opt.value
                                                            return (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => setAttendance(prev => ({ ...prev, [student.id]: opt.value }))}
                                                                    className={clsx(
                                                                        'px-3 py-1.5 rounded-md text-sm font-medium transition-all border',
                                                                        isSelected
                                                                            ? opt.style + ' ring-2 ring-offset-1 ring-offset-transparent ring-gray-200 shadow-sm'
                                                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                                    )}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-[var(--text-muted)] py-10">
                            Выберите группу
                        </p>
                    )}
                </div>
            </main>
        </div>
    )
}
