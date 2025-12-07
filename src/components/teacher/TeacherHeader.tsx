'use client'

import Button from '@/components/ui/Button'
import { LogOut } from 'lucide-react'

interface TeacherHeaderProps {
    onLogout: () => void
}

export default function TeacherHeader({ onLogout }: TeacherHeaderProps) {
    return (
        <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold text-[var(--text)]">👩‍🏫 Кабинет Учителя</h1>
                    <nav className="flex items-center gap-1">
                        <a href="/teacher" className="px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                            Мои группы
                        </a>
                        <a href="/teacher/schedule" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                            Мое расписание
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onLogout}>
                        <LogOut size={16} className="mr-2" />
                        Выйти
                    </Button>
                </div>
            </div>
        </header>
    )
}
