import React, { useState, useMemo, useEffect } from 'react';
import { Settings, User, Activity, LogOut, Code, ExternalLink, MapPin, Globe, Briefcase, Link as LinkIcon, Edit2, Check, X, ShieldAlert, Database, Trophy, Zap, Target, ArrowRight, Clock, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { allQuestions } from '../data/index';
import { BADGE_DEFS } from '../hooks/useGamification';
import { supabase } from '../lib/supabase';

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

export function ProfileView({ user, gameState, progress, settings, onSaveSettings, onHome, onSignOut }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [totalPlatformUsers, setTotalPlatformUsers] = useState(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'SQL Practitioner';
  const email = user?.email || 'guest@example.com';
  
  useEffect(() => {
    supabase.from('user_progress').select('user_id', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (!error && count !== null) {
          setTotalPlatformUsers(Math.max(count, 1));
        }
      });
  }, []);

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
  const { difficultyStats, nextRecommendations } = useMemo(() => {
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
      const isSolved = completedSet.has(q.id);
      
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
    const realTotalUsers = totalPlatformUsers || 1; 
    const maxExpectedScore = 15000; 
    let percentile = Math.min(1, score / maxExpectedScore);
    let rank = Math.round(realTotalUsers - (realTotalUsers * percentile));
    rank = Math.max(1, rank);
    
    // Find next recommended questions (Prioritize topics with lowest completion % but at least 1 solved, or just easy ones)
    const unsolved = allQuestions.filter(q => !completedSet.has(q.id));
    // Sort by easiest first for recommendations
    unsolved.sort((a, b) => {
      const wA = a.difficulty === 'easy' ? 1 : a.difficulty === 'medium' ? 2 : 3;
      const wB = b.difficulty === 'easy' ? 1 : b.difficulty === 'medium' ? 2 : 3;
      return wA - wB;
    });
    const nextRecs = unsolved.slice(0, 3);

    return {
      difficultyStats: {
        easyTotal, mediumTotal, hardTotal,
        easySolved, mediumSolved, hardSolved,
        totalSolved: easySolved + mediumSolved + hardSolved,
        totalCount: allQuestions.length,
        score,
        rank,
        skillsProgress
      },
      nextRecommendations: nextRecs
    };
  }, [progress, totalPlatformUsers]);

  const stats = difficultyStats;

  return (
    <div className="page-enter" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: 300, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.05)', zIndex: 10 }}>
        {/* User Card */}
        <div style={{ padding: '32px 24px', background: 'linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '16px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 24, fontWeight: 800, color: '#fff',
              boxShadow: '0 8px 16px var(--primary-muted)'
            }}>
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--primary)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
                  <button onClick={handleSaveName} disabled={isSavingName} style={{ background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer' }}><Check size={14} /></button>
                  <button onClick={() => setIsEditingName(false)} style={{ background: 'var(--surface-2)', color: 'var(--text)', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer' }}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ margin: '0', fontSize: 16, color: 'var(--text)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</h2>
                  <button onClick={() => { setNewName(fullName); setIsEditingName(true); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }} title="Edit Name"><Edit2 size={12} /></button>
                </div>
              )}
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Global Rank</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>#{stats.rank.toLocaleString()}</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Score</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{stats.score.toLocaleString()}</span>
             </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '24px' }}>
          <SidebarItem icon={<User size={18} />} label="My Profile" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Trophy size={18} />} label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
          <SidebarItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div style={{ marginTop: 'auto', padding: 24, borderTop: '1px solid var(--border)' }}>
          <button onClick={onHome} className="btn" style={{ width: '100%', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', padding: '12px', borderRadius: 12, fontWeight: 700, marginBottom: 12 }}>
            Return to Practice
          </button>
          <button onClick={onSignOut} className="btn" style={{ width: '100%', background: 'transparent', color: 'var(--muted)', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, display: 'flex', justifyContent: 'center' }}>
            <LogOut size={16} style={{ marginRight: 8 }} /> Sign Out
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {activeTab === 'dashboard' && <DashboardTab stats={stats} gameState={gameState} nextRecommendations={nextRecommendations} />}
          {activeTab === 'leaderboard' && <LeaderboardTab currentUser={user} currentScore={stats.score} />}
          {activeTab === 'settings' && <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>Editor settings are managed within the Practice Workspace.</div>}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: 'none',
      background: active ? 'var(--primary-muted)' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--text-secondary)',
      fontWeight: active ? 700 : 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left'
    }}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Tab
