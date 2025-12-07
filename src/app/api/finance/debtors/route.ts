import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        // Find students with balance < 0
        const debtors = await prisma.student.findMany({
            where: {
                balance: { lt: 0 }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                balance: true,
                groups: {
                    select: { name: true }
                },
                // Optional: Get last payment date to see how "fresh" the debt is
                payments: {
                    orderBy: { date: 'desc' },
                    take: 1,
                    select: { date: true }
                }
            },
            orderBy: {
                balance: 'asc' // Most negative first
            }
        })

        return NextResponse.json({ success: true, data: debtors })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch debtors' }, { status: 500 })
    }
}
