'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                // Redirect to admin dashboard
                // Redirect based on role
                if (data.user?.role === 'TEACHER') {
                    window.location.href = '/teacher'
                } else {
                    window.location.href = '/admin'
                }
            } else {
                setError(data.error || 'Ошибка входа')
            }
        } catch (err) {
            setError('Ошибка сети')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl">
                        A
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text)]">Админ-панель</h1>
                    <p className="text-[var(--text-muted)]">AngloClub Astana CRM</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Войти
                    </Button>
                </form>
            </Card>
        </div>
    )
}
