import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background gradients & Grid */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.6, pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(80px)', zIndex: 0, borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(100px)', zIndex: 0, borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Accents from screenshot */}
      <div style={{
        position: 'absolute', bottom: '6%', right: '8%', opacity: 0.8, pointerEvents: 'none', zIndex: 0
      }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="#ffffff" stroke="#e0e0ff" strokeWidth="0.5" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,1))' }}>
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 10, padding: '24px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(216, 215, 240, 0.5)'
      }}>
        <div style={{
          fontSize: '1.5rem', fontWeight: 800,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em'
        }}>
          ✦ Pathieve
        </div>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/login" style={{
            padding: '10px 20px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600,
            color: 'var(--text-primary)', background: 'transparent', textDecoration: 'none',
            transition: 'all 0.2s'
          }}>
            ログイン
          </Link>
          <Link href="/register" style={{
            padding: '10px 24px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600,
            color: '#fff', background: 'var(--accent)', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)', transition: 'all 0.2s',
            border: '1px solid var(--accent-light)'
          }}>
            無料で始める
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', zIndex: 10, padding: '60px 24px', textAlign: 'center'
      }}>
        <div className="animate-fade-in" style={{
          display: 'inline-block', padding: '8px 24px', borderRadius: 100,
          background: 'linear-gradient(to right, rgba(99,102,241,0.08), rgba(147,51,234,0.08))', 
          color: 'var(--accent-dark)',
          fontSize: '0.95rem', fontWeight: 700, marginBottom: 36,
          border: '1px solid rgba(99,102,241,0.2)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.05)'
        }}>
          ✨ 未来への道筋を、いつでも描き出せる
        </div>

        <h1 style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          fontWeight: 900, color: 'var(--text-primary)',
          letterSpacing: '-0.04em', marginBottom: 56, maxWidth: 1000
        }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            ここが、あなたの
          </span>
          <div style={{
            position: 'relative', display: 'inline-block',
            transform: 'rotate(-4deg)', margin: '16px 0', zIndex: 10
          }}>
            {/* テキスト背後の自然な発光（バックライト） */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '150%', height: '300%', minWidth: '600px',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(210,200,255,0.4) 45%, transparent 75%)',
              filter: 'blur(60px)',
              zIndex: -2, pointerEvents: 'none'
            }} />
            <span style={{
              fontSize: 'clamp(3.5rem, 8vw, 6rem)',
              background: 'linear-gradient(135deg, var(--accent), #9333ea)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              padding: '0 0.1em',
              display: 'inline-block'
            }}>
              「目標達成前夜」
            </span>
            {/* 白い流れ星（背景を横切る光のライン群 - 超増量） */}
            <div style={{ position: 'absolute', top: '-10%', right: '-40%', width: '500px', height: '2.5px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1) 50%, transparent)', transform: 'rotate(-25deg)', boxShadow: '0 0 24px rgba(255,255,255,0.9)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20%', left: '-30%', width: '300px', height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 50%, transparent)', transform: 'rotate(-25deg)', boxShadow: '0 0 16px rgba(255,255,255,0.6)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-40%', left: '10%', width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)', transform: 'rotate(-28deg)', boxShadow: '0 0 10px rgba(255,255,255,0.4)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '0%', right: '-20%', width: '150px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 50%, transparent)', transform: 'rotate(-22deg)', boxShadow: '0 0 12px rgba(255,255,255,0.5)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '30%', left: '-20%', width: '400px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)', transform: 'rotate(-24deg)', boxShadow: '0 0 20px rgba(255,255,255,0.3)', zIndex: -1, pointerEvents: 'none' }} />
            
            <div style={{ position: 'absolute', top: '15%', right: '-50%', width: '350px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent)', transform: 'rotate(-26deg)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '50%', right: '-40%', width: '600px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 50%, transparent)', transform: 'rotate(-25deg)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-30%', right: '0%', width: '150px', height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 50%, transparent)', transform: 'rotate(-24deg)', boxShadow: '0 0 15px rgba(255,255,255,0.8)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40%', left: '-10%', width: '450px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 50%, transparent)', transform: 'rotate(-27deg)', boxShadow: '0 0 20px rgba(255,255,255,0.5)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '20%', left: '-60%', width: '250px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)', transform: 'rotate(-23deg)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '80%', right: '-30%', width: '300px', height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 50%, transparent)', transform: 'rotate(-26deg)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-5%', left: '-50%', width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 50%, transparent)', transform: 'rotate(-25deg)', boxShadow: '0 0 12px rgba(255,255,255,0.7)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '60%', left: '-40%', width: '350px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent)', transform: 'rotate(-25deg)', zIndex: -1, pointerEvents: 'none' }} />

            {/* キラキラのパーティクル（光の粒・大増量） */}
            <div style={{ position: 'absolute', top: '0%', right: '-10%', width: '6px', height: '6px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 15px rgba(255,255,255,1)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '15%', left: '-5%', width: '4px', height: '4px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.8)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-15%', left: '25%', width: '3px', height: '3px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 8px rgba(255,255,255,0.6)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '15%', width: '5px', height: '5px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 12px rgba(255,255,255,0.9)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '40%', right: '-25%', width: '4px', height: '4px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.6)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '100%', left: '50%', width: '2px', height: '2px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%', boxShadow: '0 0 5px rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
            
            <div style={{ position: 'absolute', top: '-25%', right: '35%', width: '5px', height: '5px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '70%', left: '-20%', width: '3px', height: '3px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '4px', height: '4px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '6px', height: '6px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 15px #fff', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '2px', height: '2px', background: '#fff', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '30%', right: '40%', width: '4px', height: '4px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-5%', right: '-30%', width: '7px', height: '7px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 20px #fff', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '3px', height: '3px', background: '#fff', borderRadius: '50%', pointerEvents: 'none' }} />
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            になる。
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', color: '#6060a0',
          lineHeight: 1.8, maxWidth: 680, marginBottom: 56,
          fontWeight: 500
        }}>
          Pathieve（パシーヴ）は、5年後、1年後、1ヶ月後の目標をツリー状に繋ぎ、今のあなたがすべきことを明確にする動的な目標管理ツールです。
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" style={{
            padding: '16px 36px', borderRadius: 16, fontSize: '1.1rem', fontWeight: 700,
            color: '#fff', background: 'linear-gradient(135deg, var(--accent), #7c3aed)', textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'transform 0.2s, boxShadow 0.2s'
          }}>
            無料で始める
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/login" style={{
            padding: '16px 36px', borderRadius: 16, fontSize: '1.1rem', fontWeight: 700,
            color: 'var(--text-primary)', background: 'rgba(255, 255, 255, 0.6)', 
            backdropFilter: 'blur(12px)', textDecoration: 'none',
            border: '1.5px solid rgba(216, 215, 240, 0.8)', display: 'flex', alignItems: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.06)', transition: 'all 0.2s'
          }}>
            ダッシュボードへ
          </Link>
        </div>

        {/* Feature Preview snippet */}
        <div className="animate-scale-in" style={{
          marginTop: 64, width: '100%', maxWidth: 900,
          background: 'var(--bg-surface)', borderRadius: 24,
          padding: '8px', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            background: 'var(--bg-base)', borderRadius: 16, padding: '24px',
            border: '1px dashed var(--border-focus)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250,
            position: 'relative', overflow: 'hidden'
          }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.4 }}>
              <path d="M 100,100 C 200,100 200,200 300,200" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="6 6" />
              <path d="M 300,200 C 400,200 400,50 500,50" fill="none" stroke="var(--warning)" strokeWidth="3" strokeDasharray="6 6" />
            </svg>
            <div style={{
              background: '#fff', padding: '16px 24px', borderRadius: 12,
              boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
              zIndex: 10, color: 'var(--text-primary)', fontWeight: 700
            }}>
              🚀 5年後の大きなビジョンを描く
            </div>
          </div>
        </div>
      </main>

      <footer style={{
        padding: '24px', textAlign: 'center', color: 'var(--text-muted)',
        fontSize: '0.85rem', position: 'relative', zIndex: 10
      }}>
        © {new Date().getFullYear()} Pathieve. あなたの目標達成前夜.
      </footer>
    </div>
  )
}
