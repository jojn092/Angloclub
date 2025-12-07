import Card from '@/components/ui/Card'
import { Lead, Pagination } from '@/types'

interface StatsOverviewProps {
    leads: Lead[]
    total: number
}

export default function StatsOverview({ leads, total }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
                <p className="text-2xl font-bold text-[var(--text)]">{total}</p>
                <p className="text-sm text-[var(--text-muted)]">Всего заявок</p>
            </Card>
            <Card className="text-center">
                <p className="text-2xl font-bold text-red-500">
                    {leads.filter(l => l.status === 'new').length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Новых</p>
            </Card>
            <Card className="text-center">
                <p className="text-2xl font-bold text-yellow-500">
                    {leads.filter(l => l.status === 'processing').length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">В обработке</p>
            </Card>
            <Card className="text-center">
                <p className="text-2xl font-bold text-green-500">
                    {leads.filter(l => l.status === 'enrolled').length}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Записаны</p>
            </Card>
        </div>
    )
}
