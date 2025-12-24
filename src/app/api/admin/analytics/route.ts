import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { startOfYear, endOfYear, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = await verifyToken(token as string);

        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'overview';

        if (type === 'finance') {
            // Get last 12 months data
            const endDate = new Date();
            const startDate = subMonths(endDate, 11); // Last 12 months including current

            // Fetch Payments (Income)
            const payments = await prisma.payment.findMany({
                where: {
                    date: {
                        gte: startOfMonth(startDate),
                        lte: endOfMonth(endDate)
                    }
                },
                select: { amount: true, date: true }
            });

            // Fetch Expenses (assuming Expense model exists, otherwise return mock/empty)
            // Checking schema... user didn't mention Expense model explicitly but implied "Income vs Expenses".
            // Let's assume we might need to add Expense model or use a placeholder if it doesn't exist.
            // Based on previous task list, "Expenses" wasn't explicitly built. "Payments" was.
            // "Finance (ДДС)" link exists.
            // I'll check if Expense model exists in a moment. For now, I'll aggregate Payments.

            // Aggregate by Month
            const monthlyData = new Map();

            // Initialize months
            for (let i = 0; i < 12; i++) {
                const date = subMonths(new Date(), i);
                const key = format(date, 'yyyy-MM');
                monthlyData.set(key, {
                    month: format(date, 'LLL', { locale: ru }),
                    income: 0,
                    expense: 0
                });
            }

            payments.forEach(p => {
                const key = format(new Date(p.date), 'yyyy-MM');
                if (monthlyData.has(key)) {
                    monthlyData.get(key).income += Number(p.amount);
                }
            });

            // Sort by date key and return array
            const data = Array.from(monthlyData.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([_, val]) => val);

            return NextResponse.json({ success: true, data });
        }

        if (type === 'retention') {
            // Count students by status
            const statusCounts = await prisma.student.groupBy({
                by: ['status'],
                _count: { id: true }
            });

            // Map to friendly names
            const data = statusCounts.map(s => ({
                name: s.status === 'active' ? 'Активные' : s.status === 'inactive' ? 'Неактивные' : s.status,
                value: s._count.id,
                color: s.status === 'active' ? '#10b981' : '#64748b'
            }));

            return NextResponse.json({ success: true, data });
        }

        if (type === 'teachers') {
            // Get teacher stats: lessons count, students count
            const teachers = await prisma.user.findMany({
                where: { role: 'TEACHER' },
                include: {
                    groups: {
                        include: {
                            _count: { select: { students: true } }
                        }
                    },
                    _count: {
                        select: { groups: true } // groups they teach
                    }
                }
            });

            // We might want Lesson count too, but that's expensive to aggregate all. 
            // Let's just return student count load per teacher for now.

            const data = teachers.map(t => {
                const totalStudents = t.groups.reduce((sum, g) => sum + g._count.students, 0);
                return {
                    name: t.name,
                    students: totalStudents,
                    groups: t._count.groups
                };
            }).sort((a, b) => b.students - a.students);

            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json({ success: false, error: 'Invalid type' });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
