import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id)

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                course: true,
                teacher: true,
                room: true,
                students: true,
                schedules: true
            }
        })

        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: group })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch group' }, { status: 500 })
    }
}
