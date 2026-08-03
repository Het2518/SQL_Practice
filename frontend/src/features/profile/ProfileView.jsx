import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Settings as SettingsIcon, LogOut, Edit2, Check, X, Zap, Trophy,
  Medal, Share2, BarChart2, MessageSquare, Folder, Swords, Award,
} from 'lucide-react';
import { allQuestions } from '@/data/index';
import { BADGE_DEFS } from '@/hooks/useGamification';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';
import { useToast } from '@/shared/ui/ToastSystem';
import { DashboardTab } from './DashboardTab';
import { LeaderboardTab } from './LeaderboardTab';
import { SettingsTab } from './SettingsTab';
import { PlaylistsTab } from './PlaylistsTab';
import { DiscussionsTab } from './DiscussionsTab';
import { MockInterviewsTab } from './MockInterviewsTab';
import { AchievementsTab } from './AchievementsTab';

const LEAGUES = [
  { name: 'Bronze',  minXP: 0,    color: '#b45309', glow: 'rgba(180,83,9,0.35)' },
  { name: 'Silver',  minXP: 200,  color: '#94a3b8', glow: 'rgba(148,163,184,0.35)' },
  { name: 'Gold',    minXP: 500,  color: '#eab308', glow: 'rgba(234,179,8,0.35)' },
  { name: 'Diamond', minXP: 1000, color: '#6366f1', glow: 'rgba(99,102,241,0.35)' },
  { name: 'Master',  minXP: 2000, color: '#8b5cf6', glow: 'rgba(139,92,246,0.40)' },
  { name: 'Legend',  minXP: 5000, color: '#ec4899', glow: 'rgba(236,72,153,0.45)' },
];
function getLeague(score) {
  let l = LEAGUES[0];
  for (const x of LEAGUES) { if (score >= x.minXP) l = x; }
  return l;
}
function getNextLeague(score) {
  for (const x of LEAGUES) { if (score < x.minXP) return x; }
  return null;
}

const PRIMARY_TABS = [
  { id: 'dashboard',    label: 'Overview',     icon: BarChart2 },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'leaderboard',  label: 'Leaderboard',  icon: Trophy },
  { id: 'interviews',   label: 'Interviews',   icon: Swords },
];
const SECONDARY_TABS = [
  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  { id: 'playlists',   label: 'Playlists',   icon: Folder },
  { id: 'settings',    label: 'Settings',    icon: SettingsIcon },
];

function HeroStat({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <span className={`text-[22px] font-black tabular-nums tracking-tight leading-none ${highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400' : 'text-text'}`}>
        {value}
      </span>
    </div>
  );
}

