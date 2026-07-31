import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, User, Sun, Moon, Settings as SettingsIcon, LogIn, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LeaderboardModal } from '@/features/gamification/LeaderboardModal';

export function Header({ 
  leftContent,
  navLinks,
  user, 
  settings, 
  onShowAuth, 
  onShowSettings, 
  onToggleDark,
  rightContent
}) {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <header style={{
      height: 54,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
    }}>
      {/* ── LEFT: Logo & Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div 
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            cursor: 'pointer',
            userSelect: 'none',
            padding: '4px 10px 4px 4px',
            borderRadius: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={16} color="var(--primary)" strokeWidth={2.5} />
          </div>
          <span style={{ 
            fontSize: 15, 
            fontWeight: 800, 
            color: 'var(--text)', 
            letterSpacing: '-0.3px' 
          }}>
            DataDesk
          </span>
        </div>

        {leftContent && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            {leftContent}
          </>
        )}

        {navLinks && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', padding: 4, borderRadius: 8 }}>
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={link.onClick}
                  aria-pressed={link.primary ? true : undefined}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: link.primary ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'transparent',
                    border: 'none',
                    transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.color = link.primary ? 'var(--primary-hover)' : 'var(--text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = link.primary ? 'var(--primary)' : 'var(--text-secondary)';
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </>
        )}

      </div>

      {/* ── RIGHT: Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {rightContent}
        
        {onToggleDark && settings && (
          <Button 
            variant="ghost" 
            size="md" 
            icon={settings.darkMode ? Sun : Moon}
            onClick={onToggleDark}
            style={{ padding: '8px', color: 'var(--text-secondary)' }}
            title="Toggle Dark Mode"
            aria-label={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          />
        )}

        <Button 
          variant="ghost" 
          size="md" 
          icon={Trophy}
          onClick={() => setShowLeaderboard(true)}
          style={{ padding: '8px', color: '#f59e0b' }}
          title="Leaderboard"
          aria-label="Open leaderboard"
        />
        
        {onShowSettings && (
          <Button 
            variant="ghost" 
            size="md" 
            icon={SettingsIcon}
            onClick={onShowSettings}
            style={{ padding: '8px', color: 'var(--text-secondary)' }}
            title="Settings"
            aria-label="Open settings"
          />
        )}

        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 8px' }} />


        {user ? (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/profile')}
            style={{ borderRadius: 99, padding: '6px 16px', gap: 6 }}
          >
            <User size={13} strokeWidth={2.5} /> Profile
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onShowAuth}
            style={{ borderRadius: 99, padding: '6px 16px', gap: 6 }}
          >
            <LogIn size={13} strokeWidth={2.5} /> Sign In
          </Button>
        )}
      </div>
      {showLeaderboard && (
        <LeaderboardModal 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)} 
          currentUser={user} 
        />
      )}
    </header>
  );
}

// Helper for breadcrumbs in leftContent
export function HeaderBreadcrumbs({ items }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              style={{
                color: 'var(--muted)',
                cursor: 'pointer',
                transition: 'color 0.15s',
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: 'var(--text)' }}>
              {item.label}
            </span>
          )}
          
          {i < items.length - 1 && (
            <ChevronRight size={14} color="var(--border)" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

