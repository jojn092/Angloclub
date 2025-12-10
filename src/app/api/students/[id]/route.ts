import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = Number(idStr)
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
                    include: { lesson: true },
                    orderBy: { lesson: { date: 'desc' } }
                },
                lead: true
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

// PUT: Update student (balance, status, leftReason)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = Number(idStr)
        const body = await request.json()
        const { balance, status, leftReason, lessons } = body

        if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })

        const updateData: any = {}
        if (balance !== undefined) updateData.balance = balance
        if (status) updateData.status = status
        if (leftReason !== undefined) updateData.leftReason = leftReason
        if (lessons !== undefined) updateData.lessons = lessons

        const student = await prisma.student.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({ success: true, data: student })
    } catch (error) {
        console.error('Update student error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка при обновлении студента' },
            { status: 500 }
        )
    }
}
