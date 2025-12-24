import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const today = new Date();

        const [
            totalStudents,
            activeGroups,
            lessonsToday,
            unpaidCount,
            totalUnpaid
        ] = await Promise.all([
            prisma.student.count(),
            prisma.group.count({ where: { isActive: true } }),
            prisma.lesson.count({
                where: {
                    date: {
                        gte: startOfDay(today),
                        lte: endOfDay(today)
                    }
                }
            }),
            prisma.payment.count({ where: { status: 'pending' } }),
            prisma.payment.aggregate({
                where: { status: 'pending' },
                _sum: { amount: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalStudents,
                activeGroups,
                lessonsToday,
                unpaidCount,
                totalUnpaidAmount: totalUnpaid._sum.amount || 0,
                attendance: 0 // Placeholder for now, requires complex calc
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        return NextResponse.json({ success: false, error: 'Stats failed' }, { status: 500 });
    }
}
