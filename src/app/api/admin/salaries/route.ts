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
        } else {
            const now = new Date();
            dateFilter = {
                gte: startOfMonth(now),
                lte: endOfMonth(now)
            };
        }

        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER', isActive: true },
            select: {
                id: true,
                name: true,
                hourlyRate: true,
                groups: {
                    select: {
                        lessons: {
                            where: {
                                isCompleted: true,
                                date: dateFilter
                            }
                        }
                    }
                }
            }
        });

        const data = teachers.map(t => {
            const lessonCount = t.groups.reduce((acc, g) => acc + g.lessons.length, 0);
            const total = lessonCount * t.hourlyRate;
            return {
                id: t.id,
                name: t.name,
                rate: t.hourlyRate,
                lessons: lessonCount,
                total
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
