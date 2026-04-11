'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const pageBg = '#eeeeff'
const cardBg = '#ffffff'
const logoGradient = 'linear-gradient(135deg, #6366f1, #818cf8)'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await authApi.login(email, password)
      localStorage.setItem('pathieve_token', token.access_token)
      document.cookie = `pathieve_token=${token.access_token}; path=/; max-age=604800; samesite=lax`
      router.push('/pathmap')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: pageBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div className="animate-scale-in" style={{
        width: '100%', maxWidth: 400,
        background: cardBg,
        borderRadius: 20,
        padding: '40px 36px',
        border: '1.5px solid #d8d7f0',
        boxShadow: '0 8px 40px rgba(99,102,241,0.14)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 34, fontWeight: 800,
            background: logoGradient,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em', marginBottom: 6,
          }}>✦ Pathieve</div>
          <p style={{ color: '#8888aa', fontSize: '0.83rem', margin: 0 }}>あなたの目標達成前夜</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="メールアドレス" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="パスワード" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

          {error && (
            <p style={{
              fontSize: '0.82rem', color: '#ef4444', textAlign: 'center',
              background: 'rgba(239,68,68,0.07)', padding: '8px 12px', borderRadius: 8,
            }}>{error}</p>
          )}

          <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}>
            ログイン
          </Button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <Link href="/reset-password" style={{ fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
            パスワードをお忘れの方
          </Link>
          <Link href="/register" style={{ fontSize: '0.82rem', color: '#4a4a6a', textDecoration: 'none' }}>
            新規登録
          </Link>
        </div>
      </div>
    </div>
  )
}
