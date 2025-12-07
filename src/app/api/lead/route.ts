import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramNotification } from '@/lib/telegram'
import { leadSchema } from '@/lib/validations'
import { sendEmail, getConfirmationEmailTemplate } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate with Zod
        const validation = leadSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid input data' },
                { status: 400 }
            )
        }

        const { name, phone, course, message } = validation.data

        // Clean phone (optional additional step)
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

        // Create lead and log transactionally
        const lead = await prisma.$transaction(async (tx) => {
            const newLead = await tx.lead.create({
                data: {
                    name,
                    phone: cleanPhone,
                    course,
                    message,
                    status: 'new',
                },
            })

            await tx.leadLog.create({
                data: {
                    leadId: newLead.id,
                    action: 'CREATED',
                    details: 'Lead created via website form',
                },
            })

            return newLead
        })

        // Send Telegram notification
        sendTelegramNotification({
            name: lead.name,
            phone: lead.phone,
            course: lead.course,
            message: lead.message || undefined,
        }).catch(console.error)

        console.log(`[Lead] Created lead #${lead.id}`)

        return NextResponse.json({
            success: true,
            data: {
                id: lead.id,
                message: 'Lead created successfully',
            },
        })
    } catch (error) {
        console.error('[Lead API] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
