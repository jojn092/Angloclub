'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Users, CreditCard, Settings, LogOut } from 'lucide-react'

const menuItems = [
    { icon: LayoutDashboard, label: 'Главная', href: '/admin' },
    { icon: MessageSquare, label: 'Чаты', href: '/admin/chats' },
    { icon: Users, label: 'Студенты', href: '/admin/students' },
    { icon: CreditCard, label: 'Платежи', href: '/admin/payments' },
    { icon: Settings, label: 'Настройки', href: '/admin/settings' },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-[var(--surface)] border-r border-[var(--border)] h-screen fixed left-0 top-0 flex flex-col z-20">
            <div className="p-6 flex items-center gap-3 border-b border-[var(--border)]">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold">
                    A
                </div>
                <span className="font-bold text-xl text-[var(--text)]">AngloClub</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                                }`}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-[var(--border)]">
                <button
                    onClick={() => {
                        fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/admin/login')
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-colors text-left"
                >
                    <LogOut size={20} />
                    Выйти
                </button>
            </div>
        </div>
    )
}
