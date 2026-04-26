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
  const { updateTask, deleteTask, cancelRecurrence } = useGoals()
  const [editModal, setEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editMemo, setEditMemo] = useState(task.memo)
  const [editProgress, setEditProgress] = useState(task.progress)
  const [editNotificationTime, setEditNotificationTime] = useState(task.notification_time || '09:00')
  const [editNotificationDays, setEditNotificationDays] = useState<string[]>(task.notification_days ? task.notification_days.split(',') : [])
  const [saving, setSaving] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isOverlay || task.progress === 100 })

  // If this is the active dragging item (the placeholder left in the list), make it an empty box
  const isPlaceholder = isDragging && !isOverlay;
  const showAsDone = task.progress === 100 && !isOverlay && !isPlaceholder;
  const isRecurring = !!task.template_id;

  const handleSave = async () => {
    setSaving(true)
    try {
      const notifDays = editNotificationDays.length > 0 ? editNotificationDays.join(',') : undefined;
      await updateTask(task.id, { 
        title: editTitle.trim(), 
        memo: editMemo, 
        progress: editProgress,
        ...(isRecurring ? {
          notification_time: editNotificationTime,
          notification_days: notifDays
        } : {})
      })
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
          background: isOverlay ? 'var(--bg-raised)' : (isPlaceholder ? 'var(--bg-raised)' : (task.progress === 100 ? 'var(--task-complete-bg)' : 'var(--bg-surface)')),
          filter: showAsDone ? 'grayscale(100%) opacity(0.7)' : 'none',
          border: isOverlay ? '2px solid var(--accent)' : (isPlaceholder ? '2px dashed var(--accent-light)' : (task.progress === 100 ? '1.5px dashed var(--task-complete-border)' : '1.5px solid var(--border)')),
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
              cursor: isOverlay ? 'grabbing' : (isPlaceholder ? 'grabbing' : (task.progress === 100 ? 'default' : 'grab')),
              color: task.progress === 100 ? 'transparent' : '#cbd5e1',
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
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 3px', color: showAsDone ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1.4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <span>{task.title}</span>
              {task.template_id && (
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.65rem', background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 6, fontWeight: 700, letterSpacing: '0.02em', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <path d="M17 2l4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="M7 22l-4-4 4-4" opacity="0.4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" opacity="0.4" />
                  </svg>
                  定期
                </span>
              )}
            </p>
            {task.memo && (
              <p style={{ fontSize: '0.75rem', color: showAsDone ? 'var(--text-muted)' : 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.4, opacity: showAsDone ? 0.6 : 1 }}>
                memo:{task.memo}
              </p>
            )}
            {!isRecurring && (
              <div style={{ opacity: showAsDone ? 0.6 : 1 }}>
                <ProgressBar value={task.progress} label="プログレス" />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isRecurring && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await updateTask(task.id, { progress: task.progress === 100 ? 0 : 100 });
                }}
                title={task.progress === 100 ? "未完了に戻す" : "完了にする"}
                style={{
                  flexShrink: 0, height: 30,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 12px 0 8px',
                  borderRadius: 15,
                  border: task.progress === 100 ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                  background: task.progress === 100 ? 'var(--accent)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  color: task.progress === 100 ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: task.progress === 100 ? 'none' : '1.5px solid var(--border)',
                  background: task.progress === 100 ? '#fff' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={task.progress === 100 ? "var(--accent)" : "currentColor"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: task.progress === 100 ? 1 : 0 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                {task.progress === 100 ? '完了' : '完了にする'}
              </button>
            )}
            
            <button
              onClick={() => { 
                setEditTitle(task.title); 
                setEditMemo(task.memo); 
                setEditProgress(task.progress); 
                setEditNotificationTime(task.notification_time || '09:00');
                setEditNotificationDays(task.notification_days ? task.notification_days.split(',') : []);
                setEditModal(true) 
              }}
            title="編集"
            style={{
              flexShrink: 0, width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: showAsDone ? '1.5px solid transparent' : '1.5px solid var(--border)',
              background: showAsDone ? 'transparent' : 'var(--bg-raised)', 
              cursor: 'pointer', 
              color: showAsDone ? 'var(--text-muted)' : 'var(--accent)',
              transition: 'all 0.15s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" fill="currentColor" fillOpacity={0.25} />
            </svg>
          </button>
        </div>
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="タスクを編集"
        actions={
          <>
            {isRecurring && (
              <Button variant="ghost" onClick={async () => {
                if (confirm('以降の自動生成を停止しますか？（現在のタスクはそのまま残ります）')) {
                  await cancelRecurrence(task.id, task.template_id!);
                  setEditModal(false);
                }
              }} style={{ color: 'var(--danger)', marginRight: 'auto' }}>定期を解除</Button>
            )}
            <Button variant="ghost" onClick={() => setEditModal(false)}>キャンセル</Button>
            <Button variant="danger" size="sm" onClick={() => deleteTask(task.id)}>削除</Button>
            <Button onClick={handleSave} loading={saving}>保存</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="タスク名" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <Input label="メモ" value={editMemo} onChange={(e) => setEditMemo(e.target.value)} />
          {!isRecurring ? (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                進捗度: {editProgress}%
              </label>
              <input type="range" min={0} max={100} step={5} value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
              <ProgressBar value={editProgress} showValue={false} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input type="checkbox" id="recurring-complete" 
                  checked={editProgress === 100}
                  onChange={(e) => setEditProgress(e.target.checked ? 100 : 0)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <label htmlFor="recurring-complete" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  このタスクを完了にする
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>通知時間</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select
                    value={editNotificationTime}
                    onChange={(e) => setEditNotificationTime(e.target.value)}
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

              {task.recurrence === 'weekly' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>通知する曜日</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { label: '日', val: '0' }, { label: '月', val: '1' },
                      { label: '火', val: '2' }, { label: '水', val: '3' },
                      { label: '木', val: '4' }, { label: '金', val: '5' },
                      { label: '土', val: '6' }
                    ].map((day) => {
                      const isSelected = editNotificationDays.includes(day.val);
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
                                setEditNotificationDays(prev => [...prev, day.val])
                              } else {
                                setEditNotificationDays(prev => prev.filter(d => d !== day.val))
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
        </div>
      </Modal>
    </>
  )
}
