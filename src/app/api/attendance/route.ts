import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const attendanceSchema = z.object({
    groupId: z.coerce.number(),
    date: z.string(), // ISO date string
    records: z.array(z.object({
        studentId: z.number(),
        status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'])
    }))
})

// GET: Fetch attendance for a group on a date
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const groupId = searchParams.get('groupId')
        const date = searchParams.get('date')

        if (!groupId) {
            return NextResponse.json({ success: false, error: 'groupId required' }, { status: 400 })
        }

        const whereClause: any = { groupId: Number(groupId) }

        if (date) {
            const d = new Date(date)
            const start = new Date(d)
            start.setHours(0, 0, 0, 0)
            const end = new Date(d)
            end.setHours(23, 59, 59, 999)

            whereClause.date = {
                gte: start,
                lte: end
            }
        }

        // Find lessons matching criteria
        const lessons = await prisma.lesson.findMany({
            where: whereClause,
            include: {
                attendance: {
                    include: { student: true }
                }
            }
        })

        // Flatten results for checking "Sheet" status
        // Since UI expects list of attendance records. 
        // If we filter by specific date, we likely get 1 lesson.
        // If multiple lessons (e.g. morning/evening), we might return all.

        const attendanceRecords = lessons.flatMap(l => l.attendance.map(a => ({
            ...a,
            date: l.date // Pass lesson date up for UI convenience
        })))

        return NextResponse.json({ success: true, data: attendanceRecords })
    } catch (error) {
        console.error('Get Attendance Error', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch attendance' }, { status: 500 })
    }
}

// POST: Mark Attendance
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = attendanceSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 })
        }

        const { groupId, date, records } = validation.data
        const lessonDate = new Date(date)

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find or Create Lesson
            const start = new Date(lessonDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(lessonDate)
            end.setHours(23, 59, 59, 999)

            let lesson = await tx.lesson.findFirst({
                where: { groupId, date: { gte: start, lte: end } }
            })

            // Get standard duration (future improvement: fetch from Template)
            const standardDuration = 60

            if (!lesson) {
                lesson = await tx.lesson.create({
                    data: {
                        groupId,
                        date: lessonDate,
                        topic: 'Lesson ' + lessonDate.toLocaleDateString(),
                        duration: standardDuration
                    }
                })
            }

            // 2. Fetch OLD attendance to calculate diff
            const oldAttendance = await tx.attendance.findMany({
                where: { lessonId: lesson.id }
            })
            const oldStatusMap = new Map(oldAttendance.map(a => [a.studentId, a.status]))

            // 3. Process each submitted record
            for (const record of records) {
                const { studentId, status } = record
                const oldStatus = oldStatusMap.get(studentId)

                // Define which statuses consume a lesson
                const isConsuming = (s: string) => ['PRESENT', 'LATE'].includes(s)

                let lessonChange = 0

                // If new status consumes lesson, and old didn't (or didn't exist)
                if (isConsuming(status) && (!oldStatus || !isConsuming(oldStatus))) {
                    lessonChange = -1
                }
                // If new status DOES NOT consume, but old DID
                else if (!isConsuming(status) && oldStatus && isConsuming(oldStatus)) {
                    lessonChange = 1
                }

                // Update Student Lessons if changed
                if (lessonChange !== 0) {
                    await tx.student.update({
                        where: { id: studentId },
                        data: { lessons: { increment: lessonChange } }
                    })
                }
            }

            // 4. Update Attendance Records (Delete all and recreate is simpler but strictly we should upsert)
            // But strict Recreate is acceptable for this scale if we handle IDs.
            // Actually, map logic handled logic. Now let's save the state.

            // Delete old
            await tx.attendance.deleteMany({ where: { lessonId: lesson.id } })

            // Create new
            if (records.length > 0) {
                await tx.attendance.createMany({
                    data: records.map(r => ({
                        lessonId: lesson.id,
                        studentId: r.studentId,
                        status: r.status
                    }))
                })
            }

            return lesson
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error('Attendance Save Error:', error)
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
