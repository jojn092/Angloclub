/**
 * Telegram Bot Integration
 * Sends notifications to admin when new leads are created
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

interface TelegramMessage {
    name: string
    phone: string
    course: string
    message?: string
}

export async function sendTelegramNotification(data: TelegramMessage): Promise<boolean> {
    // Skip if not configured
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
        console.log('[Telegram] Bot not configured, skipping notification')
        return false
    }

    const text = `
🆕 *Новая заявка на сайте!*

👤 *Имя:* ${escapeMarkdown(data.name)}
📱 *Телефон:* ${escapeMarkdown(data.phone)}
📚 *Курс:* ${escapeMarkdown(data.course)}
${data.message ? `💬 *Сообщение:* ${escapeMarkdown(data.message)}` : ''}

⏰ ${new Date().toLocaleString('ru-KZ', { timeZone: 'Asia/Almaty' })}
  `.trim()

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_ADMIN_CHAT_ID,
                    text,
                    parse_mode: 'Markdown',
                }),
            }
        )

        if (!response.ok) {
            const error = await response.text()
            console.error('[Telegram] Failed to send message:', error)
            return false
        }

        console.log('[Telegram] Notification sent successfully')
        return true
    } catch (error) {
        console.error('[Telegram] Error sending notification:', error)
        return false
    }
}

function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}
