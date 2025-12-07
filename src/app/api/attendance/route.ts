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

// POST: Mark Attendance (Find/Create Lesson -> Update Attendance)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = attendanceSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 })
        }

        const { groupId, date, records } = validation.data
        const lessonDate = new Date(date) // "YYYY-MM-DD" usually implies start of day universal or local? 
        // We should treat it carefully. Let's assume input is YYYY-MM-DD.
        // We want to create one Lesson per day per group for now (MVP).

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find or Create Lesson for this Group + Date
            // Define range for "Same Day"
            const start = new Date(lessonDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(lessonDate)
            end.setHours(23, 59, 59, 999)

            let lesson = await tx.lesson.findFirst({
                where: {
                    groupId,
                    date: { gte: start, lte: end }
                }
            })

            if (!lesson) {
                lesson = await tx.lesson.create({
                    data: {
                        groupId,
                        date: lessonDate,
                        topic: 'Lesson ' + lessonDate.toLocaleDateString()
                    }
                })
            }

            // 2. Delete existing attendance for this lesson (to handle updates/removals)
            // We assume the submitted list is the FULL state for the lesson.
            await tx.attendance.deleteMany({
                where: { lessonId: lesson.id }
            })

            // 3. Create new attendance records
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
        return NextResponse.json({ success: false, error: 'Failed to mark attendance' }, { status: 500 })
    }
}
