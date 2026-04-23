'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { useGoals } from '@/context/GoalContext'
import { adminApi } from '@/lib/api'
import { User } from '@/types'

// admin/users APIのレスポンス型
interface AdminUser extends User {
  _count: {
    goals: number
    activities: number
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isInitialized, checkAuth } = useGoals()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const ok = await checkAuth()
      if (!ok) {
        router.replace('/login')
        return
      }

      // contextにuser情報が保存されていないため、me APIを叩いてis_adminかチェックする、もしくは
      // 権限がなければadminApiが403を返すのでそれでも良い
      const token = localStorage.getItem('pathieve_token')
      if (!token) {
        router.replace('/login')
        return
      }

      try {
        const data = await adminApi.getUsers()
        setUsers(data)
      } catch (err) {
        // 403などのエラーが出たら管理者ではないと判断してホームへ戻す
        router.replace('/')
      } finally {
        setLoading(false)
      }
    })()
  }, [checkAuth, router])

  if (!isInitialized || loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 24px', minHeight: '100vh', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: '0 0 24px' }}>
          ユーザー一覧と利用状況の確認
        </p>

        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

        <div style={{ 
          background: 'var(--bg-surface)', 
          borderRadius: 16, 
          border: '1.5px solid var(--border)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email / ID</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>登録日</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Goals</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Activities</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <div style={{ fontWeight: 600 }}>{user.email}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{user.id}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 600 }}>
                    {user._count.goals}
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 600 }}>
                    {user._count.activities}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {user.is_admin ? (
                      <span style={{ padding: '4px 8px', borderRadius: 12, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700 }}>ADMIN</span>
                    ) : (
                      <span style={{ padding: '4px 8px', borderRadius: 12, background: 'var(--bg-raised)', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>USER</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
