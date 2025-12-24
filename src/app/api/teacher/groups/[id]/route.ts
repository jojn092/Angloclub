import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = Number(params.id);
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== 'TEACHER') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                course: { select: { name: true } },
                students: {
                    select: { id: true, name: true }
                }
            }
        });

        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        // Verify ownership
        if (group.teacherId !== user.id) {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ success: true, data: group });
    } catch (error) {
        console.error('Teacher Group Details Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
