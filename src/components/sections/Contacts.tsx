'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react'

interface ContactsProps {
    translations: Record<string, unknown>
}

export default function Contacts({ translations }: ContactsProps) {
    const t = (translations.contacts || {}) as Record<string, string>
    const f = (translations.footer || {}) as Record<string, string>

    return (
        <section className="py-20 bg-[var(--background)]" id="contacts">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text)]">
                        {t.title || 'Контакты'}
                    </h2>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
                        {t.map || 'Мы находимся в центре города. Приходите на пробный урок!'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                    {/* Contact Info */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-8 text-[var(--text)]">
                            {f.links || 'Свяжитесь с нами'}
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--text)] mb-1">Адрес</p>
                                    <p className="text-[var(--text-muted)]">
                                        {f.address || 'Астана, Бухар Жырау 34/2'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--text)] mb-1">Телефон</p>
                                    <a href="tel:+77020296315" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                                        {f.phone || '+7 (702) 029 6315'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--text)] mb-1">Email</p>
                                    <a href="mailto:info@angloclub.kz" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                                        {f.email || 'info@angloclub.kz'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--text)] mb-1">График работы</p>
                                    <p className="text-[var(--text-muted)]">
                                        {f.workHours || 'Пн-Сб: 9:00 - 21:00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="h-[400px] lg:h-auto bg-[var(--surface-hover)] relative">
                        {/* 2GIS Widget */}
                        <iframe
                            className="absolute inset-0 w-full h-full border-0"
                            src="https://widgets.2gis.com/widget?type=firmsonmap&firms=70000001079190548"
                            title="AngloClub Location"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
