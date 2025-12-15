import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://angloclub.kz"),
  title: "AngloClub Astana — Курсы английского языка",
  description: "Языковая школа в Астане. IELTS, разговорный английский, курсы для детей и взрослых. Запишитесь на пробный урок!",
  keywords: ["английский язык", "Астана", "курсы", "IELTS", "языковая школа", "English courses"],
  authors: [{ name: "AngloClub Astana" }],
  openGraph: {
    title: "AngloClub Astana — Курсы английского языка",
    description: "Языковая школа в Астане. IELTS, разговорный английский, курсы для детей и взрослых.",
    url: "https://angloclub.kz",
    siteName: "AngloClub Astana",
    locale: "ru_KZ",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AngloClub Astana Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AngloClub Astana — Курсы английского языка",
    description: "Языковая школа в Астане. Запишитесь на пробный урок!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "AngloClub Astana",
              "url": "https://angloclub.kz",
              "logo": "https://angloclub.kz/og-image.png",
              "description": "Языковая школа в Астане. Курсы английского языка для детей и взрослых.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "ул. Бухар Жырау 34/2",
                "addressLocality": "Astana",
                "addressCountry": "KZ"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+7-702-029-6315",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://www.instagram.com/angloclub.kz"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
