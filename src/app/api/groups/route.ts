import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { groupSchema } from '@/lib/validations'
import { logAction } from '@/lib/audit'

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

        // Conflict Check (Only if days/time provided)
        if (days && time && days.length > 0) {
            // Find potentially conflicting groups (Same teacher OR Same Room) on Same Days
            const conflicts = await prisma.group.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { teacherId: teacherId },
                        roomId ? { roomId: roomId } : {}
                    ],
                    schedules: {
                        some: {
                            dayOfWeek: { in: days },
                            startTime: time // Exact match for MVP. Ideally overlapping.
                        }
                    }
                },
                include: { teacher: true, room: true, schedules: true }
            })

            // Filter exact conflicts
            const actualConflict = conflicts.find(g =>
                g.schedules.some(s =>
                    days.includes(s.dayOfWeek) &&
                    s.startTime === time
                )
            )

            if (actualConflict) {
                const reason = actualConflict.teacherId === teacherId ?
                    `Преподаватель ${actualConflict.teacher.name} занят` :
                    `Аудитория ${actualConflict.room?.name} занята`

                return NextResponse.json({
                    success: false,
                    error: `Конфликт расписания: ${reason} (Группа: ${actualConflict.name})`
                }, { status: 409 })
            }
        }

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

        await logAction('CREATE_GROUP', `Created group "${group.name}" (ID: ${group.id})`)

        return NextResponse.json({ success: true, data: group })
    } catch (error) {
        console.error('Create group error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка при создании группы' },
            { status: 500 }
        )
    }
}

// PUT: Update group (Full editing)
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, name, teacherId, roomId, isActive, addStudentIds, removeStudentIds } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        // Prepare data for update
        const data: any = {}
        if (name) data.name = name
        if (teacherId) data.teacherId = teacherId
        if (roomId) data.roomId = roomId
        if (isActive !== undefined) data.isActive = isActive

        // Handle relationships (Students)
        if (addStudentIds || removeStudentIds) {
            data.students = {}
            if (addStudentIds && addStudentIds.length > 0) {
                data.students.connect = addStudentIds.map((sid: number) => ({ id: sid }))
            }
            if (removeStudentIds && removeStudentIds.length > 0) {
                data.students.disconnect = removeStudentIds.map((sid: number) => ({ id: sid }))
            }
        }

        const group = await prisma.group.update({
            where: { id },
            data,
            include: {
                course: true,
                teacher: true,
                _count: { select: { students: true } }
            }
        })

        await logAction('UPDATE_GROUP', `Updated group "${group.name}" (ID: ${group.id}). Changes: ${JSON.stringify(body)}`)

        return NextResponse.json({ success: true, data: group })
    } catch (error) {
        console.error('Update group error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка при обновлении группы' },
            { status: 500 }
        )
    }
}
