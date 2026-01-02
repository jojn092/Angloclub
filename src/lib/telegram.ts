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

        // 2. Handle Contact Sharing
        if (msg.contact) {
            await this.handleContact(chat, msg.contact)
            return
        }

        // 3. Handle Commands
        if (text.startsWith('/')) {
            const [command, ...args] = text.split(' ')
            await this.handleCommand(chat, command, args)
        }

        // 4. Save Message History
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

    private static async handleContact(chat: any, contact: TelegramContact) {
        let phone = contact.phone_number.replace(/\+/g, '').replace(/\s/g, '')

        // Try to find User (Teacher/Admin)
        const user = await prisma.user.findFirst({
            where: { phone: { contains: phone } } // Loose match or exact match depending on format
        })

        if (user) {
            await prisma.telegramChat.update({
                where: { id: chat.id },
                data: {
                    userId: user.id,
                    firstName: user.name,
                    type: 'teacher'
                }
            })
            await this.sendMessage(chat.chatId, `✅ <b>Успешно!</b>\nВы авторизованы как преподаватель: <b>${user.name}</b>`)
            return
        }

        // Try to find Student
        const student = await prisma.student.findFirst({
            where: { phone: { contains: phone } }
        })

        if (student) {
            await prisma.telegramChat.update({
                where: { id: chat.id },
                data: {
                    studentId: student.id,
                    firstName: student.name,
                    type: 'student'
                }
            })
            await this.sendMessage(chat.chatId, `✅ <b>Успешно!</b>\nВы авторизованы как студент: <b>${student.name}</b>`)
            return
        }

        // Not found
        await this.sendMessage(chat.chatId, `❌ <b>Ошибка</b>\nНомер ${phone} не найден в базе. Обратитесь к администратору.`)
    }

    private static async processCallback(cb: TelegramCallbackQuery) {
        if (!cb.data) return
        const chatId = cb.from.id

        // 1. Show Student List for Lesson
        if (cb.data.startsWith('mark_lesson_')) {
            const lessonId = Number(cb.data.split('_')[2])

            const lesson = await prisma.lesson.findUnique({
                where: { id: lessonId },
                include: {
                    group: { include: { students: true } },
                    attendance: true
                }
            })

            if (!lesson) return

            // Generate buttons for each student
            const buttons: InlineKeyboardButton[][] = lesson.group.students.map(student => {
                const att = lesson.attendance.find(a => a.studentId === student.id)
                const statusIcon = att?.status === 'PRESENT' ? '✅' : att?.status === 'ABSENT' ? '❌' : '❔'

                return [{
                    text: `${statusIcon} ${student.name}`,
                    callback_data: `att_${lesson.id}_${student.id}_${att?.status === 'PRESENT' ? 'ABSENT' : 'PRESENT'}`
                }]
            })

            // Add "Back" button
            buttons.push([{ text: '🔙 Назад к списку', callback_data: 'att_back' }])

            // Edit message
            await fetch(`${API_URL}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: cb.message?.message_id,
                    text: `📝 <b>Отметка посещаемости:</b>\nГруппа: ${lesson.group.name}\nВремя: ${lesson.date.toLocaleTimeString()}`,
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: buttons }
                })
            })
        }

        // 2. Toggle Student Status
        if (cb.data.startsWith('att_') && !cb.data.startsWith('att_back')) {
            const [_, lessonIdStr, studentIdStr, newStatus] = cb.data.split('_')
            const lessonId = Number(lessonIdStr)
            const studentId = Number(studentIdStr)

            // Upsert Attendance
            const existing = await prisma.attendance.findFirst({
                where: { lessonId, studentId }
            })

            if (existing) {
                await prisma.attendance.update({
                    where: { id: existing.id },
                    data: { status: newStatus }
                })
            } else {
                await prisma.attendance.create({
                    data: { lessonId, studentId, status: newStatus }
                })
            }

            // Re-render buttons (Optimistic update logic or re-fetch)
            // Ideally we re-fetch to be safe and consistent
            // Calling processCallback recursively with 'mark_lesson_' to re-render
            await this.processCallback({ ...cb, data: `mark_lesson_${lessonId}` })
        }

        // 3. Back Button
        if (cb.data === 'att_back') {
            await this.sendMessage(chatId, 'Используйте /attendance, чтобы начать заново.')
        }

        // Answer Callback to stop loading animation
        await fetch(`${API_URL}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: cb.id })
        })
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

            case '/schedule':
                if (!chat.userId) {
                    await this.sendMessage(chatId, `❌ Вы не авторизованы. Нажмите /login`)
                    return
                }

                // Get today and tomorrow range
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const tomorrowEnd = new Date(today)
                tomorrowEnd.setDate(tomorrowEnd.getDate() + 2) // End of tomorrow

                const lessons = await prisma.lesson.findMany({
                    where: {
                        group: { teacherId: chat.userId },
                        date: {
                            gte: today,
                            lt: tomorrowEnd
                        }
                    },
                    include: {
                        group: {
                            include: { room: true }
                        }
                    },
                    orderBy: { date: 'asc' }
                })

                if (lessons.length === 0) {
                    await this.sendMessage(chatId, `📅 <b>Расписание</b>\nНа ближайшие 2 дня уроков нет.`)
                    return
                }

                let msg = `📅 <b>Ваше расписание:</b>\n`
                let currentDay = ''

                for (const lesson of lessons) {
                    const dateStr = lesson.date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
                    if (dateStr !== currentDay) {
                        msg += `\n<b>${dateStr}</b>\n`
                        currentDay = dateStr
                    }

                    const time = lesson.date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                    const room = lesson.group.room ? `(Каб. ${lesson.group.room.name})` : ''
                    msg += `• ${time} — <b>${lesson.group.name}</b> ${room}\n`
                }

                await this.sendMessage(chatId, msg)
                break

            case '/attendance':
                if (!chat.userId) {
                    await this.sendMessage(chatId, `❌ Вы не авторизованы.`)
                    return
                }

                const todayAtt = new Date()
                todayAtt.setHours(0, 0, 0, 0)
                const tomorrowAtt = new Date(todayAtt)
                tomorrowAtt.setDate(tomorrowAtt.getDate() + 1)

                const lessonsAtt = await prisma.lesson.findMany({
                    where: {
                        group: { teacherId: chat.userId },
                        date: { gte: todayAtt, lt: tomorrowAtt }
                    },
                    include: { group: true },
                    orderBy: { date: 'asc' }
                })

                if (lessonsAtt.length === 0) {
                    await this.sendMessage(chatId, `🎉 На сегодня уроков больше нет!`)
                    return
                }

                const buttons: InlineKeyboardButton[][] = lessonsAtt.map(l => ([{
                    text: `${l.date.getHours()}:${l.date.getMinutes().toString().padStart(2, '0')} - ${l.group.name}`,
                    callback_data: `mark_lesson_${l.id}`
                }]))

                await this.sendMessage(chatId, `📋 <b>Выберите урок для отметки:</b>`, {
                    reply_markup: { inline_keyboard: buttons }
                })
                break

            case '/salary':
                if (!chat.userId) {
                    await this.sendMessage(chatId, `❌ Вы не авторизованы как учитель.`)
                    return
                }

                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

                // Get Teacher info for hourly rate
                const teacher = await prisma.user.findUnique({
                    where: { id: chat.userId }
                })

                if (!teacher) return

                // Calc completed lessons this month
                const completedLessons = await prisma.lesson.findMany({
                    where: {
                        group: { teacherId: chat.userId },
                        date: { gte: startOfMonth, lte: endOfMonth },
                        isCompleted: true
                    }
                })

                // Logic: Salary = (Total Minutes / 60) * HourlyRate
                const totalMinutes = completedLessons.reduce((acc, l) => acc + l.duration, 0)
                const totalHours = Math.round((totalMinutes / 60) * 10) / 10 // Round to 1 decimal
                const salary = Math.round((totalMinutes / 60) * teacher.hourlyRate)

                await this.sendMessage(chatId,
                    `💰 <b>Ваша зарплата (Оценка):</b>\n\n` +
                    `📅 Период: <b>${now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</b>\n` +
                    `⏱ Часов проведено: <b>${totalHours} ч.</b>\n` +
                    `💳 Ставка: <b>${teacher.hourlyRate} тг/час</b>\n` +
                    `💵 <b>Итого: ~${salary.toLocaleString('ru-RU')} тг</b>`
                )
                break

            default:
                await this.sendMessage(chatId, `Неизвестная команда: ${command}`)
        }
    }
}
