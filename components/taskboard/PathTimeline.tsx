'use client'
import type { Goal } from '@/types'

const LEVEL_COLORS = {
  '5year':  { bg: 'var(--goal-5year-bg)', border: 'var(--goal-5year)', color: 'var(--goal-5year)', label: '5年後' },
  '1year':  { bg: 'var(--goal-1year-bg)', border: '#fcd34d', color: '#b45309', label: '1年後' },
  '1month': { bg: 'var(--goal-1month-bg)', border: '#94a3b8', color: '#475569', label: '1ヶ月後' },
}

interface PathTimelineProps {
  goals: Goal[]
  activeGoalId: string
}

export default function PathTimeline({ goals, activeGoalId }: PathTimelineProps) {
  const monthGoal = goals.find((g) => g.id === activeGoalId)
  const yearGoal = monthGoal?.parent_id ? goals.find((g) => g.id === monthGoal.parent_id) : null
  const fiveYearGoal = yearGoal?.parent_id ? goals.find((g) => g.id === yearGoal.parent_id) : null

  const steps = [
    fiveYearGoal ? { goal: fiveYearGoal, ...LEVEL_COLORS['5year'] } : null,
    yearGoal     ? { goal: yearGoal,     ...LEVEL_COLORS['1year'] } : null,
    monthGoal    ? { goal: monthGoal,    ...LEVEL_COLORS['1month'] } : null,
  ].filter(Boolean) as { goal: Goal; bg: string; border: string; color: string; label: string }[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => (
        <div key={step.goal.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{
            background: step.bg,
            border: `1.5px solid ${step.border}`,
            borderRadius: 10, padding: '10px 14px', width: '100%',
          }}>
            <span style={{ fontSize: '0.63rem', fontWeight: 700, color: step.color, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              {step.label}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {step.goal.title}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ marginLeft: 20, width: 2, height: 20, background: 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}
