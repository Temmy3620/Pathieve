'use client'
import { useState } from 'react'
import type { Goal, Task } from '@/types'
import { getDeletionStatus } from '@/lib/deletionValidation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useGoals } from '@/context/GoalContext'

const LEVEL_STYLES = {
  '5year':  { bg: 'var(--goal-5year-bg)', border: 'var(--goal-5year)', label: '5年後', badgeColor: 'var(--goal-5year)', badgeBg: 'var(--goal-5year-badge-bg)' },
  '1year':  { bg: 'var(--goal-1year-bg)', border: '#fcd34d', label: '1年後', badgeColor: '#b45309', badgeBg: 'var(--goal-1year-badge-bg)' },
  '1month': { bg: 'var(--goal-1month-bg)', border: '#94a3b8', label: '1ヶ月後', badgeColor: '#475569', badgeBg: 'var(--goal-1month-badge-bg)' },
}

interface GoalCardProps {
  goal: Goal
  allGoals: Goal[]
  allTasks: Task[]
  onAddChild?: () => void
}

export default function GoalCard({ goal, allGoals, allTasks, onAddChild }: GoalCardProps) {
  const { updateGoal, deleteGoal } = useGoals()
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState(goal.title)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const style = LEVEL_STYLES[goal.level]
  const { canDelete, reason } = getDeletionStatus(goal, allGoals, allTasks)

  const handleSave = async () => {
    if (!editTitle.trim()) return
    setSaving(true)
    try {
      await updateGoal(goal.id, editTitle.trim())
      setEditMode(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    await deleteGoal(goal.id)
    setDeleteModal(false)
  }

  return (
    <>
      <div
        id={`goal-card-${goal.id}`}
        data-goal-id={goal.id}
        className="animate-fade-in"
        style={{
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s',
      }}>
        {/* Level badge */}
        <span style={{
          display: 'inline-block', marginBottom: 7,
          fontSize: '0.65rem', fontWeight: 700,
          color: style.badgeColor, background: style.badgeBg,
          padding: '2px 7px', borderRadius: 999,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {style.label}の目標
        </span>

        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <Button size="sm" onClick={handleSave} loading={saving}>保存</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditMode(false); setEditTitle(goal.title) }}>キャンセル</Button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 10px', wordBreak: 'break-word' }}>
            {goal.title}
          </p>
        )}

        {!editMode && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setEditMode(true)} style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--bg-surface)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
            }}>編集</button>

            {canDelete && (
              <button onClick={() => setDeleteModal(true)} style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 6,
                border: '1px solid #fca5a5', background: '#fff1f1',
                color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit',
              }}>削除</button>
            )}
          </div>
        )}

        {onAddChild && (
          <button onClick={onAddChild} style={{
            display: 'block', width: '100%', marginTop: 10, padding: '7px',
            borderRadius: 8, border: `1.5px dashed ${style.border}`,
            background: 'transparent', color: style.badgeColor,
            fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'center', transition: 'background 0.15s',
          }}>＋（子目標の追加）</button>
        )}
      </div>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)}
        title="目標を削除しますか？" danger
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>キャンセル</Button>
            <Button variant="danger" onClick={handleDelete}>削除する</Button>
          </>
        }
      >
        <p>「{goal.title}」を削除します。この操作は取り消せません。</p>
        {reason && <p style={{ color: 'var(--danger)', marginTop: 8 }}>{reason}</p>}
      </Modal>
    </>
  )
}
