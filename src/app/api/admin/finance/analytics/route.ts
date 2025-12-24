
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { ru } from 'date-fns/locale';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'MANAGER')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Monthly Financials (Last 6 Months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(new Date(), i);
            months.push({
                date: d,
                label: format(d, 'LLL', { locale: ru }), // Jan, Feb...
                year: d.getFullYear(),
                month: d.getMonth()
            });
        }

        const monthlyData = await Promise.all(months.map(async (m) => {
            const start = startOfMonth(m.date);
            const end = endOfMonth(m.date);

            const income = await prisma.payment.aggregate({
                where: {
                    date: { gte: start, lte: end },
                    status: 'paid' // assuming 'paid' is the status
                },
                _sum: { amount: true }
            });

            const expense = await prisma.expense.aggregate({
                where: {
                    date: { gte: start, lte: end }
                },
                _sum: { amount: true }
            });

            // Also include teacher salaries paid in this month? 
            // The Expense model has 'Salary' category, so if they track it there, it's covered.
            // If they use Salary model separately, we might need to add it.
            // Let's assume Expense model covers cash flow.

            return {
                name: m.label,
                income: income._sum.amount || 0,
                expense: expense._sum.amount || 0,
                profit: (income._sum.amount || 0) - (expense._sum.amount || 0)
            };
        }));

        // 2. Group Profitability
        // Active groups only? Or all? Let's take groups active in last 6 months or just currently active.
        // Let's do currently active for simplicity + recently created.
        const groups = await prisma.group.findMany({
            where: { isActive: true },
            include: {
                teacher: {
                    select: { name: true, hourlyRate: true }
                },
                course: { select: { name: true, price: true } },
                _count: { select: { students: true } }
            }
        });

        const groupsData = await Promise.all(groups.map(async (g) => {
            // Total Income: Payments from students in this group?
            // Payment is linked to Student, not Group directly.
            // But Student has many Groups. 
            // Approximation: Payments from students currently in this group.
            // Better: Payments linked to this group? Payment model doesn't have groupId.
            // Limit: We can't perfectly attribute generally payments to specific groups if a student is in multiple.
            // BUT usually student is in 1 main group.
            // Let's sum payments of students who are in this group.

            // Wait, we want "Profitability". Is it "All time" or "This Month"?
            // Usually "Monthly Run Rate".
            // Let's calculate for "Current Month" to be relevant.

            const start = startOfMonth(new Date());
            const end = endOfMonth(new Date());

            // 1. Income (This month)
            // Get students in this group
            const students = await prisma.student.findMany({
                where: { groups: { some: { id: g.id } } },
                select: { id: true }
            });
            const studentIds = students.map(s => s.id);

            const monthlyIncome = await prisma.payment.aggregate({
                where: {
                    studentId: { in: studentIds },
                    date: { gte: start, lte: end },
                    status: 'paid'
                },
                _sum: { amount: true }
            });

            // 2. Expense (Teacher Cost This Month)
            // Get lessons for this group this month
            const lessons = await prisma.lesson.findMany({
                where: {
                    groupId: g.id,
                    date: { gte: start, lte: end },
                    isCompleted: true
                }
            });

            // Calculate cost
            // Salary = (Duration / 60) * HourlyRate
            const hourlyRate = g.teacher?.hourlyRate || 0;
            const totalMinutes = lessons.reduce((sum, l) => sum + l.duration, 0);
            const teacherCost = Math.round((totalMinutes / 60) * hourlyRate);

            return {
                id: g.id,
                name: g.name,
                teacherName: g.teacher?.name || 'Нет',
                studentsCount: g._count.students,
                income: monthlyIncome._sum.amount || 0,
                expense: teacherCost,
                profit: (monthlyIncome._sum.amount || 0) - teacherCost
            };
        }));

        // Sort by profit desc
        groupsData.sort((a, b) => b.profit - a.profit);

        return NextResponse.json({
            success: true,
            data: {
                monthly: monthlyData,
                groups: groupsData
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
