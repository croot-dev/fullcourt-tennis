import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Provider as ChakraProvider } from '@/components/ui/provider'
import TanstackProvider from '@/components/tanstackProvider'
import Header from '@/components/layouts/Header'
import Footer from '@/components/layouts/Footer'
import MobileBottomNav from '@/components/layouts/MobileBottomNav'
import ChatBot from '@/components/chat/ChatBot'
import NextTopLoader from 'nextjs-toploader'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '이름없는 테니스 모임 - 테니스 초보자 모임',
  description:
    '테니스 초보자들의 즐거운 모임, 이름없는 테니스 모임입니다. 함께 배우고 성장하는 테니스 커뮤니티에 참여하세요!',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="#319795" showSpinner={false} />
        <ChakraProvider>
          <TanstackProvider>
            <Header />
            <main
              style={{ minHeight: '100vh', background: 'var(--content-bg)' }}
            >
              {children}
            </main>
            <Footer />
            <ChatBot />
            <MobileBottomNav />
          </TanstackProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}
