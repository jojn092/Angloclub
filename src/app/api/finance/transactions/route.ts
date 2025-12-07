import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50

        // Fetch Payments (Income)
        const payments = await prisma.payment.findMany({
            include: { student: { select: { name: true } } },
            orderBy: { date: 'desc' },
            take: limit
        })

        // Fetch Expenses (Outcome)
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            take: limit
        })

        // Combine and standardise
        const history = [
            ...payments.map(p => ({
                id: `p-${p.id}`,
                date: p.date,
                amount: p.amount,
                type: 'income',
                category: 'Payment',
                description: `Студент: ${p.student.name}`,
                method: p.method
            })),
            ...expenses.map(e => ({
                id: `e-${e.id}`,
                date: e.date,
                amount: e.amount,
                type: 'expense',
                category: e.category,
                description: e.description,
                method: 'cash' // default for now
            }))
        ]

        // Sort by date desc
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return NextResponse.json({ success: true, data: history.slice(0, limit) })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, error: 'Failed to fetch transaction history' }, { status: 500 })
    }
}
