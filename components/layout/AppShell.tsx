'use client'
import { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', background: 'var(--bg-base)' }}>
        {children}
      </main>
    </div>
  )
}
