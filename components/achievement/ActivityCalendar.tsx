'use client'
import { useMemo } from 'react'

interface ActivityCalendarProps {
  activities: Record<string, number>
  months: number
}

export default function ActivityCalendar({ activities, months }: ActivityCalendarProps) {
  // 生成する日数の計算（直近 X ヶ月）
  const days = useMemo(() => {
    const today = new Date()
    // 今日の0時0分0秒 (ローカル時間基準でOK)
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const start = new Date(today.getFullYear(), today.getMonth() - months, today.getDate())
    
    // startが日曜日になるように調整（カレンダーの見た目を揃えるため）
    const startDay = start.getDay()
    start.setDate(start.getDate() - startDay)

    const result = []
    let current = new Date(start)
    while (current <= end) {
      // YYYY-MM-DD 形式
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, '0')
      const d = String(current.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`
      
      result.push({
        date: dateStr,
        level: activities[dateStr] || 0
      })
      current.setDate(current.getDate() + 1)
    }
    return result
  }, [activities, months])

  // 週ごとに分割
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7))
    }
    return w
  }, [days])

  const getOpacity = (level: number) => {
    if (level === 0) return 0.05
    if (level === 1) return 0.3
    if (level <= 3) return 0.6
    return 1
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 10 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.level} actions`}
                style={{
                  width: 14, height: 14, borderRadius: 4,
                  background: day.level > 0 ? 'var(--accent)' : 'var(--text-secondary)',
                  opacity: getOpacity(day.level),
                  transition: 'opacity 0.2s',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Less</span>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--text-secondary)', opacity: 0.05 }} />
        <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--accent)', opacity: 0.3 }} />
        <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--accent)', opacity: 0.6 }} />
        <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--accent)', opacity: 1 }} />
        <span>More</span>
      </div>
    </div>
  )
}
