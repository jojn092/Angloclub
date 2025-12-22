'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { CheckCircle, ArrowRight, RefreshCcw, Star, Trophy, Clock, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

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
    const [selectedOption, setSelectedOption] = useState<number | null>(null)

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
        setSelectedOption(optionIndex)

        // Delay to show selection feedback
        setTimeout(() => {
            const newAnswers = [...answers, optionIndex]
            setAnswers(newAnswers)

            if (optionIndex === questions[currentQuestion].correct) {
                setScore(prev => prev + 1)
            }

            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(prev => prev + 1)
                setSelectedOption(null)
            } else {
                setStep('result')
            }
        }, 400)
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

    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
            <Header
                translations={translations as Record<string, string>}
                locale="ru"
                onLocaleChange={() => { }}
            />

            <main className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-24">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl -z-10" />

                <div className="w-full max-w-3xl relative z-10">
                    {step === 'start' && (
                        <div className="text-center space-y-8 animate-fadeIn">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm text-sm font-medium text-[var(--primary)] mb-4">
                                <Star size={16} className="fill-current" />
                                Бесплатное тестирование
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold text-[var(--text)] tracking-tight leading-tight">
                                Узнайте свой уровень <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-500">
                                    за 5 минут
                                </span>
                            </h1>

                            <p className="text-xl text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
                                Пройдите быстрый тест из {questions.length} вопросов. Мы мгновенно определим ваш уровень и подберем идеальную программу обучения.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 mb-12">
                                {[
                                    { icon: Clock, text: 'Всего 5 минут' },
                                    { icon: Trophy, text: 'Точный результат' },
                                    { icon: Star, text: 'Рекомендации' }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                            <item.icon size={20} />
                                        </div>
                                        <span className="font-medium text-[var(--text)]">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <Button size="lg" variant="accent" onClick={handleStart} className="text-lg px-12 py-6 h-auto shadow-xl shadow-[var(--primary)]/20 hover:shadow-2xl hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all">
                                Начать тест <ArrowRight size={24} className="ml-2" />
                            </Button>
                        </div>
                    )}

                    {step === 'quiz' && (
                        <Card className="p-8 md:p-12 animate-fadeIn shadow-2xl border-[var(--border)] backdrop-blur-sm bg-[var(--surface)]/90">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center text-sm font-medium text-[var(--text-muted)] mb-3">
                                    <span className="uppercase tracking-wider">Вопрос {currentQuestion + 1} из {questions.length}</span>
                                    <span>{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full h-3 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--primary)] to-purple-500 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-10 leading-snug">
                                {questions[currentQuestion].question}
                            </h2>

                            <div className="grid gap-4">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        disabled={selectedOption !== null}
                                        className={clsx(
                                            "group p-5 rounded-xl border-2 text-left transition-all duration-200 font-medium text-lg relative overflow-hidden",
                                            selectedOption === index
                                                ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg scale-[1.02]"
                                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)] hover:shadow-md"
                                        )}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span className="flex items-center gap-4">
                                                <span className={clsx(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm border font-bold transition-colors",
                                                    selectedOption === index
                                                        ? "bg-white text-[var(--primary)] border-white"
                                                        : "bg-[var(--surface-hover)] text-[var(--text-muted)] border-[var(--border)] group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]"
                                                )}>
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                {option}
                                            </span>
                                            {selectedOption === index && <CheckCircle className="animate-scaleIn" size={24} />}
                                            {selectedOption === null && <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)]" size={20} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {step === 'result' && (
                        <Card className="p-8 md:p-12 text-center animate-fadeIn shadow-2xl border-[var(--border)] relative overflow-hidden">
                            {/* Confetti Background Effect (CSS only for now) */}
                            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent animate-pulse" />

                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce-slow">
                                <Trophy size={48} className="fill-current" />
                            </div>

                            <h2 className="text-4xl font-bold text-[var(--text)] mb-4">
                                Отличная работа!
                            </h2>
                            <p className="text-xl text-[var(--text-muted)] mb-10">
                                Вы ответили правильно на <span className="font-bold text-[var(--primary)]">{score}</span> из {questions.length} вопросов
                            </p>

                            <div className="bg-gradient-to-br from-[var(--surface-hover)] to-[var(--background)] border border-[var(--border)] p-8 rounded-2xl mb-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Star size={100} />
                                </div>

                                <p className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Ваш уровень</p>
                                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-600 mb-6">
                                    {result.level}
                                </p>

                                <div className="h-px bg-[var(--border)] w-full mb-6" />

                                <p className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Рекомендуем курс</p>
                                <p className="text-2xl font-bold text-[var(--text)]">{result.course}</p>
                            </div>

                            <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto leading-relaxed">
                                Это предварительный результат. Чтобы точно определить уровень и начать обучение, запишитесь на бесплатную консультацию.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => window.location.href = '/'} variant="outline" className="px-8 py-4 h-auto text-lg border-2" leftIcon={<RefreshCcw size={20} />}>
                                    На главную
                                </Button>
                                <a
                                    href={`https://wa.me/77020296315?text=${encodeURIComponent(`Здравствуйте! Я прошел тест на сайте, мой уровень: ${result.level}. Хочу записаться на пробный урок.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="whatsapp" className="px-8 py-4 h-auto text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
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
