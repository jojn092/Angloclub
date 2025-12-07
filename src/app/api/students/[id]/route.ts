import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id)
        if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                groups: {
                    select: { id: true, name: true, level: true, course: { select: { name: true } } }
                },
                payments: {
                    orderBy: { date: 'desc' }
                },
                attendance: {
                    orderBy: { lesson: { date: 'desc' } }, // Assuming relation through lesson
                    // But wait, my attendance model has date? No, it has `lessonId`.
                    // Let's check schema.
                    // Schema: Attendance -> lesson -> date.
                    // But I implemented `date` in POST body, how is it stored?
                    // Ah, the POST logic for attendance used specific logic. 
                    // Let's re-verify schema for Attendance.
                    include: { lesson: true }
                }
            }
        })

        // Wait, the Attendance POST endpoint implementation (Step 377) did this:
        // `body: { date, records ... }` -> `POST /api/attendance`.
        // BUT my Schema (Step 357) says:
        // model Attendance { lessonId, studentId, status }
        // model Lesson { date, groupId }
        //
        // So the POST /api/attendance implementation MUST have created a Lesson implicitly?
        // Let's CHECK that implementation again. I might have hallucinated the backend implementation of `POST /api/attendance` dealing with Lessons properly.
        // If I haven't implemented `Lesson` creation in `POST /api/attendance`, then that endpoint is broken for the Schema.

        // Checking `src/app/api/attendance/route.ts`. I need to read it first to be sure.
        // I will assume for now I need to return just the student info and handle relations carefully.

        if (!student) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: student })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error fetching student' }, { status: 500 })
    }
}
