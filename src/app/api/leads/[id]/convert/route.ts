import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST: Convert Lead to Student
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Updated to Promise based on Next.js 15+ types if needed, but safe to assume it might be awaited or not depending on version. The user is on recent Next.js.
) {
    try {
        const { id } = await params // Await params if using Next.js 15
        const leadId = parseInt(id)

        if (isNaN(leadId)) {
            return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
        }

        // 1. Get the lead
        const lead = await prisma.lead.findUnique({
            where: { id: leadId }
        })

        if (!lead) {
            return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
        }

        // 2. Check if already converted
        const existingStudent = await prisma.student.findUnique({
            where: { leadId }
        })

        if (existingStudent) {
            return NextResponse.json({ success: false, error: 'Lead already converted' }, { status: 400 })
        }

        // 3. Transaction: Create Student + Update Lead + Create Log
        const result = await prisma.$transaction(async (tx) => {
            // Create Student
            const student = await tx.student.create({
                data: {
                    name: lead.name,
                    phone: lead.phone,
                    leadId: lead.id,
                }
            })

            // Update Lead status
            await tx.lead.update({
                where: { id: leadId },
                data: { status: 'won' }
            })

            // Log
            await tx.leadLog.create({
                data: {
                    leadId,
                    action: 'CONVERTED',
                    details: `Converted to Student (ID: ${student.id})`
                }
            })

            return student
        })

        return NextResponse.json({ success: true, data: result })

    } catch (error) {
        console.error('Conversion error:', error)
        return NextResponse.json(
            { success: false, error: 'Conversion failed' },
            { status: 500 }
        )
    }
}
