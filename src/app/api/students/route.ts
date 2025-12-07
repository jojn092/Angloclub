import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { studentSchema } from '@/lib/validations'

// GET: Fetch students with search and filtering
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

        const where = search ? {
            OR: [
                { name: { contains: search } }, // Case insensitive in SQLite?
                { phone: { contains: search } }
            ]
        } : {}

        const students = await prisma.student.findMany({
            where,
            include: {
                groups: { select: { name: true } }
            },
            take: limit,
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ success: true, data: students })
    } catch (error) {
        console.error('Students API Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 })
    }
}

// POST: Create a new student manually
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = studentSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.message }, { status: 400 })
        }

        const { name, phone, email, groupIds } = validation.data

        const student = await prisma.student.create({
            data: {
                name,
                phone,
                email: email || null,
                groups: groupIds ? {
                    connect: groupIds.map(id => ({ id }))
                } : undefined
            }
        })

        return NextResponse.json({ success: true, data: student })
    } catch (error) {
        console.error('Create Student Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to create student' }, { status: 500 })
    }
}
