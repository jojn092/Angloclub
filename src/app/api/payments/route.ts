import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentSchema } from '@/lib/validations'

// GET: Fetch recent payments
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const studentId = searchParams.get('studentId')

        const where = studentId ? { studentId: Number(studentId) } : {}

        const payments = await prisma.payment.findMany({
            where,
            include: { student: { select: { name: true } } },
            orderBy: { date: 'desc' },
            take: 50
        })

        return NextResponse.json({ success: true, data: payments })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch payments' }, { status: 500 })
    }
}

// POST: Create a new payment
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = paymentSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 })
        }

        const { studentId, amount, method, comment, date } = validation.data

        // Transaction: Create Payment + Update Student Balance
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Payment
            const payment = await tx.payment.create({
                data: {
                    studentId,
                    amount,
                    method,
                    comment,
                    date: date ? new Date(date) : undefined
                }
            })

            // 2. Update Student Balance (Increment balance)
            // Assuming positive balance means they have money or paid. 
            // Usually, "Balance" tracks credit. 
            // If Student "buys" a course, balance goes DOWN (negative).
            // If Student "pays", balance goes UP (positive/zero).
            // Let's assume logical flow: Balance starts at 0. Payment adds to balance.
            await tx.student.update({
                where: { id: studentId },
                data: {
                    balance: { increment: amount }
                }
            })

            return payment
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 })
    }
}
