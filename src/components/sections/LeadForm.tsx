'use client'

import { useState } from 'react'
import { Send, MessageCircle, User, Phone, BookOpen, MessageSquareText } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface LeadFormProps {
    translations: Record<string, unknown>
    onSubmit?: (data: FormData) => void
}

interface FormData {
    name: string
    phone: string
    course: string
    message: string
}

const courseOptions = [
    { value: 'kids', label: 'Английский для детей (4-7 лет)' },
    { value: 'teens', label: 'Для подростков (8-16 лет)' },
    { value: 'adults', label: 'Для взрослых (17+ лет)' },
    { value: 'ielts', label: 'IELTS/TOEFL' },
    { value: 'speaking', label: 'Разговорный клуб' },
    { value: 'business', label: 'Бизнес-английский' },
    { value: 'intensive', label: 'Интенсивный курс' },
]

export default function LeadForm({ translations, onSubmit }: LeadFormProps) {
    const t = (translations.form || {}) as Record<string, string>
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        course: '',
        message: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setStatus('idle')

        try {
            const response = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error('Failed to submit')

            setStatus('success')
            setFormData({ name: '', phone: '', course: '', message: '' })
            onSubmit?.(formData)
        } catch {
            setStatus('error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="section bg-[var(--surface)]" id="lead-form">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
                            {t.title || 'Запишитесь на пробный урок'}
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
                    </div>

                    {/* Form Card */}
                    <Card className="relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                        <form onSubmit={handleSubmit} className="relative space-y-5">
                            {/* Name */}
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                label={t.name || 'Ваше имя'}
                                placeholder="Введите ваше имя"
                                leftIcon={<User size={18} />}
                                required
                            />

                            {/* Phone */}
                            <Input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                label={t.phone || 'Телефон'}
                                placeholder="+7 (___) ___-__-__"
                                leftIcon={<Phone size={18} />}
                                required
                            />

                            {/* Course Select */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                                    {t.course || 'Выберите курс'}
                                </label>
                                <div className="relative">
                                    <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <select
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Выберите курс</option>
                                        {courseOptions.map((option) => (
                                            <option key={option.value} value={option.label}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                                    {t.message || 'Сообщение (необязательно)'}
                                </label>
                                <div className="relative">
                                    <MessageSquareText size={18} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Напишите ваш вопрос или пожелание..."
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Status Messages */}
                            {status === 'success' && (
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600">
                                    {t.success || 'Спасибо! Мы свяжемся с вами в ближайшее время.'}
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600">
                                    {t.error || 'Ошибка при отправке. Попробуйте ещё раз.'}
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    type="submit"
                                    variant="accent"
                                    size="lg"
                                    isLoading={isLoading}
                                    leftIcon={<Send size={18} />}
                                    className="flex-1"
                                >
                                    {isLoading ? (t.submitting || 'Отправка...') : (t.submit || 'Отправить заявку')}
                                </Button>

                                <a
                                    href={`https://wa.me/77020296315?text=${encodeURIComponent(`Здравствуйте! Хочу записаться на курс: ${formData.course || 'не выбран'}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button
                                        type="button"
                                        variant="whatsapp"
                                        size="lg"
                                        leftIcon={<MessageCircle size={18} />}
                                        className="w-full"
                                    >
                                        WhatsApp
                                    </Button>
                                </a>
                            </div>

                            {/* Privacy */}
                            <p className="text-xs text-center text-[var(--text-muted)]">
                                {t.privacy || 'Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности'}
                            </p>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    )
}
