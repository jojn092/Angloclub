import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const rooms = await prisma.classroom.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(rooms)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
    }
}
