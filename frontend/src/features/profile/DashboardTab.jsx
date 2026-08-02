import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Lock, Share2 } from 'lucide-react';
import { BADGE_DEFS } from '@/hooks/useGamification';
import { shareAchievement } from '@/utils/shareUtils';
import { useToast } from '@/shared/ui/ToastSystem';

function DiffRow({ label, solved, total, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-mono">
        <span className="text-text-secondary font-semibold">{label}</span>
        <span>
          <span className="font-extrabold text-text">{solved}</span>
          <span className="text-muted"> / {total}</span>
        </span>
      </div>
      <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${total ? (solved / total) * 100 : 0}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

export function DashboardTab({ stats, gameState, nextRecommendations, quests, timelineEvents }) {
  const { addToast } = useToast();
  const radarData = Object.entries(stats.skillsProgress).map(([label, data]) => ({
    label,
    value: data.solved,
    fullMark: data.total,
  }));

  const totalScore = stats.score;
  const nextMilestone = 500; // Hardcoded for example, or could be based on current score
  const xpPct = Math.min((totalScore / nextMilestone) * 100, 100);

  return (
    <div className="animate-[smoothFadeIn_0.3s_ease-out_forwards] flex flex-col gap-8">
      {/* 1. HERO BAND (XP BAR) */}
      <div className="p-8 bg-surface rounded-2xl border border-border">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold m-0 mb-3 text-text">
              Overview
            </h1>
            <div className="flex gap-8 text-sm text-text-secondary">
              <span>
                <span className="text-muted text-xs uppercase mr-1.5">
                  Global Rank
                </span>
                <strong className="text-text">
                  #{stats.rank?.toLocaleString() || '...'}
                </strong>
              </span>
              <span>
                <span className="text-muted text-xs uppercase mr-1.5">
                  Percentile
                </span>
                <strong className="text-primary">
                  Top {stats.percentile || '...'}%
                </strong>
              </span>
              <span>
                <span className="text-muted text-xs uppercase mr-1.5">
                  Total Solved
                </span>
                <strong className="text-text">{stats.totalSolved}</strong>
              </span>
              <span>
                <span className="text-muted text-xs uppercase mr-1.5">
                  Badges
                </span>
                <strong className="text-text">{gameState?.badges?.length || 0}</strong>
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-3">
            <button
              onClick={async () => {
                const res = await shareAchievement(
                  'DataDesk Profile',
                  `I've solved ${stats.totalSolved} SQL problems and earned ${gameState?.badges?.length || 0} badges!`
                );
                if (res === 'copied') addToast('Profile stats copied to clipboard!');
              }}
              className="inline-flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors mb-2 text-text"
            >
              <Share2 size={14} /> Share Stats
            </button>
            <div>
              <div className="text-xs text-muted mb-1.5 uppercase font-semibold">
                XP Progress
              </div>
              <div className="text-xl font-bold text-text">
                {totalScore}{' '}
                <span className="text-muted font-medium">/ {nextMilestone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width XP Bar */}
        <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      {/* 2. 3-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Topic Mastery */}
        <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col">
          <h3 className="m-0 mb-5 text-sm font-bold text-text">
            Topic Mastery
          </h3>
          <div className="flex-1 flex flex-col gap-4">
            {Object.entries(stats.skillsProgress).map(([topic, data]) => {
              const pct = data.total > 0 ? (data.solved / data.total) * 100 : 0;
              return (
                <div key={topic}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-text">
                      {topic}
                    </span>
                    <span className="text-xs text-muted">
                      {data.solved} / {data.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quests */}
        <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col">
          <h3 className="m-0 mb-5 text-sm font-bold text-text">
            Active Quests
          </h3>
          <div className="flex flex-col gap-5">
            {quests.map((quest) => {
              const pct = (quest.current / quest.target) * 100;
              const isDone = quest.current >= quest.target;
              return (
                <div key={quest.id}>
                  <div className="flex justify-between mb-1.5">
                    <div
                      className={`text-[13px] font-medium ${isDone ? 'text-success' : 'text-text'}`}
                    >
                      {quest.title} {isDone && '✓'}
                    </div>
                    <div className="text-xs text-muted">
                      {quest.current}/{quest.target}
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full">
                    <div
                      className={`h-full rounded-full ${isDone ? 'bg-success' : 'bg-warning'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-5">
            <div className="text-xs font-semibold text-text-secondary mb-2">
              Next Badge
            </div>
            {(() => {
              const totalSolved = stats.totalSolved;
              const currentStreak = gameState?.currentStreak || 0;
              const earned = new Set(gameState?.badges || []);
              const nextBadge = BADGE_DEFS.find((b) => !earned.has(b.id));
              if (!nextBadge) {
                return (
                  <div className="px-4 py-3 bg-surface-2 rounded-lg text-[13px] text-success border border-border font-semibold">
                    🎉 All badges earned!
                  </div>
                );
              }
              // compute progress toward next badge
              let label = '';
              if (nextBadge.id === 'first_query') {
                label = 'Solve 1 question';
              } else if (nextBadge.id === 'streak_3') {
                label = `${3 - Math.min(currentStreak, 3)} more streak days`;
              } else if (nextBadge.id === 'streak_7') {
                label = `${7 - Math.min(currentStreak, 7)} more streak days`;
              } else if (nextBadge.id === 'solved_10') {
                label = `Solve ${10 - Math.min(totalSolved, 10)} more questions`;
              } else if (nextBadge.id === 'solved_50') {
                label = `Solve ${50 - Math.min(totalSolved, 50)} more questions`;
              } else if (nextBadge.id === 'perfect_db') {
                label = 'Complete 100% of any database';
              }
              return (
                <div className="px-4 py-3 bg-surface-2 rounded-lg text-[13px] text-text border border-border">
                  <strong>
                    {nextBadge.icon} {nextBadge.title}:
                  </strong>{' '}
                  {label}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Placement Prep */}
        <div className="p-6 bg-surface rounded-2xl border border-border flex flex-col">
          <h3 className="m-0 mb-5 text-sm font-bold text-text">
            Placement Prep
          </h3>
          <div className="flex flex-col gap-3">
            {nextRecommendations.map((q) => (
              <Link
                to={`/practice/${q.db}?q=${q.id}`}
                key={q.id}
                className="flex items-center justify-between py-3 px-4 bg-surface-2 rounded-lg border border-border no-underline transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <span
                      className={`pill pill-${q.difficulty} px-1.5 py-0.5 text-[10px]`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <span
                    className="text-[13px] font-semibold text-text whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]"
                  >
                    {q.title}
                  </span>
                </div>
                <ArrowRight size={14} color="var(--primary)" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CONSISTENCY HEATMAP */}
      <div className="p-8 bg-surface rounded-2xl border border-border">
        <h3 className="m-0 mb-6 text-sm font-bold text-text">
          Consistency Heatmap
        </h3>
        <div className="flex justify-between text-[13px] text-text-secondary mb-5">
          <div>
            <strong className="text-text">
              {Object.keys(gameState.activity || {}).length}
            </strong>{' '}
            days active
          </div>
          <div>
            Current Streak:{' '}
            <strong className="text-text">{gameState.currentStreak || 0}</strong>
          </div>
        </div>

        {/* Generate a dense 52-week grid (approx 364 days). We render columns of 7. */}
        <div className="flex gap-1 overflow-x-auto pb-3">
          {Array.from({ length: 52 }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, rowIdx) => {
                const dayOffset = (51 - colIdx) * 7 + (6 - rowIdx);
                const d = new Date();
                d.setDate(d.getDate() - dayOffset);
                const dateStr = d.toISOString().slice(0, 10);
                const count = gameState.activity?.[dateStr] || 0;

                let bg = 'var(--surface-2)';
                if (count === 1) bg = '#a5b4fc';
                if (count === 2) bg = '#818cf8';
                if (count > 2) bg = '#4f46e5';

                return (
                  <div
                    key={rowIdx}
                    title={`${count} submissions on ${dateStr}`}
                    className="w-3.5 h-3.5 rounded-[3px] cursor-pointer border border-white/5"
                    style={{ background: bg }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 4. BADGES & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <div className="p-8 bg-surface rounded-2xl border border-border lg:col-span-2">
          <h3 className="m-0 mb-6 text-sm font-bold text-text">
            Badge Collection
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
            {BADGE_DEFS.map((badge) => {
              const isEarned = gameState?.badges?.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-xl flex flex-col items-center text-center relative border transition-opacity ${
                    isEarned ? 'bg-surface-2 border-border opacity-100' : 'bg-bg border-surface-2 opacity-50'
                  }`}
                >
                  {!isEarned && (
                    <Lock
                      size={12}
                      className="absolute top-3 right-3 text-muted"
                    />
                  )}
                  <div
                    className={`text-[32px] mb-3 ${isEarned ? '' : 'grayscale'}`}
                  >
                    {badge.icon}
                  </div>
                  <div className="text-[13px] font-semibold text-text mb-1">
                    {badge.title}
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity & Distribution */}
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-surface rounded-2xl border border-border flex-1">
            <h3 className="m-0 mb-5 text-sm font-bold text-text">
              Recent Activity
            </h3>
            <div className="relative pl-5">
              <div className="absolute top-2.5 bottom-2.5 left-[7px] w-0.5 bg-surface-2" />
              {timelineEvents.length === 0 ? (
                <div className="text-[13px] text-muted text-center py-5">
                  No recent activity. Start solving!
                </div>
              ) : (
                timelineEvents.map((event) => {
                  const isLink = !!event.link;
                  const InnerContent = (
                    <>
                      <div className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-surface border-2 border-border flex items-center justify-center z-10">
                        <div className="scale-50">{event.icon}</div>
                      </div>
                      <div
                        className={`text-[13px] font-semibold flex items-center gap-1.5 ${
                          isLink ? 'text-text' : 'text-text-secondary'
                        }`}
                      >
                        {event.title}
                        {isLink && <ExternalLink size={12} className="text-primary" />}
                      </div>
                      <div className="text-[11px] text-muted mt-1">
                        {event.time}
                      </div>
                    </>
                  );

                  if (isLink) {
                    return (
                      <Link
                        to={event.link}
                        key={event.id}
                        className="block relative mb-5 no-underline py-2 px-3 -ml-3 rounded-lg transition-colors hover:bg-surface-2 group"
                      >
                        {InnerContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={event.id}
                      className="relative mb-5 py-2"
                    >
                      {InnerContent}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-6 bg-surface rounded-2xl border border-border">
            <h3 className="m-0 mb-5 text-sm font-bold text-text">
              Distribution
            </h3>
            <div className="flex flex-col gap-4">
              <DiffRow
                label="Easy"
                solved={stats.easySolved}
                total={stats.easyTotal}
                color="var(--success)"
              />
              <DiffRow
                label="Medium"
                solved={stats.mediumSolved}
                total={stats.mediumTotal}
                color="var(--warning)"
              />
              <DiffRow
                label="Hard"
                solved={stats.hardSolved}
                total={stats.hardTotal}
                color="var(--error)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
