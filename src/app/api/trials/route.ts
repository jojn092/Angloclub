import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/audit'

// GET: Fetch trials
export async function GET(request: Request) {
    try {
        const trials = await prisma.trialLesson.findMany({
            include: {
                teacher: { select: { id: true, name: true } }
            },
            orderBy: { date: 'asc' }
        })

        return NextResponse.json({ success: true, data: trials })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

// POST: Create trial
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, phone, date, teacherId, price } = body

        const trial = await prisma.trialLesson.create({
            data: {
                name,
                phone,
                date: new Date(date),
                teacherId: teacherId ? Number(teacherId) : null,
                price: price || 1500,
                isPaid: false,
                status: 'scheduled'
            },
            include: { teacher: true }
        })

        await logAction('CREATE_TRIAL', `Scheduled Trial Lesson for ${name} on ${date}`)

        return NextResponse.json({ success: true, data: trial })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

// PUT: Update trial (Mark paid / Status)
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, isPaid, status } = body

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const updateData: any = {}
        if (isPaid !== undefined) updateData.isPaid = isPaid
        if (status) updateData.status = status

        const trial = await prisma.trialLesson.update({
            where: { id },
            data: updateData,
            include: { teacher: true }
        })

        await logAction('UPDATE_TRIAL', `Updated Trial ${id}: Paid=${trial.isPaid}, Status=${trial.status}`)

        return NextResponse.json({ success: true, data: trial })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
