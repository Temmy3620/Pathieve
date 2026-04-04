import AppShell from '@/components/layout/AppShell'

export default function AchievementPage() {
    return (
        <AppShell>
            {/* Header */}
            <div style={{ padding: '28px 24px', minHeight: '100vh' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>
                    Achievements
                </h1>
                <p style={{ color: '#8888aa', fontSize: '0.83rem', margin: '4px 0 0' }}>達成ログのテストページです。</p>
            </div>
        </AppShell>
    );
}