import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                _count: { select: { groups: true } }
            },
            orderBy: { id: 'asc' }
        });
        return NextResponse.json({ success: true, data: courses });
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price } = body;

        const course = await prisma.course.create({
            data: {
                name,
                price: Number(price)
            }
        });

        return NextResponse.json({ success: true, data: course });
    } catch (error) {
        console.error('Failed to create course:', error);
        return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 });
    }
}
