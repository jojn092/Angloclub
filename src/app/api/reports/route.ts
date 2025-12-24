import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [studentsCount, groupsCount, paymentsSum] = await Promise.all([
            prisma.student.count({ where: { status: 'active' } }),
            prisma.group.count({ where: { isActive: true } }),
            prisma.payment.aggregate({ _sum: { amount: true } })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                students: studentsCount,
                groups: groupsCount,
                income: paymentsSum._sum.amount || 0
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
