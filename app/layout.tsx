import type { Metadata } from 'next'
import { ThemeProvider } from '@/context/ThemeContext'
import { GoalProvider } from '@/context/GoalContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pathieve — あなたの目標達成前夜',
  description: '未来への道筋をいつでも描き直せる、動的な目標管理ツール。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <GoalProvider>
            {children}
          </GoalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
