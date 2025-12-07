import { Search, RefreshCw, Download } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface LeadFiltersProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    statusFilter: string
    setStatusFilter: (status: string) => void
    onRefresh: () => void
    onExport: (format: 'csv' | 'xlsx') => void
}

export default function LeadFilters({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    onRefresh,
    onExport,
}: LeadFiltersProps) {
    return (
        <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по имени, телефону, курсу..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                </div>

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                >
                    <option value="all">Все статусы</option>
                    <option value="new">Новые</option>
                    <option value="processing">В обработке</option>
                    <option value="enrolled">Записаны</option>
                </select>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onRefresh} leftIcon={<RefreshCw size={16} />}>
                        Обновить
                    </Button>
                    <Button variant="outline" onClick={() => onExport('csv')} leftIcon={<Download size={16} />}>
                        CSV
                    </Button>
                    <Button variant="outline" onClick={() => onExport('xlsx')} leftIcon={<Download size={16} />}>
                        Excel
                    </Button>
                </div>
            </div>
        </Card>
    )
}
