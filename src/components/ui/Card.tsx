'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
    children: ReactNode
    className?: string
    variant?: 'default' | 'glass' | 'gradient' | 'hover'
    padding?: 'sm' | 'md' | 'lg' | 'none'
    onClick?: () => void
}

export default function Card({
    children,
    className,
    variant = 'default',
    padding = 'md',
    onClick,
}: CardProps) {
    const variants = {
        default:
            'bg-[var(--surface)] border border-[var(--border)]',
        glass:
            'glass',
        gradient:
            'bg-gradient-to-br from-primary/10 to-secondary/10 border border-[var(--border)]',
        hover:
            'bg-[var(--surface)] border border-[var(--border)] hover:shadow-xl hover:-translate-y-1 cursor-pointer',
    }

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }

    return (
        <div
            className={clsx(
                'rounded-xl transition-all duration-300',
                variants[variant],
                paddings[padding],
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
