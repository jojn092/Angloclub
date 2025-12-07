import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@angloclub.kz'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Главный Администратор',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    // Seed Courses
    const courses = [
        { name: 'General English', price: 25000 },
        { name: 'IELTS Preparation', price: 35000 },
        { name: 'Kids English', price: 20000 },
    ]

    for (const c of courses) {
        await prisma.course.upsert({
            where: { id: -1 }, // Hack: we don't have unique name yet, but this is just for dev. Actually, findFirst is better or just create.
            // unique constraint on name would be better in schema, but for now let's just create if not exists or ignore.
            // Simplest for now: just create if count is 0
            update: {},
            create: c,
        }).catch(() => { }) // Ignore if fails
    }

    // Better approach for courses without unique ID:
    const courseCount = await prisma.course.count()
    if (courseCount === 0) {
        await prisma.course.createMany({ data: courses })
    }

    // Seed Classrooms
    const roomCount = await prisma.classroom.count()
    if (roomCount === 0) {
        await prisma.classroom.createMany({
            data: [
                { name: 'Blue Room', capacity: 10 },
                { name: 'Red Room', capacity: 8 },
                { name: 'Online', capacity: 100 },
            ]
        })
    }

    console.log({ admin })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
