'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {label && (
          <label htmlFor={inputId} style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#4a4a6a',
            letterSpacing: '0.02em',
          }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: `1.5px solid ${error ? '#ef4444' : '#d8d7f0'}`,
            background: '#ffffff',
            color: '#1a1a2e',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : '#6366f1'
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 3px rgba(239,68,68,0.12)'
              : '0 0 0 3px rgba(99,102,241,0.12)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : '#d8d7f0'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />
        {error && <p style={{ fontSize: '0.78rem', color: '#ef4444', margin: 0 }}>{error}</p>}
        {hint && !error && <p style={{ fontSize: '0.78rem', color: '#8888aa', margin: 0 }}>{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export default Input
