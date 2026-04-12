'use client'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types'
import ProgressBar from '@/components/ui/ProgressBar'
import { useGoals } from '@/context/GoalContext'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface TaskCardProps { 
  task: Task
  isOverlay?: boolean
}

export default function TaskCard({ task, isOverlay }: TaskCardProps) {
  const { updateTask, deleteTask } = useGoals()
  const [editModal, setEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editMemo, setEditMemo] = useState(task.memo)
  const [editProgress, setEditProgress] = useState(task.progress)
  const [saving, setSaving] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isOverlay })

  // If this is the active dragging item (the placeholder left in the list), make it an empty box
  const isPlaceholder = isDragging && !isOverlay;

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateTask(task.id, { title: editTitle.trim(), memo: editMemo, progress: editProgress })
      setEditModal(false)
    } finally { setSaving(false) }
  }

  return (
    <>
      <div 
        ref={isOverlay ? undefined : setNodeRef}
        className={isOverlay ? "" : "animate-fade-in"} 
        style={{
          transform: isOverlay ? 'scale(1.04) rotate(-1.5deg)' : (isPlaceholder ? undefined : CSS.Transform.toString(transform)),
          transition: isOverlay ? 'none' : transition,
          zIndex: isOverlay ? 999 : (isDragging ? 10 : 1),
          background: isOverlay ? '#f8f7ff' : (isPlaceholder ? '#f8f7ff' : (task.progress === 100 ? '#f4f4f5' : '#ffffff')),
          opacity: task.progress === 100 && !isOverlay && !isPlaceholder ? 0.45 : 1,
          filter: task.progress === 100 && !isOverlay && !isPlaceholder ? 'grayscale(100%)' : 'none',
          border: isOverlay ? '2px solid #6366f1' : (isPlaceholder ? '2px dashed #818cf8' : (task.progress === 100 ? '1.5px dashed #d4d4d8' : '1.5px solid #e0dff5')),
          borderRadius: 12, padding: '14px 16px', marginBottom: 10,
          boxShadow: isOverlay ? '0 16px 40px rgba(99,102,241,0.3)' : (task.progress === 100 ? 'none' : '0 1px 6px rgba(99,102,241,0.06)'),
          cursor: isOverlay ? 'grabbing' : undefined,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, opacity: isPlaceholder ? 0 : 1 }}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: isOverlay ? 'grabbing' : (isPlaceholder ? 'grabbing' : 'grab'),
              color: '#cbd5e1',
              padding: '6px 2px',
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
              marginTop: '4px'
            }}
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
              <circle cx="3" cy="4" r="1.5" />
              <circle cx="9" cy="4" r="1.5" />
              <circle cx="3" cy="10" r="1.5" />
              <circle cx="9" cy="10" r="1.5" />
              <circle cx="3" cy="16" r="1.5" />
              <circle cx="9" cy="16" r="1.5" />
            </svg>
          </div>

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
