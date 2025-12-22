'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { CheckCircle, AlertCircle, ArrowRight, RefreshCcw } from 'lucide-react'

// Questions DB - Simple version
const questions = [
    {
        id: 1,
        question: "I _____ from Kazakhstan.",
        options: ["am", "is", "are", "be"],
        correct: 0,
    },
    {
        id: 2,
        question: "______ you speak English?",
        options: ["Does", "Do", "Is", "Are"],
        correct: 1,
    },
    {
        id: 3,
        question: "She ______ a book right now.",
        options: ["reads", "reading", "is reading", "read"],
        correct: 2,
    },
    {
        id: 4,
        question: "We ______ to the cinema yesterday.",
        options: ["go", "went", "gone", "going"],
        correct: 1,
    },
    {
        id: 5,
        question: "I have ______ been to London.",
        options: ["ever", "never", "did", "didn't"],
        correct: 1,
    },
    {
        id: 6,
        question: "If I ______ you, I would buy that car.",
        options: ["am", "was", "were", "be"],
        correct: 2,
    },
    {
        id: 7,
        question: "This is the hospital ______ I was born.",
        options: ["where", "which", "that", "when"],
        correct: 0,
    },
    {
        id: 8,
        question: "I look forward to ______ you.",
        options: ["see", "seeing", "seen", "saw"],
        correct: 1,
    },
    {
        id: 9,
        question: "The letter ______ yesterday.",
        options: ["sent", "was sent", "is sent", "sends"],
        correct: 1,
    },
    {
        id: 10,
        question: "By this time next year, I ______ English for 5 years.",
        options: ["will learn", "will have been learning", "am learning", "learn"],
        correct: 1,
    }
]

export default function TestPage() {
    // State
    const [step, setStep] = useState<'start' | 'quiz' | 'result'>('start')
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<number[]>([])
    const [score, setScore] = useState(0)
    const [translations, setTranslations] = useState<Record<string, unknown>>({})
    const [isLoaded, setIsLoaded] = useState(false)

    // Load translations
    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const savedLocale = localStorage.getItem('locale') || 'ru'
                const res = await fetch(`/locales/${savedLocale}.json`)
                if (res.ok) {
                    const data = await res.json()
                    setTranslations(data)
                } else {
                    throw new Error('Locale not found')
                }
            } catch (error) {
                console.error('Failed to load translations', error)
                // Fallback
                try {
                    const fb = await fetch('/locales/ru.json')
                    if (fb.ok) setTranslations(await fb.json())
                } catch (e) { console.error('Fallback failed', e) }
            } finally {
                setIsLoaded(true)
            }
        }
        loadTranslations()
    }, [])

    // Handlers
    const handleStart = () => {
        setStep('quiz')
        setCurrentQuestion(0)
        setAnswers([])
        setScore(0)
    }

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...answers, optionIndex]
        setAnswers(newAnswers)

        if (optionIndex === questions[currentQuestion].correct) {
            setScore(prev => prev + 1)
        }

        if (currentQuestion < questions.length - 1) {
            setTimeout(() => setCurrentQuestion(prev => prev + 1), 300)
        } else {
            setStep('result')
        }
    }

    const getLevel = (score: number) => {
        if (score <= 3) return { level: 'Beginner (A1)', course: 'Английский для детей / взрослых' }
        if (score <= 6) return { level: 'Elementary (A2)', course: 'Для взрослых (General English)' }
        if (score <= 8) return { level: 'Intermediate (B1)', course: 'Для взрослых / IELTS' }
        return { level: 'Upper-Intermediate (B2)+', course: 'IELTS / Advanced' }
    }

    const result = getLevel(score)

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const t = translations as Record<string, any>

    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)]">
            <Header
                translations={translations as Record<string, string>}
                locale="ru"
                onLocaleChange={() => { }}
            />

            <main className="flex-grow container mx-auto px-4 py-24 flex items-center justify-center">
                <div className="w-full max-w-2xl relative">
                    {/* Decorative background blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl -z-10" />

                    {step === 'start' && (
                        <div className="text-center space-y-6 animate-fadeIn">
                            <h1 className="text-4xl font-bold text-[var(--text)]">
                                Узнайте свой уровень английского
                            </h1>
                            <p className="text-xl text-[var(--text-muted)]">
                                Пройдите быстрый тест из {questions.length} вопросов и получите рекомендацию курса.
                            </p>
                            <Button size="lg" variant="accent" onClick={handleStart} rightIcon={<ArrowRight size={20} />}>
                                Начать тест
                            </Button>
                        </div>
                    )}

                    {step === 'quiz' && (
                        <Card className="p-8 animate-fadeIn shadow-xl border-[var(--border)]">
                            <div className="mb-6 flex justify-between items-center text-sm text-[var(--text-muted)]">
                                <span>Вопрос {currentQuestion + 1} из {questions.length}</span>
                                <span>{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-[var(--surface-hover)] rounded-full mb-8">
                                <div
                                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                />
                            </div>

                            <h2 className="text-2xl font-bold text-[var(--text)] mb-8">
                                {questions[currentQuestion].question}
                            </h2>

                            <div className="grid gap-4">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        className="p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-left hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all font-medium text-lg active:scale-[0.99]"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {step === 'result' && (
                        <Card className="p-8 text-center animate-fadeIn shadow-xl border-[var(--border)]">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>

                            <h2 className="text-3xl font-bold text-[var(--text)] mb-2">
                                Тест завершен!
                            </h2>
                            <p className="text-[var(--text-muted)] mb-8">
                                Вы ответили правильно на {score} из {questions.length} вопросов
                            </p>

                            <div className="bg-[var(--surface-hover)] p-6 rounded-2xl mb-8">
                                <p className="text-sm text-[var(--text-muted)] mb-1">Ваш примерный уровень:</p>
                                <p className="text-3xl font-bold text-[var(--primary)] mb-4">{result.level}</p>

                                <p className="text-sm text-[var(--text-muted)] mb-1">Рекомендуемый курс:</p>
                                <p className="text-xl font-bold text-[var(--text)]">{result.course}</p>
                            </div>

                            <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
                                Это предварительный результат. Для точного определения уровня запишитесь на бесплатную консультацию с преподавателем.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => window.location.href = '/'} variant="outline" leftIcon={<RefreshCcw size={18} />}>
                                    На главную
                                </Button>
                                <a
                                    href={`https://wa.me/77020296315?text=${encodeURIComponent(`Здравствуйте! Я прошел тест, мой уровень примерно ${result.level}. Хочу записаться на пробный урок.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="whatsapp">
                                        Записаться на урок
                                    </Button>
                                </a>
                            </div>
                        </Card>
                    )}

                </div>
            </main>
            <Footer translations={translations} />
        </div>
    )
}
