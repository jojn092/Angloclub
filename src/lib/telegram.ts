import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Types
export interface TelegramUpdate {
    update_id: number
    message?: TelegramMessage
    callback_query?: TelegramCallbackQuery
}

export interface TelegramMessage {
    message_id: number
    from: TelegramUser
    chat: TelegramChat
    date: number
    text?: string
    photo?: TelegramPhoto[]
    voice?: TelegramVoice
    document?: TelegramDocument
}

export interface TelegramUser {
    id: number
    is_bot: boolean
    first_name: string
    last_name?: string
    username?: string
}

export interface TelegramChat {
    id: number
    type: string
    title?: string
    username?: string
    first_name?: string
    last_name?: string
}

export interface TelegramPhoto {
    file_id: string
    file_unique_id: string
    width: number
    height: number
    file_size?: number
}

export interface TelegramVoice {
    file_id: string
    file_unique_id: string
    duration: number
    mime_type?: string
    file_size?: number
}

export interface TelegramDocument {
    file_id: string
    file_unique_id: string
    file_name?: string
    mime_type?: string
    file_size?: number
}

export interface TelegramCallbackQuery {
    id: string
    from: TelegramUser
    message?: TelegramMessage
    data?: string
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

export class TelegramService {

    /**
     * Send a text message to a chat
     */
    static async sendMessage(chatId: number | string, text: string) {
        if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is not defined')

        const res = await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        })

        if (!res.ok) {
            const err = await res.json()
            console.error('Telegram Send Error:', err)
            throw new Error(`Failed to send message: ${err.description}`)
        }

        return await res.json()
    }

    /**
     * Handle incoming webhook update
     */
    static async handleUpdate(update: TelegramUpdate) {
        if (update.message) {
            await this.processMessage(update.message)
        }
        // Handle callback queries later
    }

    /**
     * Process a single message
     */
    private static async processMessage(msg: TelegramMessage) {
        const chatId = msg.chat.id.toString()
        const text = msg.text || ''
        const type = msg.chat.type

        // 1. Find or create Chat
        let chat = await prisma.telegramChat.findUnique({
            where: { chatId }
        })

        if (!chat) {
            chat = await prisma.telegramChat.create({
                data: {
                    chatId,
                    username: msg.chat.username,
                    firstName: msg.chat.first_name,
                    lastName: msg.chat.last_name,
                    type,
                    photoUrl: '' // TODO: Fetch user profile photo
                }
            })

            // Auto-reply for new users?
            // await this.sendMessage(chatId, "Здравствуйте! Менеджер скоро ответит вам.")
        }

        // 2. Save Message
        await prisma.telegramMessage.create({
            data: {
                chatId: chat.id,
                messageId: msg.message_id,
                text: text,
                isFromBot: false,
                isRead: false,
                // TODO: Handle photos/docs
            }
        })
    }
}
