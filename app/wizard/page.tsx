'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGoals } from '@/context/GoalContext'
import type { WizardState, WizardGoalDraft, WizardTaskDraft } from '@/types'
import Button from '@/components/ui/Button'

let _id = 0
const tempId = () => `tmp_${++_id}`

const STEPS = ['5年後の目標', '1年後の目標', '1ヶ月後の目標', '直近のタスク']
const STEP_DESC = [
  '5年後に達成したい目標を入力してください。複数登録できます。',
  '1年後の目標を入力してください。5年後の目標に紐付けることができます。',
  '1ヶ月で達成したい目標を入力してください。ここから始めてもOKです。',
  '直近1ヶ月のタスクを作成してください。',
]
const STEP_COLORS = ['var(--accent)', 'var(--warning)', '#64748b', 'var(--success)']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
  color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none',
}

const draftRowStyle: React.CSSProperties = {
  background: 'var(--bg-raised)', border: '1.5px solid var(--border)',
  borderRadius: 10, padding: '12px 14px',
  display: 'flex', gap: 10, alignItems: 'flex-start',
}

function GoalDraftRow({ draft, parents, onTitleChange, onParentChange, onRemove, parentLabel }: {
  draft: WizardGoalDraft; parents: WizardGoalDraft[]
  onTitleChange: (v: string) => void; onParentChange: (p: string | null) => void
  onRemove: () => void; parentLabel: string
}) {
  return (
    <div style={draftRowStyle}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={draft.title} onChange={(e) => onTitleChange(e.target.value)}
          placeholder="目標を入力..." style={inputStyle} />
        {parents.length > 0 && (
          <select value={draft.parentTempId ?? ''} onChange={(e) => onParentChange(e.target.value || null)}
            style={{ ...inputStyle, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <option value="">（{parentLabel}に紐付けない）</option>
            {parents.map((p) => (
              <option key={p.tempId} value={p.tempId}>{p.title || '（未入力）'}</option>
            ))}
          </select>
        )}
      </div>
      <button onClick={onRemove} style={{
        width: 28, height: 28, borderRadius: 6, border: '1.5px solid var(--border)',
        background: 'var(--bg-surface)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, flexShrink: 0,
      }}>✕</button>
    </div>
  )
}

const addBtnStyle: React.CSSProperties = {
  padding: '10px', borderRadius: 10, border: '1.5px dashed var(--border-focus)',
  background: '#f0f0ff', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
}

export default function WizardPage() {
  const router = useRouter()
  const { submitWizard, isLoading } = useGoals()

  const [step, setStep] = useState(0)
  const [goals5, setGoals5] = useState<WizardGoalDraft[]>([])
  const [goals1y, setGoals1y] = useState<WizardGoalDraft[]>([])
  const [goals1m, setGoals1m] = useState<WizardGoalDraft[]>([{ tempId: tempId(), title: '', level: '1month', parentTempId: null }])
  const [tasks, setTasks] = useState<WizardTaskDraft[]>([])
  const [valError, setValError] = useState('')

  const validationError = (): string | null => {
    if (step === 1 && goals5.length > 0 && goals1y.length === 0)
      return '1年後の目標を少なくとも1つ追加してください'
    if (step === 1) {
      for (const g5 of goals5) {
        if (!goals1y.some((g) => g.parentTempId === g5.tempId))
          return `「${g5.title || '（未入力）'}」に1年後の目標を紐付けてください`
      }
    }
    if (step === 2) {
      if (goals1m.length === 0) return '1ヶ月後の目標を少なくとも1つ追加してください'
      if (goals1m.some((g) => !g.title.trim())) return '1ヶ月後の目標のタイトルを入力してください'
      if (goals1y.length > 0) {
        for (const g1y of goals1y) {
          if (!goals1m.some((g) => g.parentTempId === g1y.tempId))
            return `「${g1y.title || '（未入力）'}」に1ヶ月後の目標を紐付けてください`
        }
      }
    }
    return null
  }

  const handleNext = () => {
    const err = validationError()
    if (err) { setValError(err); return }
    setValError(''); setStep((s) => s + 1)
  }

  const handleFinish = async () => {
    if (goals1m.length === 0) { setValError('1ヶ月後の目標は必須です'); return }
    const wizard: WizardState = {
      goals5year: goals5.filter((g) => g.title.trim()),
      goals1year: goals1y.filter((g) => g.title.trim()),
      goals1month: goals1m.filter((g) => g.title.trim()),
      tasks: tasks.filter((t) => t.title.trim()),
    }
    try {
      await submitWizard(wizard)
      router.push('/pathmap')
    } catch (e) { setValError(e instanceof Error ? e.message : 'エラーが発生しました') }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div className="animate-fade-in" style={{
        width: '100%', maxWidth: 560,
        background: 'var(--bg-surface)', borderRadius: 20,
        border: '1.5px solid var(--border)',
        boxShadow: '0 8px 40px rgba(99,102,241,0.14)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1.5px solid var(--bg-muted)', background: 'var(--bg-raised)' }}>
          <div style={{
            fontSize: 22, fontWeight: 800, marginBottom: 16,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>✦ Pathieve</div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {STEPS.map((label, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? STEP_COLORS[i] : 'var(--bg-muted)', transition: 'background 0.3s', marginBottom: 4 }} />
                <span style={{ fontSize: '0.6rem', color: i <= step ? STEP_COLORS[i] : '#9999bb', fontWeight: i === step ? 700 : 400, lineHeight: 1.2 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
            Step {step + 1}: {STEPS[step]}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{STEP_DESC[step]}</p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', minHeight: 240, background: 'var(--bg-surface)' }}>
          {/* Step 0: 5year */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goals5.map((g, i) => (
                <GoalDraftRow key={g.tempId} draft={g} parents={[]} parentLabel=""
                  onTitleChange={(v) => setGoals5((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))}
                  onParentChange={() => {}}
                  onRemove={() => setGoals5((p) => p.filter((_, j) => j !== i))} />
              ))}
              <button onClick={() => setGoals5((p) => [...p, { tempId: tempId(), title: '', level: '5year', parentTempId: null }])} style={addBtnStyle}>
                ＋ 5年後の目標を追加
              </button>
            </div>
          )}

          {/* Step 1: 1year */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goals5.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  ※ 5年後の目標が未設定のため、紐付けなしで登録できます。
                </p>
              )}
              {goals1y.map((g, i) => (
                <GoalDraftRow key={g.tempId} draft={g} parents={goals5} parentLabel="5年後の目標"
                  onTitleChange={(v) => setGoals1y((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))}
                  onParentChange={(pid) => setGoals1y((p) => p.map((x, j) => j === i ? { ...x, parentTempId: pid } : x))}
                  onRemove={() => setGoals1y((p) => p.filter((_, j) => j !== i))} />
              ))}
              <button onClick={() => setGoals1y((p) => [...p, { tempId: tempId(), title: '', level: '1year', parentTempId: goals5[0]?.tempId ?? null }])}
                style={{ ...addBtnStyle, borderColor: '#fcd34d', color: '#b45309', background: '#fffef0' }}>
                ＋ 1年後の目標を追加
              </button>
            </div>
          )}

          {/* Step 2: 1month */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goals1m.map((g, i) => (
                <GoalDraftRow key={g.tempId} draft={g} parents={goals1y} parentLabel="1年後の目標"
                  onTitleChange={(v) => setGoals1m((p) => p.map((x, j) => j === i ? { ...x, title: v } : x))}
                  onParentChange={(pid) => setGoals1m((p) => p.map((x, j) => j === i ? { ...x, parentTempId: pid } : x))}
                  onRemove={() => setGoals1m((p) => goals1m.length > 1 ? p.filter((_, j) => j !== i) : p)} />
              ))}
              <button onClick={() => setGoals1m((p) => [...p, { tempId: tempId(), title: '', level: '1month', parentTempId: goals1y[0]?.tempId ?? null }])}
                style={{ ...addBtnStyle, borderColor: '#94a3b8', color: '#475569', background: '#f8fafc' }}>
                ＋ 1ヶ月後の目標を追加
              </button>
            </div>
          )}

          {/* Step 3: Tasks */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((t, i) => (
                <div key={t.tempId} style={{ ...draftRowStyle, flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: 8.5, alignItems: 'flex-start', width: '100%' }}>
                    <input value={t.title} onChange={(e) => setTasks((p) => p.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      placeholder="タスク名..." style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={() => setTasks((p) => p.filter((_, j) => j !== i))} style={{
                      width: 28, height: 28, borderRadius: 6, border: '1.5px solid var(--border)',
                      background: 'var(--bg-surface)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, flexShrink: 0,
                    }}>✕</button>
                  </div>
                  <input value={t.memo} onChange={(e) => setTasks((p) => p.map((x, j) => j === i ? { ...x, memo: e.target.value } : x))}
                    placeholder="メモ（任意）..." style={{ ...inputStyle, color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                  {goals1m.length > 0 && (
                    <select value={t.parentTempId} onChange={(e) => setTasks((p) => p.map((x, j) => j === i ? { ...x, parentTempId: e.target.value } : x))}
                      style={{ ...inputStyle, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {goals1m.map((gm) => (
                        <option key={gm.tempId} value={gm.tempId}>{gm.title || '（未入力の1ヶ月目標）'}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              <button onClick={() => setTasks((p) => [...p, { tempId: tempId(), title: '', memo: '', parentTempId: goals1m[0]?.tempId ?? '' }])}
                style={{ ...addBtnStyle, borderColor: '#86efac', color: '#16a34a', background: '#f0fdf4' }}>
                ＋ タスクを追加
              </button>
            </div>
          )}

          {valError && (
            <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.07)', padding: '8px 12px', borderRadius: 8 }}>
              {valError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1.5px solid var(--bg-muted)', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 0 ? (
            <Button variant="ghost" onClick={() => { setValError(''); setStep((s) => s - 1) }}>← 戻る</Button>
          ) : <div />}
          <div style={{ display: 'flex', gap: 8 }}>
            {step < 3 && (
              <Button variant="secondary" size="sm" onClick={() => { setValError(''); setStep((s) => s + 1) }}>スキップ</Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext}>次へ →</Button>
            ) : (
              <Button onClick={handleFinish} loading={isLoading}>✦ はじめる</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
