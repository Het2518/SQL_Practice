import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink, Target, Clock, TrendingUp, Medal, Flame, Zap, CheckCircle,
  ArrowRight, BarChart2,
} from 'lucide-react';
import { RadarChart } from './RadarChart';

// ─── Design token card wrapper ────────────────────────────────────────────────
function Card({ children, className = '', noPad }) {
  return (
    <div className={`relative overflow-hidden bg-surface border border-border/50 rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.13)] hover:-translate-y-0.5 transition-all duration-300 ${noPad ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-primary" />}
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{title}</span>
      </div>
      {action}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, colorClass = 'text-primary', glowColor = 'rgba(99,102,241,0.18)' }) {
  return (
    <Card className="group">
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-[40px] transition-all duration-700 group-hover:scale-150"
        style={{ background: glowColor }} />
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className={colorClass} />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      </div>
      <div className={`text-[30px] font-black tabular-nums tracking-tight leading-none text-text mb-1`}>{value}</div>
      {sub && <div className="text-[11px] text-muted font-medium mt-1">{sub}</div>}
    </Card>
  );
}

// ─── Difficulty bar ───────────────────────────────────────────────────────────
function DiffBar({ label, solved, total, color, bg }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-[13px] font-semibold text-text">{label}</span>
        </div>
        <div className="text-[12px] text-muted font-medium tabular-nums">
          <span className="text-text font-bold">{solved}</span> / {total}
          <span className="ml-2 text-[10px] font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: bg }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Skill mastery mini-card ──────────────────────────────────────────────────
function SkillCard({ label, solved, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  const r = 22, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#6366f1';
  return (
    <div className="flex flex-col items-center p-4 bg-surface-2 rounded-[16px] border border-border/40 hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 group cursor-default">
      <div className="relative w-14 h-14 mb-3">
        <svg className="-rotate-90 w-full h-full" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border/40" />
          <circle cx="28" cy="28" r={r} fill="none" strokeWidth="3" stroke={color}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 4px ${color}60)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[12px] font-black tabular-nums text-text">{pct}%</div>
      </div>
      <span className="text-[11px] font-bold text-text-secondary text-center leading-tight group-hover:text-text transition-colors">{label}</span>
      <span className="text-[10px] text-muted mt-0.5 tabular-nums">{solved}/{total}</span>
    </div>
  );
}

// ─── Activity timeline item ───────────────────────────────────────────────────
function TimelineItem({ event, isFirst }) {
  const inner = (
    <>
      <div className={`absolute -left-[19px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 transition-all ${isFirst ? 'border-primary bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'border-border bg-surface'}`}>
        {isFirst && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className={`text-[13px] font-semibold mb-0.5 flex items-center gap-1.5 ${event.link ? 'text-text group-hover:text-primary transition-colors' : 'text-text-secondary'}`}>
        {event.title}
        {event.link && <ExternalLink size={11} className="opacity-40" />}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{event.time}</div>
    </>
  );
  return event.link
    ? <Link to={event.link} className="block relative mb-5 pl-4 py-0.5 no-underline group">{inner}</Link>
    : <div className="relative mb-5 pl-4 py-0.5">{inner}</div>;
}

// ─── Consistency heatmap ──────────────────────────────────────────────────────
function Heatmap({ activity }) {
  const WEEKS = 26;
  const today = new Date();
  const cols = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const days = [];
    for (let d = 6; d >= 0; d--) {
      const offset = w * 7 + d;
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      const count = activity?.[key] || 0;
      let bg = 'var(--surface-2)';
      if (count === 1) bg = '#6366f150';
      if (count === 2) bg = '#6366f1';
      if (count > 2) bg = '#818cf8';
      days.push(
        <div key={d} title={`${count} on ${key}`}
          className="w-[11px] h-[11px] rounded-[2.5px] cursor-default hover:scale-125 transition-transform"
          style={{ background: bg }} />
      );
    }
    cols.push(<div key={w} className="flex flex-col gap-[3px]">{days}</div>);
  }
  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1 no-scrollbar">
      {cols}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DashboardTab({ stats, gameState, nextRecommendations, quests, timelineEvents }) {
  const {
    totalSolved, totalCount, score, accuracyPct,
    easySolved, easyTotal, mediumSolved, mediumTotal, hardSolved, hardTotal,
    skillsProgress, rank, percentile,
  } = stats;

  const activeDays   = Object.keys(gameState?.activity || {}).length;
  const streak       = gameState?.currentStreak || 0;
  const radarData    = Object.entries(skillsProgress).map(([label, data]) => ({
    label, value: data.solved, fullMark: Math.max(data.total, 1),
  }));

  return (
    <div className="flex flex-col gap-6">

      {/* ── ROW 1: 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Questions Solved" value={totalSolved} sub={`of ${totalCount} total`} icon={CheckCircle} colorClass="text-success" glowColor="rgba(34,197,94,0.15)" />
        <StatCard label="Total XP" value={score.toLocaleString()} sub="Experience points" icon={Zap} colorClass="text-primary" glowColor="rgba(99,102,241,0.15)" />
        <StatCard label="Completion Rate" value={`${accuracyPct}%`} sub="Questions attempted" icon={Target} colorClass="text-amber-400" glowColor="rgba(245,158,11,0.15)" />
        <StatCard label="Current Streak" value={`${streak}d`} sub={`${activeDays} days total active`} icon={Flame} colorClass="text-orange-400" glowColor="rgba(249,115,22,0.15)" />
      </div>

      {/* ── ROW 2: Heatmap + Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Activity — Last 6 Months" icon={BarChart2}
            action={
              <div className="flex items-center gap-3 text-[11px] text-muted font-medium">
                <span><strong className="text-text">{activeDays}</strong> days active</span>
                <span><strong className="text-text">{streak}</strong> day streak</span>
              </div>
            }
          />
          <Heatmap activity={gameState?.activity} />
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[10px] text-muted">Less</span>
            {['var(--surface-2)', '#6366f150', '#6366f1', '#818cf8'].map((c, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: c }} />
            ))}
            <span className="text-[10px] text-muted">More</span>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <CardHeader title="Skill Radar" icon={Target} />
          <div className="flex-1 flex items-center justify-center w-full">
            <RadarChart data={radarData} size={240} />
          </div>
        </Card>
      </div>

      {/* ── ROW 3: Difficulty + Skill Mastery ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Difficulty Breakdown" icon={BarChart2} />
          <div className="flex flex-col gap-5">
            <DiffBar label="Easy"   solved={easySolved}   total={easyTotal}   color="#22c55e" bg="rgba(34,197,94,0.08)" />
            <DiffBar label="Medium" solved={mediumSolved} total={mediumTotal} color="#f59e0b" bg="rgba(245,158,11,0.08)" />
            <DiffBar label="Hard"   solved={hardSolved}   total={hardTotal}   color="#ef4444" bg="rgba(239,68,68,0.08)" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Skill Mastery" icon={Target} />
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(skillsProgress).map(([label, { solved, total }]) => (
              <SkillCard key={label} label={label} solved={solved} total={total} />
            ))}
          </div>
        </Card>
      </div>

      {/* ── ROW 4: Activity Timeline + Next Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader title="Recent Activity" icon={Clock} />
          {timelineEvents.length === 0 ? (
            <div className="text-center py-10 text-muted text-[13px] font-medium">
              No activity yet. Start solving to see your history here.
            </div>
          ) : (
            <div className="relative border-l border-border/50 ml-3">
              {timelineEvents.map((ev, i) => (
                <TimelineItem key={ev.id} event={ev} isFirst={i === 0} />
              ))}
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader title="Up Next — Recommended" icon={ArrowRight} />
          <div className="flex flex-col gap-3">
            {nextRecommendations.length === 0 ? (
              <div className="text-center py-10 text-muted text-[13px]">All questions solved! Outstanding work.</div>
            ) : (
              nextRecommendations.map((q) => {
                const diffColor = q.difficulty === 'easy' ? 'text-success bg-success/8 border-success/20'
                  : q.difficulty === 'medium' ? 'text-amber-400 bg-amber-400/8 border-amber-400/20'
                  : 'text-error bg-error/8 border-error/20';
                return (
                  <Link key={q.id} to={`/practice/${q.db}?q=${q.id}`}
                    className="flex items-center justify-between p-4 rounded-[14px] bg-surface-2 border border-border/40 no-underline hover:border-primary/30 hover:bg-surface-3 transition-all duration-200 group">
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border w-fit ${diffColor}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[13px] font-semibold text-text group-hover:text-primary transition-colors truncate max-w-[220px]">
                        {q.title}
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* ── ROW 5: League XP Progress (full width) ── */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal size={14} className="text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">League Progression</span>
            </div>
            <span className="text-xs font-bold text-primary">{score.toLocaleString()} XP Total</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {['Bronze', 'Silver', 'Gold', 'Diamond', 'Master', 'Legend'].map((lg, i) => {
              const colors = ['#b45309', '#94a3b8', '#eab308', '#6366f1', '#8b5cf6', '#ec4899'];
              const xpGates = [0, 200, 500, 1000, 2000, 5000];
              const reached = score >= xpGates[i];
              return (
                <React.Fragment key={lg}>
                  <div className={`flex flex-col items-center gap-1.5 flex-shrink-0 transition-opacity ${reached ? 'opacity-100' : 'opacity-35'}`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: reached ? colors[i] : 'var(--border)', background: reached ? colors[i] + '18' : 'transparent', boxShadow: reached ? `0 0 10px ${colors[i]}40` : 'none' }}>
                      <Medal size={14} style={{ color: reached ? colors[i] : 'var(--muted)' }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: reached ? colors[i] : 'var(--muted)' }}>{lg}</span>
                    <span className="text-[9px] text-muted tabular-nums">{xpGates[i].toLocaleString()}</span>
                  </div>
                  {i < 5 && <div className={`flex-1 h-0.5 rounded-full min-w-[20px] transition-colors ${score >= xpGates[i + 1] ? '' : score > xpGates[i] ? 'bg-gradient-to-r from-[currentColor] to-border' : 'bg-border/40'}`}
                    style={{ background: score >= xpGates[i + 1] ? `linear-gradient(90deg, ${colors[i]}, ${colors[i+1]})` : score > xpGates[i] ? `linear-gradient(90deg, ${colors[i]}, var(--border))` : undefined }} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Card>

    </div>
  );
}
