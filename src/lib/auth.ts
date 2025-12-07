import { jwtVerify, SignJWT } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key')
const ALG = 'HS256'

export async function signToken(payload: { id: number; email: string; role: string }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setExpirationTime('24h')
        .sign(SECRET)
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET)
        return payload as { id: number; email: string; role: string }
    } catch (error) {
        return null
    }
}
