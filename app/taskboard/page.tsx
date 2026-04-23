'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGoals } from '@/context/GoalContext'
import AppShell from '@/components/layout/AppShell'
import PathTimeline from '@/components/taskboard/PathTimeline'
import TaskCard from '@/components/taskboard/TaskCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

function TaskBoardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { goals, tasks, isInitialized, checkAuth, refreshData, createTask, reorderTasks } = useGoals()

  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMemo, setNewMemo] = useState('')
  const [newRecurrence, setNewRecurrence] = useState('none')
  const [newNotificationTime, setNewNotificationTime] = useState('09:00')
  const [newNotificationDays, setNewNotificationDays] = useState<string[]>([])
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    (async () => {
      const ok = await checkAuth()
      if (!ok) { router.replace('/login'); return }
      await refreshData()
    })()
  }, [checkAuth, refreshData, router])

  useEffect(() => {
    const goalFromQuery = searchParams.get('goal')
    const monthGoals = goals.filter((g) => g.level === '1month')
    if (goalFromQuery && monthGoals.find((g) => g.id === goalFromQuery)) {
      setActiveGoalId(goalFromQuery)
    } else if (monthGoals.length > 0 && !activeGoalId) {
      setActiveGoalId(monthGoals[0].id)
    }
  }, [goals, searchParams, activeGoalId])

  const monthGoals = goals.filter((g) => g.level === '1month')
  const activeGoal = goals.find((g) => g.id === activeGoalId)
  
  const activeTasksFromContext = [...tasks.filter((t) => t.goal_id === activeGoalId)].sort((a, b) => {
    const aDone = a.progress === 100 ? 1 : 0
    const bDone = b.progress === 100 ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    return (a.order ?? 0) - (b.order ?? 0)
  })
  const [localTasks, setLocalTasks] = useState(activeTasksFromContext)

  useEffect(() => {
    if (!activeDragId) {
      setLocalTasks(activeTasksFromContext)
    }
  }, [tasks, activeGoalId, activeDragId]) // Re-run if context tasks change

  const avgProgress = localTasks.length > 0
    ? Math.round(localTasks.reduce((s, t) => s + t.progress, 0) / localTasks.length)
    : 0

  const handleAddTask = async () => {
    if (!newTitle.trim()) { setAddError('タスク名を入力してください'); return }
    if (!activeGoalId) return
    setAddLoading(true)
    try {
      const notifTime = newRecurrence !== 'none' ? newNotificationTime : undefined
      const notifDays = newRecurrence === 'weekly' ? newNotificationDays.join(',') : undefined
      await createTask(activeGoalId, newTitle.trim(), newMemo.trim(), newRecurrence, notifTime, notifDays)
      setNewTitle(''); setNewMemo(''); setNewRecurrence('none'); setNewNotificationTime('09:00'); setNewNotificationDays([]); setAddModal(false)
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally { setAddLoading(false) }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLocalTasks((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id)
        const newIndex = prev.findIndex((t) => t.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex)
        }
        return prev
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const isChanged = localTasks.some((t, i) => t.id !== activeTasksFromContext[i]?.id)
    if (isChanged) {
      const updatedTasks = localTasks.map((t, i) => ({ ...t, order: i }))
      reorderTasks(updatedTasks)
    }
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
    setLocalTasks(activeTasksFromContext)
  }

  const activeDragTask = localTasks.find(t => t.id === activeDragId)

  return (
    <AppShell>
      <div style={{ padding: '28px 24px', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Task Board</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: '0 0 24px' }}>1ヶ月ごとのタスクを管理する</p>

        {!isInitialized ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>読み込み中...</div>
        ) : monthGoals.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-muted)' }}>
            <p>1ヶ月後の目標がありません。Path Mapで目標を追加してください。</p>
            <Button onClick={() => router.push('/pathmap')} style={{ marginTop: 16 }}>Path Mapへ</Button>
          </div>
        ) : activeGoal ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '240px 1fr',
            background: 'var(--bg-surface)',
            borderRadius: 16, border: '1.5px solid var(--border)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(99,102,241,0.10)',
          }}>
            {/* Left: timeline */}
            <div style={{
              background: 'var(--bg-raised)',
              borderRight: '1.5px solid var(--border)',
              padding: 20,
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Pathタイムライン
              </p>
              <PathTimeline goals={goals} activeGoalId={activeGoal.id} />

              {monthGoals.length > 1 && (
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    他のボード
                  </p>
                  {monthGoals.filter((g) => g.id !== activeGoalId).map((g) => (
                    <button key={g.id} onClick={() => {
                      setActiveGoalId(g.id)
                      router.push(`/taskboard?goal=${g.id}`)
                    }} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '6px 8px', borderRadius: 6, border: 'none',
                      background: 'transparent', color: 'var(--text-muted)',
                      fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      ▸ {g.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: tasks */}
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                    1ヶ月のマイルストーン
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    1ヶ月で達成予定のタスク — 進捗 {avgProgress}%
                  </p>
                </div>
                
                {/* 完了済み表示スイッチ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>完了済みを表示</span>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    style={{
                      width: 36, height: 20, borderRadius: 10,
                      background: showCompleted ? 'var(--accent)' : 'var(--bg-raised)',
                      border: showCompleted ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                      position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', padding: 0
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', background: '#fff',
                      position: 'absolute', left: showCompleted ? 17 : 1,
                      transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                    }} />
                  </button>
                </div>
              </div>

              <button onClick={() => setAddModal(true)} style={{
                display: 'block', width: '100%', padding: '12px',
                marginBottom: 16, borderRadius: 10,
                border: '1.5px dashed var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                transition: 'background 0.15s, opacity 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 18%, transparent)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 12%, transparent)'}
              >＋ 新しいタスクの追加</button>

              {localTasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: 20 }}>
                  まだタスクがありません
                </p>
              ) : (() => {
                const incompleteTasks = localTasks.filter(t => t.progress < 100);
                const completedTasks = localTasks.filter(t => t.progress === 100);
                
                return (
                  <div style={{ maxHeight: 'calc(100vh - 280px)', minHeight: 200, overflowY: 'auto', paddingRight: 4, paddingBottom: 20 }}>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      onDragCancel={handleDragCancel}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={incompleteTasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {incompleteTasks.map((t) => <TaskCard key={t.id} task={t} />)}
                      </SortableContext>
                      <DragOverlay>
                        {activeDragTask ? <TaskCard task={activeDragTask} isOverlay /> : null}
                      </DragOverlay>
                    </DndContext>

                    {showCompleted && completedTasks.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ height: 1.5, background: 'var(--border)', margin: '16px 0', opacity: 0.6 }} />
                        {completedTasks.map((t) => <TaskCard key={t.id} task={t} />)}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}

        <Modal isOpen={addModal} onClose={() => { setAddModal(false); setAddError('') }}
          title="新しいタスクを追加"
          actions={
            <>
              <Button variant="ghost" onClick={() => setAddModal(false)}>キャンセル</Button>
              <Button onClick={handleAddTask} loading={addLoading}>追加する</Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="タスク名" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
            <Input label="メモ（任意）" value={newMemo} onChange={(e) => setNewMemo(e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>繰り返し</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  value={newRecurrence}
                  onChange={(e) => setNewRecurrence(e.target.value)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    width: '100%',
                    padding: '10px 36px 10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = '2px solid color-mix(in srgb, var(--accent) 50%, transparent)'
                    e.target.style.outlineOffset = '1px'
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = 'none'
                  }}
                >
                  <option value="none">なし（1回きり）</option>
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
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

            {newRecurrence !== 'none' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>通知時間</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <select
                      value={newNotificationTime}
                      onChange={(e) => setNewNotificationTime(e.target.value)}
                      style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        width: '100%',
                        padding: '10px 36px 10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-panel)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = '2px solid color-mix(in srgb, var(--accent) 50%, transparent)'
                        e.target.style.outlineOffset = '1px'
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none'
                      }}
                    >
                      {Array.from({ length: 24 * 4 }).map((_, i) => {
                        const h = Math.floor(i / 4).toString().padStart(2, '0');
                        const m = ((i % 4) * 15).toString().padStart(2, '0');
                        const time = `${h}:${m}`;
                        return <option key={time} value={time}>{time}</option>;
                      })}
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

                {newRecurrence === 'weekly' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>通知する曜日</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        { label: '日', val: '0' }, { label: '月', val: '1' },
                        { label: '火', val: '2' }, { label: '水', val: '3' },
                        { label: '木', val: '4' }, { label: '金', val: '5' },
                        { label: '土', val: '6' }
                      ].map((day) => {
                        const isSelected = newNotificationDays.includes(day.val);
                        return (
                          <label key={day.val} style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: '0.85rem', color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                            cursor: 'pointer', padding: '6px 12px', borderRadius: 8,
                            background: isSelected ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-raised)',
                            border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                            transition: 'all 0.2s',
                            fontWeight: isSelected ? 600 : 500
                          }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewNotificationDays(prev => [...prev, day.val])
                                } else {
                                  setNewNotificationDays(prev => prev.filter(d => d !== day.val))
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                            {day.label}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
            {addError && <p style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>{addError}</p>}
          </div>
        </Modal>
      </div>
    </AppShell>
  )
}

import { Suspense } from 'react'

export default function TaskBoardPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    }>
      <TaskBoardContent />
    </Suspense>
  )
}
