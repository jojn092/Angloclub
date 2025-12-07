import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
    req: NextRequest,
    // params is a Promise in Next.js 16+? No, in 13/14 it's simple object, but recently strictly typed as Promise. All previous route.ts fixes treated it as Promise.
    // However, for GET requests, we can also extract from context. 
    // But since `props.params` is the standard way...  let's use the context argument.
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const chatId = parseInt(params.id)

        const messages = await prisma.telegramMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(messages)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}
