import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const view = searchParams.get('view') || 'week'; // day, week, month

        const groupId = searchParams.get('groupId');
        const teacherId = searchParams.get('teacherId');
        const roomId = searchParams.get('roomId');
        const subjectId = searchParams.get('subjectId');

        const referenceDate = dateParam ? new Date(dateParam) : new Date();

        let start, end;
        if (view === 'day') {
            start = startOfDay(referenceDate);
            end = endOfDay(referenceDate);
        } else if (view === 'month') {
            start = startOfWeek(startOfMonth(referenceDate), { weekStartsOn: 1 }); // Start slightly before month for grid
            end = endOfWeek(endOfMonth(referenceDate), { weekStartsOn: 1 });
        } else {
            // Default week
            start = startOfWeek(referenceDate, { weekStartsOn: 1 });
            end = endOfWeek(referenceDate, { weekStartsOn: 1 });
        }

        const where: any = {
            date: {
                gte: start,
                lte: end
            }
        };

        if (groupId && groupId !== 'all') where.groupId = Number(groupId);
        if (teacherId && teacherId !== 'all') where.group = { ...where.group, teacherId: Number(teacherId) };
        if (roomId && roomId !== 'all') where.group = { ...where.group, roomId: Number(roomId) };
        if (subjectId && subjectId !== 'all') where.group = { ...where.group, courseId: Number(subjectId) };

        const lessons = await prisma.lesson.findMany({
            where,
            include: {
                group: {
                    select: {
                        name: true,
                        course: { select: { name: true } },
                        room: { select: { name: true } },
                        teacher: { select: { name: true } }
                    }
                },
                attendance: { select: { status: true } } // Fetch attendance status count if needed
            },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json({ success: true, data: lessons });
    } catch (error) {
        console.error('Failed to fetch lessons:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch lessons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { groupId, date, duration, topic } = body;

        const lesson = await prisma.lesson.create({
            data: {
                groupId: Number(groupId),
                date: new Date(date),
                duration: Number(duration),
                topic: topic || null
            }
        });
        return NextResponse.json({ success: true, data: lesson });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
    }
}
