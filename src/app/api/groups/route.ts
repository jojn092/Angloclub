import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const where = search ? {
            name: { contains: search, mode: 'insensitive' as const }
        } : {};

        const groups = await prisma.group.findMany({
            where,
            include: {
                course: true,
                _count: { select: { students: true } },
                teacher: { select: { name: true } },
                room: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, data: groups });
    } catch (error) {
        console.error('Failed to fetch groups:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch groups' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, courseId, teacherId, roomId, level, studentIds } = body;

        const group = await prisma.group.create({
            data: {
                name,
                courseId: Number(courseId),
                teacherId: Number(teacherId),
                roomId: roomId ? Number(roomId) : null,
                level: level || 'General',
                students: studentIds && studentIds.length > 0 ? {
                    connect: studentIds.map((id: number) => ({ id }))
                } : undefined
            }
        });

        return NextResponse.json({ success: true, data: group });
    } catch (error) {
        console.error('Failed to create group:', error);
        return NextResponse.json({ success: false, error: 'Failed to create group' }, { status: 500 });
    }
}
