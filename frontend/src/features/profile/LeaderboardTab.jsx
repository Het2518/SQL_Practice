import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { allQuestions } from '@/data/index';

export function LeaderboardTab({ currentUser, currentScore }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.leaderboard
      .get(200)
      .then(({ data }) => {
        const leaderboard = data.data.leaderboard ?? [];

        // Override the current user's score with live in-memory value
        const processed = leaderboard.map((entry) => ({
          ...entry,
          isCurrentUser: String(entry.userId) === String(currentUser?.id),
          score:
            String(entry.userId) === String(currentUser?.id) && currentScore != null
              ? currentScore
              : entry.score,
        }));

        // Re-sort after potential score override
        processed.sort((a, b) => b.score - a.score);
        processed.forEach((p, idx) => {
          p.rank = idx + 1;
        });

        setEntries(processed);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[LeaderboardTab] Failed to load:', err.message);
        setLoading(false);
      });
  }, [currentUser, currentScore]);

  return (
    <div
      style={{
        animation: 'smoothFadeIn 0.3s ease-out forwards',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div
        style={{
          padding: '32px',
          background: 'var(--surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
          Global Leaderboard
        </h2>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            Loading rankings...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Header row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 100px',
                padding: '0 16px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--border)',
                marginBottom: 8,
              }}
            >
              <div>Rank</div>
              <div>User</div>
              <div style={{ textAlign: 'right' }}>XP</div>
            </div>

            {entries.slice(0, 100).map((entry) => (
              <div
                key={entry.userId || entry.rank}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: entry.isCurrentUser ? 'var(--primary-muted)' : 'var(--surface-2)',
                  borderRadius: 8,
                  border: `1px solid ${entry.isCurrentUser ? 'var(--primary)' : 'transparent'}`,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: entry.rank <= 3 ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  #{entry.rank}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: entry.isCurrentUser ? 700 : 500,
                    color: entry.isCurrentUser ? 'var(--primary)' : 'var(--text)',
                  }}
                >
                  {entry.displayName || (entry.isCurrentUser ? 'You' : 'Anonymous User')}
                  {entry.isCurrentUser && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        padding: '2px 6px',
                        background: 'var(--primary)',
                        color: '#fff',
                        borderRadius: 99,
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {(entry.score || 0).toLocaleString()}
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
