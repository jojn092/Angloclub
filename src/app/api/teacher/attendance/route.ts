import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const decoded = await verifyToken(token as string);

        if (!decoded || decoded.role !== 'TEACHER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { lessonId, groupId, date, records } = body;

        let targetLessonId = lessonId;

        // Case 1: Just updating existing lesson by ID
        if (targetLessonId) {
            const lesson = await prisma.lesson.findUnique({
                where: { id: targetLessonId },
                include: { group: true }
            });

            if (!lesson || lesson.group.teacherId !== decoded.id) {
                return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
            }
        }
        // Case 2: Finding/Creating lesson by Group + Date
        else if (groupId && date) {
            // Verify group ownership first
            const group = await prisma.group.findUnique({
                where: { id: Number(groupId) }
            });

            if (!group || group.teacherId !== decoded.id) {
                return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
            }

            // Find existing lesson or create new one
            // We need to parse date string strictly? Or assumt YYYY-MM-DD
            // Prisma stores DateTime. A simple string compare might not accept new Date(date).
            // Let's assume start of day / exact match logic if we want to be precise, 
            // but for now let's hope finding by timestamp works if we use ISO string.
            // Actually, best to use "gte" and "lt" for the day range if strict,
            // OR if the app strictly uses exact timestamps.
            // Simplified: Try to find a lesson with this exact date (as stored).

            // To be safe, let's just find ANY lesson on this day for this group.
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            let lesson = await prisma.lesson.findFirst({
                where: {
                    groupId: Number(groupId),
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            if (!lesson) {
                // Create new lesson
                lesson = await prisma.lesson.create({
                    data: {
                        groupId: Number(groupId),
                        date: new Date(date), // set to the specific time passed or default? Passed 'date' is usually YYYY-MM-DD.
                        // If it's pure date string, new Date(date) might be UTC or Local.
                        // Let's force it to be noon or consistent.
                        // If 'date' is '2025-12-25', new Date() is '2025-12-25T00:00:00.000Z'
                        duration: 60, // Default duration
                        topic: 'Тема урока',
                        isCompleted: false
                    }
                });
            }
            targetLessonId = lesson.id;
        } else {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }


        // Transaction to save attendance and update lesson
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing attendance for this lesson (to allow updates/overwrites)
            // Be careful if we just created it, it's empty anyway.
            await tx.attendance.deleteMany({
                where: { lessonId: targetLessonId }
            });

            // 2. Create new attendance records
            if (records && records.length > 0) {
                await tx.attendance.createMany({
                    data: records.map((r: any) => ({
                        lessonId: targetLessonId,
                        studentId: r.studentId,
                        status: r.status, // 'PRESENT', 'ABSENT', 'EXCUSED'
                        grade: r.grade ? Number(r.grade) : null,
                        comment: r.comment || null
                    }))
                });
            }

            // 3. Mark lesson as completed
            await tx.lesson.update({
                where: { id: targetLessonId },
                data: { isCompleted: true }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Attendance Submit Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit' }, { status: 500 });
    }
}
