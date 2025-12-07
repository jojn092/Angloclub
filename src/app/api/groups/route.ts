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
                    create: days.map((day: number) => ({
                        dayOfWeek: day,
                        startTime: time,
                        duration: 60 // Default duration
                    }))
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
