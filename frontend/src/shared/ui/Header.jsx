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
  Briefcase,
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
    <header className="sticky top-0 z-50 h-[56px] px-6 flex items-center justify-between bg-surface/80 backdrop-blur-xl border-b border-border/50 shadow-sm shrink-0">
      {/* ── LEFT: Logo & Context ── */}
      <div className="flex items-center gap-4 justify-start">
        <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 select-none" onClick={() => navigate('/')}>
          <div className="w-6 h-6 rounded-md bg-text text-bg flex items-center justify-center font-extrabold text-sm">
            <Database size={14} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-text tracking-tight m-0 hidden sm:block">DataDesk</span>
        </div>

        {leftContent && (
          <>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="hidden sm:flex">{leftContent}</div>
          </>
        )}
      </div>

      {/* ── CENTER: Segmented Control / Main Navigation ── */}
      <div className="flex justify-center flex-1 mx-4">
        {centerContent}
      </div>

      {/* ── RIGHT: Tools & Actions ── */}
      <div className="flex items-center gap-1 sm:gap-2 justify-end">
        {navLinks && navLinks.map((link, i) => (
          <button
            key={i}
            type="button"
            onClick={link.onClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 bg-transparent text-text-secondary font-sans text-xs font-medium rounded-sm cursor-pointer transition-colors hover:bg-surface-2 hover:text-text hidden md:flex ${link.primary ? 'text-text font-semibold' : ''}`}
          >
            {link.label}
          </button>
        ))}

        {rightContent && (
          <div className="flex items-center gap-1.5">
             {rightContent}
          </div>
        )}

        {/* Global Mock Interviews Button */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 mx-1 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-primary transition-all font-semibold text-sm border border-blue-500/20 hover:border-blue-500/40 shadow-sm hover:shadow"
          onClick={() => navigate('/interview')}
          title="Mock Interviews"
        >
          <Briefcase size={14} className="text-blue-500" /> <span className="hidden sm:inline">Mock Interviews</span>
        </button>

        <button
          className="flex items-center justify-center p-1.5 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text transition-colors"
          onClick={toggleDarkMode}
          title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {settings.darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {gameState?.currentStreak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full border border-orange-500/20" title={`${gameState.currentStreak} Day Streak`}>
            <Flame size={12} />{gameState.currentStreak}
          </div>
        )}

        <button
          className="flex items-center justify-center p-1.5 rounded-md hover:bg-surface-2 transition-colors text-amber-500"
          onClick={() => navigate('/leaderboard')}
          title="Leaderboard"
        >
          <Trophy size={15} />
        </button>

        {onShowSettings && (
          <button
            className="flex items-center justify-center p-1.5 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text transition-colors"
            onClick={onShowSettings}
            title="Settings"
          >
            <SettingsIcon size={15} />
          </button>
        )}

        <div className="w-px h-4 bg-border mx-1 sm:mx-2" />

        {user ? (
          <button
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-text text-bg rounded-full font-sans text-xs font-semibold cursor-pointer shadow-sm transition-all hover:opacity-90 hover:scale-95"
            onClick={() => navigate('/profile')}
          >
            <User size={14} strokeWidth={2.5} /> <span className="hidden sm:inline">Profile</span>
          </button>
        ) : (
          <button
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-text text-bg rounded-full font-sans text-xs font-semibold cursor-pointer shadow-sm transition-all hover:opacity-90 hover:scale-95"
            onClick={onShowAuth}
          >
            <LogIn size={14} strokeWidth={2.5} /> <span className="hidden sm:inline">Sign In</span>
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
    <div className="flex items-center gap-2 text-[13px] font-semibold">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className="p-0 bg-transparent text-text-secondary hover:text-text transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-text">{item.label}</span>
          )}

          {i < items.length - 1 && <ChevronRight size={14} className="text-border" />}
        </React.Fragment>
      ))}
    </div>
  );
}
