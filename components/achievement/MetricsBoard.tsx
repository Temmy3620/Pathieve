'use client'

interface MetricsBoardProps {
  metrics: {
    totalCompleted: number
    totalTasks: number
    averageProgress: number
  }
}

export default function MetricsBoard({ metrics }: MetricsBoardProps) {
  const { totalCompleted, totalTasks, averageProgress } = metrics
  
  // 円グラフ用の計算
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (averageProgress / 100) * circumference

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
      
      {/* 完了度 */}
      <div style={{
        background: 'var(--bg-surface)', padding: 24, borderRadius: 16,
        border: '1.5px solid var(--border)', boxShadow: '0 4px 20px rgba(99,102,241,0.05)',
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            今月のタスク完了度
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {totalCompleted}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              タスク完了
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.4 }}>
            今月のマイルストーンで<br/>これだけのタスクを完了させました！
          </p>
        </div>
      </div>

      {/* 達成度 (進捗) */}
      <div style={{
        background: 'var(--bg-surface)', padding: 24, borderRadius: 16,
        border: '1.5px solid var(--border)', boxShadow: '0 4px 20px rgba(99,102,241,0.05)',
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--accent)" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }} />
          </svg>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {averageProgress}%
            </span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            今月の達成度
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 4px', lineHeight: 1.4 }}>
            今月の全タスクの<br />平均進捗です
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            少しの進歩も素晴らしい成果。<br/>着実に進んでいます！
          </p>
        </div>
      </div>

    </div>
  )
}
