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
  Flame,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LeaderboardModal } from '@/features/gamification/LeaderboardModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuth } from '@/hooks/useAuth';
import { useGamificationStore } from '@/stores/useGamificationStore';

export function Header({ leftContent, centerContent, navLinks, onShowAuth, onShowSettings, rightContent }) {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, toggleDarkMode } = useSettingsStore();
  const { user } = useAuth();
  const { gameState } = useGamificationStore();

  return (
    <header className="home-header">
      {/* ── LEFT: Logo & Context ── */}
      <div className="home-header-left">
        <div className="home-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="home-logo-badge">
            <Database size={14} strokeWidth={2.5} />
          </div>
          <span className="home-title">DataDesk</span>
        </div>

        {leftContent && (
          <>
            <div className="home-header-sep" />
            {leftContent}
          </>
        )}
      </div>

      {/* ── CENTER: Segmented Control / Main Navigation ── */}
      <div className="home-header-center">
        {centerContent}
      </div>

      {/* ── RIGHT: Tools & Actions ── */}
      <div className="home-nav">
        {navLinks && navLinks.map((link, i) => (
          <button
            key={i}
            type="button"
            onClick={link.onClick}
            className={`nav-btn ${link.primary ? 'primary-text' : ''}`}
          >
            {link.label}
          </button>
        ))}

        {rightContent && (
          <>
             {rightContent}
          </>
        )}

        <button
          className="nav-btn nav-btn-icon"
          onClick={toggleDarkMode}
          title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {settings.darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {gameState?.currentStreak > 0 && (
          <div className="pill pill-easy" title={`${gameState.currentStreak} Day Streak`} style={{ gap: 4, display: 'flex', alignItems: 'center' }}>
            <Flame size={12} />{gameState.currentStreak}
          </div>
        )}

        <button
          className="nav-btn nav-btn-icon"
          onClick={() => navigate('/leaderboard')}
          style={{ color: '#f59e0b' }}
          title="Leaderboard"
        >
          <Trophy size={15} />
        </button>

        {onShowSettings && (
          <button
            className="nav-btn nav-btn-icon"
            onClick={onShowSettings}
            title="Settings"
          >
            <SettingsIcon size={15} />
          </button>
        )}

        <div className="home-header-sep" style={{ margin: '0 8px' }} />

        {user ? (
          <button
            className="nav-btn-primary"
            onClick={() => navigate('/profile')}
            style={{ borderRadius: 9999, padding: '6px 14px' }}
          >
            <User size={14} strokeWidth={2.5} /> Profile
          </button>
        ) : (
          <button
            className="nav-btn-primary"
            onClick={onShowAuth}
            style={{ borderRadius: 9999, padding: '6px 14px' }}
          >
            <LogIn size={14} strokeWidth={2.5} /> Sign In
          </button>
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
              className="nav-btn"
              style={{ padding: 0 }}
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
