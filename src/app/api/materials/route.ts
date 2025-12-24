import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const materials = await prisma.material.findMany({
            include: {
                course: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, data: materials });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, type, url, courseId } = body;

        const material = await prisma.material.create({
            data: {
                title,
                type,
                url,
                courseId: Number(courseId)
            }
        });

        return NextResponse.json({ success: true, data: material });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
