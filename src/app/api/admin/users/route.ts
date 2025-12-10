import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET: List all users
export async function GET(request: Request) {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                password: false // Never return passwords
            }
        })
        return NextResponse.json({ success: true, data: users })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

// POST: Create new user
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password, role } = body

        if (!name || !email || !password || !role) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role, // ADMIN, MANAGER, TEACHER
            },
            select: { id: true, name: true, email: true, role: true }
        })

        return NextResponse.json({ success: true, data: user })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 })
    }
}

// DELETE: Remove user
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))

        await prisma.user.delete({ where: { id } })


        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}

// PUT: Update user
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, name, email, role, password, hourlyRate } = body

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

        const updateData: any = { name, email, role }

        if (hourlyRate !== undefined) updateData.hourlyRate = Number(hourlyRate)

        if (password) {
            updateData.password = await bcrypt.hash(password, 10)
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        })

        return NextResponse.json({ success: true, data: user })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
    }
}
