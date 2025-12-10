import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // "YYYY-MM"

        const startOfMonth = new Date(`${month}-01`)
        const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1))

        // 1. Fetch all teachers with their groups, hourly rate, and salary records for the month
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER' },
            select: {
                id: true,
                name: true,
                hourlyRate: true, // Assuming hourlyRate is directly on the User model
                groups: {
                    select: { id: true }
                },
                salary: {
                    where: { period: month },
                    select: { id: true, amount: true, paid: true, period: true }
                }
            }
        })

        // 2. Fetch all completed lessons for the month
        const lessons = await prisma.lesson.findMany({
            where: {
                date: {
                    gte: startOfMonth,
                    lt: endOfMonth
                },
                isCompleted: true
            },
            select: {
                groupId: true,
                duration: true // Assuming duration is in minutes
            }
        })

        // 3. Process each teacher
        const payroll = teachers.map(teacher => {
            // Find lessons for this teacher
            const teacherGroupIds = teacher.groups.map(g => g.id)
            const teacherLessons = lessons.filter(l => teacherGroupIds.includes(l.groupId))

            // Calculate Salary
            // Logic: Sum of (Duration / 60) * HourlyRate
            const totalMinutes = teacherLessons.reduce((acc, l) => acc + l.duration, 0)
            const hoursWorked = totalMinutes / 60
            const calculatedSalary = Math.round(hoursWorked * teacher.hourlyRate)

            // Check if already paid for this month
            // We look for a Salary record for this user and period
            // Simple check: if any salary record exists for this month? 
            // Better: find salary record by period string
            const salaryRecord = teacher.salary.find(s => s.period === month)

            return {
                teacherId: teacher.id,
                teacherName: teacher.name,
                hourlyRate: teacher.hourlyRate,
                lessonCount: teacherLessons.length,
                hoursWorked: Number(hoursWorked.toFixed(1)),
                calculatedSalary,
                status: salaryRecord ? (salaryRecord.paid ? 'PAID' : 'PENDING') : 'UNPAID',
                paidAmount: salaryRecord ? salaryRecord.amount : 0,
                salaryId: salaryRecord?.id
            }
        })

        return NextResponse.json({ success: true, data: payroll })
    } catch (error) {
        console.error('Payroll Error:', error)
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, amount, period } = body

        if (!userId || !amount || !period) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        // Transaction: Create Salary + Create Expense
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create/Update Salary Record
            // We assume one salary payment per month per teacher for simplicity
            const salary = await tx.salary.create({
                data: {
                    userId,
                    amount: Number(amount),
                    period,
                    paid: true
                }
            })

            // 2. Create Expense Record (DDS)
            await tx.expense.create({
                data: {
                    amount: Number(amount),
                    category: 'Salary',
                    description: `Зарплата за ${period} (ID: ${userId})`,
                    date: new Date()
                }
            })

            return salary
        })

        return NextResponse.json({ success: true, data: result })

    } catch (error) {
        console.error('Pay Salary Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to process payment' }, { status: 500 })
    }
}


export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { userId, amount, period } = body

        // Find salary record
        const salary = await prisma.salary.findFirst({
            where: { userId, period }
        })

        if (!salary) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })

        const updated = await prisma.salary.update({
            where: { id: salary.id },
            data: { amount: Number(amount) }
        })

        // Note: We are NOT updating the linked Expense automatically because we don't have the ID.
        // This is a trade-off. User handles Expense separately in Finance tab.

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const period = searchParams.get('period')

        if (!userId || !period) return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 })

        const salary = await prisma.salary.findFirst({
            where: { userId: Number(userId), period }
        })

        if (!salary) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })

        await prisma.salary.delete({ where: { id: salary.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
