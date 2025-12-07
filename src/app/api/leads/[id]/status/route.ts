import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadStatusSchema } from '@/lib/validations'

// Simple admin auth check
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth is handled by middleware


    try {
        const { id } = await params
        const leadId = parseInt(id)

        if (isNaN(leadId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid lead ID' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const validation = leadStatusSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            )
        }

        const { status } = validation.data

        // Update lead and log
        const lead = await prisma.$transaction(async (tx) => {
            const updatedLead = await tx.lead.update({
                where: { id: leadId },
                data: { status },
            })

            await tx.leadLog.create({
                data: {
                    leadId,
                    action: 'STATUS_CHANGE',
                    details: `Status changed to ${status}`,
                },
            })

            return updatedLead
        })

        console.log(`[Lead] Updated lead #${lead.id} status to: ${status}`)

        return NextResponse.json({
            success: true,
            data: lead,
        })
    } catch (error) {
        console.error('[Lead Status API] Error:', error)

        // Check if lead not found
        if ((error as { code?: string }).code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Lead not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
