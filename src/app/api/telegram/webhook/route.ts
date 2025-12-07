import { NextRequest, NextResponse } from 'next/server'
import { TelegramService, TelegramUpdate } from '@/lib/telegram'

// SECRET TOKEN for security (optional but recommended)
// const SECRET_TOKEN = process.env.TELEGRAM_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
    try {
        const update: TelegramUpdate = await req.json()

        // Log for debugging
        console.log('Telegram Webhook:', JSON.stringify(update, null, 2))

        // Process in background (Next.js handling depends on deployment, but await here is safer for Vercel functions/lambdas)
        await TelegramService.handleUpdate(update)

        return NextResponse.json({ ok: true })

    } catch (error) {
        console.error('Webhook processing error:', error)
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'active', message: 'Telegram Webhook Endpoint' })
}
