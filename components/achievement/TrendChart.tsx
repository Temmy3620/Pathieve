'use client'
import Select from '@/components/ui/Select'

interface TrendData {
  month: string
  completed: number
  progress: number
}

interface TrendChartProps {
  data: TrendData[]
  months: number
  onMonthsChange: (m: number) => void
}

export default function TrendChart({ data, months, onMonthsChange }: TrendChartProps) {
  if (!data || data.length === 0) return null

  // グラフのサイズ設定
  const height = 180
  const barWidth = 46
  const maxCompleted = Math.max(...data.map(d => d.completed), 1)
  // 縦軸（完了タスク数）の最大スケールを少し余裕を持たせる
  const scaleMax = Math.ceil(maxCompleted * 1.2)

  return (
    <div style={{
      background: 'var(--bg-surface)', padding: '24px 24px 16px', borderRadius: 16,
      border: '1.5px solid var(--border)', boxShadow: '0 4px 20px rgba(99,102,241,0.05)',
      marginBottom: 24
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            月別トレンド
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            過去数ヶ月のタスク完了数と平均達成度の推移です。
          </p>
        </div>
        <Select
          value={months}
          onChange={(e) => onMonthsChange(Number(e.target.value))}
          options={[
            { label: '直近1ヶ月', value: 1 },
            { label: '直近3ヶ月', value: 3 },
            { label: '直近6ヶ月', value: 6 },
            { label: '直近1年', value: 12 },
          ]}
        />
      </div>

      <div style={{ position: 'relative', height, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 20 }}>
        {/* 背景のグリッド線 */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.4 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderTop: '1.5px dashed var(--border)', width: '100%' }} />
          ))}
        </div>

        {data.map((d, i) => {
          // 棒グラフの高さ (完了タスク数に基づく)
          const barHeight = (d.completed / scaleMax) * (height - 40) // 40はラベル用の余白

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, height: '100%', justifyContent: 'flex-end' }}>
              
              {/* 達成度バッジ */}
              <div style={{
                background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700,
                padding: '4px 10px', borderRadius: 12, marginBottom: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                達成率 {d.progress}%
              </div>

              {/* 完了タスクの棒 */}
              <div style={{
                position: 'relative',
                width: barWidth,
                height: Math.max(barHeight, 4), // 最低でも4pxの高さ
                background: 'var(--accent)',
                borderRadius: '6px 6px 0 0',
                opacity: 0.85,
                transition: 'height 0.3s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}>
                <span style={{ 
                  color: 'var(--bg-surface)', fontSize: '0.85rem', fontWeight: 800, 
                  marginTop: 6, opacity: d.completed > 0 ? 1 : 0 
                }}>
                  {d.completed}
                </span>
              </div>
              
              {/* X軸のラベル (月) */}
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 8 }}>
                {d.month}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
