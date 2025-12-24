import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month'); // "2025-12"

        let dateFilter = {};
        if (monthParam) {
            const date = new Date(monthParam);
            dateFilter = {
                gte: startOfMonth(date),
                lte: endOfMonth(date)
            };
        }

        // Parallel fetch
        const [incomeAgg, expenseAgg, payments, expenses] = await Promise.all([
            prisma.payment.aggregate({
                where: { status: 'paid', date: dateFilter },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { date: dateFilter },
                _sum: { amount: true }
            }),
            prisma.payment.findMany({
                where: { status: 'paid', date: dateFilter },
                take: 20,
                orderBy: { date: 'desc' },
                include: { student: { select: { name: true } } }
            }),
            prisma.expense.findMany({
                where: { date: dateFilter },
                take: 20,
                orderBy: { date: 'desc' }
            })
        ]);

        const totalIncome = incomeAgg._sum.amount || 0;
        const totalExpense = expenseAgg._sum.amount || 0;
        const netProfit = totalIncome - totalExpense;

        return NextResponse.json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                netProfit,
                payments,
                expenses
            }
        });
    } catch (error) {
        console.error('Finance Summary Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
