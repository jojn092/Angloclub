'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react'
import { clsx } from 'clsx'

interface Group {
    id: number
    name: string
    teacher: { name: string }
    room: { name: string } | null
    schedules: {
        id: number
        dayOfWeek: number
        startTime: string
        duration: number
    }[]
}

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => i + 8) // 08:00 to 21:00

export default function SchedulePage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups') // Groups with schedules
            const data = await res.json()
            if (data.success) setGroups(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to check if a group has a class on a specific Day + Hour
    const getClassesForSlot = (dayIndex: number, hour: number) => {
        return groups.flatMap(g =>
            g.schedules
                .filter(s => {
                    const startH = parseInt(s.startTime.split(':')[0])
                    const dayMatch = s.dayOfWeek === dayIndex
                    // Simple check: if start hour matches current slot
                    // Ideally we should handle duration spanning multiple slots
                    return dayMatch && startH === hour
                })
                .map(s => ({ ...g, schedule: s }))
        )
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />
            <main className="max-w-full mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)]">Расписание занятий</h1>
                    <div className="flex gap-2">
                        <button className="p-2 rounded hover:bg-[var(--surface-hover)] text-[var(--text)]"><ChevronLeft /></button>
                        <span className="font-medium text-[var(--text)]">Эта неделя</span>
                        <button className="p-2 rounded hover:bg-[var(--surface-hover)] text-[var(--text)]"><ChevronRight /></button>
                    </div>
                </div>

                <div className="grid grid-cols-8 gap-px bg-[var(--border)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
                    {/* Header Row */}
                    <div className="bg-[var(--surface)] p-4 text-center font-bold text-[var(--text-muted)] border-b border-r border-[var(--border)]">
                        Время
                    </div>
                    {DAYS.slice(1).map((day, i) => ( // Show Mon-Sat
                        <div key={i} className="bg-[var(--surface)] p-4 text-center border-b border-[var(--border)]">
                            <span className="block font-bold text-[var(--text)]">{day}</span>
                            {/* <span className="text-xs text-[var(--text-muted)]">Oct {20+i}</span> */}
                        </div>
                    ))}
                    <div className="bg-[var(--surface)] p-4 text-center border-b border-[var(--border)]">
                        <span className="block font-bold text-red-500">{DAYS[0]}</span>
                    </div>

                    {/* Time Slots */}
                    {TIME_SLOTS.map(hour => (
                        <>
                            {/* Time Label */}
                            <div key={`time-${hour}`} className="bg-[var(--surface)] p-4 text-xs font-medium text-[var(--text-muted)] border-r border-[var(--border)] flex items-start justify-center">
                                {hour}:00
                            </div>

                            {/* Days Columns for this Hour */}
                            {[1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
                                const classes = getClassesForSlot(dayIdx, hour)
                                return (
                                    <div key={`slot-${dayIdx}-${hour}`} className="bg-[var(--background)] min-h-[100px] p-1 border-r border-b border-[var(--border)] relative group">
                                        {classes.map((cls, idx) => (
                                            <div key={idx} className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded text-xs mb-1 hover:shadow-md transition-shadow cursor-pointer">
                                                <div className="font-bold text-blue-900 truncate">{cls.name}</div>
                                                <div className="text-blue-700 flex items-center gap-1 mt-1">
                                                    <MapPin size={10} /> {cls.room?.name || 'No Room'}
                                                </div>
                                                <div className="text-blue-600 flex items-center gap-1">
                                                    <Users size={10} /> {cls.teacher.name.split(' ')[0]}
                                                </div>
                                                <div className="text-blue-500 flex items-center gap-1 mt-1">
                                                    <Clock size={10} /> {cls.schedule.startTime} ({cls.schedule.duration}m)
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </>
                    ))}
                </div>
            </main>
        </div>
    )
}
