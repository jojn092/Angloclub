'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
    const [translations, setTranslations] = useState<Record<string, unknown>>({})
    const [locale, setLocale] = useState('ru')

    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') || 'ru'
        setLocale(savedLocale)
        fetch(`/locales/${savedLocale}.json`)
            .then(res => res.json())
            .then(data => setTranslations(data))
            .catch(() => {
                fetch('/locales/ru.json').then(res => res.json()).then(data => setTranslations(data))
            })
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                translations={translations as Record<string, string>}
                locale={locale}
                onLocaleChange={() => { }}
            />
            <main className="flex-grow max-w-4xl mx-auto px-4 py-12 text-[var(--text)]">
                <h1 className="text-3xl font-bold mb-6">Условия использования – AngloClub.kz</h1>
                <p className="text-[var(--text-secondary)] mb-8">Дата обновления: {new Date().toLocaleDateString('ru-RU')}</p>

                <div className="space-y-6">
                    <p>Используя сайт angloclub.kz, вы соглашаетесь с настоящими Условиями.</p>

                    <section>
                        <h2 className="text-xl font-bold mb-3">1. Описание сервиса</h2>
                        <p>AngloClub предоставляет информацию об услугах языковой школы и позволяет:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>отправлять заявки</li>
                            <li>получать консультации</li>
                            <li>записываться на курсы</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">2. Ответственность</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Мы стремимся обеспечивать точность информации, но не гарантируем отсутствие ошибок.</li>
                            <li>Сайт может временно не работать из-за технических работ.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">3. Обязательства пользователя</h2>
                        <p>Пользователь обязуется:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>предоставлять достоверную информацию при регистрации или заполнении формы</li>
                            <li>не предпринимать действий, нарушающих работу сайта</li>
                            <li>не использовать сайт для рассылки спама или вредоносной активности</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">4. Интеллектуальная собственность</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Все материалы (логотипы, тексты, изображения) являются собственностью AngloClub.</li>
                            <li>Копирование без согласия запрещено.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">5. Изменение условий</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Мы можем обновлять условия без уведомления.</li>
                            <li>Продолжая использование сайта, вы подтверждаете согласие с обновленной версией.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">6. Отказ от ответственности</h2>
                        <p>Мы не несём ответственность за действия пользователей и за сторонние сервисы, на которые может ссылаться сайт.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">7. Контакты</h2>
                        <p>По вопросам использования сайта:</p>
                        <p>📧 angloclub001@gmail.com</p>
                        <p>📞 +7 (702) 029-63-15</p>
                    </section>
                </div>
            </main>
            <Footer translations={translations} />
        </div>
    )
}
