'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { ThemeMode, AccentColor, AppSettings } from '@/types'

interface ThemeContextValue {
  mode: ThemeMode
  accent: AccentColor
  toggleMode: () => void
  setAccent: (accent: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  accent: 'indigo',
  toggleMode: () => {},
  setAccent: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [accent, setAccentState] = useState<AccentColor>('indigo')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pathieve_settings')
    if (saved) {
      try {
        const settings: AppSettings = JSON.parse(saved)
        setMode(settings.mode)
        setAccentState(settings.accent)
      } catch (_) {}
    }
  }, [])

  // Apply to <html> element
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', mode)
    html.setAttribute('data-accent', accent === 'indigo' ? '' : accent)
    localStorage.setItem(
      'pathieve_settings',
      JSON.stringify({ mode, accent }),
    )
  }, [mode, accent])

  const toggleMode = () =>
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))

  const setAccent = (a: AccentColor) => setAccentState(a)

  return (
    <ThemeContext.Provider value={{ mode, accent, toggleMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
