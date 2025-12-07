'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

interface AccordionItem {
    id: string
    title: string
    content: string
}

interface AccordionProps {
    items: AccordionItem[]
    allowMultiple?: boolean
    className?: string
}

export default function Accordion({
    items,
    allowMultiple = false,
    className,
}: AccordionProps) {
    const [openItems, setOpenItems] = useState<string[]>([])

    const toggleItem = (id: string) => {
        if (allowMultiple) {
            setOpenItems((prev) =>
                prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id]
            )
        } else {
            setOpenItems((prev) =>
                prev.includes(id) ? [] : [id]
            )
        }
    }

    const isOpen = (id: string) => openItems.includes(id)

    return (
        <div className={clsx('space-y-3', className)}>
            {items.map((item) => (
                <div
                    key={item.id}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden"
                >
                    <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--surface-hover)] transition-colors"
                    >
                        <span className="font-medium text-[var(--text)]">
                            {item.title}
                        </span>
                        <ChevronDown
                            className={clsx(
                                'w-5 h-5 text-[var(--text-muted)] transition-transform duration-200',
                                isOpen(item.id) && 'rotate-180'
                            )}
                        />
                    </button>
                    <div
                        className={clsx(
                            'overflow-hidden transition-all duration-300',
                            isOpen(item.id) ? 'max-h-96' : 'max-h-0'
                        )}
                    >
                        <div className="p-4 pt-0 text-[var(--text-muted)] leading-relaxed">
                            {item.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
