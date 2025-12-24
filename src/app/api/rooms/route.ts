import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const rooms = await prisma.classroom.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json({ success: true, data: rooms });
    } catch (error) {
        console.error('Failed to fetch rooms:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, capacity } = body;

        const room = await prisma.classroom.create({
            data: {
                name,
                capacity: Number(capacity)
            }
        });

        return NextResponse.json({ success: true, data: room });
    } catch (error) {
        console.error('Failed to create room:', error);
        return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 });
    }
}
