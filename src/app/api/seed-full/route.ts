import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
    try {
        // 1. Seed Courses
        const courses = [
            { name: 'General English', price: 25000 },
            { name: 'IELTS Preparation', price: 35000 },
            { name: 'Kids English', price: 20000 },
        ]

        for (const c of courses) {
            const exists = await prisma.course.findFirst({ where: { name: c.name } })
            if (!exists) {
                await prisma.course.create({ data: c })
            }
        }

        // 2. Seed Classrooms
        const rooms = [
            { name: 'Blue Room', capacity: 10 },
            { name: 'Red Room', capacity: 8 },
            { name: 'Online', capacity: 100 },
        ]

        for (const r of rooms) {
            const exists = await prisma.classroom.findFirst({ where: { name: r.name } })
            if (!exists) {
                await prisma.classroom.create({ data: r })
            }
        }

        // 3. Ensure Admin Exists (fallback)
        const email = 'admin@angloclub.kz'
        const user = await prisma.user.findUnique({ where: { email } })

        return NextResponse.json({
            success: true,
            message: 'Database seeded with Courses and Rooms!',
            stats: {
                courses: await prisma.course.count(),
                rooms: await prisma.classroom.count(),
                adminExists: !!user
            }
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
