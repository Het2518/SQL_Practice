import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  User,
  Sun,
  Moon,
  Settings as SettingsIcon,
  LogIn,
  ChevronRight,
  Trophy,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LeaderboardModal } from '@/features/gamification/LeaderboardModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuth } from '@/hooks/useAuth';
import { useGamificationStore } from '@/stores/useGamificationStore';

export function Header({ leftContent, navLinks, onShowAuth, onShowSettings, rightContent }) {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, toggleDarkMode } = useSettingsStore();
  const { user } = useAuth();
  const { gameState } = useGamificationStore();

  return (
    <header
      style={{
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
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
      }}
    >
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
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--primary-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={16} color="var(--primary)" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.3px',
            }}
          >
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
            <div className="hidden md:block w-[1px] h-4 bg-border mx-2" />

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 bg-surface-2 p-1 rounded-lg">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={link.onClick}
                  aria-pressed={link.primary ? true : undefined}
                  className={`px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all ${
                    link.primary
                      ? 'text-primary hover:bg-surface hover:text-primary-hover'
                      : 'text-text-secondary hover:bg-surface hover:text-text'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Mobile Nav Toggle */}
            <button
              className="md:hidden p-1.5 text-text-secondary hover:text-text rounded-md hover:bg-surface-2 transition-colors ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        )}
      </div>

      {/* ── RIGHT: Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {rightContent}

        <Button
          variant="ghost"
          size="md"
          icon={settings.darkMode ? Sun : Moon}
          onClick={toggleDarkMode}
          style={{ padding: '8px', color: 'var(--text-secondary)' }}
          title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        />

        {gameState?.currentStreak > 0 && (
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20 font-bold text-sm"
            title={`${gameState.currentStreak} Day Streak`}
          >
            <span className="text-lg">🔥</span> {gameState.currentStreak}
          </div>
        )}

        <Button
          variant="ghost"
          size="md"
          icon={Trophy}
          onClick={() => navigate('/leaderboard')}
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

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && navLinks && (
        <div className="absolute top-[54px] left-0 right-0 bg-surface border-b border-border p-4 flex flex-col gap-2 shadow-lg md:hidden">
          {navLinks.map((link, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                link.onClick();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-lg ${
                link.primary ? 'bg-primary/10 text-primary' : 'text-text-secondary bg-surface-2'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
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
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: 'var(--text)' }}>{item.label}</span>
          )}

          {i < items.length - 1 && <ChevronRight size={14} color="var(--border)" />}
        </React.Fragment>
      ))}
    </div>
  );
}
