import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
        if (mounted && data) setLeaders(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLeaders();
    return () => { mounted = false; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} 
      />
      
      <div style={{
        position: 'relative', width: 500, maxWidth: '90vw', maxHeight: '85vh',
        background: 'var(--surface)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
            }}>
              <Trophy size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text)' }}>Leaderboard</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Top solvers by streak</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, 
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '0', flex: 1, overflowY: 'auto', background: 'var(--surface)' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16, color: 'var(--text-secondary)' }}>
              <div className="spinner" />
              <span style={{ fontSize: 14 }}>Loading...</span>
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No data available.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {leaders.map((leader, index) => {
                const isMe = currentUser && currentUser.id === leader.user_id;
                
                let RankIcon = null;
                if (index === 0) RankIcon = <Medal size={20} color="var(--warning)" />;
                else if (index === 1) RankIcon = <Medal size={20} color="var(--text-secondary)" />;
                else if (index === 2) RankIcon = <Medal size={20} color="#b45309" />;

                return (
                  <div 
                    key={leader.user_id}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '16px 24px', gap: 16,
                      background: isMe ? 'var(--primary-muted)' : 'var(--surface)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ width: 24, fontSize: 14, fontWeight: 600, color: RankIcon ? 'transparent' : 'var(--muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {RankIcon || (index + 1)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: isMe ? 'var(--primary)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {leader.display_name}
                        {isMe && <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>YOU</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        {leader.badges && leader.badges.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={12} color="var(--text-secondary)" /> {leader.badges.length} badges
                          </span>
                        )}
                        {leader.max_streak > leader.current_streak && (
                          <span style={{ color: 'var(--muted)' }}>Max: {leader.max_streak}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 600, color: leader.current_streak > 0 ? 'var(--text)' : 'var(--muted)' }}>
                      <Flame size={18} color={leader.current_streak > 0 ? 'var(--error)' : 'currentColor'} />
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

  return createPortal(modalContent, document.body);
}
