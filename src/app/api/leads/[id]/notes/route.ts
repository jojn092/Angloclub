import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const noteSchema = z.object({
    content: z.string().min(1, 'Content is required'),
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const leadId = parseInt(id)

        const body = await request.json()
        const validation = noteSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Content is required' },
                { status: 400 }
            )
        }

        const note = await prisma.note.create({
            data: {
                leadId,
                content: validation.data.content,
                author: 'Admin', // TODO: Get from auth token if available
            },
        })

        return NextResponse.json({
            success: true,
            data: note,
        })
    } catch (error) {
        console.error('[Add Note API] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
