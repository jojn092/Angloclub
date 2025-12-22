'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LeadForm from '@/components/sections/LeadForm'

const FAQ_ITEMS = [
    {
        question: "Где проходят занятия?",
        answer: "Наши занятия проходят в центре Астаны по адресу: ул. Бухар Жырау 34/2. Мы находимся в удобном месте с хорошей транспортной доступностью."
    },
    {
        question: "Как записаться на пробный урок?",
        answer: "Вы можете записаться на бесплатный пробный урок, оставив заявку на нашем сайте или позвонив по телефону +7 702 029 6315."
    },
    {
        question: "Какой график занятий?",
        answer: "Мы работаем ежедневно с 9:00 до 21:00. График занятий составляется индивидуально или в зависимости от расписания выбранной группы."
    },
    {
        question: "Сколько человек в группе?",
        answer: "Мы формируем мини-группы до 6 человек, чтобы уделить максимум внимания каждому студенту."
    },
    {
        question: "Выдаете ли вы сертификат?",
        answer: "Да, по окончании курса и успешной сдаче финального теста вы получаете сертификат, подтверждающий ваш уровень владения языком."
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
