import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Flame, Star, X, Medal } from 'lucide-react';

export function LeaderboardModal({ isOpen, onClose, currentUser }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('user_id, display_name, current_streak, max_streak, badges')
          .order('current_streak', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        if (mounted && data) {
          setLeaders(data);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLeaders();
    return () => { mounted = false; };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', transition: 'all 0.3s' }} 
      />
      <div style={{
        position: 'relative', width: 520, maxWidth: '90vw', maxHeight: '85vh',
        background: 'var(--surface)', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '28px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--surface))',
          borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <Trophy size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>Global Leaderboard</h2>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Top solvers by current streak</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', padding: 8, 
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 0', flex: 1, overflowY: 'auto', background: 'var(--bg-color)' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16, color: 'var(--text-secondary)' }}>
              <div className="spinner" />
              <span style={{ fontSize: 15, fontWeight: 500 }}>Loading leaderboard...</span>
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 15 }}>No data available yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
              {leaders.map((leader, index) => {
                const isMe = currentUser && currentUser.id === leader.user_id;
                
                let RankIcon = null;
                if (index === 0) RankIcon = <Medal size={24} color="#fbbf24" fill="#fef3c7" />;
                else if (index === 1) RankIcon = <Medal size={24} color="#94a3b8" fill="#f1f5f9" />;
                else if (index === 2) RankIcon = <Medal size={24} color="#b45309" fill="#fef3c7" />;

                return (
                  <div 
                    key={leader.user_id}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 16,
                      background: isMe ? 'var(--surface)' : 'var(--surface)',
                      border: isMe ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 16, transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: isMe ? '0 4px 12px rgba(var(--primary-rgb), 0.15)' : '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => { if (!isMe) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { if (!isMe) e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: 32, fontSize: 16, fontWeight: 800, color: RankIcon ? 'transparent' : 'var(--muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {RankIcon || `#${index + 1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: isMe ? 'var(--primary)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {leader.display_name}
                        {isMe && <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 12, fontWeight: 800, letterSpacing: 0.5 }}>YOU</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontWeight: 500 }}>
                        {leader.badges && leader.badges.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={14} color="#f59e0b" fill="#f59e0b" /> {leader.badges.length} badges
                          </span>
                        )}
                        {leader.max_streak > leader.current_streak && (
                          <span style={{ color: 'var(--muted)' }}>Max: {leader.max_streak}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 800, color: leader.current_streak > 0 ? '#ef4444' : 'var(--muted)' }}>
                      <Flame size={24} fill={leader.current_streak > 0 ? '#ef4444' : 'transparent'} />
                      {leader.current_streak}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '12px 24px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: 14
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
