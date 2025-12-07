'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Mock Data (In real app, fetch from API)
// We need endpoints for Courses, Teachers, Rooms
// For now, I'll hardcode or fetch if available. 
// Since we have seed data, let's try to fetch referenced data or hardcode for MVP quick test.
// I will create simple API endpoints for options next.

export default function CreateGroupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        level: 'A1',
        courseId: '1', // Default to first
        teacherId: '1', // Default to first (Admin)
        roomId: '1',
        days: [] as number[],
        time: '10:00'
    })

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

            if (res.ok) {
                router.push('/admin/groups')
            } else {
                alert('Ошибка при создании группы')
            }
        } catch (error) {
            console.error(error)
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
                                    {/* Hardcoded for now, ideally fetch from API */}
                                    <option value="1">General English</option>
                                    <option value="2">IELTS Preparation</option>
                                    <option value="3">Kids English</option>
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
                                    <option value="1">Главный Администратор</option>
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
                                    <option value="1">Blue Room</option>
                                    <option value="2">Red Room</option>
                                    <option value="3">Online</option>
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
