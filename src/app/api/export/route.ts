import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const secret = searchParams.get('secret')
        const format = searchParams.get('format') || 'csv'
        const status = searchParams.get('status')
        const fromDate = searchParams.get('from')
        const toDate = searchParams.get('to')

        // Validate secret
        const exportSecret = process.env.EXPORT_SECRET || 'secret123'
        if (secret !== exportSecret) {
            return NextResponse.json(
                { success: false, error: 'Invalid secret' },
                { status: 401 }
            )
        }

        // Build where clause
        const where: Record<string, unknown> = {}

        if (status && status !== 'all') {
            where.status = status
        }

        if (fromDate || toDate) {
            where.createdAt = {}
            if (fromDate) {
                (where.createdAt as Record<string, Date>).gte = new Date(fromDate)
            }
            if (toDate) {
                (where.createdAt as Record<string, Date>).lte = new Date(toDate)
            }
        }

        // Get leads
        const leads = await prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        // Format data for export
        const data = leads.map((lead) => ({
            ID: lead.id,
            'Имя': lead.name,
            'Телефон': lead.phone,
            'Курс': lead.course,
            'Статус': lead.status === 'new' ? 'Новая' :
                lead.status === 'processing' ? 'В обработке' : 'Записан',
            'Сообщение': lead.message || '',
            'Дата создания': lead.createdAt.toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
        }))

        if (format === 'xlsx') {
            // Generate XLSX
            const worksheet = XLSX.utils.json_to_sheet(data)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Заявки')

            // Set column widths
            worksheet['!cols'] = [
                { wch: 5 },  // ID
                { wch: 20 }, // Имя
                { wch: 15 }, // Телефон
                { wch: 30 }, // Курс
                { wch: 15 }, // Статус
                { wch: 40 }, // Сообщение
                { wch: 20 }, // Дата
            ]

            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().split('T')[0]}.xlsx"`,
                },
            })
        } else {
            // Generate CSV
            const headers = Object.keys(data[0] || {})
            const csv = [
                headers.join(','),
                ...data.map((row) =>
                    headers.map((h) => {
                        const value = String(row[h as keyof typeof row] || '')
                        // Escape quotes and wrap in quotes if contains comma
                        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                            return `"${value.replace(/"/g, '""')}"`
                        }
                        return value
                    }).join(',')
                ),
            ].join('\n')

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().split('T')[0]}.csv"`,
                },
            })
        }
    } catch (error) {
        console.error('[Export API] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
