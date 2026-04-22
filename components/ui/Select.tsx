'use client'
import { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string | number }[]
}

export default function Select({ options, style, ...props }: SelectProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        {...props}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          padding: '8px 36px 8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...style
        }}
        onFocus={(e) => {
          e.target.style.outline = '2px solid color-mix(in srgb, var(--text-primary) 20%, transparent)'
          e.target.style.outlineOffset = '2px'
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none'
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
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
  )
}
