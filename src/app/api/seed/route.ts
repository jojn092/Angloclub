import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'angloclub_setup_2025') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@angloclub.kz' }
        });

        if (existingAdmin) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@angloclub.kz',
                password: hashedPassword,
                name: 'Admin',
                role: 'ADMIN',
                isActive: true
            }
        });

        // Also create a Teacher and Manager for testing
        const existingTeacher = await prisma.user.findUnique({ where: { email: 'teacher@angloclub.kz' } });
        if (!existingTeacher) {
            await prisma.user.create({
                data: {
                    email: 'teacher@angloclub.kz',
                    password: await bcrypt.hash('teacher123', 10),
                    name: 'Teacher Demo',
                    role: 'TEACHER',
                    isActive: true
                }
            });
        }

        return NextResponse.json({ success: true, message: 'Users seeded successfully' });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
