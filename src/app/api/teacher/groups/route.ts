import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== 'TEACHER') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const groups = await prisma.group.findMany({
            where: { teacherId: user.id },
            include: {
                course: { select: { name: true } },
                room: { select: { name: true } },
                _count: { select: { students: true } }
            }
        });

        return NextResponse.json({ success: true, data: groups });
    } catch (error) {
        console.error('Teacher Groups Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
