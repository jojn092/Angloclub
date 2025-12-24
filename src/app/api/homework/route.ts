import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const homework = await prisma.homework.findMany({
            include: {
                course: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, data: homework });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, courseId, deadline } = body;

        const hw = await prisma.homework.create({
            data: {
                title,
                description,
                courseId: Number(courseId),
                deadline: deadline ? new Date(deadline) : null
            }
        });

        return NextResponse.json({ success: true, data: hw });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
