import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Trophy, Medal, Crown, Loader2, ArrowLeft, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/shared/ui/Header';
import { shareAchievement } from '@/utils/shareUtils';
import { useToast } from '@/shared/ui/ToastSystem';

export function LeaderboardPage({ user }) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: leaders = [], isLoading: loading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.leaderboard.get(50);
      return data.data.leaderboard ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-bg flex flex-col page-enter">
      <Header user={user} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border bg-surface-2 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
              <Trophy size={32} />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2">Global Leaderboard</h1>
            <p className="text-text-secondary mb-6">Top SQL developers ranked by problems solved</p>
            <button
              onClick={async () => {
                const res = await shareAchievement(
                  'DataDesk Leaderboard',
                  'Check out the top SQL developers on DataDesk!'
                );
                if (res === 'copied') addToast('Link copied to clipboard!');
              }}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              <Share2 size={16} /> Share Leaderboard
            </button>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-text-secondary">
                <Loader2 size={32} className="animate-spin mb-4 text-primary" />
                <p>Loading rankings...</p>
              </div>
            ) : leaders.length === 0 ? (
              <div className="py-20 text-center text-text-secondary">
                No users found. Be the first to solve a problem!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {leaders.map((leader) => (
                  <div
                    key={leader.userId || leader.rank}
                    className="flex items-center justify-between p-6 hover:bg-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 text-center font-bold text-xl text-text-secondary">
                        {leader.rank === 1 ? (
                          <Crown className="text-yellow-500 mx-auto" size={28} />
                        ) : leader.rank === 2 ? (
                          <Medal className="text-gray-400 mx-auto" size={26} />
                        ) : leader.rank === 3 ? (
                          <Medal className="text-amber-700 mx-auto" size={26} />
                        ) : (
                          `#${leader.rank}`
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-text text-lg">
                          {leader.displayName || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {leader.completed} questions solved
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-xl">
                        {(leader.score || 0).toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
