import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0]
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

        const user = await verifyToken(token)
        if (!user) return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 401 })

        // 1. Fetch groups where teacherId == user.id
        // If ADMIN, fetch ALL? Or just "My Groups" for admin acting as teacher?
        // Let's assume ADMIN sees everything or nothing? 
        // For debugging, if admin, let's show all.

        const where = (user.role === 'TEACHER') ? { teacherId: user.id } : {}

        const groups = await prisma.group.findMany({
            where,
            include: {
                course: { select: { name: true } },
                room: { select: { name: true } },
                _count: { select: { students: true } }
            },
            orderBy: { id: 'desc' }
        })

        return NextResponse.json({ success: true, data: groups })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
