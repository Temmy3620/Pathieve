'use client'
import { ReactNode, useEffect } from 'react'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
  danger?: boolean
}

export default function Modal({ isOpen, onClose, title, children, actions, danger }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10,10,30,0.55)',
        backdropFilter: 'blur(4px)',
      }} />
      {/* Panel */}
      <div className="animate-scale-in" style={{
        position: 'relative',
        background: '#ffffff',
        border: `1.5px solid ${danger ? '#ef4444' : '#d8d7f0'}`,
        borderRadius: 16,
        padding: 28,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 8px 40px rgba(10,10,50,0.18)',
      }}>
        <h3 style={{
          margin: '0 0 12px',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: danger ? '#ef4444' : '#1a1a2e',
        }}>
          {title}
        </h3>
        <div style={{ color: '#4a4a6a', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {children}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
