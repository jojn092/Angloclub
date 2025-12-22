'use client'

import React, { useState, useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Search, User, Users } from 'lucide-react'

interface AdminHeaderProps {
    onLogout?: () => void
    title?: string
}

export default function AdminHeader({ onLogout, title }: AdminHeaderProps) {
    // Search State
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<{ students: any[], groups: any[] } | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    const NAV_ITEMS = [
        { label: 'Заявки', href: '/admin' },
        { label: 'Группы', href: '/admin/groups' },
        { label: 'Студенты', href: '/admin/students' },
        { label: 'Пробники', href: '/admin/trials' },
        { label: 'Mock IELTS', href: '/admin/exams' },
        { label: 'Аудит', href: '/admin/logs' },
        { label: 'Расписание', href: '/admin/schedule' },
        { label: 'Посещаемость', href: '/admin/attendance' },
        { label: 'Финансы', href: '/admin/finance' },
    ]

    useEffect(() => {
        // Close search when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch()
            } else {
                setResults(null)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const performSearch = async () => {
        setIsSearching(true)
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
            const data = await res.json()
            if (data.success) {
                setResults(data.data)
                setShowResults(true)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleLogout = async () => {
        if (onLogout) {
            onLogout()
        } else {
            try {
                await fetch('/api/auth/logout', { method: 'POST' })
                window.location.href = '/admin/login'
            } catch (error) {
                console.error('Logout failed', error)
            }
        }
    }

    return (
        <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-8 shrink-0">
                    <a href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                            AC
                        </div>
                        <span className="font-bold text-[var(--text)] hidden sm:block">AngloClub</span>
                    </a>

                    {/* Navigation visible on Desktop */}
                    {!title && (
                        <nav className="hidden xl:flex items-center gap-1">
                            {NAV_ITEMS.map(item => (
                                <a key={item.label} href={item.href} className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors whitespace-nowrap">
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Global Search */}
                <div className="flex-1 max-w-md relative" ref={searchRef}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            type="text"
                            className="w-full pl-9 pr-4 py-2 rounded-full border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                            placeholder="Поиск..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 2 && setShowResults(true)}
                        />
                    </div>

                    {/* Dropdown Results */}
                    {showResults && results && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto">
                            {results.students.length === 0 && results.groups.length === 0 ? (
                                <div className="p-4 text-sm text-[var(--text-muted)] text-center">Ничего не найдено</div>
                            ) : (
                                <>
                                    {results.students.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Студенты</div>
                                            {results.students.map(s => (
                                                <a key={s.id} href={`/admin/students/${s.id}`} className="block px-4 py-2 hover:bg-[var(--surface-hover)] flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[var(--text)]">{s.name}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">{s.phone}</div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    {results.groups.length > 0 && (
                                        <div className="py-2 border-t border-[var(--border)]">
                                            <div className="px-4 py-1 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Группы</div>
                                            {results.groups.map(g => (
                                                <a key={g.id} href={`/admin/groups`} className="block px-4 py-2 hover:bg-[var(--surface-hover)] flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                                                        <Users size={14} />
                                                    </div>
                                                    <div className="text-sm font-bold text-[var(--text)]">{g.name}</div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Выйти
                    </Button>
                </div>
            </div>

            {/* Mobile Menu (Scrollable) */}
            {!title && (
                <div className="xl:hidden border-t border-[var(--border)] overflow-x-auto no-scrollbar">
                    <div className="flex p-2 gap-2 min-w-max">
                        {NAV_ITEMS.map(item => (
                            <a key={item.label} href={item.href} className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--surface-hover)] rounded-md whitespace-nowrap">
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    )
}
