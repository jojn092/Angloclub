'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Filter } from 'lucide-react'

// Types
interface Group {
    id: number
    name: string
    teacher: { id: number, name: string }
    room: { id: number, name: string } | null
    schedules: {
        dayOfWeek: number
        startTime: string
        endTime: string
    }[]
}

interface Room { id: number, name: string }

const DAYS = [
    { value: 1, label: 'Понедельник' },
    { value: 2, label: 'Вторник' },
    { value: 3, label: 'Среда' },
    { value: 4, label: 'Четверг' },
    { value: 5, label: 'Пятница' },
    { value: 6, label: 'Суббота' },
    { value: 0, label: 'Воскресенье' }
]

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => i + 8) // 08:00 to 21:00

export default function SchedulePage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [selectedDay, setSelectedDay] = useState(1) // Default Monday
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetchGroups(),
            fetchRooms()
        ]).finally(() => setIsLoading(false))
    }, [])

    const fetchGroups = async () => {
        const res = await fetch('/api/groups')
        const data = await res.json()
        if (data.success) setGroups(data.data)
    }

    const fetchRooms = async () => {
        const res = await fetch('/api/rooms')
        const data = await res.json()
        if (data.success) {
            setRooms(data.data)
        }
    }

    // Filter classes for specific Room + Time + Selected Day
    const getClasses = (roomId: number | null, hour: number) => {
        return groups.flatMap(g =>
            g.schedules
                .filter(s => {
                    const sDay = s.dayOfWeek
                    const sHour = parseInt(s.startTime.split(':')[0])

                    // Match Day
                    if (sDay !== selectedDay) return false

                    // Match Time (Simple hour match)
                    if (sHour !== hour) return false

                    // Match Room
                    if (roomId === null) {
                        return g.room === null // 'No Room' column
                    }
                    return g.room?.id === roomId
                })
                .map(s => ({ ...g, schedule: s }))
        )
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Расписание по кабинетам</h1>
                </div>

                {/* Day Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
                    {DAYS.map(day => (
                        <button
                            key={day.value}
                            onClick={() => setSelectedDay(day.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day.value
                                    ? 'bg-[var(--primary)] text-white shadow-lg'
                                    : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
                                }`}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-r border-[var(--border)] w-20 bg-[var(--background)] sticky left-0 z-10 text-[var(--text-muted)]">
                                        Время
                                    </th>
                                    {rooms.map(room => (
                                        <th key={room.id} className="p-4 border-b border-r border-[var(--border)] min-w-[200px] bg-[var(--background)] text-[var(--text)]">
                                            {room.name}
                                        </th>
                                    ))}
                                    <th className="p-4 border-b border-[var(--border)] min-w-[200px] bg-[var(--background)] text-[var(--text-muted)] italic">
                                        Без кабинета
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map(hour => (
                                    <tr key={hour} className="group hover:bg-[var(--surface-hover)]">
                                        {/* Time Column */}
                                        <td className="p-4 border-b border-r border-[var(--border)] text-center text-sm font-bold text-[var(--text-muted)] bg-[var(--background)] sticky left-0 z-10 group-hover:bg-[var(--surface-hover)]">
                                            {hour}:00
                                        </td>

                                        {/* Room Columns */}
                                        {rooms.map(room => {
                                            const classes = getClasses(room.id, hour)
                                            return (
                                                <td key={room.id} className="p-2 border-b border-r border-[var(--border)] align-top h-24 transition-colors">
                                                    {classes.map((cls, idx) => (
                                                        <div key={idx} className="mb-2 p-2 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 hover:shadow-md transition-all cursor-pointer">
                                                            <div className="font-bold text-sm text-blue-900 dark:text-blue-100">{cls.name}</div>
                                                            <div className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1 mt-1">
                                                                <Users size={12} /> {cls.teacher.name}
                                                            </div>
                                                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                                {cls.schedule.startTime} - {cls.schedule.endTime}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </td>
                                            )
                                        })}

                                        {/* No Room Column */}
                                        <td className="p-2 border-b border-[var(--border)] align-top bg-gray-50/50 dark:bg-gray-900/20">
                                            {getClasses(null, hour).map((cls, idx) => (
                                                <div key={idx} className="mb-2 p-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-600">
                                                    <div className="font-bold text-xs">{cls.name}</div>
                                                    <div className="text-xs">{cls.teacher.name}</div>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
