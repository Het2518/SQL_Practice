import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Settings as SettingsIcon,
  User,
  Activity,
  LogOut,
  Code,
  ExternalLink,
  MapPin,
  Globe,
  Briefcase,
  Link as LinkIcon,
  Edit2,
  Check,
  X,
  ShieldAlert,
  Database,
  Trophy,
  Zap,
  Target,
  ArrowRight,
  Clock,
  Star,
  Lock,
  Swords,
  Flame,
  Medal,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { allQuestions } from '@/data/index';
import { BADGE_DEFS } from '@/hooks/useGamification';
// Supabase removed — using api.js
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';

import { useCountUp } from './useCountUp';
import { RadarChart } from './RadarChart';
import { DashboardTab } from './DashboardTab';
import { LeaderboardTab } from './LeaderboardTab';
import { SettingsTab } from './SettingsTab';
import { PlaylistsTab } from './PlaylistsTab';
import { DiscussionsTab } from './DiscussionsTab';
import { MockInterviewsTab } from './MockInterviewsTab';
import { AchievementsTab } from './AchievementsTab';
import { MessageSquare, Folder } from 'lucide-react';

export function ProfileView({ user, gameState, progress, onHome, onSignOut }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const fullName = user?.displayName || user?.email?.split('@')[0] || 'SQL Practitioner';
  const email = user?.email || 'guest@example.com';

  const { data: rankData } = useQuery({
    queryKey: ['profileRank', user?.id, progress],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await api.leaderboard.get(500);
      const leaderboard = data.data.leaderboard ?? [];
      if (!leaderboard.length) return { totalUsers: 0, rank: 0, percentile: 100 };

      const totalUsers = leaderboard.length;
      const myEntry = leaderboard.find((e) => String(e.userId) === String(user.id));
      const rank = myEntry ? myEntry.rank : totalUsers;
      const percent =
        totalUsers > 1 ? Math.round(((totalUsers - rank) / (totalUsers - 1)) * 100) : 100;
      const percentile = Math.max(1, 100 - percent);
      return { totalUsers, rank, percentile };
    },
  });

  const totalPlatformUsers = rankData?.totalUsers ?? null;
  const realRank = rankData?.rank ?? null;
  const realPercentile = rankData?.percentile ?? null;

  const handleSaveName = async () => {
    if (!newName.trim() || newName === fullName) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await api.auth.updateName(newName.trim());
      window.location.reload();
    } catch (err) {
      alert('Failed to update name: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingName(false);
      setIsEditingName(false);
    }
  };

  // Calculate Progress Stats correctly using ONLY real data
  const { difficultyStats, nextRecommendations, timelineEvents, quests } = useMemo(() => {
    let easyTotal = 0,
      mediumTotal = 0,
      hardTotal = 0;
    let easySolved = 0,
      mediumSolved = 0,
      hardSolved = 0;

    const completedSet = new Set();
    Object.entries(progress || {}).forEach(([qid, status]) => {
      if (status === 'complete') completedSet.add(String(qid));
    });

    const skillsProgress = {
      Joins: { solved: 0, total: 0 },
      'Window Functions': { solved: 0, total: 0 },
      Aggregations: { solved: 0, total: 0 },
      CTEs: { solved: 0, total: 0 },
      Subqueries: { solved: 0, total: 0 },
      Filtering: { solved: 0, total: 0 },
    };

    allQuestions.forEach((q) => {
      const qkw = (q.keywords || []).map((k) => k.toLowerCase());
      const isSolved = completedSet.has(String(q.id));

      const isJoin = qkw.some((k) => k.includes('join'));
      const isWindow = qkw.some(
        (k) => k.includes('window') || k.includes('over') || k.includes('rank')
      );
      const isAgg = qkw.some(
        (k) =>
          k.includes('group by') || k.includes('sum') || k.includes('count') || k.includes('avg')
      );
      const isCte = qkw.some((k) => k.includes('cte') || k.includes('with'));
      const isSubq = qkw.some((k) => k.includes('subquery'));
      const isFilter = qkw.some(
        (k) => k.includes('where') || k.includes('having') || k.includes('filter')
      );

      if (isJoin) {
        skillsProgress['Joins'].total++;
        if (isSolved) skillsProgress['Joins'].solved++;
      }
      if (isWindow) {
        skillsProgress['Window Functions'].total++;
        if (isSolved) skillsProgress['Window Functions'].solved++;
      }
      if (isAgg) {
        skillsProgress['Aggregations'].total++;
        if (isSolved) skillsProgress['Aggregations'].solved++;
      }
      if (isCte) {
        skillsProgress['CTEs'].total++;
        if (isSolved) skillsProgress['CTEs'].solved++;
      }
      if (isSubq) {
        skillsProgress['Subqueries'].total++;
        if (isSolved) skillsProgress['Subqueries'].solved++;
      }
      if (isFilter) {
        skillsProgress['Filtering'].total++;
        if (isSolved) skillsProgress['Filtering'].solved++;
      }

      const diff = (q.difficulty || '').toLowerCase();
      if (diff === 'easy') {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (diff === 'medium') {
        mediumTotal++;
        if (isSolved) mediumSolved++;
      } else if (diff === 'hard') {
        hardTotal++;
        if (isSolved) hardSolved++;
      }
    });
    const score = easySolved * 10 + mediumSolved * 30 + hardSolved * 50;

    // Find next recommended questions (1 Easy, 1 Medium, 1 Hard)
    const unsolved = allQuestions.filter((q) => !completedSet.has(String(q.id)));
    const nextRecs = [];
    const getNext = (diff) => unsolved.find((q) => (q.difficulty || '').toLowerCase() === diff);
    const recEasy = getNext('easy');
    const recMedium = getNext('medium');
    const recHard = getNext('hard');

    if (recEasy) nextRecs.push(recEasy);
    if (recMedium) nextRecs.push(recMedium);
    if (recHard) nextRecs.push(recHard);

    // Fill remainder if we don't have 3
    for (const q of unsolved) {
      if (nextRecs.length >= 3) break;
      if (!nextRecs.includes(q)) nextRecs.push(q);
    }

    // Generate Quests
    const streak = gameState?.currentStreak || 0;
    const quests = [
      {
        id: 1,
        title: 'Keep the Fire Burning',
        desc: 'Reach a 7-day streak.',
        current: Math.min(streak, 7),
        target: 7,
        type: 'streak',
      },
      {
        id: 2,
        title: 'Medium Master',
        desc: 'Solve 10 Medium difficulty questions.',
        current: Math.min(mediumSolved, 10),
        target: 10,
        type: 'medium',
      },
      {
        id: 3,
        title: 'The Challenger',
        desc: 'Solve 3 Hard difficulty questions.',
        current: Math.min(hardSolved, 3),
        target: 3,
        type: 'hard',
      },
    ];

    // Generate Timeline Events
    let events = [];
    if (gameState?.recentSubmissions && Array.isArray(gameState.recentSubmissions)) {
      events = gameState.recentSubmissions.map((sub, i) => {
        let timeStr = 'Today';
        if (i === 0) timeStr = 'Just now';
        else if (i === 1) timeStr = 'A few hours ago';
        else if (i > 3) timeStr = `${i} days ago`;

        return {
          id: `sub-${i}`,
          type: 'solve',
          title: `Solved ${sub.title}`,
          time: timeStr,
          icon: <Check size={14} color="var(--success)" />,
          link: sub.db && sub.id ? `/practice/${sub.db}?q=${sub.id}` : null,
        };
      });
    }
    if (gameState?.badges) {
      gameState.badges.forEach((bId, i) => {
        const b = BADGE_DEFS.find((x) => x.id === bId);
        if (b) {
          events.push({
            id: `badge-${bId}`,
            type: 'badge',
            title: `Earned Badge: ${b.title}`,
            time: `Today`,
            icon: <Star size={14} color="var(--warning)" />,
          });
        }
      });
    }

    return {
      difficultyStats: {
        easyTotal,
        mediumTotal,
        hardTotal,
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved: easySolved + mediumSolved + hardSolved,
        totalCount: allQuestions.length,
        score,
        rank: realRank,
        percentile: realPercentile,
        skillsProgress,
      },
      nextRecommendations: nextRecs,
      quests,
      timelineEvents: events.slice(0, 8),
    };
  }, [progress, totalPlatformUsers, gameState, realRank, realPercentile]);

  const stats = difficultyStats;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto flex flex-col bg-bg text-text page-enter">
      {/* ── Global Header ── */}
      <Header
        user={user}
        leftContent={
          <HeaderBreadcrumbs
            items={[{ label: 'Home', onClick: onHome }, { label: 'My Profile' }]}
          />
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 bg-bg">
        <div className="max-w-[1200px] mx-auto">
          {/* ── Premium Profile Hero ── */}
          <div className="relative overflow-hidden bg-surface/80 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-border/50 shadow-2xl shadow-black/40 mb-8 group transition-all duration-300 hover:border-primary/30">
            {/* Background Orbs & Noise */}
            <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-all duration-700" />
            <div className="absolute -bottom-[150px] -left-[150px] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left: User Info & Avatar */}
              <div className="flex items-center gap-6 w-full md:w-auto">
                {/* Circular XP Ring Avatar */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-2" />
                    <circle 
                      cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" 
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeDasharray="289" strokeDashoffset={289 - (289 * Math.min(stats.score / 500, 1))} strokeLinecap="round" 
                    />
                  </svg>
                  <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-surface to-surface-2 border-2 border-surface-3 flex items-center justify-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-blue-400">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 bg-surface border border-border px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-primary uppercase shadow-sm">
                    Lvl {Math.floor(stats.score / 100) + 1}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-primary/50 bg-bg text-text outline-none text-xl font-black focus:ring-2 ring-primary/20"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={isSavingName}
                        className="bg-success text-white border-none rounded-lg p-1.5 cursor-pointer hover:bg-success/90 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="bg-surface-2 text-text border border-border rounded-lg p-1.5 cursor-pointer hover:bg-surface-3 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="m-0 text-3xl md:text-4xl text-text font-black tracking-tight">{fullName}</h2>
                      <button
                        onClick={() => {
                          setNewName(fullName);
                          setIsEditingName(true);
                        }}
                        className="bg-surface-2 border border-border rounded-lg text-text-secondary cursor-pointer p-1.5 hover:text-text hover:border-primary/50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Name"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="m-0 text-sm text-text-secondary font-medium tracking-wide">{email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-text-secondary">
                      <Medal size={12} className="text-warning" /> League: <span className="text-text">Diamond</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-text-secondary">
                      <Flame size={12} className="text-error" /> Streak: <span className="text-text">{gameState?.currentStreak || 0}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Core Motivation Metrics */}
              <div className="flex items-center gap-6 w-full md:w-auto bg-bg/50 border border-border/50 rounded-2xl p-5 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Total XP</span>
                  <span className="text-3xl font-black text-text tabular-nums">{stats.score}</span>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Global Rank</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 tabular-nums">#{stats.rank?.toLocaleString() || '---'}</span>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Percentile</span>
                  <span className="text-3xl font-black text-text tabular-nums">Top {stats.percentile || '--'}%</span>
                </div>
              </div>
            </div>
          </div>

            <div className="flex gap-4 items-center flex-wrap">
              {/* Premium Navigation Tabs */}
              <nav className="flex gap-2 bg-surface/50 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md">
                <TopNavItem
                  icon={<User size={16} />}
                  label="Overview"
                  active={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                />
                <TopNavItem
                  icon={<Star size={16} />}
                  label="Achievements"
                  active={activeTab === 'achievements'}
                  onClick={() => setActiveTab('achievements')}
                />
                <TopNavItem
                  icon={<Trophy size={16} />}
                  label="Leaderboard"
                  active={activeTab === 'leaderboard'}
                  onClick={() => setActiveTab('leaderboard')}
                />
                <TopNavItem
                  icon={<SettingsIcon size={16} />}
                  label="Settings"
                  active={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                />
                {/* Secondary tabs tucked away */}
                <div className="w-px h-6 bg-border/50 self-center mx-1" />
                <TopNavItem
                  icon={<MessageSquare size={16} />}
                  label="Discussions"
                  active={activeTab === 'discussions'}
                  onClick={() => setActiveTab('discussions')}
                />
                <TopNavItem
                  icon={<Folder size={16} />}
                  label="Playlists"
                  active={activeTab === 'playlists'}
                  onClick={() => setActiveTab('playlists')}
                />
              </nav>

              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-2 text-error border border-border cursor-pointer text-[13px] font-semibold hover:bg-surface-3 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

          {activeTab === 'dashboard' && (
            <DashboardTab
              stats={stats}
              gameState={gameState}
              nextRecommendations={nextRecommendations}
              quests={quests}
              timelineEvents={timelineEvents}
            />
          )}
          {activeTab === 'achievements' && (
            <AchievementsTab 
              gameState={gameState} 
              quests={quests} 
            />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardTab currentUser={user} currentScore={stats.score} />
          )}
          {activeTab === 'discussions' && <DiscussionsTab />}
          {activeTab === 'playlists' && <PlaylistsTab />}
          {activeTab === 'interviews' && <MockInterviewsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

function TopNavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-none text-[13px] font-bold cursor-pointer transition-all duration-300 ${
        active 
          ? 'bg-surface-2 text-text shadow-sm border border-border/50 ring-1 ring-primary/20 scale-100' 
          : 'bg-transparent text-text-secondary hover:text-text hover:bg-surface-2/50 scale-95 hover:scale-100'
      }`}
    >
      {React.cloneElement(icon, { className: active ? 'text-primary' : '' })}
      <span>{label}</span>
    </button>
  );
}
