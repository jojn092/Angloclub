import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Define protected paths
    const isAdminPath = pathname.startsWith('/admin')
    const isTeacherPath = pathname.startsWith('/teacher')
    const isProtected = isAdminPath || isTeacherPath || pathname.startsWith('/api/leads')

    // 2. Exclude public paths
    if (pathname === '/admin/login') {
        return NextResponse.next()
    }

    if (!isProtected) {
        return NextResponse.next()
    }

    // 3. Verify auth token
    const token = request.cookies.get('auth_token')?.value
    const user = token ? await verifyToken(token) : null

    if (!user) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        // Redirect to login
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // 4. Role-based Access Control (RBAC)
    if (isAdminPath && user.role !== 'ADMIN' && user.role !== 'MANAGER' && user.role !== 'SUPER_ADMIN') {
        // Teachers cannot access /admin
        if (user.role === 'TEACHER') {
            return NextResponse.redirect(new URL('/teacher', request.url))
        }
        // Others (unknown role?)
        return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (isTeacherPath && user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        // Only teachers (and admins for debugging) can (or should?) access /teacher
        // Actually Admins might want to see teacher view, so allowing ADMIN is good.
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/teacher/:path*',
        '/api/admin/:path*',
        '/api/leads/:path*',
    ],
}
