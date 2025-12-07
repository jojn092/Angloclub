import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json() // Changed from password only to email+password

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Введите email и пароль' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Неверный email или пароль' },
                { status: 401 }
            )
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Неверный email или пароль' },
                { status: 401 }
            )
        }

        // Create token
        const token = await signToken({
            id: user.id,
            email: user.email,
            role: user.role
        })

        const response = NextResponse.json({ success: true, user: { name: user.name, role: user.role } })

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500 }
        )
    }
}
