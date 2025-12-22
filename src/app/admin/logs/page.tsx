'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import Card from '@/components/ui/Card'
import { Clock, User as UserIcon, Activity } from 'lucide-react'

interface LogEntry {
    id: number
    action: string
    details: string
    createdAt: string
    user: {
        name: string
        email: string
    } | null
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/logs')
            .then(res => res.json())
            .then(data => {
                if (data.success) setLogs(data.data)
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={() => window.location.href = '/admin/login'} />

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                        <Activity className="text-[var(--primary)]" />
                        История действий (Audit Log)
                    </h1>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Загрузка...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-muted)]">История пуста</div>
                ) : (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Когда</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Кто</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Действие</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Детали</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(log.createdAt).toLocaleString('ru-RU')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text)]">
                                                <div className="flex items-center gap-2">
                                                    {log.user ? (
                                                        <>
                                                            <UserIcon size={14} className="text-[var(--primary)]" />
                                                            {log.user.name}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Система</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--primary)] font-bold">
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    )
}
