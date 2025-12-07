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
  title: "AngloClub Astana — Курсы английского языка",
  description: "Языковая школа в Астане. IELTS, разговорный английский, курсы для детей и взрослых. Запишитесь на бесплатный пробный урок!",
  keywords: ["английский язык", "Астана", "курсы", "IELTS", "языковая школа", "English courses"],
  authors: [{ name: "AngloClub Astana" }],
  openGraph: {
    title: "AngloClub Astana — Курсы английского языка",
    description: "Языковая школа в Астане. IELTS, разговорный английский, курсы для детей и взрослых.",
    url: "https://angloclub.kz",
    siteName: "AngloClub Astana",
    locale: "ru_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AngloClub Astana — Курсы английского языка",
    description: "Языковая школа в Астане. Запишитесь на бесплатный пробный урок!",
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
      </body>
    </html>
  );
}
