import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
    // Auth is handled by middleware


    try {
        const { searchParams } = new URL(request.url)

        // Validate params with Zod
        const result = leadQuerySchema.safeParse(Object.fromEntries(searchParams))

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid parameters' },
                { status: 400 }
            )
        }

        const { page, limit, status, search } = result.data

        // Build where clause
        const where: Record<string, unknown> = {}

        if (status && status !== 'all') {
            where.status = status
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
                { course: { contains: search } },
            ]
        }

        // Get leads with pagination
        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.lead.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                leads,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        })
    } catch (error) {
        console.error('[Leads API] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
