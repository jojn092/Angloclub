import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const email = 'admin@angloclub.kz'
        const password = 'admin123'
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: 'Admin User'
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
            },
        })

        return NextResponse.json({ success: true, message: 'Admin user seeded successfully', user: { email: user.email, role: user.role } })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
