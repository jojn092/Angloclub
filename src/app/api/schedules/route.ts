import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const templates = await prisma.scheduleTemplate.findMany({
            include: {
                group: { select: { name: true, teacher: { select: { name: true } }, course: { select: { name: true } }, room: { select: { name: true } } } }
            },
            orderBy: { group: { name: 'asc' } }
        });
        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        console.error('Failed to fetch schedule templates:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { groupId, daysOfWeek, startTime, endTime, validFrom, validTo } = body;

        // daysOfWeek expects array of numbers [1, 3, 5], convert to string "1,3,5"
        const daysString = Array.isArray(daysOfWeek) ? daysOfWeek.join(',') : String(daysOfWeek);

        const template = await prisma.scheduleTemplate.create({
            data: {
                groupId: Number(groupId),
                daysOfWeek: daysString,
                startTime,
                endTime,
                validFrom: validFrom ? new Date(validFrom) : new Date(),
                validTo: validTo ? new Date(validTo) : null
            }
        });

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('Failed to create schedule:', error);
        return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
    }
}
