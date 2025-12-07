import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const leadId = parseInt(id)

        if (isNaN(leadId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid lead ID' },
                { status: 400 }
            )
        }

        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                notes: { orderBy: { createdAt: 'desc' } },
                logs: { orderBy: { createdAt: 'desc' } },
            },
        })

        if (!lead) {
            return NextResponse.json(
                { success: false, error: 'Lead not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: lead,
        })
    } catch (error) {
        console.error('[Get Lead API] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
