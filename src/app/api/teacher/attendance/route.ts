import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        // Auth Check
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0]
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

        // Parse Body
        const { groupId, date, records } = await request.json()

        if (!groupId || !date || !records) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        // Transaction:
        // 1. Find or Create Lesson for this Group + Date
        // 2. Upsert Attendance records

        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Find/Create Lesson
                let lesson = await tx.lesson.findFirst({
                    where: {
                        groupId,
                        date: new Date(date)
                    }
                })

                if (!lesson) {
                    lesson = await tx.lesson.create({
                        data: {
                            groupId,
                            date: new Date(date),
                            isCompleted: true // Mark as completed since we took attendance
                        }
                    })
                }

                // 2. Save Attendance


                // Correct approach without schema change:
                // Delete existing attendance for this lesson/students and re-insert?
                // Or iterate and check.

                // Let's implement Delete + Create for simplicity and robustness for this session.
                // Note: This deletes ALL attendance for this lesson before adding new.
                // Optimization: Only delete for students in `records`?
                // Let's Keep it simple:

                // 2. Upsert manually
                for (const record of records) {
                    const existing = await tx.attendance.findFirst({
                        where: {
                            studentId: record.studentId,
                            lessonId: lesson.id
                        }
                    })

                    if (existing) {
                        await tx.attendance.update({
                            where: { id: existing.id },
                            data: { status: record.status }
                        })
                    } else {
                        await tx.attendance.create({
                            data: {
                                studentId: record.studentId,
                                lessonId: lesson.id,
                                status: record.status
                            }
                        })
                    }
                }

                return lesson
            })

            return NextResponse.json({ success: true, data: result })

        } catch (dbError) {
            console.error('DB Error:', dbError)
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
