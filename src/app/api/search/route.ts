import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')

        if (!q || q.length < 2) {
            return NextResponse.json({ success: true, data: { students: [], groups: [] } })
        }

        const [students, groups] = await Promise.all([
            prisma.student.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { phone: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 5,
                select: { id: true, name: true, phone: true }
            }),
            prisma.group.findMany({
                where: {
                    name: { contains: q, mode: 'insensitive' }
                },
                take: 5,
                select: { id: true, name: true }
            })
        ])

        return NextResponse.json({ success: true, data: { students, groups } })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
    }
}
