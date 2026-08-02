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
    <div className="flex flex-col gap-6 animate-[smoothFadeIn_0.3s_ease-out_forwards]">
      <div className="p-8 bg-surface rounded-2xl border border-border">
        <h2 className="m-0 mb-6 text-2xl font-bold text-text">
          Global Leaderboard
        </h2>

        {loading ? (
          <div className="p-10 text-center text-muted">
            Loading rankings...
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Header row */}
            <div className="grid grid-cols-[60px_1fr_100px] px-4 pb-3 text-xs font-semibold text-muted uppercase border-b border-border mb-2">
              <div>Rank</div>
              <div>User</div>
              <div className="text-right">XP</div>
            </div>

            {entries.slice(0, 100).map((entry) => (
              <div
                key={entry.userId || entry.rank}
                className={`grid grid-cols-[60px_1fr_100px] items-center px-4 py-3 rounded-lg border ${
                  entry.isCurrentUser
                    ? 'bg-primary-muted border-primary'
                    : 'bg-surface-2 border-transparent'
                }`}
              >
                <div
                  className={`text-[15px] font-bold ${
                    entry.rank <= 3 ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  #{entry.rank}
                </div>
                <div
                  className={`text-sm ${
                    entry.isCurrentUser ? 'font-bold text-primary' : 'font-medium text-text'
                  }`}
                >
                  {entry.displayName || (entry.isCurrentUser ? 'You' : 'Anonymous User')}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-right text-[15px] font-bold text-text tabular-nums">
                  {(entry.score || 0).toLocaleString()}
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div className="text-center p-10 text-muted">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
