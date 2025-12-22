'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Teachers from '@/components/sections/Teachers'
import LeadForm from '@/components/sections/LeadForm'

export default function TeachersPage() {
    const [translations, setTranslations] = useState<Record<string, unknown>>({})
    const [locale, setLocale] = useState('ru')
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') || 'ru'
        setLocale(savedLocale)
        loadTranslations(savedLocale)
    }, [])

    const loadTranslations = async (lang: string) => {
        try {
            const res = await fetch(`/locales/${lang}.json`)
            if (res.ok) {
                const data = await res.json()
                setTranslations(data)
                setIsLoaded(true)
            }
        } catch (error) {
            console.error('Failed to load translations:', error)
            const res = await fetch('/locales/ru.json')
            if (res.ok) {
                const data = await res.json()
                setTranslations(data)
                setIsLoaded(true)
            }
        }
    }

    const handleLocaleChange = (newLocale: string) => {
        setLocale(newLocale)
        localStorage.setItem('locale', newLocale)
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
        loadTranslations(newLocale)
    }

    const handleEnroll = () => {
        const form = document.getElementById('lead-form')
        if (form) {
            form.scrollIntoView({ behavior: 'smooth' })
        }
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Загрузка...</p>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Header
                translations={translations as Record<string, string>}
                locale={locale}
                onLocaleChange={handleLocaleChange}
                onEnrollClick={handleEnroll}
            />
            <div className="pt-20">
                <Teachers translations={translations} onEnroll={handleEnroll} />
            </div>
            <LeadForm translations={translations} />
            <Footer translations={translations} />
        </main>
    )
}
