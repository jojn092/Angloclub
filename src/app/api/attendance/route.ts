import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const groupIdParam = searchParams.get('groupId');
        const allParam = searchParams.get('all');

        const where: any = {};

        // If 'all' is not true, apply date filter
        if (allParam !== 'true') {
            const date = dateParam ? new Date(dateParam) : new Date();
            where.date = {
                gte: startOfDay(date),
                lte: endOfDay(date)
            };
        }

        if (groupIdParam) {
            where.groupId = Number(groupIdParam);
        }

        const lessons = await prisma.lesson.findMany({
            where,
            include: {
                group: { select: { name: true } },
                attendance: { include: { student: { select: { name: true } } } }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json({ success: true, data: lessons });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