// ─────────────────────────────────────────────────────────────────────────────
function DashboardTab({ stats, gameState, nextRecommendations }) {
  const animatedSolved = useCountUp(stats.totalSolved);
  const recentSubmissions = gameState.recentSubmissions || [];

  return (
    <div style={{ animation: 'smoothFadeIn 0.4s ease-out forwards', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Top Section: Progress & Up Next */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        
        {/* Core Progress Card */}
        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
            <Activity size={18} color="var(--primary)" /> SQL Mastery Progress
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            {/* SVG Ring */}
            <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexShrink: 0 }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="62" fill="none" stroke="var(--surface-2)" strokeWidth="12" />
                <circle cx="70" cy="70" r="62" fill="none" stroke="var(--error)" strokeWidth="12" strokeDasharray={`${(stats.hardSolved/Math.max(1, stats.hardTotal))*389} 389`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                <circle cx="70" cy="70" r="62" fill="none" stroke="var(--warning)" strokeWidth="12" strokeDasharray={`${((stats.mediumSolved+stats.hardSolved)/Math.max(1, stats.mediumTotal+stats.hardTotal))*389} 389`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                <circle cx="70" cy="70" r="62" fill="none" stroke="var(--success)" strokeWidth="12" strokeDasharray={`${((stats.totalSolved)/Math.max(1, stats.totalCount))*389} 389`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
              </svg>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{animatedSolved}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>Solved</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DiffRow label="Easy" solved={stats.easySolved} total={stats.easyTotal} color="var(--success)" />
              <DiffRow label="Medium" solved={stats.mediumSolved} total={stats.mediumTotal} color="var(--warning)" />
              <DiffRow label="Hard" solved={stats.hardSolved} total={stats.hardTotal} color="var(--error)" />
            </div>
          </div>
        </div>

        {/* What to do Next Card (Placement Focus) */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary-muted) 0%, transparent 100%)', borderRadius: 24, padding: 32, border: '1px solid var(--primary-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
            <Target size={18} color="var(--primary)" /> Recommended Next Steps
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Master these specific problems to strengthen your profile for upcoming technical interviews and placements.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nextRecommendations.length > 0 ? nextRecommendations.map(q => (
               <Link to={`/practice/${q.db}`} key={q.id} style={{
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface)', 
                 borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s'
               }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{q.title}</span>
                   <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                     <span className={`pill pill-${q.difficulty}`}>{q.difficulty}</span>
                     <span style={{ fontSize: 11, color: 'var(--muted)' }}>{q.keywords?.[0] || 'SQL'}</span>
                   </div>
                 </div>
                 <ArrowRight size={16} color="var(--primary)" />
               </Link>
            )) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--success)', fontWeight: 600, background: 'var(--success-muted)', borderRadius: 12 }}>
                🎉 You have completed every available question!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Topic-wise Progress (Real Data Only) */}
      <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
         <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
            <Zap size={18} color="var(--primary)" /> Topic-Wise Mastery
         </h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {Object.entries(stats.skillsProgress).map(([topic, data]) => (
               <div key={topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{topic}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text)' }}>{data.solved}</span> / {data.total}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${data.total ? (data.solved/data.total)*100 : 0}%`, background: 'var(--primary)', transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'right' }}>
                    {data.total - data.solved} left to master
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Bottom Section: Heatmap & Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
        
        {/* Activity Heatmap */}
        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
            <Clock size={18} color="var(--primary)" /> Consistency Heatmap
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            <div><span style={{ fontWeight: 700, color: 'var(--text)' }}>{Object.keys(gameState.activity || {}).length}</span> days active</div>
            <div>Current streak: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{gameState.streak || 0}</span></div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignContent: 'flex-start' }}>
            {Array.from({ length: 112 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (111 - i));
              const dateStr = d.toISOString().slice(0, 10);
              const count = gameState.activity?.[dateStr] || 0;
              let bg = 'var(--surface-2)';
              if (count === 1) bg = 'var(--primary-muted)';
              if (count === 2) bg = 'var(--primary-light)';
              if (count > 2) bg = 'var(--primary)';
              return (
                <div key={i} title={`${count} submissions on ${dateStr}`} style={{
                  width: 14, height: 14, borderRadius: 4, background: bg, transition: 'transform 0.1s', cursor: 'pointer'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              );
            })}
          </div>
        </div>

        {/* Earned Badges */}
        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
            <Star size={18} color="var(--primary)" /> Earned Badges
          </h3>
          {gameState.badges.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>🏆</div>
              Complete questions and build streaks to earn badges!
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {gameState.badges.map(badgeId => {
                const badge = BADGE_DEFS.find(b => b.id === badgeId);
                if (!badge) return null;
                return (
                  <div key={badge.id} title={badge.description} style={{
                    width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'default'
                  }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {badge.icon}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiffRow({ label, solved, total, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span>
          <span style={{ fontWeight: 800, color: 'var(--text)' }}>{solved}</span>
          <span style={{ color: 'var(--muted)' }}> / {total}</span>
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${total ? (solved/total)*100 : 0}%`, background: color, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
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
      .select('user_id, badges, activity, completed_questions')
      .order('user_id', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (!data) return;
        const processed = data.map(row => {
          const completed = Object.values(row.completed_questions || {}).filter(v => v === 'complete').length;
          const score = completed * 20;
          const isCurrentUser = row.user_id === currentUser?.id;
          return { userId: row.user_id, score, isCurrentUser };
        });
        const curr = processed.find(p => p.isCurrentUser);
        if (curr) curr.score = currentScore;
        processed.sort((a, b) => b.score - a.score);
        setEntries(processed.slice(0, 50));
        setLoading(false);
      });
  }, [currentUser, currentScore]);

  return (
    <div style={{ animation: 'smoothFadeIn 0.4s ease-out forwards' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 40, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
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
                      {e.isCurrentUser ? '👤' : e.userId.charAt(0).toUpperCase()}
                    </div>
                    {e.isCurrentUser ? 'You' : `Player ${e.userId.slice(0, 8)}`}
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
