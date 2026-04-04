'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#eeeeff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div className="animate-scale-in" style={{
        width: '100%', maxWidth: 400, background: '#ffffff',
        borderRadius: 20, padding: '40px 36px',
        border: '1.5px solid #d8d7f0',
        boxShadow: '0 8px 40px rgba(99,102,241,0.14)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 30, fontWeight: 800,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em', marginBottom: 8,
          }}>✦ Pathieve</div>
          <p style={{ color: '#4a4a6a', fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>パスワード再設定</p>
          {!sent && <p style={{ color: '#8888aa', fontSize: '0.82rem' }}>登録済みのメールアドレスを入力してください。</p>}
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <p style={{ color: '#1a1a2e', fontWeight: 600, marginBottom: 8 }}>メールを送りました。</p>
            <p style={{ color: '#8888aa', fontSize: '0.85rem', marginBottom: 24 }}>パスワード再設定のご案内をお送りしました。</p>
            <Link href="/login">
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>ログイン画面へ戻る</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="メールアドレス" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            {error && <p style={{ fontSize: '0.82rem', color: '#ef4444', textAlign: 'center' }}>{error}</p>}
            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
              再設定メールを送る
            </Button>
            <div style={{ textAlign: 'center' }}>
              <Link href="/login" style={{ fontSize: '0.82rem', color: '#8888aa', textDecoration: 'none' }}>戻る</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
