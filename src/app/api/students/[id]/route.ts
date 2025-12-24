import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/audit'

// GET: Fetch single student with details
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
                    orderBy: { date: 'desc' },
                    take: 50
                },
                attendance: {
                    include: { lesson: true },
                    orderBy: { lesson: { date: 'desc' } },
                    take: 50
                },
                lead: true
            }
        })

        if (!student) {
            return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: student })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error fetching student' }, { status: 500 })
    }
}

// PUT: Update student (profile, balance, status)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = Number(idStr)
        const body = await request.json()
        const { name, phone, email, balance, status, leftReason, groupIds, motherPhone, fatherPhone } = body

        if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })

        // Get old data for log
        const oldStudent = await prisma.student.findUnique({ where: { id }, select: { name: true } })

        const updateData: any = {}
        if (name) updateData.name = name
        if (phone) updateData.phone = phone
        if (email !== undefined) updateData.email = email
        if (motherPhone !== undefined) updateData.motherPhone = motherPhone
        if (fatherPhone !== undefined) updateData.fatherPhone = fatherPhone
        if (balance !== undefined) updateData.balance = balance
        if (status) updateData.status = status
        if (leftReason !== undefined) updateData.leftReason = leftReason

        // Manage Groups if provided
        if (groupIds) {
            updateData.groups = {
                set: groupIds.map((gId: number) => ({ id: gId }))
            }
        }

        const student = await prisma.student.update({
            where: { id },
            data: updateData
        })

        await logAction('UPDATE_STUDENT', `Updated student ${oldStudent?.name} (ID: ${id}). Changes: ${JSON.stringify(body)}`)

        return NextResponse.json({ success: true, data: student })
    } catch (error) {
        console.error('Update student error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка при обновлении студента' },
            { status: 500 }
        )
    }
}

// DELETE: Delete student
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = Number(idStr)
        if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })

        const student = await prisma.student.findUnique({ where: { id } })
        if (!student) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

        await prisma.student.delete({ where: { id } })

        await logAction('DELETE_STUDENT', `Deleted student: ${student.name} (ID: ${id})`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 })
    }
}
