'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function CreateGroupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [options, setOptions] = useState({
        courses: [] as any[],
        teachers: [] as any[],
        rooms: [] as any[]
    })

    const [formData, setFormData] = useState({
        name: '',
        level: 'A1',
        courseId: '',
        teacherId: '',
        roomId: '',
        days: [] as number[],
        time: '10:00'
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, teachersRes, roomsRes] = await Promise.all([
                    fetch('/api/courses'),
                    fetch('/api/users/teachers'),
                    fetch('/api/rooms')
                ])

                const courses = await coursesRes.json()
                const teachers = await teachersRes.json()
                const rooms = await roomsRes.json()

                setOptions({
                    courses: Array.isArray(courses) ? courses : [],
                    teachers: Array.isArray(teachers) ? teachers : [],
                    rooms: Array.isArray(rooms) ? rooms : []
                })

                // Set defaults if available
                if (courses.length > 0) setFormData(prev => ({ ...prev, courseId: courses[0].id.toString() }))
                if (teachers.length > 0) setFormData(prev => ({ ...prev, teacherId: teachers[0].id.toString() }))
                if (rooms.length > 0) setFormData(prev => ({ ...prev, roomId: rooms[0].id.toString() }))

            } catch (error) {
                console.error('Failed to load options', error)
            }
        }
        fetchData()
    }, [])

    const initializeDefaults = async () => {
        setIsLoading(true)
        try {
            await fetch('/api/seed-full')
            // Reload page to fetch new options
            window.location.reload()
        } catch (error) {
            alert('Failed to initialize')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isLoading && options.courses.length === 0 && options.rooms.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--background)]">
                <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
                <main className="max-w-3xl mx-auto px-4 py-6">
                    <Card className="text-center py-12">
                        <h2 className="text-xl font-bold mb-4 text-[var(--text)]">Настройка системы</h2>
                        <p className="text-[var(--text-muted)] mb-6">
                            Похоже, база данных пуста. Давайте создадим стандартные курсы (General English, IELTS) и кабинеты.
                        </p>
                        <Button onClick={initializeDefaults} isLoading={isLoading}>
                            Заполнить базу стандартными данными
                        </Button>
                    </Card>
                </main>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    courseId: Number(formData.courseId),
                    teacherId: Number(formData.teacherId),
                    roomId: Number(formData.roomId),
                })
            })

            const data = await res.json()

            if (res.ok) {
                router.push('/admin/groups')
            } else {
                alert(data.error || 'Ошибка при создании группы')
            }
        } catch (error) {
            console.error(error)
            alert('Ошибка сети')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleDay = (day: number) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }))
    }

    const daysMap = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />

            <main className="max-w-3xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Создание новой группы</h1>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Название группы
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Например: Elementary-1"
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Уровень
                                </label>
                                <select
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                >
                                    <option value="A1">A1 - Beginner</option>
                                    <option value="A2">A2 - Elementary</option>
                                    <option value="B1">B1 - Pre-Intermediate</option>
                                    <option value="B2">B2 - Intermediate</option>
                                    <option value="C1">C1 - Upper-Intermediate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Курс
                                </label>
                                <select
                                    value={formData.courseId}
                                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                >
                                    {options.courses.length === 0 && <option value="">Нет доступных курсов</option>}
                                    {options.courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Преподаватель
                                </label>
                                <select
                                    value={formData.teacherId}
                                    onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                >
                                    {options.teachers.length === 0 && <option value="">Нет учителей</option>}
                                    {options.teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Кабинет
                                </label>
                                <select
                                    value={formData.roomId}
                                    onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                >
                                    {options.rooms.length === 0 && <option value="">Нет кабинетов</option>}
                                    {options.rooms.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Время занятий
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Дни недели
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${formData.days.includes(day)
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]'
                                            }`}
                                    >
                                        {daysMap[day]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                disabled={!formData.courseId || !formData.teacherId}
                            >
                                Создать группу
                            </Button>
                        </div>
                    </form>
                </Card>
            </main>
        </div>
    )
}
