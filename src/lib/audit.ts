import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

/**
 * Logs an action to the database.
 * Tries to identify the current user from the auth_token cookie.
 * 
 * @param action - Short string describing the action (e.g., "CREATE_GROUP")
 * @param details - detailed description (e.g., "Created group 'English A1' with ID 5")
 * @param entityId - (Optional) ID of the related entity if applicable
 */
export async function logAction(action: string, details?: string) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        let userId: number | null = null

        if (token) {
            const user = await verifyToken(token)
            if (user) {
                userId = user.id
            }
        }

        await prisma.log.create({
            data: {
                action,
                details,
                userId,
            }
        })
    } catch (error) {
        // We do not want to fail the main request if logging fails, 
        // but we should output it to console
        console.error('Failed to write audit log:', error)
    }
}
