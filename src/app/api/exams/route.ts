import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/audit'

// GET: Fetch exams
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const studentId = searchParams.get('studentId')

        const where = studentId ? { studentId: Number(studentId) } : {}

        const exams = await prisma.mockExam.findMany({
            where,
            include: {
                student: { select: { id: true, name: true } }
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json({ success: true, data: exams })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

// POST: Create exam
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { studentId, date, listening, reading, writing, speaking, type, comment } = body

        // 1. Calculate Overall
        // IELTS rounding: Average of 4 components, rounded to nearest 0.5.
        // Example: 6.25 -> 6.5, 6.125 -> 6.0, 6.75 -> 7.0
        const avg = (Number(listening) + Number(reading) + Number(writing) + Number(speaking)) / 4

        // Custom Rounding for IELTS
        const overall = Math.round(avg * 2) / 2

        const exam = await prisma.mockExam.create({
            data: {
                studentId: Number(studentId),
                date: new Date(date),
                listening: Number(listening),
                reading: Number(reading),
                writing: Number(writing),
                speaking: Number(speaking),
                overall,
                type: type || 'IELTS',
                comment
            },
            include: { student: true }
        })

        await logAction('CREATE_EXAM', `Created Mock Exam for ${exam.student.name}: Overall ${overall}`)

        return NextResponse.json({ success: true, data: exam })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, error: 'Failed to create exam' }, { status: 500 })
    }
}
