import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Trophy, Medal, Crown, Flame, Zap } from 'lucide-react';

const RANK_COLORS = {
  1: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)', glow: '0 0 20px rgba(234,179,8,0.35)', label: 'Gold' },
  2: { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)', glow: '0 0 14px rgba(148,163,184,0.25)', label: 'Silver' },
  3: { color: '#b45309', bg: 'rgba(180,83,9,0.10)', border: 'rgba(180,83,9,0.30)', glow: '0 0 14px rgba(180,83,9,0.25)', label: 'Bronze' },
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
      <div className="w-8 h-4 bg-surface-2 rounded" />
      <div className="w-8 h-8 rounded-full bg-surface-2" />
      <div className="flex-1 h-4 bg-surface-2 rounded" />
      <div className="w-16 h-4 bg-surface-2 rounded" />
    </div>
  );
}

function PodiumCard({ entry, position }) {
  const theme = RANK_COLORS[position];
  const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
  const name = entry.displayName || 'Anonymous';
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className={`flex flex-col items-center gap-3 ${position === 1 ? 'order-2' : position === 2 ? 'order-1' : 'order-3'}`}>
      {/* Crown for #1 */}
      {position === 1 && <Crown size={22} style={{ color: theme.color, filter: `drop-shadow(0 0 6px ${theme.color})` }} />}
      {position !== 1 && <div className="h-[22px]" />}

      {/* Avatar ring */}
      <div className="relative">
        <div className={`${position === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full flex items-center justify-center text-xl font-black border-2 transition-all`}
          style={{ background: theme.bg, borderColor: theme.border, color: theme.color, boxShadow: theme.glow }}>
          {initial}
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black"
          style={{ background: theme.color, borderColor: 'var(--bg)', color: position === 1 ? '#000' : '#fff' }}>
          {position}
        </div>
      </div>

      {/* Name + score */}
      <div className="text-center">
        <div className={`font-black text-text truncate max-w-[100px] ${position === 1 ? 'text-[14px]' : 'text-[13px]'}`}>{name}</div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Zap size={10} style={{ color: theme.color }} />
          <span className="text-[12px] font-bold tabular-nums" style={{ color: theme.color }}>{(entry.score || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Podium column */}
      <div className={`w-full ${heights[position]} rounded-t-[12px] flex items-end justify-center pb-2`}
        style={{ background: `linear-gradient(180deg, ${theme.bg} 0%, transparent 100%)`, border: `1px solid ${theme.border}`, borderBottom: 'none' }}>
        <Trophy size={position === 1 ? 20 : 15} style={{ color: theme.color, opacity: 0.7 }} />
      </div>
    </div>
  );
}

function RankRow({ entry }) {
  const name    = entry.displayName || (entry.isCurrentUser ? 'You' : 'Anonymous');
  const initial = name.charAt(0).toUpperCase();
  const isTop3  = entry.rank <= 3;
  const theme   = isTop3 ? RANK_COLORS[entry.rank] : null;

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 border-b border-border/30 last:border-0 transition-colors ${
      entry.isCurrentUser ? 'bg-primary/6 border-l-2 border-l-primary' : 'hover:bg-surface-2'
    }`}>
      {/* Rank */}
      <div className={`w-8 text-[14px] font-black tabular-nums flex-shrink-0 ${isTop3 ? '' : 'text-muted'}`}
        style={isTop3 ? { color: theme.color } : {}}>
        {isTop3 ? (
          <span style={{ filter: `drop-shadow(0 0 4px ${theme.color})` }}>#{entry.rank}</span>
        ) : `#${entry.rank}`}
      </div>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black flex-shrink-0 ${entry.isCurrentUser ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface-2 text-text-secondary border border-border/40'}`}>
        {initial}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-semibold truncate ${entry.isCurrentUser ? 'text-primary font-bold' : 'text-text'}`}>
          {name}
          {entry.isCurrentUser && (
            <span className="ml-2 text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">You</span>
          )}
        </div>
      </div>

      {/* XP score */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Zap size={12} className={entry.isCurrentUser ? 'text-primary' : 'text-muted'} />
        <span className={`text-[13px] font-bold tabular-nums ${entry.isCurrentUser ? 'text-primary' : 'text-text'}`}>
          {(entry.score || 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export function LeaderboardTab({ currentUser, currentScore }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.leaderboard.get(200).then(({ data }) => {
      const leaderboard = data.data.leaderboard ?? [];
      const processed   = leaderboard.map((entry) => ({
        ...entry,
        isCurrentUser: String(entry.userId) === String(currentUser?.id),
        score: String(entry.userId) === String(currentUser?.id) && currentScore != null ? currentScore : entry.score,
      }));
      processed.sort((a, b) => b.score - a.score);
      processed.forEach((p, i) => { p.rank = i + 1; });
      setEntries(processed);
    }).catch((err) => {
      console.error('[LeaderboardTab]', err.message);
    }).finally(() => setLoading(false));
  }, [currentUser, currentScore]);

  const top3    = entries.slice(0, 3);
  const rest    = entries.slice(3, 100);
  const myEntry = entries.find((e) => e.isCurrentUser);

  return (
    <div className="flex flex-col gap-6">

      {/* ─── Podium ─── */}
      <div className="bg-surface border border-border/50 rounded-[24px] p-8 overflow-hidden">
        <div className="flex items-center gap-2 mb-8">
          <Trophy size={16} className="text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Global Leaderboard</span>
          {myEntry && (
            <span className="ml-auto text-[11px] text-muted font-medium">
              Your rank: <span className="text-text font-bold">#{myEntry.rank}</span>
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center gap-8 pb-6">
            {[2, 1, 3].map((p) => (
              <div key={p} className="flex flex-col items-center gap-3 animate-pulse">
                <div className={`${p === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-surface-2`} />
                <div className="w-20 h-4 bg-surface-2 rounded" />
                <div className={`w-full ${p === 1 ? 'h-28' : p === 2 ? 'h-20' : 'h-16'} bg-surface-2 rounded-t-xl`} />
              </div>
            ))}
          </div>
        ) : top3.length >= 3 ? (
          <div className="grid grid-cols-3 gap-4 items-end max-w-sm mx-auto">
            <PodiumCard entry={top3[1]} position={2} />
            <PodiumCard entry={top3[0]} position={1} />
            <PodiumCard entry={top3[2]} position={3} />
          </div>
        ) : null}
      </div>

      {/* ─── Rest of table ─── */}
      <div className="bg-surface border border-border/50 rounded-[24px] overflow-hidden">
        <div className="grid grid-cols-[32px_36px_1fr_auto] gap-4 px-5 py-3 bg-surface-2 border-b border-border/50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Rank</span>
          <span></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">User</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted text-right">XP</span>
        </div>

        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
        ) : rest.length === 0 && entries.length === 0 ? (
          <div className="text-center py-16 text-muted text-[13px] font-medium">No rankings available yet.</div>
        ) : (
          <div>
            {rest.map((entry) => <RankRow key={entry.userId || entry.rank} entry={entry} />)}
          </div>
        )}
      </div>

    </div>
  );
}
