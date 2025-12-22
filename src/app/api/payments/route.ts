import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentSchema } from '@/lib/validations'
import { logAction } from '@/lib/audit'

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
            await tx.student.update({
                where: { id: studentId },
                data: {
                    balance: { increment: amount }
                }
            })

            return payment
        })

        await logAction('CREATE_PAYMENT', `Recorded payment of ${amount} for student ID: ${studentId}`)

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

        // Transaction: Delete Payment + Revert (Decrement) Student Balance
        const deletedPayment = await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({ where: { id: Number(id) } })
            if (!payment) throw new Error('Payment not found')

            await tx.student.update({
                where: { id: payment.studentId },
                data: { balance: { decrement: payment.amount } }
            })

            await tx.payment.delete({ where: { id: Number(id) } })
            return payment
        })

        await logAction('DELETE_PAYMENT', `Deleted payment ID: ${id} (Amount: ${deletedPayment.amount})`)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, amount, ...otherData } = body
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

        const result = await prisma.$transaction(async (tx) => {
            const oldPayment = await tx.payment.findUnique({ where: { id: Number(id) } })
            if (!oldPayment) throw new Error('Payment not found')

            // Calculate diff if amount changed
            if (amount !== undefined && amount !== oldPayment.amount) {
                const diff = amount - oldPayment.amount
                await tx.student.update({
                    where: { id: oldPayment.studentId },
                    data: { balance: { increment: diff } }
                })
            }

            const updatedPayment = await tx.payment.update({
                where: { id: Number(id) },
                data: {
                    amount: amount !== undefined ? amount : undefined,
                    ...otherData,
                    date: otherData.date ? new Date(otherData.date) : undefined
                }
            })
            return updatedPayment
        })

        await logAction('UPDATE_PAYMENT', `Updated payment ID: ${id}`)

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
