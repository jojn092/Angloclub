'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LeadForm from '@/components/sections/LeadForm'

const FAQ_ITEMS = [
    {
        question: "Как проходит занятие?",
        answer: "Занятия проходят в интерактивном формате. Мы используем коммуникативную методику, где 80% времени вы говорите. Преподаватель объясняет материал, и вы сразу же закрепляете его на практике через диалоги, игры и обсуждения."
    },
    {
        question: "Сколько человек в группе?",
        answer: "Мы формируем мини-группы до 6 человек. Это позволяет преподавателю уделить достаточно времени каждому студенту, скорректировать произношение и ответить на все вопросы."
    },
    {
        question: "Нужна ли подготовка?",
        answer: "Нет, специальная подготовка не требуется. Мы подберем группу, соответствующую вашему текущему уровню знаний. Для определения уровня мы проводим предварительное тестирование."
    },
    {
        question: "Можно ли перейти между уровнями?",
        answer: "Да, конечно. Если вы чувствуете, что группа для вас слишком легкая или, наоборот, сложная, мы переведем вас в группу подходящего уровня после консультации с преподавателем."
    },
    {
        question: "Сколько стоит пробный урок?",
        answer: "Пробный урок стоит 1500 тенге. Это полноценное занятие, где вы сможете познакомиться с преподавателем, методикой и группой, чтобы принять взвешенное решение."
    }
]

export default function FAQPage() {
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

    const t = (translations.faq || {}) as Record<string, string>

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Header
                translations={translations as Record<string, string>}
                locale={locale}
                onLocaleChange={handleLocaleChange}
                onEnrollClick={handleEnroll}
            />

            <div className="pt-28 pb-16 container mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-8 text-center">{t.title || 'Часто задаваемые вопросы'}</h1>

                <div className="max-w-3xl mx-auto space-y-6">
                    {FAQ_ITEMS.map((item, index) => (
                        <div key={index} className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
                            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{item.question}</h3>
                            <p className="text-[var(--text-muted)] leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            <LeadForm translations={translations} />
            <Footer translations={translations} />
        </main>
    )
}
