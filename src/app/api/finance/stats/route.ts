import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // YYYY-MM

        const start = new Date(`${month}-01T00:00:00.000Z`)
        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)

        // Parallel fetch
        const [income, expenses] = await Promise.all([
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { date: { gte: start, lt: end } }
            }),
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { date: { gte: start, lt: end } }
            })
        ])

        const totalIncome = income._sum.amount || 0
        const totalExpense = expenses._sum.amount || 0

        return NextResponse.json({
            success: true,
            data: {
                income: totalIncome,
                expense: totalExpense,
                profit: totalIncome - totalExpense,
                month
            }
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
