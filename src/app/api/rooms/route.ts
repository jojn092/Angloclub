import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        let rooms = await prisma.classroom.findMany({
            orderBy: { name: 'asc' }
        })

        if (rooms.length === 0) {
            // Seed Rooms if empty
            await prisma.classroom.createMany({
                data: [
                    { name: 'Room 1 (Big)' },
                    { name: 'Room 2 (Medium)' },
                    { name: 'Room 3 (Small)' }
                ]
            })
            rooms = await prisma.classroom.findMany({ orderBy: { name: 'asc' } })
        }

        return NextResponse.json({ success: true, data: rooms })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch rooms' }, { status: 500 })
    }
}
