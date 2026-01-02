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
    caption?: string
    contact?: TelegramContact
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

export interface TelegramContact {
    phone_number: string
    first_name: string
    last_name?: string
    user_id?: number
}

export interface TelegramCallbackQuery {
    id: string
    from: TelegramUser
    message?: TelegramMessage
    data?: string
}

export interface SendMessageOptions {
    parse_mode?: 'HTML' | 'MarkdownV2'
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove
}

export interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][]
}

export interface InlineKeyboardButton {
    text: string
    url?: string
    callback_data?: string
}

export interface ReplyKeyboardMarkup {
    keyboard: KeyboardButton[][]
    resize_keyboard?: boolean
    one_time_keyboard?: boolean
}

export interface KeyboardButton {
    text: string
    request_contact?: boolean
    request_location?: boolean
}

export interface ReplyKeyboardRemove {
    remove_keyboard: true
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

export class TelegramService {

    /**
     * Send a text message to a chat
     */
    static async sendMessage(chatId: number | string, text: string, options: SendMessageOptions = {}) {
        if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is not defined')

        const body: any = {
            chat_id: chatId,
            text: text,
            parse_mode: options.parse_mode || 'HTML'
        }

        if (options.reply_markup) {
            body.reply_markup = options.reply_markup
        }

        const res = await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
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
        } else if (update.callback_query) {
            await this.processCallback(update.callback_query)
        }
    }

    /**
     * Process a single message
     */
    private static async processMessage(msg: TelegramMessage) {
        const chatId = msg.chat.id.toString()
        const text = msg.text || ''

        // 1. Ensure Chat Exists
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
                    type: msg.chat.type,
                }
            })
        }

        // 2. Handle Commands
        if (text.startsWith('/')) {
            const [command, ...args] = text.split(' ')
            await this.handleCommand(chat, command, args)
        }

        // 3. Save Message History
        await prisma.telegramMessage.create({
            data: {
                chatId: chat.id,
                messageId: msg.message_id,
                text: text,
                isFromBot: false,
                isRead: false
            }
        })
    }

    private static async processCallback(cb: TelegramCallbackQuery) {
        // TODO: Handle button clicks
        console.log('Callback:', cb.data)
    }

    private static async handleCommand(chat: any, command: string, args: string[]) {
        const chatId = chat.chatId

        switch (command) {
            case '/start':
                await this.sendMessage(chatId, `<b>Doing Great!</b>\nДобро пожаловать в AngloClub Bot.\n\nИспользуйте /login чтобы привязать профиль (для учителей и студентов).`)
                break

            case '/help':
                await this.sendMessage(chatId, `Список команд:\n/start - Начать\n/login - Войти в систему\n/help - Помощь`)
                break

            case '/login':
                await this.sendMessage(chatId, `Чтобы привязать аккаунт, отправьте ваш контакт кнопкой ниже:`, {
                    reply_markup: {
                        keyboard: [[{ text: "📱 Отправить контакт", request_contact: true }]],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                })
                break

            default:
                await this.sendMessage(chatId, `Неизвестная команда: ${command}`)
        }
    }
}
