import React, { useState, useMemo, useEffect } from 'react';
import { Settings as SettingsIcon, User, Activity, LogOut, Code, ExternalLink, MapPin, Globe, Briefcase, Link as LinkIcon, Edit2, Check, X, ShieldAlert, Database, Trophy, Zap, Target, ArrowRight, Clock, Star, Lock, Swords, Flame, Medal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { allQuestions } from '@/data/index';
import { BADGE_DEFS } from '@/hooks/useGamification';
import { supabase } from '@/lib/supabase';

// Helper for count up animation
function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Radar Chart Component (No external libraries required)
// ─────────────────────────────────────────────────────────────────────────────
function RadarChart({ data, size = 280 }) {
  const center = size / 2;
  const radius = (size / 2) - 40; 
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const valRatio = Math.max(0.1, d.value / (d.fullMark || 1));
    return {
      x: center + radius * valRatio * Math.cos(angle),
      y: center + radius * valRatio * Math.sin(angle),
      labelX: center + (radius + 25) * Math.cos(angle),
      labelY: center + (radius + 20) * Math.sin(angle),
      label: d.label,
      valRatio
    };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Generate web background
  const webs = [0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => {
    const p = data.map((_, j) => {
      const angle = j * angleStep - Math.PI / 2;
      return `${j === 0 ? 'M' : 'L'} ${center + radius * scale * Math.cos(angle)} ${center + radius * scale * Math.sin(angle)}`;
    }).join(' ') + ' Z';
    return <path key={i} d={p} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray={scale === 1 ? "0" : "2 4"} />;
  });

  return (
    <div style={{ width: size, height: size, position: 'relative', margin: '0 auto' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {webs}
        
        {/* Axis lines */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line key={`axis-${i}`} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="var(--border)" strokeWidth="1" />
          );
        })}

        {/* Data Polygon */}
        <path d={polygonPath} fill="url(#radarFill)" stroke="var(--primary)" strokeWidth="2.5" filter="url(#glow)" style={{ transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        
        {/* Data Points */}
        {points.map((p, i) => (
          <circle key={`pt-${i}`} cx={p.x} cy={p.y} r="5" fill="var(--bg)" stroke="var(--primary)" strokeWidth="2" style={{ transition: 'all 1s ease' }} />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const words = p.label.split(' ');
          return (
            <text key={`lbl-${i}`} x={p.labelX} y={p.labelY} fill="var(--text)" fontSize="12" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
              {words.length > 1 ? (
                <>
                  <tspan x={p.labelX} dy="-0.4em">{words[0]}</tspan>
                  <tspan x={p.labelX} dy="1.2em">{words.slice(1).join(' ')}</tspan>
                </>
              ) : (
                <tspan x={p.labelX} dy="0">{words[0]}</tspan>
              )}
            </text>
          );
        })}
      </svg>
    </div>
  );
}


export function ProfileView({ user, gameState, progress, settings, onSaveSettings, onHome, onSignOut }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [totalPlatformUsers, setTotalPlatformUsers] = useState(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'SQL Practitioner';
  const email = user?.email || 'guest@example.com';
  
  const [realRank, setRealRank] = useState(null);
  const [realPercentile, setRealPercentile] = useState(null);

  useEffect(() => {
    supabase.from('user_progress').select('user_id, completed_questions')
      .then(({ data, error }) => {
        if (!error && data) {
          const processed = data.map(row => {
            let s = 0;
            if (row.completed_questions) {
              Object.entries(row.completed_questions).forEach(([qId, status]) => {
                if (status === 'complete') {
                  const q = allQuestions.find(x => String(x.id) === String(qId));
                  if (q) {
                    if (q.difficulty === 'easy') s += 10;
                    else if (q.difficulty === 'medium') s += 30;
                    else if (q.difficulty === 'hard') s += 50;
                  }
                }
              });
            }
            return { userId: row.user_id, score: s };
          });
          
          // Re-evaluate my own current score using my live progress state 
          // because the DB might not be fully synced yet
          let myScore = 0;
          Object.entries(progress || {}).forEach(([qId, status]) => {
            if (status === 'complete') {
              const q = allQuestions.find(x => String(x.id) === String(qId));
              if (q) {
                if (q.difficulty === 'easy') myScore += 10;
                else if (q.difficulty === 'medium') myScore += 30;
                else if (q.difficulty === 'hard') myScore += 50;
              }
            }
          });

          const curr = processed.find(p => p.userId === user?.id);
          if (curr) curr.score = myScore;
          else processed.push({ userId: user?.id, score: myScore });

          processed.sort((a, b) => b.score - a.score);
          const totalUsers = processed.length;
          setTotalPlatformUsers(totalUsers);
          
          const myIndex = processed.findIndex(p => p.userId === user?.id);
          const rank = myIndex !== -1 ? myIndex + 1 : totalUsers;
          setRealRank(rank);
          
          // Calculate percentile (e.g. top X%)
          const percent = totalUsers > 1 ? Math.round(((totalUsers - rank) / (totalUsers - 1)) * 100) : 100;
          setRealPercentile(Math.max(1, 100 - percent)); // 'Top 1%' instead of 'Top 99%'
        }
      });
  }, [user, progress]);

  const handleSaveName = async () => {
    if (!newName.trim() || newName === fullName) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim(), name: newName.trim() }
      });
      if (error) throw error;
      window.location.reload(); 
    } catch (err) {
      alert("Failed to update name: " + err.message);
    } finally {
      setIsSavingName(false);
      setIsEditingName(false);
    }
  };

  // Calculate Progress Stats correctly using ONLY real data
  const { difficultyStats, nextRecommendations, timelineEvents, quests } = useMemo(() => {
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0;
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    
    const completedSet = new Set();
    Object.entries(progress || {}).forEach(([qid, status]) => {
      if (status === 'complete') completedSet.add(Number(qid));
    });

    const skillsProgress = {
      'Joins': { solved: 0, total: 0 },
      'Window Functions': { solved: 0, total: 0 },
      'Aggregations': { solved: 0, total: 0 },
      'CTEs': { solved: 0, total: 0 },
      'Subqueries': { solved: 0, total: 0 },
      'Filtering': { solved: 0, total: 0 }
    };

    allQuestions.forEach(q => {
      const qkw = (q.keywords || []).map(k => k.toLowerCase());
      const isSolved = completedSet.has(Number(q.id));
      
      const isJoin = qkw.some(k => k.includes('join'));
      const isWindow = qkw.some(k => k.includes('window') || k.includes('over') || k.includes('rank'));
      const isAgg = qkw.some(k => k.includes('group by') || k.includes('sum') || k.includes('count') || k.includes('avg'));
      const isCte = qkw.some(k => k.includes('cte') || k.includes('with'));
      const isSubq = qkw.some(k => k.includes('subquery'));
      const isFilter = qkw.some(k => k.includes('where') || k.includes('having') || k.includes('filter'));

      if (isJoin) { skillsProgress['Joins'].total++; if (isSolved) skillsProgress['Joins'].solved++; }
      if (isWindow) { skillsProgress['Window Functions'].total++; if (isSolved) skillsProgress['Window Functions'].solved++; }
      if (isAgg) { skillsProgress['Aggregations'].total++; if (isSolved) skillsProgress['Aggregations'].solved++; }
      if (isCte) { skillsProgress['CTEs'].total++; if (isSolved) skillsProgress['CTEs'].solved++; }
      if (isSubq) { skillsProgress['Subqueries'].total++; if (isSolved) skillsProgress['Subqueries'].solved++; }
      if (isFilter) { skillsProgress['Filtering'].total++; if (isSolved) skillsProgress['Filtering'].solved++; }
      
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
    const score = (easySolved * 10) + (mediumSolved * 30) + (hardSolved * 50);
    
    // Find next recommended questions (1 Easy, 1 Medium, 1 Hard)
    const unsolved = allQuestions.filter(q => !completedSet.has(Number(q.id)));
    const nextRecs = [];
    const getNext = (diff) => unsolved.find(q => (q.difficulty || '').toLowerCase() === diff);
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
    const streak = gameState?.streak || 0;
    const quests = [
      { id: 1, title: "Keep the Fire Burning", desc: "Reach a 7-day streak.", current: Math.min(streak, 7), target: 7, type: 'streak' },
      { id: 2, title: "Medium Master", desc: "Solve 10 Medium difficulty questions.", current: Math.min(mediumSolved, 10), target: 10, type: 'medium' },
      { id: 3, title: "The Challenger", desc: "Solve 3 Hard difficulty questions.", current: Math.min(hardSolved, 3), target: 3, type: 'hard' }
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
          link: sub.db && sub.id ? `/practice/${sub.db}?q=${sub.id}` : null
        };
      });
    }
    if (gameState?.badges) {
      gameState.badges.forEach((bId, i) => {
        const b = BADGE_DEFS.find(x => x.id === bId);
        if (b) {
          events.push({
            id: `badge-${bId}`,
            type: 'badge',
            title: `Earned Badge: ${b.title}`,
            time: `Today`,
            icon: <Star size={14} color="var(--warning)" />
          });
        }
      });
    }

    return {
      difficultyStats: {
        easyTotal, mediumTotal, hardTotal,
        easySolved, mediumSolved, hardSolved,
        totalSolved: easySolved + mediumSolved + hardSolved,
        totalCount: allQuestions.length,
        score,
        rank: realRank,
        percentile: realPercentile,
        skillsProgress
      },
      nextRecommendations: nextRecs,
      quests,
      timelineEvents: events.slice(0, 8) 
    };
  }, [progress, totalPlatformUsers, gameState]);

  const stats = difficultyStats;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* Top Header Bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        
        {/* User Info (Left) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '10px', 
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 16, fontWeight: 800, color: '#fff'
          }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontSize: 14 }} />
                <button onClick={handleSaveName} disabled={isSavingName} style={{ background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer' }}><Check size={14} /></button>
                <button onClick={() => setIsEditingName(false)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ margin: '0', fontSize: 16, color: 'var(--text)', fontWeight: 700 }}>{fullName}</h2>
                <button onClick={() => { setNewName(fullName); setIsEditingName(true); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }} title="Edit Name"><Edit2 size={12} /></button>
              </div>
            )}
            <p style={{ margin: '0', fontSize: 12, color: 'var(--muted)' }}>{email}</p>
          </div>
        </div>

        {/* Navigation Tabs (Center) */}
        <nav style={{ display: 'flex', gap: 8, background: 'var(--surface-2)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
          <TopNavItem icon={<User size={14} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <TopNavItem icon={<Trophy size={14} />} label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
          <TopNavItem icon={<SettingsIcon size={14} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        {/* Actions (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onHome} className="btn" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            Return to Practice
          </button>
          <button onClick={onSignOut} className="btn" style={{ background: 'transparent', color: 'var(--error)', border: '1px solid var(--error-muted)' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {activeTab === 'dashboard' && <DashboardTab stats={stats} gameState={gameState} nextRecommendations={nextRecommendations} quests={quests} timelineEvents={timelineEvents} />}
          {activeTab === 'leaderboard' && <LeaderboardTab currentUser={user} currentScore={stats.score} />}
          {activeTab === 'settings' && <SettingsTab settings={settings} onSaveSettings={onSaveSettings} />}
        </div>
      </main>
    </div>
  );
}

function TopNavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none',
      background: active ? 'var(--surface)' : 'transparent',
      color: active ? 'var(--text)' : 'var(--text-secondary)',
      fontWeight: active ? 600 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
    }} onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)'; }} onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Tab
// ─────────────────────────────────────────────────────────────────────────────
function DashboardTab({ stats, gameState, nextRecommendations, quests, timelineEvents }) {
  const radarData = Object.entries(stats.skillsProgress).map(([label, data]) => ({
    label,
    value: data.solved,
    fullMark: data.total
  }));

  const totalScore = stats.score;
  const nextMilestone = 500; // Hardcoded for example, or could be based on current score
  const xpPct = Math.min((totalScore / nextMilestone) * 100, 100);

  return (
    <div style={{ animation: 'smoothFadeIn 0.3s ease-out forwards', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* 1. HERO BAND (XP BAR) */}
      <div style={{ padding: '32px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px', color: 'var(--text)' }}>
              Overview
            </h1>
            <div style={{ display: 'flex', gap: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
              <span><span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', marginRight: 6 }}>Global Rank</span><strong style={{ color: 'var(--text)' }}>#{stats.rank?.toLocaleString() || '...'}</strong></span>
              <span><span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', marginRight: 6 }}>Percentile</span><strong style={{ color: 'var(--primary)' }}>Top {stats.percentile || '...'}%</strong></span>
              <span><span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', marginRight: 6 }}>Total Solved</span><strong style={{ color: 'var(--text)' }}>{stats.totalSolved}</strong></span>
              <span><span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', marginRight: 6 }}>Badges</span><strong style={{ color: 'var(--text)' }}>{gameState?.badges?.length || 0}</strong></span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>XP Progress</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{totalScore} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>/ {nextMilestone}</span></div>
          </div>
        </div>
        
        {/* Full-width XP Bar */}
        <div style={{ height: 12, background: 'var(--surface-2)', borderRadius: 6, overflow: 'hidden' }}>
           <div style={{ height: '100%', width: `${xpPct}%`, background: 'var(--primary)', borderRadius: 6, transition: 'width 1s ease-out' }} />
        </div>
      </div>

      {/* 2. 3-COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        
        {/* Topic Mastery */}
        <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Topic Mastery</h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(stats.skillsProgress).map(([topic, data]) => {
              const pct = data.total > 0 ? (data.solved / data.total) * 100 : 0;
              return (
                <div key={topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{topic}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{data.solved} / {data.total}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quests */}
        <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Active Quests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {quests.map(quest => {
              const pct = (quest.current / quest.target) * 100;
              const isDone = quest.current >= quest.target;
              return (
                <div key={quest.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: isDone ? 'var(--success)' : 'var(--text)' }}>{quest.title} {isDone && '✓'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{quest.current}/{quest.target}</div>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isDone ? 'var(--success)' : 'var(--warning)', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Next Badge</div>
            <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13, color: 'var(--text)', border: '1px solid var(--border)' }}>
              <strong>🥷 SQL Ninja:</strong> Solve 36 more questions.
            </div>
          </div>
        </div>

        {/* Placement Prep */}
        <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Placement Prep</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nextRecommendations.map(q => (
               <Link to={`/practice/${q.db}?q=${q.id}`} key={q.id} style={{
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-2)', 
                 borderRadius: 8, border: '1px solid var(--border)', textDecoration: 'none', transition: 'border-color 0.2s'
               }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                     <span className={`pill pill-${q.difficulty}`} style={{ padding: '2px 6px', fontSize: 10 }}>{q.difficulty}</span>
                   </div>
                   <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{q.title}</span>
                 </div>
                 <ArrowRight size={14} color="var(--primary)" />
               </Link>
            ))}
          </div>
        </div>

      </div>

      {/* 3. CONSISTENCY HEATMAP */}
      <div style={{ padding: 32, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
          Consistency Heatmap
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          <div><strong style={{ color: 'var(--text)' }}>{Object.keys(gameState.activity || {}).length}</strong> days active</div>
          <div>Current Streak: <strong style={{ color: 'var(--text)' }}>{gameState.streak || 0}</strong></div>
        </div>
        
        {/* Generate a dense 52-week grid (approx 364 days). We render columns of 7. */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 12 }}>
          {Array.from({ length: 52 }).map((_, colIdx) => (
            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Array.from({ length: 7 }).map((_, rowIdx) => {
                const dayOffset = (51 - colIdx) * 7 + (6 - rowIdx);
                const d = new Date();
                d.setDate(d.getDate() - dayOffset);
                const dateStr = d.toISOString().slice(0, 10);
                const count = gameState.activity?.[dateStr] || 0;
                
                let bg = 'var(--surface-2)';
                if (count === 1) bg = '#a5b4fc';
                if (count === 2) bg = '#818cf8';
                if (count > 2) bg = '#4f46e5';
                
                return (
                  <div key={rowIdx} title={`${count} submissions on ${dateStr}`} style={{
                    width: 14, height: 14, borderRadius: 3, background: bg, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.02)'
                  }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 4. BADGES & ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Badges */}
        <div style={{ padding: 32, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Badge Collection
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
            {BADGE_DEFS.map(badge => {
              const isEarned = gameState?.badges?.includes(badge.id);
              return (
                <div key={badge.id} style={{
                  padding: 20, borderRadius: 12, background: isEarned ? 'var(--surface-2)' : 'var(--bg)',
                  border: `1px solid ${isEarned ? 'var(--border)' : 'var(--surface-2)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  opacity: isEarned ? 1 : 0.5, position: 'relative'
                }}>
                  {!isEarned && <Lock size={12} color="var(--muted)" style={{ position: 'absolute', top: 12, right: 12 }} />}
                  <div style={{ fontSize: 32, filter: isEarned ? 'none' : 'grayscale(100%)', marginBottom: 12 }}>{badge.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{badge.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{badge.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity & Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', flex: 1 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              Recent Activity
            </h3>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              <div style={{ position: 'absolute', top: 10, bottom: 10, left: 7, width: 2, background: 'var(--surface-2)' }} />
              {timelineEvents.length === 0 ? (
                 <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No recent activity. Start solving!</div>
              ) : timelineEvents.map((event) => {
                const isLink = !!event.link;
                const InnerContent = (
                  <>
                    <div style={{ position: 'absolute', left: -20, top: 2, width: 14, height: 14, borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <div style={{ transform: 'scale(0.5)' }}>{event.icon}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isLink ? 'var(--text)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {event.title}
                      {isLink && <ExternalLink size={12} color="var(--primary)" />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{event.time}</div>
                  </>
                );

                if (isLink) {
                  return (
                    <Link to={event.link} key={event.id} style={{ display: 'block', position: 'relative', marginBottom: 20, textDecoration: 'none', padding: '8px 12px', marginLeft: '-12px', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {InnerContent}
                    </Link>
                  );
                }

                return (
                  <div key={event.id} style={{ position: 'relative', marginBottom: 20, padding: '8px 0' }}>
                    {InnerContent}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DiffRow label="Easy" solved={stats.easySolved} total={stats.easyTotal} color="var(--success)" />
              <DiffRow label="Medium" solved={stats.mediumSolved} total={stats.mediumTotal} color="var(--warning)" />
              <DiffRow label="Hard" solved={stats.hardSolved} total={stats.hardTotal} color="var(--error)" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

function DiffRow({ label, solved, total, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontFamily: 'var(--mono)' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span>
          <span style={{ fontWeight: 800, color: 'var(--text)' }}>{solved}</span>
          <span style={{ color: 'var(--muted)' }}> / {total}</span>
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${total ? (solved/total)*100 : 0}%`, background: color, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
      </div>
    </div>
  );
}

function ProfileToggleRow({ label, description, checked, onChange }) {
  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-2)', borderRadius: 12, cursor: 'pointer' }}
      onClick={() => onChange(!checked)}
    >
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{description}</div>
      </div>
      <div style={{ position: 'relative', width: 40, height: 22, borderRadius: 11, background: checked ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.3s' }} />
      </div>
    </div>
  );
}

function SettingsTab({ settings, onSaveSettings }) {
  const updateSetting = (key, value) => {
    if (onSaveSettings) onSaveSettings({ ...settings, [key]: value });
  };

  return (
    <div className="glass-panel page-enter" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text)' }}>
        <SettingsIcon color="var(--primary)" /> Application Settings
      </h2>
      
      <ProfileToggleRow 
        label="Dark Mode" description="Toggle application theme" 
        checked={settings?.darkMode} onChange={(v) => updateSetting('darkMode', v)} 
      />
      <ProfileToggleRow 
        label="Auto-run Queries" description="Automatically execute SQL after you stop typing" 
        checked={settings?.autoRunAfterTyping} onChange={(v) => updateSetting('autoRunAfterTyping', v)} 
      />
      <ProfileToggleRow 
        label="Auto-complete SQL" description="Enable syntax autocomplete in the editor" 
        checked={settings?.autoCompleteSql} onChange={(v) => updateSetting('autoCompleteSql', v)} 
      />
      <ProfileToggleRow 
        label="Persist Editor Text" description="Save your query text when switching questions" 
        checked={settings?.persistEditorText} onChange={(v) => updateSetting('persistEditorText', v)} 
      />
      <ProfileToggleRow 
        label="Timed Challenges" description="Enable countdown timer for practice questions" 
        checked={settings?.timedChallenges} onChange={(v) => updateSetting('timedChallenges', v)} 
      />
      <ProfileToggleRow 
        label="Disable Advertisements" description="Hide sponsor messages in the practice interface" 
        checked={settings?.disableAdvertisements} onChange={(v) => updateSetting('disableAdvertisements', v)} 
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-2)', borderRadius: 12 }}>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text)' }}>Editor Font Size</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Adjust the size of the SQL editor font</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => updateSetting('editorFontSize', Math.max(12, (settings?.editorFontSize || 14) - 2))}>-</button>
          <span style={{ width: 30, textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>{settings?.editorFontSize || 14}px</span>
          <button className="btn btn-ghost" onClick={() => updateSetting('editorFontSize', Math.min(24, (settings?.editorFontSize || 14) + 2))}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Tab 
// ─────────────────────────────────────────────────────────────────────────────
function LeaderboardTab({ currentUser, currentScore }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('user_progress')
      .select('user_id, badges, activity, completed_questions, display_name')
      .order('user_id', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (!data) return;
        const processed = data.map(row => {
          let score = 0;
          if (row.completed_questions) {
            Object.entries(row.completed_questions).forEach(([qId, status]) => {
              if (status === 'complete') {
                const q = allQuestions.find(x => String(x.id) === String(qId));
                if (q) {
                  if (q.difficulty === 'easy') score += 10;
                  else if (q.difficulty === 'medium') score += 30;
                  else if (q.difficulty === 'hard') score += 50;
                }
              }
            });
          }
          const isCurrentUser = row.user_id === currentUser?.id;
          return { userId: row.user_id, score, isCurrentUser, displayName: row.display_name };
        });
        const curr = processed.find(p => p.isCurrentUser);
        if (curr) curr.score = currentScore;
        processed.sort((a, b) => b.score - a.score);
        setEntries(processed.slice(0, 50));
        setLoading(false);
      });
  }, [currentUser, currentScore]);

  return (
    <div className="page-enter">
      <div className="glass-panel" style={{ padding: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Trophy color="var(--primary)" /> Global Leaderboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Compare your SQL mastery with other top practitioners.</p>
        
        {loading ? <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading rankings...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Rank</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} style={{ borderBottom: `1px solid var(--border)`, background: e.isCurrentUser ? 'var(--primary-muted)' : 'transparent' }}>
                  <td style={{ padding: '20px 24px', fontSize: 16, fontWeight: 800, color: i < 3 ? 'var(--warning)' : 'var(--muted)' }}>
                    {i === 0 ? '👑 1' : i + 1}
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: e.isCurrentUser ? 800 : 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>
                      {e.isCurrentUser ? '👤' : (e.displayName ? e.displayName.charAt(0).toUpperCase() : e.userId.charAt(0).toUpperCase())}
                    </div>
                    {e.isCurrentUser ? 'You' : (e.displayName || `Player ${e.userId.slice(0, 8)}`)}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                    {e.score.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
