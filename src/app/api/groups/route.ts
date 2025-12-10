import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { groupSchema } from '@/lib/validations'

// GET: Fetch all groups with relations
export async function GET(request: Request) {
    try {
        const groups = await prisma.group.findMany({
            include: {
                course: true,
                teacher: {
                    select: { id: true, name: true, email: true }
                },
                room: true,
                students: {
                    select: { id: true, name: true }
                },
                schedules: true, // IMPORTANT: Include schedules for calendar
                _count: {
                    select: { students: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, data: groups })
    } catch (error) {
        console.error('Fetch groups error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка при загрузке групп' },
            { status: 500 }
        )
    }
}

// POST: Create a new group
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validate
        const validation = groupSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Ошибка валидации', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { name, level, courseId, teacherId, roomId, days, time } = validation.data

        const group = await prisma.group.create({
            data: {
                name,
                level,
                courseId,
                teacherId,
                roomId,
                // Create schedule templates if days/time provided
                schedules: (days && time) ? {
                    create: days.map((day: number) => {
                        // Calculate endTime (default 60 mins)
                        const [h, m] = time.split(':').map(Number)
                        const endDate = new Date()
                        endDate.setHours(h, m + 60)
                        const endTime = endDate.toTimeString().slice(0, 5)

                        return {
                            dayOfWeek: day,
                            startTime: time,
                            endTime // Required field
                        }
                    })
                } : undefined
            },
            include: {
                course: true,
                teacher: true,
                room: true,
                schedules: true
            }
        })

        return NextResponse.json({ success: true, data: group })
    } catch (error) {
        console.error('Create group error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка при создании группы' },
            { status: 500 }
        )
    }
}
// PUT: Update group (isActive, addStudent)
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, isActive, addStudentId } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const group = await prisma.group.update({
            where: { id },
            data: {
                isActive: isActive !== undefined ? isActive : undefined,
                students: addStudentId ? {
                    connect: { id: addStudentId }
                } : undefined
            },
            include: {
                course: true,
                teacher: true,
                _count: { select: { students: true } }
            }
        })

        return NextResponse.json({ success: true, data: group })
    } catch (error) {
        console.error('Update group error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка при обновлении группы' },
            { status: 500 }
        )
    }
}
