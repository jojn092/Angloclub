import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period'); // "2025-12"
        const groupId = searchParams.get('groupId');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const studentName = searchParams.get('studentName');

        const where: any = {};

        if (period) {
            // Filter by date range for that month
            const date = new Date(period + '-01'); // "2025-12-01"
            if (!isNaN(date.getTime())) {
                where.date = {
                    gte: startOfMonth(date),
                    lte: endOfMonth(date)
                };
            }
        }

        if (groupId && groupId !== 'all') {
            where.student = { groups: { some: { id: Number(groupId) } } };
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (type && type !== 'all') {
            where.type = type;
        }

        if (studentName) {
            where.student = {
                ...where.student,
                name: { contains: studentName, mode: 'insensitive' }
            };
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                student: { include: { groups: true } }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json({ success: true, data: payments });
    } catch (error) {
        console.error('Failed to fetch payments:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch payments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, amount, method, comment, status, type, period, date } = body;

        const payment = await prisma.payment.create({
            data: {
                studentId: Number(studentId),
                amount: Number(amount),
                method,
                comment,
                status: status || 'paid',
                type: type || 'monthly',
                period,
                date: date ? new Date(date) : new Date()
            }
        });

        // Only update balance if Paid
        if (payment.status === 'paid') {
            await prisma.student.update({
                where: { id: Number(studentId) },
                data: { balance: { increment: Number(amount) } }
            });
        }

        return NextResponse.json({ success: true, data: payment });
    } catch (error) {
        console.error('Failed to create payment:', error);
        return NextResponse.json({ success: false, error: 'Failed to create payment' }, { status: 500 });
    }
}
