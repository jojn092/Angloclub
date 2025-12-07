'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Sun, Moon, Globe, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import Button from '../ui/Button'

const navItems = [
    { href: '/', label: 'nav.home' },
    { href: '/about', label: 'nav.about' },
    { href: '/courses', label: 'nav.courses' },
    { href: '/schedule', label: 'nav.schedule' },
    { href: '/teachers', label: 'nav.teachers' },
    { href: '/contacts', label: 'nav.contacts' },
]

const languages = [
    { code: 'ru', label: 'Русский' },
    { code: 'kz', label: 'Қазақша' },
    { code: 'en', label: 'English' },
]

interface HeaderProps {
    translations?: Record<string, string>
    locale?: string
    onLocaleChange?: (locale: string) => void
}

export default function Header({ translations = {}, locale = 'ru', onLocaleChange = () => { } }: HeaderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDark, setIsDark] = useState(false)
    const [showLangMenu, setShowLangMenu] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const theme = document.documentElement.getAttribute('data-theme')
        setIsDark(theme === 'dark')
    }, [])

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('theme', newTheme)
        setIsDark(!isDark)
    }

    const getTranslation = (key: string) => {
        const keys = key.split('.')
        let value: unknown = translations
        for (const k of keys) {
            value = (value as Record<string, unknown>)?.[k]
        }
        return (value as string) || key
    }

    return (
        <header
            className={clsx(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-[var(--background)]/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                            A
                        </div>
                        <span className={clsx(
                            'font-bold text-xl hidden sm:block',
                            isScrolled ? 'text-[var(--text)]' : 'text-white'
                        )}>
                            AngloClub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'px-4 py-2 rounded-lg font-medium transition-colors',
                                    isScrolled
                                        ? 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                )}
                            >
                                {getTranslation(item.label)}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className={clsx(
                                    'flex items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                                    isScrolled
                                        ? 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                )}
                            >
                                <Globe size={18} />
                                <span className="uppercase text-sm font-medium">{locale}</span>
                                <ChevronDown size={14} />
                            </button>
                            {showLangMenu && (
                                <div className="absolute right-0 mt-2 w-36 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                onLocaleChange(lang.code)
                                                setShowLangMenu(false)
                                            }}
                                            className={clsx(
                                                'w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors',
                                                locale === lang.code ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text)]'
                                            )}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={clsx(
                                'p-2 rounded-lg transition-colors',
                                isScrolled
                                    ? 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                                    : 'text-white/90 hover:text-white hover:bg-white/10'
                            )}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* CTA Button */}
                        <Button
                            variant="accent"
                            size="sm"
                            className="hidden sm:flex"
                        >
                            {getTranslation('hero.cta')}
                        </Button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={clsx(
                                'lg:hidden p-2 rounded-lg transition-colors',
                                isScrolled
                                    ? 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                                    : 'text-white hover:bg-white/10'
                            )}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={clsx(
                    'lg:hidden fixed inset-x-0 top-16 bg-[var(--background)] border-t border-[var(--border)] transition-all duration-300 overflow-hidden',
                    isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <nav className="container mx-auto px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-lg text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                        >
                            {getTranslation(item.label)}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-[var(--border)]">
                        <Button variant="accent" className="w-full">
                            {getTranslation('hero.cta')}
                        </Button>
                    </div>
                </nav>
            </div>
        </header>
    )
}
