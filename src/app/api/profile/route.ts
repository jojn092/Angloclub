import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, password } = body;

        // In a real app, we would get the ID from the session/token.
        // For this demo, we'll update the first admin user found or specific ID if provided.
        // Assuming hardcoded user for demo or first user.
        // Let's assume ID 1 is the logged in admin.
        const userId = 1;

        const data: any = { name, email, phone };
        if (password && password.length > 0) {
            // In real app, hash password here
            data.password = password;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data
        });

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const userId = 1;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
