'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGoals } from '@/context/GoalContext'

export default function RootPage() {
  const router = useRouter()
  const { checkAuth, goals, isLoading, isInitialized, isAuthenticated, refreshData } = useGoals()

  useEffect(() => {
    async function init() {
      const authed = await checkAuth()
      if (authed) {
        await refreshData()
      } else {
        router.replace('/login')
      }
    }
    init()
  }, [checkAuth, refreshData, router])

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      if (goals.length === 0) {
        router.replace('/wizard')
      } else {
        router.replace('/pathmap')
      }
    }
  }, [isInitialized, isAuthenticated, goals.length, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 40, marginBottom: 16,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontWeight: 800, letterSpacing: '-0.03em',
        }}>
          ✦ Pathieve
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>読み込み中...</div>
      </div>
    </div>
  )
}
