import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = Number(params.id);
        await prisma.group.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete group:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete group' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = Number(params.id);
        const body = await request.json();
        const { name, courseId, teacherId, roomId, level } = body;

        const group = await prisma.group.update({
            where: { id },
            data: {
                name,
                courseId: Number(courseId),
                teacherId: Number(teacherId),
                roomId: roomId ? Number(roomId) : null,
                level: level
            }
        });

        return NextResponse.json({ success: true, data: group });
    } catch (error) {
        console.error('Failed to update group:', error);
        return NextResponse.json({ success: false, error: 'Failed to update group' }, { status: 500 });
    }
}
