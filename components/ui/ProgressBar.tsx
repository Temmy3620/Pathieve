'use client'

interface ProgressBarProps {
  value: number
  label?: string
  showValue?: boolean
  height?: number
}

export default function ProgressBar({ value, label, showValue = true, height = 8 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const barColor = clamped === 100
    ? '#22c55e'
    : `linear-gradient(90deg, #6366f1, #818cf8)`

  return (
    <div style={{ width: '100%' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && <span style={{ fontSize: '0.8rem', color: '#4a4a6a', fontWeight: 500 }}>{label}</span>}
          {showValue && (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: clamped === 100 ? '#22c55e' : '#6366f1' }}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div style={{
        width: '100%', height,
        background: '#e8e7f5',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${clamped}%`,
          background: barColor,
          borderRadius: height,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}
