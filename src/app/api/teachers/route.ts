import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER' },
            select: { id: true, name: true, phone: true }
        });
        return NextResponse.json({ success: true, data: teachers });
    } catch (error) {
        console.error('Failed to fetch teachers:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch teachers' }, { status: 500 });
    }
}
