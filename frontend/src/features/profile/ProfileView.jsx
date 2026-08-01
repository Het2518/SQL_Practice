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
      if (status === 'complete') completedSet.add(Number(qid));
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
      const isSolved = completedSet.has(Number(q.id));

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
    const unsolved = allQuestions.filter((q) => !completedSet.has(Number(q.id)));
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
    <div
      className="page-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
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
      <main style={{ flex: 1, padding: '40px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* ── Profile Hero ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface)',
              padding: '24px 32px',
              borderRadius: 16,
              border: '1px solid var(--border)',
              marginBottom: 24,
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, var(--primary-muted) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#fff',
                }}
              >
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        outline: 'none',
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      style={{
                        background: 'var(--success)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      style={{
                        background: 'var(--surface-2)',
                        color: 'var(--text)',
                        border: 'none',
                        borderRadius: 4,
                        padding: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 24, color: 'var(--text)', fontWeight: 800 }}>
                      {fullName}
                    </h2>
                    <button
                      onClick={() => {
                        setNewName(fullName);
                        setIsEditingName(true);
                      }}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: 6,
                      }}
                      title="Edit Name"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
                <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>{email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Navigation Tabs */}
              <nav
                style={{
                  display: 'flex',
                  gap: 4,
                  background: 'var(--bg)',
                  padding: 4,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                <TopNavItem
                  icon={<User size={14} />}
                  label="Dashboard"
                  active={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                />
                <TopNavItem
                  icon={<Trophy size={14} />}
                  label="Leaderboard"
                  active={activeTab === 'leaderboard'}
                  onClick={() => setActiveTab('leaderboard')}
                />
                <TopNavItem
                  icon={<Folder size={14} />}
                  label="Playlists"
                  active={activeTab === 'playlists'}
                  onClick={() => setActiveTab('playlists')}
                />
                <TopNavItem
                  icon={<SettingsIcon size={14} />}
                  label="Settings"
                  active={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                />
              </nav>

              <button
                onClick={onSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'var(--surface-2)',
                  color: 'var(--error)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
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
          {activeTab === 'leaderboard' && (
            <LeaderboardTab currentUser={user} currentScore={stats.score} />
          )}
          {activeTab === 'playlists' && <PlaylistsTab />}
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 6,
        border: 'none',
        background: active ? 'var(--surface)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 500,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
