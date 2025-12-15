'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CTABar from '@/components/layout/CTABar'
import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import Stats from '@/components/sections/Stats'
import Testimonials from '@/components/sections/Testimonials'
import CourseCards from '@/components/sections/CourseCards'
import Teachers from '@/components/sections/Teachers'
import LeadForm from '@/components/sections/LeadForm'

export default function Home() {
  const [translations, setTranslations] = useState<Record<string, unknown>>({})
  const [locale, setLocale] = useState('ru')
  const [isLoaded, setIsLoaded] = useState(false)
  const [formInitialData, setFormInitialData] = useState<{ course?: string; message?: string } | null>(null)

  // Load translations
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'ru'
    setLocale(savedLocale)
    loadTranslations(savedLocale)
  }, [])

  const loadTranslations = async (lang: string) => {
    try {
      const res = await fetch(`/locales/${lang}.json`)
      if (res.ok) {
        const data = await res.json()
        setTranslations(data)
        setIsLoaded(true)
      }
    } catch (error) {
      console.error('Failed to load translations:', error)
      // Fallback to Russian
      const res = await fetch('/locales/ru.json')
      if (res.ok) {
        const data = await res.json()
        setTranslations(data)
        setIsLoaded(true)
      }
    }
  }

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    loadTranslations(newLocale)
  }

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTest = () => {
    window.location.href = '/test'
  }

  const handleEnrollCourse = (course: string, message?: string) => {
    setFormInitialData({ course, message })
    const form = document.getElementById('lead-form')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header
        translations={translations as Record<string, string>}
        locale={locale}
        onLocaleChange={handleLocaleChange}
        onEnrollClick={scrollToForm}
      />

      <Hero
        translations={translations}
        onEnrollClick={scrollToForm}
        onTestClick={scrollToTest}
      />

      <Features translations={translations} />

      <Stats translations={translations} />

      <CourseCards
        translations={translations}
        onEnroll={handleEnrollCourse}
      />

      <Teachers
        translations={translations}
        onEnroll={handleEnrollCourse}
      />

      <Testimonials translations={translations} />

      <LeadForm
        translations={translations}
        initialData={formInitialData}
      />

      <Footer translations={translations} />

      <CTABar
        onEnrollClick={scrollToForm}
        onTestClick={scrollToTest}
      />

      {/* Spacer for mobile CTA bar */}
      <div className="h-20 lg:hidden" />
    </main>
  )
}
