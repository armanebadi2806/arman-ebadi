import type { ReactNode } from 'react'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/sections/navbar'
import { Footer } from '@/components/sections/footer'

const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

export const metadata = {
  title: 'Arman Ebadi — Webdesign & Automatisierung',
  description:
    'Websites, die wirken. Systeme, die Zeit sparen. Projekt anfragen und Antwort binnen 24 Stunden.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className="bg-white">
      <body className={`${space.variable} font-sans bg-white text-[#0f172a]`}>
        <div className="min-h-screen">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
