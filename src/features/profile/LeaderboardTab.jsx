import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { allQuestions } from '@/data/index';

export function LeaderboardTab({ currentUser, currentScore }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('user_progress')
      .select('user_id, badges, activity, completed_questions, display_name')
      .limit(500)
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }

        // Compute score for each DB row
        const rawEntries = data.map(row => {
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
          return {
            userId: row.user_id,
            score,
            isCurrentUser: row.user_id === currentUser?.id,
            displayName: row.display_name || null,
          };
        });

        // ── Deduplicate by user_id (keep highest score row per user) ──────────
        const byUser = new Map();
        rawEntries.forEach(entry => {
          const existing = byUser.get(entry.userId);
          if (!existing || entry.score > existing.score) {
            byUser.set(entry.userId, entry);
          }
        });
        const processed = Array.from(byUser.values());

        // ── Override current user's score with live in-memory value ───────────
        const curr = processed.find(p => p.isCurrentUser);
        if (curr) {
          curr.score = currentScore;
        } else if (currentUser?.id) {
          // Current user has no DB row yet — add them
          processed.push({
            userId: currentUser.id,
            score: currentScore,
            isCurrentUser: true,
            displayName: currentUser?.user_metadata?.full_name || 'You',
          });
        }

        // ── Sort & Rank ──────────
        processed.sort((a, b) => b.score - a.score);
        processed.forEach((p, idx) => p.rank = idx + 1);

        setEntries(processed);
        setLoading(false);
      });
  }, [currentUser, currentScore]);

  return (
    <div style={{ animation: 'smoothFadeIn 0.3s ease-out forwards', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: '32px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Global Leaderboard</h2>
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading rankings...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px', padding: '0 16px 12px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
              <div>Rank</div>
              <div>User</div>
              <div style={{ textAlign: 'right' }}>XP</div>
            </div>

            {entries.slice(0, 100).map((entry) => (
              <div key={entry.userId} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 100px', alignItems: 'center',
                padding: '12px 16px', background: entry.isCurrentUser ? 'var(--primary-muted)' : 'var(--surface-2)',
                borderRadius: 8, border: `1px solid ${entry.isCurrentUser ? 'var(--primary)' : 'transparent'}`
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: entry.rank <= 3 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  #{entry.rank}
                </div>
                <div style={{ fontSize: 14, fontWeight: entry.isCurrentUser ? 700 : 500, color: entry.isCurrentUser ? 'var(--primary)' : 'var(--text)' }}>
                  {entry.displayName || (entry.isCurrentUser ? 'You' : 'Anonymous User')}
                  {entry.isCurrentUser && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', background: 'var(--primary)', color: '#fff', borderRadius: 99 }}>YOU</span>}
                </div>
                <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))}
            
            {entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No users found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
