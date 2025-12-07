'use client'

import { Phone, MessageCircle, ClipboardCheck } from 'lucide-react'
import { clsx } from 'clsx'

interface CTABarProps {
    onEnrollClick: () => void
    whatsappNumber?: string
    onTestClick?: () => void
    className?: string
}

export default function CTABar({
    onEnrollClick,
    whatsappNumber = '+77001234567',
    onTestClick,
    className,
}: CTABarProps) {
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`

    return (
        <div
            className={clsx(
                'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
                'bg-[var(--background)]/95 backdrop-blur-md border-t border-[var(--border)]',
                'px-4 py-3 safe-area-inset-bottom',
                className
            )}
        >
            <div className="flex items-center justify-between gap-2">
                {/* Enroll Button */}
                <button
                    onClick={onEnrollClick}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-accent-light text-white font-semibold text-sm transition-transform active:scale-95"
                >
                    <Phone size={18} />
                    <span>Записаться</span>
                </button>

                {/* WhatsApp Button */}
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white font-semibold text-sm transition-transform active:scale-95"
                >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                </a>

                {/* Test Button */}
                {onTestClick && (
                    <button
                        onClick={onTestClick}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm transition-transform active:scale-95"
                    >
                        <ClipboardCheck size={18} />
                        <span>Тест</span>
                    </button>
                )}
            </div>
        </div>
    )
}
