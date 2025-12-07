import { NextRequest, NextResponse } from 'next/server'
import { TelegramService } from '@/lib/telegram'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { chatId, text, dbChatId } = body

        if (!chatId || !text) {
            return NextResponse.json({ error: 'Missing chatId or text' }, { status: 400 })
        }

        // 1. Send to Telegram
        await TelegramService.sendMessage(chatId, text)

        // 2. Save to DB (Outgoing message)
        let internalChatId = dbChatId

        // If we only have external chatId, find the internal ID
        if (!internalChatId) {
            const chat = await prisma.telegramChat.findUnique({
                where: { chatId: chatId.toString() }
            })
            if (chat) internalChatId = chat.id
        }

        if (internalChatId) {
            await prisma.telegramMessage.create({
                data: {
                    chatId: internalChatId,
                    text,
                    isFromBot: true,
                    isRead: true
                }
            })
        }

        return NextResponse.json({ ok: true })

    } catch (error: any) {
        console.error('Send API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
