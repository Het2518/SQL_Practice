import React, { useState, useMemo, useEffect } from 'react';
import { Settings, User, Activity, LogOut, Code, Award, ExternalLink, Moon, Bell, ShieldAlert, LayoutDashboard, Database, ChevronRight, ToggleRight, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allQuestions } from '../data/index';
import { BADGE_DEFS } from '../hooks/useGamification';
import { supabase } from '../lib/supabase';

export function ProfileView({ user, gameState, progress, settings, onSaveSettings, onHome, onSignOut }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [totalPlatformUsers, setTotalPlatformUsers] = useState(null);
  
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

  // Calculate Progress Stats
  const difficultyStats = useMemo(() => {
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0;
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    
    const completedSet = new Set();
    Object.values(progress || {}).forEach(dbProgress => {
      Object.entries(dbProgress).forEach(([qid, status]) => {
        if (status === 'complete') completedSet.add(qid);
      });
    });

    const skillsProgress = {
      Joins: { solved: 0, total: 0 },
      'Window Functions': { solved: 0, total: 0 },
      Aggregations: { solved: 0, total: 0 },
      'CTEs': { solved: 0, total: 0 }
    };

    allQuestions.forEach(q => {
      const qkw = (q.keywords || []).map(k => k.toLowerCase());
      const isSolved = completedSet.has(q.id);
      
      const isJoin = qkw.some(k => k.includes('join'));
      const isWindow = qkw.some(k => k.includes('window') || k.includes('over') || k.includes('rank'));
      const isAgg = qkw.some(k => k.includes('group by') || k.includes('sum') || k.includes('count') || k.includes('avg'));
      const isCte = qkw.some(k => k.includes('cte') || k.includes('with'));

      if (isJoin) { skillsProgress.Joins.total++; if (isSolved) skillsProgress.Joins.solved++; }
      if (isWindow) { skillsProgress['Window Functions'].total++; if (isSolved) skillsProgress['Window Functions'].solved++; }
      if (isAgg) { skillsProgress.Aggregations.total++; if (isSolved) skillsProgress.Aggregations.solved++; }
      if (isCte) { skillsProgress.CTEs.total++; if (isSolved) skillsProgress.CTEs.solved++; }
      
      const diff = (q.difficulty || '').toLowerCase();
      if (diff === 'easy') {
        easyTotal++;
        if (completedSet.has(q.id)) easySolved++;
      } else if (diff === 'medium') {
        mediumTotal++;
        if (completedSet.has(q.id)) mediumSolved++;
      } else if (diff === 'hard') {
        hardTotal++;
        if (completedSet.has(q.id)) hardSolved++;
      }
    });
    
    const score = (easySolved * 10) + (mediumSolved * 30) + (hardSolved * 50);
    
    // Calculate Rank based on real user count!
    // If we have total users loaded, use it. Otherwise fallback to 1.
    const realTotalUsers = totalPlatformUsers || 1;
    
    // Perfect score is roughly 600 questions * avg 30 pts = 18000.
    // Let's create a percentile formula: (score / 15000)
    // The rank will be (TotalUsers) - (TotalUsers * Percentile).
    const maxExpectedScore = 15000; 
    let percentile = Math.min(1, score / maxExpectedScore);
    
    // Calculate real rank: lower percentile means lower rank number (closer to totalUsers).
    // If score is 0, rank = totalUsers. If score is max, rank = 1.
    let rank = Math.round(realTotalUsers - (realTotalUsers * percentile));
    rank = Math.max(1, rank);

    return {
      easyTotal, mediumTotal, hardTotal,
      easySolved, mediumSolved, hardSolved,
      totalSolved: easySolved + mediumSolved + hardSolved,
      totalCount: allQuestions.length,
      score,
      rank,
      skillsProgress
    };
  }, [progress, totalPlatformUsers]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Identity Sidebar */}
      <aside style={{
        width: 320,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 24, fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 16px rgba(99,102,241,0.2)'
          }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--text)', fontWeight: 800 }}>{fullName}</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{email}</p>
          </div>
        </div>

        {/* Global Rank & Score */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: 'var(--surface-2)', padding: '12px 16px', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>Global Rank</div>
            <div style={{ fontSize: 16, color: 'var(--text)', fontWeight: 800 }}>
              {totalPlatformUsers === null ? <span style={{ opacity: 0.5 }}>Loading...</span> : `# ${difficultyStats.rank.toLocaleString()}`}
            </div>
          </div>
          <div style={{ flex: 1, background: 'var(--surface-2)', padding: '12px 16px', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>Total Score</div>
            <div style={{ fontSize: 16, color: 'var(--primary)', fontWeight: 800 }}>{difficultyStats.score.toLocaleString()}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Settings size={18} />} label="Preferences" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={<User size={18} />} label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={onHome} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px', color: 'var(--text-secondary)', marginBottom: 8 }}>
            ← Back to Practice
          </button>
        </div>
      </aside>
      
      {/* Main Dashboard Area */}
      <main style={{ flex: 1, padding: '48px 64px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {activeTab === 'dashboard' && <DashboardTab gameState={gameState} difficultyStats={difficultyStats} />}
          {activeTab === 'settings' && <SettingsTab settings={settings} onSaveSettings={onSaveSettings} />}
          {activeTab === 'account' && <AccountTab user={user} onSignOut={onSignOut} />}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Navigation Item Component
// ─────────────────────────────────────────────────────────────────────────────
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
      {active && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Tabs
// ─────────────────────────────────────────────────────────────────────────────

function DashboardTab({ gameState, difficultyStats }) {
  const recentSubmissions = gameState.recentSubmissions || [];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px' }}>Dashboard</h1>

      {/* Top Row: Donut Chart & Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Difficulty Chart */}
        <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 24, border: '1px solid var(--border)', display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r="60" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
              <circle cx="70" cy="70" r="60" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray={`${(difficultyStats.hardSolved/Math.max(1, difficultyStats.hardTotal))*377} 377`} style={{ transition: 'stroke-dasharray 1s ease' }} />
              <circle cx="70" cy="70" r="60" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={`${((difficultyStats.mediumSolved+difficultyStats.hardSolved)/Math.max(1, difficultyStats.mediumTotal+difficultyStats.hardTotal))*377} 377`} style={{ transition: 'stroke-dasharray 1s ease' }} />
              <circle cx="70" cy="70" r="60" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={`${((difficultyStats.totalSolved)/Math.max(1, difficultyStats.totalCount))*377} 377`} style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{difficultyStats.totalSolved}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Solved</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DifficultyBar label="Easy" solved={difficultyStats.easySolved} total={difficultyStats.easyTotal} color="#10b981" />
            <DifficultyBar label="Medium" solved={difficultyStats.mediumSolved} total={difficultyStats.mediumTotal} color="#f59e0b" />
            <DifficultyBar label="Hard" solved={difficultyStats.hardSolved} total={difficultyStats.hardTotal} color="#ef4444" />
          </div>
        </div>

        {/* Badges / Milestones */}
        <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Badges ({gameState.badges.length})</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {BADGE_DEFS.slice(0, 6).map(badge => {
              const unlocked = gameState.badges.includes(badge.id);
              return (
                <div key={badge.id} title={badge.description} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  opacity: unlocked ? 1 : 0.4, filter: unlocked ? 'none' : 'grayscale(1)'
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: unlocked ? 'var(--surface-2)' : 'var(--bg)',
                    border: `1px solid ${unlocked ? 'var(--primary-muted)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    boxShadow: unlocked ? 'inset 0 2px 8px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    {badge.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', textAlign: 'center' }}>{badge.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Heatmap & Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        {/* Activity Heatmap */}
        <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Activity</h3>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Array.from({ length: 45 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (44 - i));
              const dateStr = d.toISOString().slice(0, 10);
              const count = gameState.activity?.[dateStr] || 0;
              let bg = 'var(--surface-2)';
              if (count === 1) bg = '#10b98140';
              if (count === 2) bg = '#10b98180';
              if (count > 2) bg = '#10b981';
              return (
                <div key={i} title={`${count} submissions on ${dateStr}`} style={{
                  width: 14, height: 14, borderRadius: 3, background: bg, cursor: 'pointer', transition: 'transform 0.1s'
                }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              );
            })}
          </div>
        </div>

        {/* Skills Progress */}
        <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Skills</h3>
          </div>
          {Object.entries(difficultyStats.skillsProgress).map(([skill, stats]) => (
            <DifficultyBar key={skill} label={skill} solved={stats.solved} total={stats.total} color="var(--primary)" />
          ))}
        </div>
      </div>

      {/* Bottom Row: Recent Submissions */}
      <div style={{ background: 'var(--surface)', padding: 0, borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Recent Submissions</h3>
        </div>
        {recentSubmissions.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            No recent submissions found. Start practicing!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Question</th>
                <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Time Submitted</th>
                <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Status</th>
                <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.slice(0, 10).map((sub, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {sub.title}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--muted)' }}>
                    {new Date(sub.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: sub.status === 'complete' ? 'var(--success)' : 'var(--warning)' }}>
                    {sub.status === 'complete' ? 'Accepted' : 'Attempted'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link to={`/practice/${sub.db}`} style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'var(--surface-2)', 
                      borderRadius: 6, fontSize: 12, color: 'var(--text)', textDecoration: 'none', fontWeight: 600 
                    }}>
                      Try Again <ExternalLink size={12} />
                    </Link>
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

function DifficultyBar({ label, solved, total, color }) {
  const percent = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{solved} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>/ {total}</span></span>
      </div>
      <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Tab Component
// ─────────────────────────────────────────────────────────────────────────────
function SettingsTab({ settings, onSaveSettings }) {
  const handleToggle = (key) => {
    onSaveSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleSelect = (key, val) => {
    onSaveSettings(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>Preferences</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 40 }}>Manage your environment settings and preferences.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
        
        {/* Editor Settings */}
        <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Editor Setup</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SettingRow 
              icon={<Moon size={20} />} 
              title="Dark Mode" 
              description="Enable high-contrast dark theme across the IDE." 
              toggled={settings.darkMode} 
              onToggle={() => handleToggle('darkMode')} 
            />
            <SettingRow 
              icon={<ToggleRight size={20} />} 
              title="Auto-Run Queries" 
              description="Automatically execute SQL when you pause typing." 
              toggled={settings.autoRunAfterTyping} 
              onToggle={() => handleToggle('autoRunAfterTyping')} 
            />
            <SettingRow 
              icon={<Database size={20} />} 
              title="Persist Editor Text" 
              description="Remember your unsubmitted code across sessions." 
              toggled={settings.persistEditorText} 
              onToggle={() => handleToggle('persistEditorText')} 
            />
            
            {/* Font Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <Type size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Editor Font Size</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Adjust the typography size in the Monaco editor.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[12, 14, 16, 18, 20].map(sz => (
                  <button 
                    key={sz} 
                    onClick={() => handleSelect('editorFontSize', sz)}
                    className="btn"
                    style={{ 
                      padding: '6px 12px', fontSize: 13, 
                      background: settings.editorFontSize === sz ? 'var(--primary)' : 'var(--surface-2)',
                      color: settings.editorFontSize === sz ? '#fff' : 'var(--text)'
                    }}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SettingRow({ icon, title, description, toggled, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{description}</div>
        </div>
      </div>
      <button onClick={onToggle} style={{
        width: 44, height: 24, borderRadius: 12, background: toggled ? 'var(--primary)' : 'var(--surface-2)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: toggled ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Tab Component
// ─────────────────────────────────────────────────────────────────────────────
function AccountTab({ user, onSignOut }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>Account Information</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 40 }}>Manage your personal details and session.</p>

      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 24, border: '1px solid var(--border)', marginBottom: 24, maxWidth: 800 }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700 }}>Profile Identity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Display Name</label>
            <input 
              type="text" 
              readOnly 
              value={user?.user_metadata?.full_name || user?.user_metadata?.name || 'SQL Practitioner'} 
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 14, outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" 
              readOnly 
              value={user?.email || 'guest@example.com'} 
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 14, outline: 'none' }} 
            />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 24, border: '1px solid var(--error-muted)', borderColor: 'rgba(239, 68, 68, 0.2)', maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <ShieldAlert size={20} color="var(--error)" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--error)' }}>Danger Zone</h3>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Actions here are permanent. You will need to sign in again after logging out.</p>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <LogOut size={16} /> Sign Out Securely
          </button>
          <button style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Delete Account Data
          </button>
        </div>
      </div>
    </div>
  );
}
