'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const [translations, setTranslations] = useState<Record<string, unknown>>({})
    const [locale, setLocale] = useState('ru')
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const checkLocale = async () => {
            const savedLocale = localStorage.getItem('locale') || 'ru'
            setLocale(savedLocale)
            try {
                const res = await fetch(`/locales/${savedLocale}.json`)
                if (res.ok) {
                    const data = await res.json()
                    setTranslations(data)
                } else {
                    // Fallback
                    const fb = await fetch('/locales/ru.json')
                    if (fb.ok) setTranslations(await fb.json())
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoaded(true)
            }
        }
        checkLocale()
    }, [])

    // Prevent hydration mismatch or white screen by rendering simplified header first if needed
    // But Header handles empty translations gracefully now.

    const tCommon = (translations.common || {}) as Record<string, string>

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                translations={translations as Record<string, string>}
                locale={locale}
                onLocaleChange={(l) => {
                    localStorage.setItem('locale', l)
                    window.location.reload() // Simple reload for now
                }}
            />
            {children}
            <Footer translations={translations} />
        </div>
    )
}
