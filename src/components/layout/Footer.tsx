'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, Send } from 'lucide-react'

interface FooterProps {
    translations?: Record<string, unknown>
}

export default function Footer({ translations = {} }: FooterProps) {
    const t = translations as Record<string, Record<string, string>>

    const quickLinks = [
        { href: '/about', label: t.nav?.about || 'О школе' },
        { href: '/courses', label: t.nav?.courses || 'Курсы' },
        { href: '/schedule', label: t.nav?.schedule || 'Расписание' },
        { href: '/teachers', label: t.nav?.teachers || 'Преподаватели' },
        { href: '/faq', label: t.nav?.faq || 'FAQ' },
        { href: '/contacts', label: t.nav?.contacts || 'Контакты' },
    ]

    const courseLinks = [
        { href: '/courses/kids', label: 'Для детей' },
        { href: '/courses/teens', label: 'Для подростков' },
        { href: '/courses/adults', label: 'Для взрослых' },
        { href: '/courses/ielts', label: 'IELTS/TOEFL' },
        { href: '/courses/speaking', label: 'Разговорный клуб' },
        { href: '/corporate', label: t.nav?.corporate || 'Для компаний' },
    ]

    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)]" id="contacts">
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Company Info */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                                A
                            </div>
                            <span className="font-bold text-xl text-[var(--text)]">
                                AngloClub
                            </span>
                        </Link>
                        <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
                            Современная языковая школа в центре Астаны.
                            Эффективное обучение английскому для всех возрастов.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://www.instagram.com/angloclub.ast"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-[var(--surface-hover)] hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:text-white flex items-center justify-center text-[var(--text-muted)] transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href="https://2gis.kz/astana/geo/70000001079190548"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-[var(--surface-hover)] hover:bg-green-600 hover:text-white flex items-center justify-center text-[var(--text-muted)] transition-all"
                                aria-label="2GIS"
                            >
                                <MapPin size={20} />
                            </a>
                            <a
                                href="https://t.me/Angloclubkz_bot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-[var(--surface-hover)] hover:bg-[#0088cc] hover:text-white flex items-center justify-center text-[var(--text-muted)] transition-all"
                                aria-label="Telegram Bot"
                            >
                                <Send size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-[var(--text)] mb-4">
                            {t.footer?.links || 'Быстрые ссылки'}
                        </h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Courses */}
                    <div>
                        <h4 className="font-semibold text-[var(--text)] mb-4">
                            {t.nav?.courses || 'Курсы'}
                        </h4>
                        <ul className="space-y-2">
                            {courseLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-[var(--text)] mb-4">
                            {t.nav?.contacts || 'Контакты'}
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-[var(--primary)] shrink-0 mt-0.5" />
                                <span className="text-[var(--text-muted)]">
                                    {t.footer?.address || 'Астана, Бухар Жырау 34/2'}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-[var(--primary)] shrink-0" />
                                <a
                                    href="tel:+77020296315"
                                    className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                >
                                    {t.footer?.phone || '+7 702 029 6315'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-[var(--primary)] shrink-0" />
                                <a
                                    href="mailto:info@angloclub.kz"
                                    className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                >
                                    {t.footer?.email || 'info@angloclub.kz'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock size={20} className="text-[var(--primary)] shrink-0" />
                                <span className="text-[var(--text-muted)]">
                                    {t.footer?.workHours || 'Ежедневно: 9:00 - 21:00'}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[var(--text-muted)]">
                        {t.footer?.copyright || '© 2025 AngloClub Astana. Все права защищены.'}
                    </p>
                    <div className="flex gap-4 text-sm">
                        <Link href="/privacy" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                            Политика конфиденциальности
                        </Link>
                        <Link href="/terms" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                            Условия использования
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
