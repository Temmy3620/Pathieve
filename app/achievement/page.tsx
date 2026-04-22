'use client'
import { useEffect, useState, useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import { achievementApi } from '@/lib/api'
import ActivityCalendar from '@/components/achievement/ActivityCalendar'
import MetricsBoard from '@/components/achievement/MetricsBoard'
import { useGoals } from '@/context/GoalContext'

export default function AchievementPage() {
  const [months, setMonths] = useState(3)
  const [data, setData] = useState<{ activities: Record<string, number>, metrics: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const { tasks, goals, isInitialized, checkAuth, refreshData } = useGoals()

  // 認証と初期データ取得
  useEffect(() => {
    (async () => {
      const ok = await checkAuth()
      if (ok && !isInitialized) {
        await refreshData()
      }
    })()
  }, [checkAuth, refreshData, isInitialized])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await achievementApi.get(months)
        setData(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [months])

  // Metrics用のデータをローカルタスクから算出
  const localMetrics = useMemo(() => {
    const monthGoals = goals.filter(g => g.level === '1month')
    const monthGoalIds = new Set(monthGoals.map(g => g.id))
    // 進行中の1ヶ月の全タスク（定期マスタを除く）
    const activeTasks = tasks.filter(t => monthGoalIds.has(t.goal_id) && !t.is_template)

    const totalTasks = activeTasks.length
    const totalCompleted = activeTasks.filter(t => t.progress === 100).length
    const averageProgress = totalTasks > 0
      ? Math.round(activeTasks.reduce((s, t) => s + t.progress, 0) / totalTasks)
      : 0

    return { totalCompleted, totalTasks, averageProgress }
  }, [tasks, goals])

  return (
    <AppShell>
      <div style={{ padding: '28px 24px', minHeight: '100vh', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Achievement Log
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: '4px 0 0', lineHeight: 1.5 }}>
            あなたのこれまでの頑張りと実績を振り返りましょう。<br/>
            少しの進捗も、確実な一歩です。
          </p>
        </div>

        {/* Metricsはローカルデータから常に表示 */}
        <MetricsBoard metrics={localMetrics} />

        {/* 葉っぱのカレンダー部分はローディングと期間切り替えあり */}
        <div style={{
          background: 'var(--bg-surface)', padding: 24, borderRadius: 16,
          border: '1.5px solid var(--border)', boxShadow: '0 4px 20px rgba(99,102,241,0.05)',
          marginTop: 40, marginBottom: 16
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 20
          }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              活動の記録 (葉っぱ)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              ログインやタスクのちょっとした進捗でも葉っぱが色づきます。継続は力なり！
            </p>
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '8px 36px 8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.outline = '2px solid color-mix(in srgb, var(--text-primary) 20%, transparent)'
                e.target.style.outlineOffset = '2px'
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none'
              }}
            >
              <option value={1}>直近1ヶ月</option>
              <option value={3}>直近3ヶ月</option>
              <option value={6}>直近6ヶ月</option>
              <option value={12}>直近1年</option>
            </select>
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none', color: 'var(--text-muted)'
              }}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            読み込み中...
          </div>
        ) : data ? (
          <ActivityCalendar activities={data.activities} months={months} />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--danger)', fontSize: '0.9rem' }}>
            データの取得に失敗しました。
          </div>
        )}
        </div>
      </div>
    </AppShell>
  )
}