import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { clsx } from 'clsx'
import { Lead, Pagination } from '@/types'

interface LeadsTableProps {
    leads: Lead[]
    isLoading: boolean
    pagination: Pagination
    setPagination: (p: any) => void // using any for simplicty of state updater
    onUpdateStatus: (id: number, status: string) => void
}

export default function LeadsTable({
    leads,
    isLoading,
    pagination,
    setPagination,
    onUpdateStatus,
}: LeadsTableProps) {
    // Status badge styles
    const getStatusBadge = (status: string) => {
        const styles = {
            new: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            enrolled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            won: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            lost: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        }
        const labels = {
            new: 'Новая',
            processing: 'В обработке',
            enrolled: 'Записан',
            won: 'Студент',
            lost: 'Отказ',
        }
        return (
            <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles] || '')}>
                {labels[status as keyof typeof labels] || status}
            </span>
        )
    }

    const handleConvert = async (leadId: number) => {
        if (!confirm('Вы уверены, что хотите создать студента из этого лида?')) return

        try {
            const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                // Determine if we should refresh or just update locally.
                // For now, let's call onUpdateStatus to 'won' if supported, or just refresh logic might be needed.
                // Assuming parent refreshes when status changes or we can trigger it.
                // But onUpdateStatus only takes status string.
                onUpdateStatus(leadId, 'won')
                alert('Лид успешно конвертирован в студента!')
            } else {
                alert(data.error || 'Ошибка конвертации')
            }
        } catch (error) {
            console.error('Conversion failed', error)
            alert('Ошибка сети')
        }
    }

    return (
        <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[var(--surface-hover)]">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">ID</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Имя</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Телефон</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Курс</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Статус</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Дата</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                    Загрузка...
                                </td>
                            </tr>
                        ) : leads.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                    Заявок не найдено
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-[var(--surface-hover)]">
                                    <td className="px-4 py-3 text-sm text-[var(--text)]">#{lead.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-[var(--text)]">{lead.name}</td>
                                    <td className="px-4 py-3 text-sm text-[var(--text)]">
                                        <a href={`tel:${lead.phone}`} className="text-[var(--primary)] hover:underline">
                                            {lead.phone}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[var(--text)]">{lead.course}</td>
                                    <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                                        {new Date(lead.createdAt).toLocaleString('ru-RU')}
                                    </td>
                                    <td className="px-4 py-3 flex gap-2 items-center">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                                            className="px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                                        >
                                            <option value="new">Новая</option>
                                            <option value="processing">В обработке</option>
                                            <option value="enrolled">Записан</option>
                                            <option value="won">Студент (Won)</option>
                                            <option value="lost">Отказ (Lost)</option>
                                        </select>

                                        {lead.status !== 'won' && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="text-xs px-2 py-1 h-auto"
                                                onClick={() => handleConvert(lead.id)}
                                                title="Конвертировать в студента"
                                            >
                                                To Student
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                    <p className="text-sm text-[var(--text-muted)]">
                        Показано {(pagination.page - 1) * pagination.limit + 1} -{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination((p: any) => ({ ...p, page: p.page - 1 }))}
                            leftIcon={<ChevronLeft size={16} />}
                        >
                            Назад
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => setPagination((p: any) => ({ ...p, page: p.page + 1 }))}
                            rightIcon={<ChevronRight size={16} />}
                        >
                            Вперёд
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    )
}
