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

export default function TaskBoardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { goals, tasks, isInitialized, checkAuth, refreshData, createTask, reorderTasks } = useGoals()

  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMemo, setNewMemo] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

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
  
  const activeTasksFromContext = [...tasks.filter((t) => t.goal_id === activeGoalId)].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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
      await createTask(activeGoalId, newTitle.trim(), newMemo.trim())
      setNewTitle(''); setNewMemo(''); setAddModal(false)
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
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                  1ヶ月のマイルストーン
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  1ヶ月で達成予定のタスク — 進捗 {avgProgress}%
                </p>
              </div>

              <button onClick={() => setAddModal(true)} style={{
                display: 'block', width: '100%', padding: '12px',
                marginBottom: 16, borderRadius: 10,
                border: '1.5px dashed var(--border-focus)', background: 'var(--bg-raised)',
                color: 'var(--border-focus)', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                transition: 'background 0.15s',
              }}>＋ 新しいタスクの追加</button>

              {localTasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: 20 }}>
                  まだタスクがありません
                </p>
              ) : (
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
                    items={localTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                      {localTasks.map((t) => <TaskCard key={t.id} task={t} />)}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeDragTask ? <TaskCard task={activeDragTask} isOverlay /> : null}
                  </DragOverlay>
                </DndContext>
              )}
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
            {addError && <p style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>{addError}</p>}
          </div>
        </Modal>
      </div>
    </AppShell>
  )
}
