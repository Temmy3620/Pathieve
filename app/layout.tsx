import type { Metadata } from 'next'
import { ThemeProvider } from '@/context/ThemeContext'
import { GoalProvider } from '@/context/GoalContext'
import prisma from '@/lib/prisma'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pathieve — あなたの目標達成前夜',
  description: '未来への道筋をいつでも描き直せる、動的な目標管理ツール。',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings = await prisma.systemSetting.findUnique({ where: { id: 'global' } })
  if (!settings) {
    settings = { id: 'global', home_theme_mode: 'light', home_theme_accent: 'indigo', updated_at: new Date() }
  }

  return (
    <html lang="ja" data-theme={settings.home_theme_mode} data-accent={settings.home_theme_accent === 'indigo' ? '' : settings.home_theme_accent}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider initialGlobalTheme={{ mode: settings.home_theme_mode as any, accent: settings.home_theme_accent as any }}>
          <GoalProvider>
            {children}
          </GoalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
