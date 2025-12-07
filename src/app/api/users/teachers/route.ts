import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                role: { in: ['TEACHER', 'ADMIN', 'MANAGER'] }
            },
            select: { id: true, name: true, role: true },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(teachers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
    }
}
