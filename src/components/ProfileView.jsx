import React from 'react';

export function ProfileView({ user, gameState, onHome, onSignOut }) {
  return (
    <div className="home-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header className="home-header" style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost" onClick={onHome} style={{ padding: '8px 16px', fontWeight: 600 }}>
            ← Back to Home
          </button>
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Practitioner'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {user?.email || 'Guest User'}
            </span>
          </div>
          {user && (
            <button className="btn btn-ghost" onClick={onSignOut} style={{ padding: '6px 12px', color: 'var(--error)' }}>
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '48px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Your Profile</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Track your learning progress and milestones.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
            {/* Streak */}
            <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 20, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: '0 0 16px', color: 'var(--text)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Your Streak</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <span style={{ fontSize: 64, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{gameState.currentStreak}</span>
                <span style={{ fontSize: 18, color: 'var(--muted)', paddingBottom: 8 }}>days</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12 }}>Best streak: {gameState.maxStreak} days</div>
            </div>

            {/* Activity Heatmap */}
            <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 20, border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 16px', color: 'var(--text)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Activity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 8 }}>
                {Array.from({ length: 45 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (44 - i));
                  const dateStr = d.toISOString().slice(0, 10);
                  const count = gameState.activity[dateStr] || 0;
                  let bg = 'var(--surface-2)';
                  if (count > 0) bg = 'var(--primary-light)';
                  if (count > 2) bg = 'var(--primary)';
                  return (
                    <div key={i} title={`${dateStr}: ${count} questions`} style={{
                      aspectRatio: '1', borderRadius: 6, background: bg, border: '1px solid var(--border)'
                    }} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Badges Unlocked ({gameState.badges.length})</h3>
            </div>
            
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {gameState.badges.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 15 }}>No badges yet. Keep practicing to unlock them!</div>
              ) : (
                gameState.badges.map(b => {
                  let icon = '📚';
                  let title = 'Master';
                  let desc = 'You are doing great';
                  if (b === 'first_query') { icon = '🩸'; title = 'First Blood'; desc = 'Completed your first query'; }
                  if (b === 'streak_3') { icon = '🔥'; title = 'On Fire'; desc = '3 day streak'; }
                  if (b === 'streak_7') { icon = '🚀'; title = 'Unstoppable'; desc = '7 day streak'; }

                  return (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-2)', padding: '16px 24px', borderRadius: 16, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 40, width: 64, height: 64, background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
