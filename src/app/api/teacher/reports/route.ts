import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'TEACHER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const reports = await prisma.teacherReport.findMany({
            where: { teacherId: decoded.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: reports });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const decoded = await verifyToken(token as string);

        if (!decoded || decoded.role !== 'TEACHER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { period, lessons1h, lessons15h, trials, ielts, speaking, comment } = body;

        // Check availability
        // const existing = await prisma.teacherReport.findFirst({ where: { teacherId: decoded.id, period } });
        // if (existing) return NextResponse.json({ success: false, error: 'Report already exists' }, { status: 400 });

        const report = await prisma.teacherReport.create({
            data: {
                teacherId: decoded.id,
                period,
                lessons1h: parseInt(lessons1h) || 0,
                lessons15h: parseInt(lessons15h) || 0,
                trials: parseInt(trials) || 0,
                ielts: parseInt(ielts) || 0,
                speaking: parseInt(speaking) || 0,
                comment,
                status: 'submitted'
            }
        });

        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
