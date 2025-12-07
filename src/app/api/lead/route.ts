import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TelegramService } from '@/lib/telegram'
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
        // Send Telegram notification
        const telegramMessage = `
<b>Новая заявка:</b>
👤 Имя: ${lead.name}
📱 Телефон: ${lead.phone}
📚 Курс: ${lead.course}
💬 Сообщение: ${lead.message || 'Нет'}
        `.trim()

        // Send to Admin Chat (you need to define ADMIN_CHAT_ID in env or logic)
        // For now, let's skip or hardcode if we know it, or just use the service if implemented correctly.
        // Actually the old function handled formatting.

        // Better approach: Re-implement sendTelegramNotification as a wrapper around TelegramService
        // OR update this code to manually format.
        // Since we don't have a single target chat ID (admin group), the previous implementation likely sent to a specific ENV var.

        if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
            TelegramService.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, telegramMessage).catch(console.error)
        }

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
