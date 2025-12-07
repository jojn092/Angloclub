import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // "YYYY-MM"

        const startOfMonth = new Date(`${month}-01`)
        const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1))

        // 1. Fetch Teachers
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER' },
            select: { id: true, name: true, email: true }
        })

        // 2. Calculate Stats for each teacher
        const data = await Promise.all(teachers.map(async (teacher) => {
            // Count completed lessons
            const lessonCount = await prisma.lesson.count({
                where: {
                    group: { teacherId: teacher.id },
                    date: {
                        gte: startOfMonth,
                        lt: endOfMonth
                    },
                    isCompleted: true
                }
            })

            // Check if already paid for this month
            const salaryRecord = await prisma.salary.findFirst({
                where: {
                    userId: teacher.id,
                    period: month // Assuming exact string match for simplicity
                }
            })

            return {
                teacher,
                lessonCount,
                salary: salaryRecord ? salaryRecord.amount : 0,
                isPaid: !!salaryRecord
            }
        }))

        return NextResponse.json({ success: true, data })

    } catch (error) {
        console.error('Payroll API Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch payroll data' }, { status: 500 })
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
