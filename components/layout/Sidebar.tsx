'use client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useGoals } from '@/context/GoalContext'

const navItems = [
  {
    href: '/pathmap',
    label: 'Path Map',
    icon: (
      <svg width="15" height="15" viewBox="0 0 512 512">
        <g stroke="currentColor" strokeWidth="64" strokeLinecap="round" opacity="0.4">
          <line x1="128" y1="224" x2="384" y2="224" />
          <line x1="128" y1="224" x2="288" y2="384" />
        </g>
        <g fill="currentColor">
          <rect x="64" y="160" width="128" height="128" rx="32" />
          <rect x="320" y="160" width="128" height="128" rx="32" />
          <rect x="224" y="320" width="128" height="128" rx="32" />
        </g>
      </svg>
    )
  },
  {
    href: '/taskboard',
    label: 'Task Board',
    icon: (
      <svg width="15" height="15" viewBox="0 0 512 512">
        <path fill="currentColor" d="M152.1 38.2c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 113C-2.3 103.6-2.3 88.4 7 79s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zm0 160c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 273c-9.4-9.4-9.4-24.6 0-34s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zM160 416c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32z" />
        <path fill="currentColor" fillOpacity="0.4" d="M224 96c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32zM256 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-224 0z" />
      </svg>
    )
  },
  {
    href: '/achievement',
    label: 'Achievement Log',
    icon: (
      <svg width="15" height="15" viewBox="0 0 512 512">
        <path fill="currentColor" fillOpacity="0.4" d="M128 288 L240 176 L320 256 L448 128 L448 384 C448 401.7 433.7 416 416 416 L112 416 C94.3 416 80 401.7 80 384 L80 288 Z" />
        <path fill="currentColor" d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z" />
      </svg>
    )
  },
  {
    href: '/settings',
    label: 'Setting',
    icon: (
      <svg width="15" height="15" viewBox="0 0 512 512">
        <path
          fill="currentColor"
          fillOpacity="0.4"
          stroke="currentColor"
          strokeWidth="32"
          strokeLinejoin="round"
          d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
        />
      </svg>
    )
  },
]

function TaskBoardSubMenu({ monthGoals }: { monthGoals: any[] }) {
  const searchParams = useSearchParams()
  const currentGoalId = searchParams.get('goal') || (monthGoals.length > 0 ? monthGoals[0].id : null)

  return (
    <div style={{ paddingLeft: 32 }}>
      {monthGoals.map((g) => {
        const isActive = currentGoalId === g.id
        return (
          <Link key={g.id} href={`/taskboard?goal=${g.id}`} style={{
            display: 'block', padding: '6px 8px', marginBottom: 2,
            fontSize: '0.76rem', color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            textDecoration: 'none', borderRadius: 6,
            fontWeight: isActive ? 700 : 500,
            background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isActive ? '✦' : '▸'} {g.title}
          </Link>
        )
      })}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { mode, toggleMode } = useTheme()
  const { goals, logout } = useGoals()

  const monthGoals = goals.filter((g) => g.level === '1month')

  const handleLogout = () => {
    logout()
    router.push('/login') // ログアウト後にログイン画面へ遷移
  }

  return (
    <nav style={{
      width: '200px',
      minWidth: '200px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1.5px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>✦</span>
          <span style={{
            fontWeight: 800, fontSize: '1.05rem',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>Pathieve</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <div key={href}>
              <Link href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
                background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 15, display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
                {label}
              </Link>

              {href === '/taskboard' && active && monthGoals.length > 0 && (
                <Suspense fallback={<div style={{ paddingLeft: 32, fontSize: '0.76rem', color: 'var(--text-muted)' }}>読み込み中...</div>}>
                  <TaskBoardSubMenu monthGoals={monthGoals} />
                </Suspense>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom */}
      <div style={{ padding: '12px 14px', borderTop: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={toggleMode} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 8px', borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'inherit', fontWeight: 500,
        }}>
          {mode === 'dark' ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--warning)' }}>
                <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity={0.3} />
                <g opacity={0.6}>
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
              ライトモード
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" fillOpacity={0.25} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              ダークモード
            </>
          )}
        </button>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 8px', borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'inherit', fontWeight: 500,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          ログアウト
        </button>
      </div>
    </nav>
  )
}
