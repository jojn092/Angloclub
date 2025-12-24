import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = Number(params.id);
        await prisma.classroom.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete room:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete room' }, { status: 500 });
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
        const { name, capacity } = body;

        const room = await prisma.classroom.update({
            where: { id },
            data: { name, capacity: Number(capacity) }
        });

        return NextResponse.json({ success: true, data: room });
    } catch (error) {
        console.error('Failed to update room:', error);
        return NextResponse.json({ success: false, error: 'Failed to update room' }, { status: 500 });
    }
}
