'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useGoals } from '@/context/GoalContext'

const navItems = [
  { href: '/pathmap', label: 'Path Map', icon: '🗺️' },
  { href: '/taskboard', label: 'Task Board', icon: '📋' },
  { href: '/achievement', label: 'Achievement Log', icon: '🏆' },
  { href: '/settings', label: 'Setting', icon: '⚙️' },
]

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
      background: '#ffffff',
      borderRight: '1.5px solid #d8d7f0',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1.5px solid #d8d7f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>✦</span>
          <span style={{
            fontWeight: 800, fontSize: '1.05rem',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
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
                color: active ? '#6366f1' : '#4a4a6a',
                fontWeight: active ? 700 : 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
                background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                borderLeft: `3px solid ${active ? '#6366f1' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </Link>

              {href === '/taskboard' && active && monthGoals.length > 0 && (
                <div style={{ paddingLeft: 32 }}>
                  {monthGoals.map((g) => (
                    <Link key={g.id} href={`/taskboard?goal=${g.id}`} style={{
                      display: 'block', padding: '5px 8px',
                      fontSize: '0.76rem', color: '#8888aa',
                      textDecoration: 'none', borderRadius: 6,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      ▸ {g.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom */}
      <div style={{ padding: '12px 14px', borderTop: '1.5px solid #d8d7f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={toggleMode} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 8px', borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: '#8888aa', fontSize: '0.78rem', fontFamily: 'inherit', fontWeight: 500,
        }}>
          {mode === 'dark' ? '☀️ ライトモード' : '🌙 ダークモード'}
        </button>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 8px', borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: '#8888aa', fontSize: '0.78rem', fontFamily: 'inherit', fontWeight: 500,
        }}>
          🚪 ログアウト
        </button>
      </div>
    </nav>
  )
}
