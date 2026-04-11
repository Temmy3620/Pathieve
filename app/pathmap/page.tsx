'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGoals } from '@/context/GoalContext'
import AppShell from '@/components/layout/AppShell'
import GoalCard from '@/components/pathmap/GoalCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Goal } from '@/types'

// ── Connection-line colors by parent level ──────────────
const LINE_COLOR: Record<Goal['level'], string> = {
  '5year': '#6366f1',
  '1year': '#f59e0b',
  '1month': '#64748b',
}

// ── Add-goal modal ───────────────────────────────────────
function AddGoalModal({ level, parentId, onClose }: { level: Goal['level']; parentId: string | null; onClose: () => void }) {
  const { createGoal } = useGoals()
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const levelLabel = { '5year': '5年後', '1year': '1年後', '1month': '1ヶ月後' }[level]

  const handleAdd = async () => {
    if (!title.trim()) { setError('タイトルを入力してください'); return }
    setLoading(true)
    try { await createGoal(title.trim(), level, parentId); onClose() }
    catch (e) { setError(e instanceof Error ? e.message : 'エラーが発生しました') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen onClose={onClose} title={`${levelLabel}の目標を追加`}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleAdd} loading={loading}>追加する</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input label="目標タイトル" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }} />
        {error && <p style={{ fontSize: '0.82rem', color: '#ef4444' }}>{error}</p>}
      </div>
    </Modal>
  )
}

// ── Connection lines ─────────────────────────────────────
interface Line { x1: number; y1: number; x2: number; y2: number; color: string; id: string }

function computeLines(goals: Goal[], container: HTMLElement): Line[] {
  const rect = container.getBoundingClientRect()
  const lines: Line[] = []

  for (const goal of goals) {
    if (!goal.parent_id) continue
    const parentEl = container.querySelector(`[data-goal-id="${goal.parent_id}"]`)
    const childEl = container.querySelector(`[data-goal-id="${goal.id}"]`)
    if (!parentEl || !childEl) continue

    const pr = parentEl.getBoundingClientRect()
    const cr = childEl.getBoundingClientRect()

    const parent = goals.find((g) => g.id === goal.parent_id)
    const color = parent ? LINE_COLOR[parent.level] : '#999'

    lines.push({
      id: `${goal.parent_id}-${goal.id}`,
      x1: pr.right - rect.left,
      y1: pr.top + pr.height / 2 - rect.top,
      x2: cr.left - rect.left,
      y2: cr.top + cr.height / 2 - rect.top,
      color,
    })
  }
  return lines
}

// ── ソートロジックの追加 ────────────────────────────────────────
// 目標を親子関係に基づいて並び替える関数
function sortGoalsByPath(allGoals: Goal[]) {
  const sorted: Goal[] = [];
  const visited = new Set<string>();

  // 1. 5年後の目標をベースにループ
  const rootGoals = allGoals.filter(g => g.level === '5year');

  rootGoals.forEach(root => {
    traverse(root);
  });

  // 2. 親が見つからない孤立した目標を最後に追加
  allGoals.forEach(g => {
    if (!visited.has(g.id)) traverse(g);
  });

  function traverse(goal: Goal) {
    if (visited.has(goal.id)) return;
    visited.add(goal.id);
    sorted.push(goal);

    // 直系の子を探して再帰的に追加
    const children = allGoals.filter(g => g.parent_id === goal.id);
    children.forEach(child => traverse(child));
  }

  return sorted;
}

function BezierLine({ x1, y1, x2, y2, color }: Line) {
  const cp = Math.max(40, (x2 - x1) * 0.45)
  const d = `M ${x1},${y1} C ${x1 + cp},${y1} ${x2 - cp},${y2} ${x2},${y2}`
  return (
    <>
      {/* Glow */}
      <path d={d} fill="none" stroke={color} strokeWidth={8} strokeOpacity={0.08} strokeLinecap="round" />
      {/* Main line */}
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.55} strokeLinecap="round"
        strokeDasharray="0" />
      {/* Arrow dot at end */}
      <circle cx={x2} cy={y2} r={4} fill={color} fillOpacity={0.7} />
      <circle cx={x1} cy={y1} r={3} fill={color} fillOpacity={0.4} />
    </>
  )
}

// ── Column config ────────────────────────────────────────
const COLUMNS = [
  { level: '5year' as const, label: '5年後の目標', headerBg: '#ede9fe', headerColor: '#6366f1', addBtnBorder: '#a5b4fc', addBtnColor: '#6366f1', colBg: '#faf9ff' },
  { level: '1year' as const, label: '1年後の目標', headerBg: '#fffbeb', headerColor: '#b45309', addBtnBorder: '#fcd34d', addBtnColor: '#b45309', colBg: '#fffefb' },
  { level: '1month' as const, label: '1ヶ月後の目標', headerBg: '#f1f5f9', headerColor: '#475569', addBtnBorder: '#94a3b8', addBtnColor: '#475569', colBg: '#f8fafc' },
]

