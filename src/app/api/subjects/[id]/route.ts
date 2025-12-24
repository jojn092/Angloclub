import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = Number(params.id);
        await prisma.course.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete course:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete course' }, { status: 500 });
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
        const { name, price } = body;

        const course = await prisma.course.update({
            where: { id },
            data: { name, price: Number(price) }
        });

        return NextResponse.json({ success: true, data: course });
    } catch (error) {
        console.error('Failed to update course:', error);
        return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 });
    }
}
