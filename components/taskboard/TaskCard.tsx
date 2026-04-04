'use client'
import { useState } from 'react'
import type { Task } from '@/types'
import ProgressBar from '@/components/ui/ProgressBar'
import { useGoals } from '@/context/GoalContext'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface TaskCardProps { task: Task }

export default function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useGoals()
  const [editModal, setEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editMemo, setEditMemo] = useState(task.memo)
  const [editProgress, setEditProgress] = useState(task.progress)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateTask(task.id, { title: editTitle.trim(), memo: editMemo, progress: editProgress })
      setEditModal(false)
    } finally { setSaving(false) }
  }

  return (
    <>
      <div className="animate-fade-in" style={{
        background: '#ffffff',
        border: '1.5px solid #e0dff5',
        borderRadius: 12, padding: '14px 16px', marginBottom: 10,
        boxShadow: '0 1px 6px rgba(99,102,241,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 3px', color: '#1a1a2e', lineHeight: 1.4 }}>
              {task.title}
            </p>
            {task.memo && (
              <p style={{ fontSize: '0.75rem', color: '#8888aa', margin: '0 0 8px', lineHeight: 1.4 }}>
                memo:{task.memo}
              </p>
            )}
            <ProgressBar value={task.progress} label="プログレス" />
          </div>
          <button
            onClick={() => { setEditTitle(task.title); setEditMemo(task.memo); setEditProgress(task.progress); setEditModal(true) }}
            title="編集"
            style={{
              flexShrink: 0, width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: '1.5px solid #d8d7f0',
              background: '#f4f3ff', cursor: 'pointer', fontSize: 13, color: '#6366f1',
            }}
          >✏️</button>
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="タスクを編集"
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditModal(false)}>キャンセル</Button>
            <Button variant="danger" size="sm" onClick={() => deleteTask(task.id)}>削除</Button>
            <Button onClick={handleSave} loading={saving}>保存</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="タスク名" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <Input label="メモ" value={editMemo} onChange={(e) => setEditMemo(e.target.value)} />
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4a4a6a', display: 'block', marginBottom: 6 }}>
              進捗度: {editProgress}%
            </label>
            <input type="range" min={0} max={100} step={5} value={editProgress}
              onChange={(e) => setEditProgress(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
            <ProgressBar value={editProgress} showValue={false} />
          </div>
        </div>
      </Modal>
    </>
  )
}
