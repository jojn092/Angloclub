import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'TEACHER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        let startDate: Date;
        let endDate: Date;

        if (fromParam && toParam) {
            startDate = new Date(fromParam);
            endDate = new Date(toParam);
        } else if (dateParam) {
            const date = new Date(dateParam);
            startDate = startOfDay(date);
            endDate = endOfDay(date);
        } else {
            const now = new Date();
            startDate = startOfWeek(now, { weekStartsOn: 1 });
            endDate = endOfWeek(now, { weekStartsOn: 1 });
        }

        // 1. Get Real Lessons
        const realLessons = await prisma.lesson.findMany({
            where: {
                group: {
                    teacherId: decoded.id
                },
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                group: {
                    include: {
                        students: {
                            where: { status: 'active' },
                            select: { id: true, name: true }
                        },
                        room: true,
                        course: true
                    }
                },
                attendance: true
            },
            orderBy: { date: 'asc' }
        });

        // 2. Get Templates
        const templates = await prisma.scheduleTemplate.findMany({
            where: {
                group: {
                    teacherId: decoded.id,
                    isActive: true
                },
                validFrom: { lte: endDate }
            },
            include: {
                group: {
                    include: {
                        students: {
                            where: { status: 'active' },
                            select: { id: true, name: true }
                        },
                        room: true,
                        course: true
                    }
                }
            }
        });

        // 3. Generate Virtual Lessons
        const virtualLessons: any[] = [];
        let loopDate = new Date(startDate);

        // Reset to start of day to ensure consistent iteration
        loopDate.setHours(0, 0, 0, 0);

        while (loopDate <= endDate) {
            // Check week day (0-6, but let's match our DB convention)
            // our DB: 1=Mon ... 7=Sun? Or 0=Sun. 
            // In Page.tsx: 1=Mon...6=Sat, 0=Sun.
            // date-fns getDay: 0=Sun, 1=Mon...
            const dayIdLimit = loopDate.getDay();
            // If our templates use 1=Mon..7=Sun logic or 0=Sun logic, we need to match.
            // Looking at Admin Page: daysMap uses 1=Mon ... 6=Sat, 0=Sun. Matches date-fns getDay exactly.

            const dayTemplates = templates.filter(t => {
                // Check date validity
                const validFrom = new Date(t.validFrom);
                validFrom.setHours(0, 0, 0, 0);
                if (loopDate < validFrom) return false;
                if (t.validTo) {
                    const validTo = new Date(t.validTo);
                    validTo.setHours(23, 59, 59, 999);
                    if (loopDate > validTo) return false;
                }

                // Check day of week
                const days = t.daysOfWeek.split(',').map(Number);
                return days.includes(dayIdLimit);
            });

            for (const t of dayTemplates) {
                // Create Date object for this lesson
                const [h, m] = t.startTime.split(':').map(Number);
                const lessonDate = new Date(loopDate);
                lessonDate.setHours(h, m, 0, 0);

                // Check if Real Lesson already exists for this Group + Date (approx match or strict?)
                // Let's assume one lesson per group per day usually, OR match time.
                // Strict time matching might fail if teacher started it 5 mins late.
                // Let's check if there is a real lesson for this group within +/- 2 hours range? 
                // Or simply ON THIS DAY?
                // Let's try: On this DAY.
                const exists = realLessons.find(rl =>
                    rl.groupId === t.groupId &&
                    rl.date.getDate() === loopDate.getDate() &&
                    rl.date.getMonth() === loopDate.getMonth() &&
                    rl.date.getFullYear() === loopDate.getFullYear()
                );

                if (!exists) {
                    virtualLessons.push({
                        id: -Math.floor(Math.random() * 1000000000) - 1, // Temp negative ID
                        date: lessonDate.toISOString(), // Send as string to match JSON
                        duration: 60, // Default or calc from endTime
                        topic: '',
                        isCompleted: false,
                        group: t.group,
                        attendance: []
                    });
                }
            }

            // Next day
            loopDate.setDate(loopDate.getDate() + 1);
        }

        // 4. Merge and Sort
        const allLessons = [...realLessons, ...virtualLessons].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return NextResponse.json({ success: true, data: allLessons });
    } catch (error) {
        console.error('Fetch Lessons Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
