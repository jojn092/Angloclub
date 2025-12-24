import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ user: null });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ user: null });

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { name: true, role: true, email: true, phone: true }
        });

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, email, phone } = body;

        await prisma.user.update({
            where: { id: decoded.id },
            data: {
                name: name || undefined,
                email: email || undefined,
                phone: phone || undefined
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
    }
}
