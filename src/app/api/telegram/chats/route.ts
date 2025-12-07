import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const chats = await prisma.telegramChat.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                lead: {
                    select: { id: true, name: true, status: true }
                }
            }
        })

        return NextResponse.json(chats)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
    }
}
