'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const VARIANT_COLORS: Record<Variant, { bg: string; color: string; border: string; hoverBg: string }> = {
  primary:   { bg: 'var(--accent)', color: 'var(--bg-surface)', border: 'var(--accent)', hoverBg: '#4f46e5' },
  secondary: { bg: 'var(--bg-raised)', color: 'var(--text-secondary)', border: 'var(--border)', hoverBg: 'var(--bg-base)' },
  danger:    { bg: 'var(--danger)', color: 'var(--bg-surface)', border: 'var(--danger)', hoverBg: '#dc2626' },
  ghost:     { bg: 'transparent', color: '#6060a0', border: 'transparent', hoverBg: 'var(--bg-raised)' },
}

const SIZE_STYLES: Record<Size, { padding: string; fontSize: string; borderRadius: string }> = {
  sm: { padding: '4px 10px',  fontSize: '0.8rem',   borderRadius: '6px' },
  md: { padding: '8px 16px',  fontSize: '0.875rem', borderRadius: '8px' },
  lg: { padding: '11px 22px', fontSize: '0.95rem',  borderRadius: '10px' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const colors = VARIANT_COLORS[variant]
  const sizes = SIZE_STYLES[size]

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        background: colors.bg,
        color: colors.color,
        border: `1.5px solid ${colors.border}`,
        ...sizes,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = colors.hoverBg
          if (variant === 'primary' || variant === 'danger') {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.25)'
          }
        }
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.bg
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
        onMouseLeave?.(e)
      }}
      {...props}
    >
      {loading && (
        <span style={{
          width: 14, height: 14,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          display: 'inline-block',
          flexShrink: 0,
        }} />
      )}
      {children}
    </button>
  )
}
