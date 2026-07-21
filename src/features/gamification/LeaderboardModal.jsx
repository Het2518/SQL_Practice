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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
      />
      <div style={{
        position: 'relative', width: 500, maxWidth: '90vw', maxHeight: '85vh',
        background: 'var(--surface)', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', background: 'linear-gradient(135deg, var(--primary-muted), var(--surface))',
          borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Trophy size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text)' }}>Global Leaderboard</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Top solvers by current streak</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', padding: 8, 
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16, color: 'var(--text-secondary)' }}>
              <div className="spinner" />
              <span>Loading leaderboard...</span>
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No data available yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
              {leaders.map((leader, index) => {
                const isMe = currentUser && currentUser.id === leader.user_id;
                
                let RankIcon = null;
                if (index === 0) RankIcon = <Medal size={20} color="#fbbf24" fill="#fef3c7" />;
                else if (index === 1) RankIcon = <Medal size={20} color="#94a3b8" fill="#f1f5f9" />;
                else if (index === 2) RankIcon = <Medal size={20} color="#b45309" fill="#fef3c7" />;

                return (
                  <div 
                    key={leader.user_id}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 16,
                      background: isMe ? 'var(--primary-muted)' : 'var(--surface-2)',
                      border: isMe ? '1px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 12, transition: 'transform 0.2s'
                    }}
                  >
                    <div style={{ width: 28, fontSize: 16, fontWeight: 800, color: RankIcon ? 'transparent' : 'var(--muted)', textAlign: 'center' }}>
                      {RankIcon || `#${index + 1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: isMe ? 'var(--primary)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {leader.display_name}
                        {isMe && <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 800 }}>YOU</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        {leader.badges && leader.badges.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" /> {leader.badges.length} badges
                          </span>
                        )}
                        {leader.max_streak > leader.current_streak && (
                          <span style={{ color: 'var(--muted)' }}>Max: {leader.max_streak}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, fontWeight: 800, color: leader.current_streak > 0 ? '#ef4444' : 'var(--muted)' }}>
                      <Flame size={20} fill={leader.current_streak > 0 ? '#ef4444' : 'transparent'} />
                      {leader.current_streak}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