// ── Main page ────────────────────────────────────────────
export default function PathMapPage() {
  const router = useRouter()
  const { goals, tasks, isInitialized, checkAuth, refreshData } = useGoals()
  const [addModal, setAddModal] = useState<{ level: Goal['level']; parentId: string | null } | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (async () => {
      const ok = await checkAuth()
      if (!ok) { router.replace('/login'); return }
      await refreshData()
    })()
  }, [checkAuth, refreshData, router])

  // Recompute SVG lines whenever goals or layout changes
  const recompute = useCallback(() => {
    if (!gridRef.current || goals.length === 0) return
    // Small delay so cards have finished painting
    requestAnimationFrame(() => {
      if (gridRef.current) setLines(computeLines(goals, gridRef.current))
    })
  }, [goals])

  useEffect(() => { recompute() }, [recompute])

  // Also recompute on window resize
  useEffect(() => {
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [recompute])

  // 表示用にソートされた目標リストを作成
  const sortedGoals = sortGoalsByPath(goals);

  return (
    <AppShell>
      <div style={{ padding: '28px 24px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>
            Path Map
          </h1>
          <p style={{ color: '#8888aa', fontSize: '0.83rem', margin: '4px 0 0' }}>未来への道筋を俯瞰する</p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: '5年後 → 1年後のつながり', color: '#6366f1' },
            { label: '1年後 → 1ヶ月後のつながり', color: '#f59e0b' },
          ].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={28} height={10} style={{ flexShrink: 0 }}>
                <line x1={0} y1={5} x2={22} y2={5} stroke={l.color} strokeWidth={2} strokeOpacity={0.6} />
                <circle cx={22} cy={5} r={3.5} fill={l.color} fillOpacity={0.7} />
              </svg>
              <span style={{ fontSize: '0.72rem', color: '#8888aa' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {!isInitialized ? (
          <div style={{ color: '#8888aa', textAlign: 'center', paddingTop: 60 }}>読み込み中...</div>
        ) : (
          /* Grid + SVG overlay */
          <div ref={gridRef} style={{ position: 'relative' }}>
            {/* SVG connection layer */}
            <svg
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                width: '100%', height: '100%', overflow: 'visible',
              }}
            >
              {lines.map((l) => <BezierLine key={l.id} {...l} />)}
            </svg>

            {/* Card grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              background: '#ffffff', borderRadius: 16,
              border: '1.5px solid #d8d7f0', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(99,102,241,0.10)',
            }}>
              {COLUMNS.map((col, colIdx) => {
                const items = sortedGoals.filter((g) => g.level === col.level)
                return (
                  <div key={col.level} style={{
                    background: col.colBg,
                    borderRight: colIdx < 2 ? '1.5px solid #d8d7f0' : 'none',
                    padding: '0 0 20px',
                    display: 'flex', flexDirection: 'column', minHeight: 480,
                  }}>
                    {/* Column header */}
                    <div style={{
                      background: col.headerBg, padding: '14px 16px',
                      borderBottom: '1.5px solid #d8d7f0', marginBottom: 16, textAlign: 'center',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: col.headerColor }}>
                        {col.label}
                      </span>
                    </div>

                    {/* Cards */}
                    <div style={{ flex: 1, padding: '0 14px' }}>
                      {items.map((goal) => {
                        const nextLevel = col.level === '5year' ? '1year' : col.level === '1year' ? '1month' : null
                        return (
                          <GoalCard key={goal.id} goal={goal} allGoals={goals} allTasks={tasks}
                            onAddChild={nextLevel ? () => setAddModal({ level: nextLevel, parentId: goal.id }) : undefined} />
                        )
                      })}
                    </div>

                    <div style={{ padding: '0 14px' }}>
                      <button onClick={() => setAddModal({ level: col.level, parentId: null })} style={{
                        display: 'block', width: '100%', padding: '10px', borderRadius: 10,
                        border: `1.5px dashed ${col.addBtnBorder}`, background: 'transparent',
                        color: col.addBtnColor, fontSize: '0.82rem', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                      }}>＋（{col.label}の追加）</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {addModal && (
          <AddGoalModal level={addModal.level} parentId={addModal.parentId}
            onClose={() => { setAddModal(null); recompute() }} />
        )}
      </div>
    </AppShell>
  )
}
