import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Lock, Share2 } from 'lucide-react';
import { BADGE_DEFS } from '@/hooks/useGamification';
import { shareAchievement } from '@/utils/shareUtils';
import { useToast } from '@/shared/ui/ToastSystem';

function DiffRow({ label, solved, total, color }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          marginBottom: 4,
          fontFamily: 'var(--mono)',
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span>
          <span style={{ fontWeight: 800, color: 'var(--text)' }}>{solved}</span>
          <span style={{ color: 'var(--muted)' }}> / {total}</span>
        </span>
      </div>
      <div
        style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}
      >
        <div
          style={{
            height: '100%',
            width: `${total ? (solved / total) * 100 : 0}%`,
            background: color,
            transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
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
    <div
      style={{
        animation: 'smoothFadeIn 0.3s ease-out forwards',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      {/* 1. HERO BAND (XP BAR) */}
      <div
        style={{
          padding: '32px',
          background: 'var(--surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px', color: 'var(--text)' }}>
              Overview
            </h1>
            <div style={{ display: 'flex', gap: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>
                <span
                  style={{
                    color: 'var(--muted)',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    marginRight: 6,
                  }}
                >
                  Global Rank
                </span>
                <strong style={{ color: 'var(--text)' }}>
                  #{stats.rank?.toLocaleString() || '...'}
                </strong>
              </span>
              <span>
                <span
                  style={{
                    color: 'var(--muted)',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    marginRight: 6,
                  }}
                >
                  Percentile
                </span>
                <strong style={{ color: 'var(--primary)' }}>
                  Top {stats.percentile || '...'}%
                </strong>
              </span>
              <span>
                <span
                  style={{
                    color: 'var(--muted)',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    marginRight: 6,
                  }}
                >
                  Total Solved
                </span>
                <strong style={{ color: 'var(--text)' }}>{stats.totalSolved}</strong>
              </span>
              <span>
                <span
                  style={{
                    color: 'var(--muted)',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    marginRight: 6,
                  }}
                >
                  Badges
                </span>
                <strong style={{ color: 'var(--text)' }}>{gameState?.badges?.length || 0}</strong>
              </span>
            </div>
          </div>
          <div
            style={{
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 12,
            }}
          >
            <button
              onClick={async () => {
                const res = await shareAchievement(
                  'DataDesk Profile',
                  `I've solved ${stats.totalSolved} SQL problems and earned ${gameState?.badges?.length || 0} badges!`
                );
                if (res === 'copied') addToast('Profile stats copied to clipboard!');
              }}
              className="inline-flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors mb-2"
            >
              <Share2 size={14} /> Share Stats
            </button>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                XP Progress
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                {totalScore}{' '}
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>/ {nextMilestone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width XP Bar */}
        <div
          style={{
            height: 12,
            background: 'var(--surface-2)',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${xpPct}%`,
              background: 'var(--primary)',
              borderRadius: 6,
              transition: 'width 1s ease-out',
            }}
          />
        </div>
      </div>

      {/* 2. 3-COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {/* Topic Mastery */}
        <div
          style={{
            padding: 24,
            background: 'var(--surface)',
            borderRadius: 16,
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Topic Mastery
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(stats.skillsProgress).map(([topic, data]) => {
              const pct = data.total > 0 ? (data.solved / data.total) * 100 : 0;
              return (
                <div key={topic}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                      {topic}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {data.solved} / {data.total}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'var(--primary)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quests */}
        <div
          style={{
            padding: 24,
            background: 'var(--surface)',
            borderRadius: 16,
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Active Quests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {quests.map((quest) => {
              const pct = (quest.current / quest.target) * 100;
              const isDone = quest.current >= quest.target;
              return (
                <div key={quest.id}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isDone ? 'var(--success)' : 'var(--text)',
                      }}
                    >
                      {quest.title} {isDone && '✓'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {quest.current}/{quest.target}
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: isDone ? 'var(--success)' : 'var(--warning)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 8,
              }}
            >
              Next Badge
            </div>
            {(() => {
              const totalSolved = stats.totalSolved;
              const currentStreak = gameState?.currentStreak || 0;
              const earned = new Set(gameState?.badges || []);
              const nextBadge = BADGE_DEFS.find((b) => !earned.has(b.id));
              if (!nextBadge) {
                return (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'var(--surface-2)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: 'var(--success)',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                    }}
                  >
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
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--surface-2)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
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
        <div
          style={{
            padding: 24,
            background: 'var(--surface)',
            borderRadius: 16,
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Placement Prep
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nextRecommendations.map((q) => (
              <Link
                to={`/practice/${q.db}?q=${q.id}`}
                key={q.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--surface-2)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span
                      className={`pill pill-${q.difficulty}`}
                      style={{ padding: '2px 6px', fontSize: 10 }}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 180,
                    }}
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
      <div
        style={{
          padding: 32,
          background: 'var(--surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <h3 style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
          Consistency Heatmap
        </h3>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 20,
          }}
        >
          <div>
            <strong style={{ color: 'var(--text)' }}>
              {Object.keys(gameState.activity || {}).length}
            </strong>{' '}
            days active
          </div>
          <div>
            Current Streak:{' '}
            <strong style={{ color: 'var(--text)' }}>{gameState.currentStreak || 0}</strong>
          </div>
        </div>

        {/* Generate a dense 52-week grid (approx 364 days). We render columns of 7. */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 12 }}>
          {Array.from({ length: 52 }).map((_, colIdx) => (
            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: bg,
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.02)',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 4. BADGES & ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Badges */}
        <div
          style={{
            padding: 32,
            background: 'var(--surface)',
            borderRadius: 16,
            border: '1px solid var(--border)',
          }}
        >
          <h3 style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Badge Collection
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 16,
            }}
          >
            {BADGE_DEFS.map((badge) => {
              const isEarned = gameState?.badges?.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    background: isEarned ? 'var(--surface-2)' : 'var(--bg)',
                    border: `1px solid ${isEarned ? 'var(--border)' : 'var(--surface-2)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    opacity: isEarned ? 1 : 0.5,
                    position: 'relative',
                  }}
                >
                  {!isEarned && (
                    <Lock
                      size={12}
                      color="var(--muted)"
                      style={{ position: 'absolute', top: 12, right: 12 }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: 32,
                      filter: isEarned ? 'none' : 'grayscale(100%)',
                      marginBottom: 12,
                    }}
                  >
                    {badge.icon}
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}
                  >
                    {badge.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity & Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              padding: 24,
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid var(--border)',
              flex: 1,
            }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              Recent Activity
            </h3>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  bottom: 10,
                  left: 7,
                  width: 2,
                  background: 'var(--surface-2)',
                }}
              />
              {timelineEvents.length === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                    textAlign: 'center',
                    padding: '20px 0',
                  }}
                >
                  No recent activity. Start solving!
                </div>
              ) : (
                timelineEvents.map((event) => {
                  const isLink = !!event.link;
                  const InnerContent = (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          left: -20,
                          top: 2,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: 'var(--surface)',
                          border: '2px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1,
                        }}
                      >
                        <div style={{ transform: 'scale(0.5)' }}>{event.icon}</div>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isLink ? 'var(--text)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {event.title}
                        {isLink && <ExternalLink size={12} color="var(--primary)" />}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                        {event.time}
                      </div>
                    </>
                  );

                  if (isLink) {
                    return (
                      <Link
                        to={event.link}
                        key={event.id}
                        style={{
                          display: 'block',
                          position: 'relative',
                          marginBottom: 20,
                          textDecoration: 'none',
                          padding: '8px 12px',
                          marginLeft: '-12px',
                          borderRadius: 8,
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'var(--surface-2)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {InnerContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={event.id}
                      style={{ position: 'relative', marginBottom: 20, padding: '8px 0' }}
                    >
                      {InnerContent}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            style={{
              padding: 24,
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid var(--border)',
            }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
