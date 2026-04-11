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

export default function TaskBoardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { goals, tasks, isInitialized, checkAuth, refreshData, createTask } = useGoals()

  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
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
  const activeTasks = tasks.filter((t) => t.goal_id === activeGoalId)
  const avgProgress = activeTasks.length > 0
    ? Math.round(activeTasks.reduce((s, t) => s + t.progress, 0) / activeTasks.length)
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

  return (
    <AppShell>
      <div style={{ padding: '28px 24px', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Task Board</h1>
        <p style={{ color: '#8888aa', fontSize: '0.83rem', margin: '0 0 24px' }}>1ヶ月ごとのタスクを管理する</p>

        {!isInitialized ? (
          <div style={{ color: '#8888aa', textAlign: 'center', paddingTop: 60 }}>読み込み中...</div>
        ) : monthGoals.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: '#8888aa' }}>
            <p>1ヶ月後の目標がありません。Path Mapで目標を追加してください。</p>
            <Button onClick={() => router.push('/pathmap')} style={{ marginTop: 16 }}>Path Mapへ</Button>
          </div>
        ) : activeGoal ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '240px 1fr',
            background: '#ffffff',
            borderRadius: 16, border: '1.5px solid #d8d7f0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(99,102,241,0.10)',
          }}>
            {/* Left: timeline */}
            <div style={{
              background: '#f8f7ff',
              borderRight: '1.5px solid #d8d7f0',
              padding: 20,
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8888aa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Pathタイムライン
              </p>
              <PathTimeline goals={goals} activeGoalId={activeGoal.id} />

              {monthGoals.length > 1 && (
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8888aa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    他のボード
                  </p>
                  {monthGoals.filter((g) => g.id !== activeGoalId).map((g) => (
                    <button key={g.id} onClick={() => setActiveGoalId(g.id)} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '6px 8px', borderRadius: 6, border: 'none',
                      background: 'transparent', color: '#8888aa',
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
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px' }}>
                  1ヶ月のマイルストーン
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#8888aa', margin: 0 }}>
                  1ヶ月で達成予定のタスク — 進捗 {avgProgress}%
                </p>
              </div>

              <button onClick={() => setAddModal(true)} style={{
                display: 'block', width: '100%', padding: '12px',
                marginBottom: 16, borderRadius: 10,
                border: '1.5px dashed #a5b4fc', background: '#f8f7ff',
                color: '#6366f1', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                transition: 'background 0.15s',
              }}>＋ 新しいタスクの追加</button>

              {activeTasks.length === 0 ? (
                <p style={{ color: '#8888aa', fontSize: '0.85rem', textAlign: 'center', paddingTop: 20 }}>
                  まだタスクがありません
                </p>
              ) : (
                <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                  {activeTasks.map((t) => <TaskCard key={t.id} task={t} />)}
                </div>
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
            {addError && <p style={{ fontSize: '0.82rem', color: '#ef4444' }}>{addError}</p>}
          </div>
        </Modal>
      </div>
    </AppShell>
  )
}
