'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGoals } from '@/context/GoalContext'
import { useTheme } from '@/context/ThemeContext'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { AccentColor } from '@/types'

const ACCENT_OPTIONS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'indigo', label: 'インディゴ', color: '#6366f1' },
  { value: 'purple', label: 'パープル',   color: '#a855f7' },
  { value: 'teal',   label: 'ティール',    color: '#14b8a6' },
  { value: 'rose',   label: 'ローズ',      color: '#f43f5e' },
  { value: 'sky',    label: 'スカイ',      color: '#0ea5e9' },
]

function SettingRow({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px 0', borderBottom: '1px solid var(--bg-muted)',
    }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 3px' }}>{title}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{description}</p>
      </div>
      <div style={{ flexShrink: 0, marginLeft: 24 }}>{action}</div>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { mode, accent, toggleMode, setAccent } = useTheme()
  const { checkAuth, logout } = useGoals()
  const [resetModal, setResetModal] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  useEffect(() => {
    (async () => {
      const ok = await checkAuth()
      if (!ok) router.replace('/login')
    })()
  }, [checkAuth, router])

  const handleReset = async () => {
    setResetLoading(true)
    try {
      const { userApi } = await import('@/lib/api')
      await userApi.resetData()
      setResetModal(false)
      router.push('/wizard')
    } catch { alert('データリセットに失敗しました') }
    finally { setResetLoading(false) }
  }

  const handleWithdraw = async () => {
    setWithdrawLoading(true)
    try {
      const { authApi } = await import('@/lib/api')
      await authApi.withdraw()
      logout()
      router.push('/login')
    } catch { alert('退会手続きに失敗しました') }
    finally { setWithdrawLoading(false) }
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 24px', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: '0 0 28px' }}>アプリのカスタマイズと管理</p>

        <div style={{
          background: 'var(--bg-surface)', borderRadius: 16,
          border: '1.5px solid var(--border)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.10)',
          padding: '0 24px', maxWidth: 600,
        }}>
          {/* Color customize row */}
          <div style={{ padding: '20px 0', borderBottom: '1px solid var(--bg-muted)' }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 3px' }}>カラーカスタマイズ</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>アプリのカラーテーマを変更します。</p>

            {/* Accent colors */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {ACCENT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setAccent(opt.value)} title={opt.label} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: opt.color,
                  border: accent === opt.value ? `3px solid var(--text-primary)` : '3px solid transparent',
                  cursor: 'pointer',
                  outline: accent === opt.value ? `2px solid ${opt.color}` : 'none',
                  outlineOffset: 2,
                  transition: 'all 0.15s',
                  transform: accent === opt.value ? 'scale(1.15)' : 'scale(1)',
                }} />
              ))}
            </div>

            {/* Mode toggle */}
            <button onClick={toggleMode} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 20,
              border: '1.5px solid var(--border)', background: 'var(--bg-raised)',
              color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {mode === 'dark' ? '☀️ ライトモードに切替' : '🌙 ダークモードに切替'}
            </button>
          </div>

          <SettingRow
            title="データリセット"
            description="現状作成している計画を削除して、初期からはじめます"
            action={
              <button onClick={() => setResetModal(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 20, border: 'none',
                background: 'var(--accent)', color: 'var(--bg-surface)',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>実行する ▷</button>
            }
          />

          <SettingRow
            title="退会手続き"
            description="課金を停止します。データは匿名化して保持されます。"
            action={
              <button onClick={() => setWithdrawModal(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 20, border: 'none',
                background: 'var(--danger)', color: 'var(--bg-surface)',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>実行する ▷</button>
            }
          />
        </div>
      </div>

      <Modal isOpen={resetModal} onClose={() => setResetModal(false)} title="データをリセットしますか？" danger
        actions={
          <>
            <Button variant="ghost" onClick={() => setResetModal(false)}>キャンセル</Button>
            <Button variant="danger" onClick={handleReset} loading={resetLoading}>リセットする</Button>
          </>
        }
      >
        <p>全ての目標・タスクデータが削除されます。リセット後、ウィザードに戻ります。</p>
      </Modal>

      <Modal isOpen={withdrawModal} onClose={() => setWithdrawModal(false)} title="退会しますか？" danger
        actions={
          <>
            <Button variant="ghost" onClick={() => setWithdrawModal(false)}>キャンセル</Button>
            <Button variant="danger" onClick={handleWithdraw} loading={withdrawLoading}>退会する</Button>
          </>
        }
      >
        <p>アカウントを無効化します。ログインできなくなりますが、データは匿名化してDBに保持されます。</p>
      </Modal>
    </AppShell>
  )
}
