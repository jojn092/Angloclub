'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            className,
            type = 'text',
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false)
        const isPassword = type === 'password'

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={isPassword && showPassword ? 'text' : type}
                        className={clsx(
                            'w-full px-4 py-3 rounded-lg border bg-[var(--surface)] text-[var(--text)]',
                            'placeholder:text-[var(--text-light)]',
                            'transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
                            error
                                ? 'border-[var(--error)] focus:ring-[var(--error)]'
                                : 'border-[var(--border)]',
                            leftIcon && 'pl-10',
                            (rightIcon || isPassword) && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    )}
                    {rightIcon && !isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-[var(--text-muted)]">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
