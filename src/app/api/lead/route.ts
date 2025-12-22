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
            console.error('[Lead API] Validation failed:', validation.error.flatten())
            return NextResponse.json(
                { success: false, error: 'Invalid input data', details: validation.error.flatten() },
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


        // Helper to escape HTML characters for Telegram
        const escapeHtml = (str: string) => {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
        }

        // Send Telegram notification
        const telegramMessage = `
<b>Новая заявка:</b>
👤 Имя: ${escapeHtml(lead.name)}
📱 Телефон: ${escapeHtml(lead.phone)}
📚 Курс: ${escapeHtml(lead.course)}
💬 Сообщение: ${escapeHtml(lead.message || 'Нет')}
        `.trim()

        if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
            TelegramService.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, telegramMessage).catch((err) => {
                console.error('[Lead API] Failed to send Telegram message:', err)
            })
        } else {
            console.warn('[Lead API] TELEGRAM_ADMIN_CHAT_ID is not defined in .env. Notification skipped.')
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