export function ProfileView({ user, gameState, progress, onHome, onSignOut }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const fullName = user?.displayName || user?.email?.split('@')[0] || 'SQL Practitioner';
  const email    = user?.email || '';
  const handle   = '@' + (user?.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '');

  const { data: rankData } = useQuery({
    queryKey: ['profileRank', user?.id, progress],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await api.leaderboard.get(500);
      const leaderboard = data.data.leaderboard ?? [];
      if (!leaderboard.length) return { totalUsers: 0, rank: 0, percentile: 100 };
      const totalUsers = leaderboard.length;
      const myEntry    = leaderboard.find((e) => String(e.userId) === String(user.id));
      const rank       = myEntry ? myEntry.rank : totalUsers;
      const percent    = totalUsers > 1 ? Math.round(((totalUsers - rank) / (totalUsers - 1)) * 100) : 100;
      return { totalUsers, rank, percentile: Math.max(1, 100 - percent) };
    },
  });

  const realRank       = rankData?.rank       ?? null;
  const realPercentile = rankData?.percentile ?? null;

  const handleSaveName = async () => {
    if (!newName.trim() || newName === fullName) { setIsEditingName(false); return; }
    setIsSavingName(true);
    try {
      await api.auth.updateName(newName.trim());
      window.location.reload();
    } catch (err) {
      addToast('Failed to update name: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsSavingName(false);
      setIsEditingName(false);
    }
  };

  const { stats, nextRecommendations, timelineEvents, quests } = useMemo(() => {
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0;
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    const completedSet = new Set();
    Object.entries(progress || {}).forEach(([qid, status]) => {
      if (status === 'complete') completedSet.add(String(qid));
    });
    const skillsProgress = {
      Joins: { solved: 0, total: 0 }, 'Window Fns': { solved: 0, total: 0 },
      Aggregations: { solved: 0, total: 0 }, CTEs: { solved: 0, total: 0 },
      Subqueries: { solved: 0, total: 0 }, Filtering: { solved: 0, total: 0 },
    };
    allQuestions.forEach((q) => {
      const kw = (q.keywords || []).map((k) => k.toLowerCase());
      const ok = completedSet.has(String(q.id));
      if (kw.some((k) => k.includes('join'))) { skillsProgress['Joins'].total++; if (ok) skillsProgress['Joins'].solved++; }
      if (kw.some((k) => k.includes('window') || k.includes('over') || k.includes('rank'))) { skillsProgress['Window Fns'].total++; if (ok) skillsProgress['Window Fns'].solved++; }
      if (kw.some((k) => k.includes('group by') || k.includes('sum') || k.includes('count') || k.includes('avg'))) { skillsProgress['Aggregations'].total++; if (ok) skillsProgress['Aggregations'].solved++; }
      if (kw.some((k) => k.includes('cte') || k.includes('with'))) { skillsProgress['CTEs'].total++; if (ok) skillsProgress['CTEs'].solved++; }
      if (kw.some((k) => k.includes('subquery'))) { skillsProgress['Subqueries'].total++; if (ok) skillsProgress['Subqueries'].solved++; }
      if (kw.some((k) => k.includes('where') || k.includes('having') || k.includes('filter'))) { skillsProgress['Filtering'].total++; if (ok) skillsProgress['Filtering'].solved++; }
      const diff = (q.difficulty || '').toLowerCase();
      if (diff === 'easy') { easyTotal++; if (ok) easySolved++; }
      else if (diff === 'medium') { mediumTotal++; if (ok) mediumSolved++; }
      else if (diff === 'hard') { hardTotal++; if (ok) hardSolved++; }
    });
    const totalSolved = easySolved + mediumSolved + hardSolved;
    const score = easySolved * 10 + mediumSolved * 30 + hardSolved * 50;
    const accuracyPct = allQuestions.length > 0 ? Math.round((totalSolved / allQuestions.length) * 100) : 0;
    const unsolved = allQuestions.filter((q) => !completedSet.has(String(q.id)));
    const nextRecs = [];
    ['easy', 'medium', 'hard'].forEach((d) => { const r = unsolved.find((q) => (q.difficulty || '').toLowerCase() === d); if (r) nextRecs.push(r); });
    for (const q of unsolved) { if (nextRecs.length >= 3) break; if (!nextRecs.includes(q)) nextRecs.push(q); }
    const streak = gameState?.currentStreak || 0;
    const quests = [
      { id: 1, title: 'Streak Warrior',  desc: 'Reach a 7-day streak.',               current: Math.min(streak, 7),       target: 7,  type: 'streak' },
      { id: 2, title: 'Medium Master',   desc: 'Solve 10 medium difficulty questions.', current: Math.min(mediumSolved, 10), target: 10, type: 'medium' },
      { id: 3, title: 'Hard Challenger', desc: 'Solve 3 hard difficulty questions.',    current: Math.min(hardSolved, 3),    target: 3,  type: 'hard' },
    ];
    let events = [];
    if (gameState?.recentSubmissions?.length) {
      events = gameState.recentSubmissions.map((sub, i) => ({
        id: `sub-${i}`, type: 'solve', title: `Solved "${sub.title}"`,
        time: i === 0 ? 'Just now' : i === 1 ? 'A few hours ago' : `${i} days ago`,
        link: sub.db && sub.id ? `/practice/${sub.db}?q=${sub.id}` : null,
      }));
    }
    if (gameState?.badges) {
      gameState.badges.forEach((bId) => {
        const b = BADGE_DEFS.find((x) => x.id === bId);
        if (b) events.push({ id: `badge-${bId}`, type: 'badge', title: `Earned: ${b.title}`, time: 'Today' });
      });
    }
    return {
      stats: { easyTotal, mediumTotal, hardTotal, easySolved, mediumSolved, hardSolved, totalSolved, totalCount: allQuestions.length, score, accuracyPct, rank: realRank, percentile: realPercentile, skillsProgress },
      nextRecommendations: nextRecs, quests, timelineEvents: events.slice(0, 10),
    };
  }, [progress, gameState, realRank, realPercentile]);

  const league     = getLeague(stats.score);
  const nextLeague = getNextLeague(stats.score);
  const xpToNext   = nextLeague ? nextLeague.minXP - stats.score : 0;
  const leagueStart = LEAGUES.find((l) => l.name === league.name)?.minXP || 0;
  const leagueXpPct = nextLeague ? Math.min(100, ((stats.score - leagueStart) / (nextLeague.minXP - leagueStart)) * 100) : 100;
  const level = Math.floor(stats.score / 100) + 1;
  const interviewReadiness = Math.min(100, Math.round(
    (stats.totalSolved / Math.max(allQuestions.length, 1)) * 60 +
    (stats.accuracyPct / 100) * 20 +
    Math.min((gameState?.currentStreak || 0) / 30, 1) * 20
  ));

  const handleShare = async () => {
    const text = `I've solved ${stats.totalSolved} SQL problems on DataDesk! Rank #${stats.rank ?? '?'} · ${stats.score} XP · ${league.name} League`;
    try {
      if (navigator.share) { await navigator.share({ title: 'My DataDesk Profile', text }); }
      else { await navigator.clipboard.writeText(text); addToast('Stats copied to clipboard'); }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto flex flex-col bg-bg text-text">
      <Header user={user} leftContent={<HeaderBreadcrumbs items={[{ label: 'Home', onClick: onHome }, { label: 'Profile' }]} />} />

      <main className="flex-1 pb-16">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 lg:px-10">

          {/* ─── HERO ─── */}
          <div className="relative overflow-hidden rounded-[32px] border border-border/40 bg-surface mt-6 mb-6 shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
              style={{ background: `radial-gradient(circle, ${league.glow} 0%, transparent 70%)` }} />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
            <div className="absolute inset-0 opacity-[0.018] pointer-events-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

            <div className="relative z-10 p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start gap-8">

                {/* Avatar + ring */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="relative w-[120px] h-[120px]">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-2" />
                      <circle cx="60" cy="60" r="54" fill="none" strokeWidth="4" stroke={league.color}
                        strokeDasharray={`${2 * Math.PI * 54}`}
                        strokeDashoffset={`${2 * Math.PI * 54 * (1 - leagueXpPct / 100)}`}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${league.glow})`, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
                    </svg>
                    <div className="absolute inset-[8px] rounded-full bg-gradient-to-br from-surface-2 to-bg flex items-center justify-center border border-border/20 overflow-hidden">
                      <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-blue-400 select-none">
                        {fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-black tracking-widest uppercase whitespace-nowrap shadow-lg"
                      style={{ background: 'var(--bg)', borderColor: league.color + '50', color: league.color }}>
                      <Zap size={9} strokeWidth={3} />Lv {level}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-md"
                    style={{ background: league.color + '12', borderColor: league.color + '35', color: league.color, boxShadow: `0 0 14px ${league.glow}` }}>
                    <Medal size={12} />
                    {league.name} League
                  </div>
                </div>

                {/* Identity + stats */}
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mb-3">
                      <input autoFocus value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                        className="px-4 py-2 rounded-xl border border-primary/40 bg-bg text-text outline-none text-2xl font-black focus:ring-2 ring-primary/20 w-full max-w-sm" />
                      <button onClick={handleSaveName} disabled={isSavingName}
                        className="p-2 rounded-lg bg-success/10 text-success border border-success/30 cursor-pointer hover:bg-success/20 transition-colors"><Check size={16} /></button>
                      <button onClick={() => setIsEditingName(false)}
                        className="p-2 rounded-lg bg-surface-2 text-muted border border-border cursor-pointer hover:bg-surface-3 transition-colors"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-1 group">
                      <h1 className="m-0 text-[32px] md:text-[40px] font-black tracking-tight text-text leading-none">{fullName}</h1>
                      <button onClick={() => { setNewName(fullName); setIsEditingName(true); }}
                        className="p-1.5 rounded-lg text-muted cursor-pointer hover:bg-surface-2 hover:text-text transition-all opacity-0 group-hover:opacity-100">
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-medium mb-5">
                    <span className="font-mono text-xs">{handle}</span>
                    {email && <><span className="opacity-30">·</span><span className="text-muted text-xs">{email}</span></>}
                  </div>
                  <div className="flex flex-wrap items-center gap-5 md:gap-7">
                    <HeroStat label="Total XP" value={stats.score.toLocaleString()} />
                    <div className="w-px h-8 bg-border/40 hidden sm:block" />
                    <HeroStat label="Global Rank" value={stats.rank ? `#${stats.rank}` : '—'} highlight />
                    <div className="w-px h-8 bg-border/40 hidden sm:block" />
                    <HeroStat label="Top Percentile" value={stats.percentile ? `${stats.percentile}%` : '—'} />
                    <div className="w-px h-8 bg-border/40 hidden sm:block" />
                    <HeroStat label="Streak" value={`${gameState?.currentStreak || 0}d`} />
                    <div className="w-px h-8 bg-border/40 hidden sm:block" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Interview Ready</span>
                      <span className="text-[22px] font-black tabular-nums tracking-tight leading-none text-text">
                        {interviewReadiness}<span className="text-sm font-bold text-muted">/100</span>
                      </span>
                    </div>
                  </div>
                  {nextLeague && (
                    <div className="mt-5 max-w-[360px]">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{xpToNext.toLocaleString()} XP to {nextLeague.name}</span>
                        <span className="text-[10px] font-bold" style={{ color: league.color }}>{Math.round(leagueXpPct)}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${leagueXpPct}%`, background: `linear-gradient(90deg, ${league.color}, ${nextLeague.color})` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex md:flex-col gap-2 flex-shrink-0">
                  <button onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-text text-[13px] font-semibold cursor-pointer hover:bg-surface-3 hover:border-primary/25 transition-all">
                    <Share2 size={14} />Share
                  </button>
                  <button onClick={onSignOut}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-error/25 text-error text-[13px] font-semibold cursor-pointer hover:bg-error/8 transition-all">
                    <LogOut size={14} />Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── NAVIGATION ─── */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1 no-scrollbar">
            <nav className="flex gap-1 bg-surface border border-border/50 p-1 rounded-[14px] flex-shrink-0">
              {PRIMARY_TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold cursor-pointer border transition-all duration-200 whitespace-nowrap ${
                      active ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' : 'bg-transparent text-text-secondary border-transparent hover:bg-surface-2 hover:text-text'
                    }`}>
                    <Icon size={15} className={active ? 'text-primary' : 'opacity-50'} />
                    {label}
                  </button>
                );
              })}
            </nav>
            <div className="w-px h-7 bg-border/50 flex-shrink-0 hidden sm:block" />
            <nav className="flex gap-1 flex-shrink-0">
              {SECONDARY_TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold cursor-pointer border transition-all duration-200 whitespace-nowrap ${
                      active ? 'bg-surface border-border/70 text-text shadow-sm' : 'bg-transparent border-transparent text-muted hover:bg-surface hover:text-text-secondary hover:border-border/40'
                    }`}>
                    <Icon size={13} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ─── TAB CONTENT ─── */}
          <div key={activeTab} className="animate-[smoothFadeIn_0.25s_ease-out_forwards]">
            {activeTab === 'dashboard'    && <DashboardTab stats={stats} gameState={gameState} nextRecommendations={nextRecommendations} quests={quests} timelineEvents={timelineEvents} />}
            {activeTab === 'achievements' && <AchievementsTab gameState={gameState} quests={quests} />}
            {activeTab === 'leaderboard'  && <LeaderboardTab currentUser={user} currentScore={stats.score} />}
            {activeTab === 'interviews'   && <MockInterviewsTab />}
            {activeTab === 'discussions'  && <DiscussionsTab />}
            {activeTab === 'playlists'    && <PlaylistsTab />}
            {activeTab === 'settings'     && <SettingsTab />}
          </div>

        </div>
      </main>
    </div>
  );
}
