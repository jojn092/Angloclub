import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expenseSchema } from '@/lib/validations'

export async function GET(request: Request) {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            take: 100
        })
        return NextResponse.json({ success: true, data: expenses })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = expenseSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.message }, { status: 400 })
        }

        const expense = await prisma.expense.create({
            data: {
                ...validation.data,
                date: validation.data.date ? new Date(validation.data.date) : undefined
            }
        })

        return NextResponse.json({ success: true, data: expense })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
