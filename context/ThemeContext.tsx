'use client'
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import type { ThemeMode, AccentColor, AppSettings } from '@/types'

interface ThemeContextValue {
  mode: ThemeMode
  accent: AccentColor
  globalMode: ThemeMode
  globalAccent: AccentColor
  toggleMode: () => void
  setAccent: (accent: AccentColor) => void
  setTheme: (mode: ThemeMode, accent: AccentColor) => void
  setGlobalTheme: (mode: ThemeMode, accent: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  accent: 'indigo',
  globalMode: 'light',
  globalAccent: 'indigo',
  toggleMode: () => {},
  setAccent: () => {},
  setTheme: () => {},
  setGlobalTheme: () => {},
})

// Public pages that should always use the global theme
const PUBLIC_PAGES = ['/', '/login', '/register', '/reset-password']

export function ThemeProvider({ 
  children, 
  initialGlobalTheme 
}: { 
  children: ReactNode
  initialGlobalTheme?: AppSettings
}) {
  const pathname = usePathname()
  const isPublicPage = PUBLIC_PAGES.includes(pathname)

  // Global theme (for public pages)
  const [globalMode, setGlobalModeState] = useState<ThemeMode>(initialGlobalTheme?.mode || 'light')
  const [globalAccent, setGlobalAccentState] = useState<AccentColor>(initialGlobalTheme?.accent || 'indigo')

  // User theme (for authenticated pages)
  const [userMode, setUserMode] = useState<ThemeMode>('light')
  const [userAccent, setUserAccent] = useState<AccentColor>('indigo')

  // The active theme depends on the route
  const mode = isPublicPage ? globalMode : userMode
  const accent = isPublicPage ? globalAccent : userAccent

  // Apply to <html> element whenever mode or accent changes
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', mode)
    html.setAttribute('data-accent', accent === 'indigo' ? '' : accent)
  }, [mode, accent])

  const toggleMode = useCallback(() => {
    if (isPublicPage) {
      setGlobalModeState((prev) => prev === 'light' ? 'dark' : 'light')
    } else {
      setUserMode((prev) => prev === 'light' ? 'dark' : 'light')
    }
  }, [isPublicPage])

  const setAccent = useCallback((a: AccentColor) => {
    if (isPublicPage) {
      setGlobalAccentState(a)
    } else {
      setUserAccent(a)
    }
  }, [isPublicPage])

  const setTheme = useCallback((m: ThemeMode, a: AccentColor) => {
    setUserMode(m)
    setUserAccent(a)
  }, [])

  const setGlobalTheme = useCallback((m: ThemeMode, a: AccentColor) => {
    setGlobalModeState(m)
    setGlobalAccentState(a)
  }, [])

  const contextValue = useMemo(() => ({
    mode, accent, 
    globalMode, globalAccent,
    toggleMode, setAccent, setTheme, setGlobalTheme 
  }), [mode, accent, globalMode, globalAccent, toggleMode, setAccent, setTheme, setGlobalTheme])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

