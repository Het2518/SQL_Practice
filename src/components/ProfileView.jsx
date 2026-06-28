import React, { useState } from 'react';
import { Settings, User, PieChart, Activity, LogOut, ChevronRight, ShieldAlert, Moon, Bell, Code, Award, Target, LayoutDashboard } from 'lucide-react';

export function ProfileView({ user, gameState, onHome, onSignOut }) {
  const [activeTab, setActiveTab] = useState('overview');

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'SQL Practitioner';
  const email = user?.email || 'guest@example.com';

  const renderSidebar = () => (
    <aside style={{
      width: 280,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }}>
      {/* Profile Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16,
          boxShadow: '0 8px 16px rgba(99,102,241,0.2)'
        }}>
          {fullName.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--text)', fontWeight: 700 }}>{fullName}</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>{email}</p>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <SidebarItem icon={<PieChart size={18} />} label="Statistics" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} />
        <SidebarItem icon={<Settings size={18} />} label="Preferences" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        <SidebarItem icon={<User size={18} />} label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
      </nav>

      {/* Bottom Actions */}
      <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <button onClick={onHome} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px', color: 'var(--text-secondary)' }}>
          ← Back to Practice
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {renderSidebar()}
      
      <main style={{ flex: 1, overflowY: 'auto', padding: '48px 64px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {activeTab === 'overview' && <OverviewTab gameState={gameState} />}
          {activeTab === 'statistics' && <StatisticsTab gameState={gameState} />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'account' && <AccountTab user={user} onSignOut={onSignOut} />}
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
      {active && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
    </button>
  );
}

function OverviewTab({ gameState }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Dashboard Overview</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 40 }}>Welcome back! Here is a snapshot of your recent learning progress.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 32 }}>
        {/* Streak Premium Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
          padding: 32, borderRadius: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, transform: 'rotate(15deg)' }}>
            <Target size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: 'var(--text-secondary)' }}>
            <Activity size={18} />
            <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Current Streak</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 64, fontWeight: 900, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{gameState.currentStreak}</span>
            <span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 600 }}>Days</span>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Personal Best</span>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{gameState.maxStreak} Days</span>
          </div>
        </div>

        {/* Heatmap Card */}
        <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: 'var(--text-secondary)' }}>
            <Code size={18} />
            <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Activity Heatmap</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 8 }}>
            {Array.from({ length: 45 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (44 - i));
              const dateStr = d.toISOString().slice(0, 10);
              const count = gameState.activity[dateStr] || 0;
              let bg = 'var(--surface-2)';
              let border = '1px solid var(--border)';
              if (count > 0) { bg = '#10b98140'; border = '1px solid #10b98180'; }
              if (count > 2) { bg = '#10b981'; border = '1px solid #059669'; }
              return (
                <div key={i} title={`${dateStr}: ${count} questions`} style={{
                  aspectRatio: '1', borderRadius: 6, background: bg, border, transition: 'transform 0.2s', cursor: 'pointer'
                }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
            <span>Less</span>
            <div style={{ width: 12, height: 12, background: 'var(--surface-2)', borderRadius: 2 }}></div>
            <div style={{ width: 12, height: 12, background: '#10b98140', borderRadius: 2 }}></div>
            <div style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }}></div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 24, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: 'var(--text-secondary)' }}>
          <Award size={18} />
          <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Badges Unlocked ({gameState.badges.length})</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {gameState.badges.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: 32, textAlign: 'center', color: 'var(--muted)', background: 'var(--surface-2)', borderRadius: 16, border: '1px dashed var(--border)' }}>
              No badges unlocked yet. Complete challenges to earn them!
            </div>
          ) : (
            gameState.badges.map(b => {
              let icon = '🏆';
              let title = 'Master';
              let desc = 'You are doing great';
              let gradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
              
              if (b === 'first_query') { icon = '🔥'; title = 'First Blood'; desc = 'Completed your first query'; gradient = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'; }
              if (b === 'streak_3') { icon = '⚡'; title = 'On Fire'; desc = '3 Day Streak'; gradient = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; }
              if (b === 'streak_7') { icon = '🚀'; title = 'Unstoppable'; desc = '7 Day Streak'; gradient = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'; }

              return (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-2)', padding: '20px', borderRadius: 20, border: '1px solid var(--border)', transition: 'transform 0.2s, boxShadow 0.2s', cursor: 'default' }}
                     onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                     onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontSize: 32, width: 56, height: 56, background: gradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.2)' }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{desc}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatisticsTab({ gameState }) {
  const totalCompleted = Object.values(gameState.completed || {}).flat().length;
  
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Performance Statistics</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 40 }}>Dive deep into your SQL problem solving metrics.</p>
      
      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 24, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 72, fontWeight: 900, background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
            {totalCompleted}
          </div>
          <div style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 600, marginTop: 8, textTransform: 'uppercase', letterSpacing: 2 }}>Questions Solved</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 16 }}>
          <StatCard title="Easy Solved" value={Math.floor(totalCompleted * 0.5)} color="#10b981" />
          <StatCard title="Medium Solved" value={Math.floor(totalCompleted * 0.35)} color="#f59e0b" />
          <StatCard title="Hard Solved" value={Math.floor(totalCompleted * 0.15)} color="#ef4444" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ background: 'var(--surface-2)', padding: 24, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, fontWeight: 600 }}>{title}</div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Preferences</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 40 }}>Customize your learning environment.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SettingRow icon={<Moon size={20} />} title="Dark Mode" description="Toggle dark mode theme." active={true} />
        <SettingRow icon={<Bell size={20} />} title="Email Notifications" description="Receive updates on new questions and features." active={false} />
        <SettingRow icon={<ShieldAlert size={20} />} title="Public Profile" description="Allow others to see your badges and streak." active={true} />
      </div>
    </div>
  );
}

function SettingRow({ icon, title, description, active }) {
  const [toggled, setToggled] = useState(active);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{description}</div>
        </div>
      </div>
      <button onClick={() => setToggled(!toggled)} style={{
        width: 44, height: 24, borderRadius: 12, background: toggled ? 'var(--primary)' : 'var(--surface-2)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: toggled ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}

function AccountTab({ user, onSignOut }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Account Settings</h1>
      <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 40 }}>Manage your account details and security.</p>

      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 24, border: '1px solid var(--border)', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700 }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Full Name</label>
            <input type="text" readOnly value={user?.user_metadata?.full_name || user?.user_metadata?.name || 'SQL Practitioner'} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Email Address</label>
            <input type="email" readOnly value={user?.email || 'guest@example.com'} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 24, border: '1px solid var(--error-muted)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--error)' }}>Danger Zone</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Actions here are permanent and cannot be undone.</p>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <LogOut size={16} /> Sign Out
          </button>
          <button style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
