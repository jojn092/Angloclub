import Button from '@/components/ui/Button'

interface AdminHeaderProps {
    onLogout?: () => void
    title?: string
}

export default function AdminHeader({ onLogout, title }: AdminHeaderProps) {
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
        <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <a href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                            AC
                        </div>
                        <span className="font-bold text-[var(--text)] hidden sm:block">AngloClub</span>
                    </a>

                    {title ? (
                        <h1 className="text-xl font-bold text-[var(--text)] ml-4 border-l border-[var(--border)] pl-6">
                            {title}
                        </h1>
                    ) : (
                        <nav className="hidden md:flex items-center gap-1">
                            <a href="/admin" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Заявки
                            </a>
                            <a href="/admin/groups" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Группы
                            </a>
                            <a href="/admin/students" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Студенты
                            </a>
                            <a href="/admin/schedule" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Расписание
                            </a>
                            <a href="/admin/attendance" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Посещаемость
                            </a>
                            <a href="/admin/finance" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Финансы
                            </a>
                            <a href="/admin/salary" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Зарплаты
                            </a>
                            <a href="/admin/users" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] rounded-md transition-colors">
                                Пользователи
                            </a>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Выйти
                    </Button>
                </div>
            </div>
            {/* Mobile Menu (Simplified) - Hide if title is present (assuming sidebar handles nav) */}
            {!title && (
                <div className="md:hidden border-t border-[var(--border)] overflow-x-auto">
                    <div className="flex p-2 gap-2 min-w-max">
                        <a href="/admin" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--surface-hover)] rounded-md">Заявки</a>
                        <a href="/admin/groups" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-md">Группы</a>
                        <a href="/admin/students" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-md">Студенты</a>
                        <a href="/admin/schedule" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-md">Расписание</a>
                        <a href="/admin/finance" className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-md">Финансы</a>
                    </div>
                </div>
            )}
        </header>
    )
}
