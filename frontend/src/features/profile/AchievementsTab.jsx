import React from 'react';
import { Lock, Target, Award, Shield, Zap, Star, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { BADGE_DEFS } from '@/hooks/useGamification';

// Badge icon mapping — no emoji, use Lucide icons
const BADGE_ICONS = {
  first_query:  Zap,
  streak_3:     Flame,
  streak_7:     Flame,
  solved_10:    Star,
  solved_50:    Award,
  perfect_db:   Shield,
};

// Rarity tiers based on badge id pattern
function getRarity(badge) {
  if (badge.id === 'perfect_db' || badge.id === 'solved_50') return { label: 'Legendary', color: '#ec4899', glow: 'rgba(236,72,153,0.35)', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.35)' };
  if (badge.id === 'streak_7'   || badge.id === 'solved_10') return { label: 'Rare',      color: '#6366f1', glow: 'rgba(99,102,241,0.30)',  bg: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.30)' };
  return { label: 'Common', color: '#94a3b8', glow: 'rgba(148,163,184,0.20)', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.25)' };
}

import { Flame } from 'lucide-react';

function BadgeCard({ badge, isEarned }) {
  const rarity = getRarity(badge);
  const IconComp = BADGE_ICONS[badge.id] || Award;
  return (
    <div className={`relative overflow-hidden rounded-[20px] p-5 border flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 group ${
      isEarned ? 'hover:shadow-lg cursor-default' : 'opacity-45 grayscale cursor-default'
    }`}
      style={{
        background: isEarned ? rarity.bg : 'var(--surface-2)',
        borderColor: isEarned ? rarity.border : 'var(--border)',
        boxShadow: isEarned ? `0 0 0 0 transparent` : 'none',
      }}
      onMouseEnter={(e) => { if (isEarned) e.currentTarget.style.boxShadow = `0 8px 30px ${rarity.glow}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {isEarned && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      )}

      {!isEarned && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center">
          <Lock size={10} className="text-muted" />
        </div>
      )}

      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{ background: isEarned ? rarity.color + '18' : 'var(--border)', border: `1px solid ${isEarned ? rarity.border : 'transparent'}` }}>
        <IconComp size={22} style={{ color: isEarned ? rarity.color : 'var(--muted)' }} strokeWidth={isEarned ? 2 : 1.5} />
      </div>

      <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded-full border"
        style={{ color: isEarned ? rarity.color : 'var(--muted)', background: isEarned ? rarity.bg : 'transparent', borderColor: isEarned ? rarity.border : 'var(--border)' }}>
        {rarity.label}
      </div>
      <h4 className="text-[12px] font-black text-text mb-1 tracking-wide leading-tight">{badge.title}</h4>
      <p className="text-[10px] text-muted leading-relaxed font-medium">{badge.description}</p>
    </div>
  );
}

function QuestCard({ quest }) {
  const pct     = Math.min(100, (quest.current / quest.target) * 100);
  const isDone  = quest.current >= quest.target;
  const color   = quest.type === 'streak' ? '#f97316' : quest.type === 'hard' ? '#ef4444' : '#6366f1';
  const TypeIcon = quest.type === 'streak' ? Flame : quest.type === 'hard' ? Shield : Target;
  return (
    <div className="relative overflow-hidden p-5 rounded-[20px] border border-border/40 bg-surface flex flex-col gap-4 hover:-translate-y-0.5 hover:border-primary/25 transition-all duration-200"
      style={isDone ? { borderColor: '#22c55e50', background: 'rgba(34,197,94,0.04)' } : {}}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            <TypeIcon size={15} style={{ color }} />
          </div>
          <div>
            <h4 className="text-[13px] font-black text-text mb-0.5 leading-tight">{quest.title}</h4>
            <p className="text-[11px] text-muted font-medium leading-relaxed">{quest.desc}</p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          {isDone
            ? <CheckCircle size={18} className="text-success" />
            : <span className="text-[11px] font-black tabular-nums text-text-secondary">{quest.current}<span className="text-muted font-medium">/{quest.target}</span></span>
          }
        </div>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: isDone ? '#22c55e' : color, boxShadow: `0 0 8px ${isDone ? '#22c55e' : color}60` }} />
      </div>
    </div>
  );
}

export function AchievementsTab({ gameState, quests }) {
  const earnedBadges = new Set(gameState?.badges || []);
  const earnedCount  = earnedBadges.size;

  // Sort: earned first, then by rarity (legendary → common)
  const rarityOrder = { Legendary: 0, Rare: 1, Common: 2 };
  const sortedBadges = [...BADGE_DEFS].sort((a, b) => {
    const aEarned = earnedBadges.has(a.id) ? 0 : 1;
    const bEarned = earnedBadges.has(b.id) ? 0 : 1;
    if (aEarned !== bEarned) return aEarned - bEarned;
    return rarityOrder[getRarity(a).label] - rarityOrder[getRarity(b).label];
  });

  return (
    <div className="flex flex-col gap-8">

      {/* ─── Quests ─── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Target size={16} className="text-primary" />
            <h2 className="m-0 text-[15px] font-black text-text tracking-tight">Active Quests</h2>
          </div>
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            {quests.filter(q => q.current >= q.target).length} / {quests.length} complete
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quests.map((q) => <QuestCard key={q.id} quest={q} />)}
        </div>
      </section>

      {/* ─── Badges ─── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Award size={16} className="text-primary" />
            <h2 className="m-0 text-[15px] font-black text-text tracking-tight">Badge Collection</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted font-bold">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span><span className="text-text">{earnedCount}</span> unlocked</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-[11px] text-muted font-bold">{BADGE_DEFS.length - earnedCount} locked</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} isEarned={earnedBadges.has(badge.id)} />
          ))}
        </div>
      </section>

    </div>
  );
}
