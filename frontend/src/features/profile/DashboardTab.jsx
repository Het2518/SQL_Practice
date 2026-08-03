import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Target, Zap, Clock, TrendingUp, Medal, Flame } from 'lucide-react';
import { BADGE_DEFS } from '@/hooks/useGamification';
import { shareAchievement } from '@/utils/shareUtils';
import { useToast } from '@/shared/ui/ToastSystem';
import { RadarChart } from './RadarChart';

// --- Premium Bento Card Wrapper ---
function BentoCard({ children, className = '', title, icon }) {
  return (
    <div className={`relative overflow-hidden bg-surface/80 backdrop-blur-xl rounded-[28px] border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 flex flex-col p-6 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-6 z-10 relative">
          {icon && <span className="text-primary">{icon}</span>}
          <h3 className="m-0 text-sm font-bold text-text uppercase tracking-widest">{title}</h3>
        </div>
      )}
      <div className="flex-1 relative z-10 flex flex-col">{children}</div>
    </div>
  );
}

function BentoStatCard({ label, value, subValue, icon, color = "text-primary", gradient = "from-primary/20 to-transparent" }) {
  return (
    <BentoCard className="justify-between overflow-hidden group">
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700`} />
      <div className="flex items-center gap-3 text-text-secondary font-bold uppercase tracking-widest text-[10px] mb-2">
        {React.cloneElement(icon, { size: 14, className: color })}
        {label}
      </div>
      <div>
        <div className="text-3xl font-black text-text tracking-tighter tabular-nums">{value}</div>
        {subValue && <div className="text-xs text-muted font-medium mt-1">{subValue}</div>}
      </div>
    </BentoCard>
  );
}

export function DashboardTab({ stats, gameState, nextRecommendations, quests, timelineEvents }) {
  const { addToast } = useToast();
  
  const radarData = Object.entries(stats.skillsProgress).map(([label, data]) => ({
    label,
    value: data.solved,
    fullMark: Math.max(data.total, 5), // Provide a min scale for aesthetics
  }));

  const totalScore = stats.score;
  const nextMilestone = 500; 
  const xpPct = Math.min((totalScore / nextMilestone) * 100, 100);

  // Compute dummy accuracy for visuals, normally this would come from backend
  const accuracy = "94.2%"; 
  const velocity = "+12/wk";

  return (
    <div className="animate-[smoothFadeIn_0.4s_ease-out_forwards] flex flex-col gap-6">
      
      {/* ── BENTO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ROW 1: Heatmap (Col 1), Radar (Col 2), Activity (Col 3 / Row span 2) */}
        
        {/* Consistency Heatmap */}
        <BentoCard title="Consistency" icon={<Flame size={16} />} className="md:col-span-1">
          <div className="flex justify-between text-xs text-text-secondary font-medium mb-6">
            <span><strong className="text-text text-sm">{Object.keys(gameState.activity || {}).length}</strong> days active</span>
            <span><strong className="text-text text-sm">{gameState.currentStreak || 0}</strong> day streak</span>
          </div>
          <div className="flex-1 flex items-end">
            <div className="flex gap-1.5 overflow-x-auto pb-2 w-full justify-end custom-scrollbar">
              {Array.from({ length: 18 }).map((_, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5">
                  {Array.from({ length: 7 }).map((_, rowIdx) => {
                    const dayOffset = (17 - colIdx) * 7 + (6 - rowIdx);
                    const d = new Date();
                    d.setDate(d.getDate() - dayOffset);
                    const dateStr = d.toISOString().slice(0, 10);
                    const count = gameState.activity?.[dateStr] || 0;

                    let bg = 'var(--surface-2)';
                    if (count === 1) bg = '#3b82f680'; // blue-500/50
                    if (count === 2) bg = '#3b82f6'; // blue-500
                    if (count > 2) bg = '#60a5fa'; // blue-400

                    return (
                      <div
                        key={rowIdx}
                        title={`${count} submissions on ${dateStr}`}
                        className="w-3 h-3 rounded-[3px] cursor-pointer transition-colors hover:scale-125 hover:ring-2 ring-primary/50"
                        style={{ background: bg }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Topic Radar */}
        <BentoCard title="Skill Radar" icon={<Target size={16} />} className="md:col-span-1 items-center justify-center">
          <div className="scale-90 transform origin-center -mt-4">
            <RadarChart data={radarData} size={240} />
          </div>
        </BentoCard>

        {/* Recent Activity (Spans 2 rows if possible, or just sits in col 3) */}
        <BentoCard title="Recent Activity" icon={<Clock size={16} />} className="md:col-span-1 md:row-span-2">
          <div className="relative pl-5 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
            <div className="absolute top-2 bottom-2 left-[7px] w-px bg-border/50" />
            {timelineEvents.length === 0 ? (
              <div className="text-[13px] text-muted text-center py-10 font-medium">
                No recent activity. Start solving!
              </div>
            ) : (
              timelineEvents.map((event, i) => {
                const isLink = !!event.link;
                const isFirst = i === 0;
                const InnerContent = (
                  <>
                    <div className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${isFirst ? 'bg-primary border-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-surface border-border'}`}>
                      <div className={`scale-50 ${isFirst ? 'text-bg' : 'text-muted'}`}>{event.icon}</div>
                    </div>
                    <div className={`text-[13px] font-bold flex items-center gap-1.5 ${isLink ? 'text-text hover:text-primary transition-colors' : 'text-text-secondary'}`}>
                      {event.title}
                      {isLink && <ExternalLink size={12} className="opacity-50" />}
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted mt-1">
                      {event.time}
                    </div>
                  </>
                );

                if (isLink) {
                  return (
                    <Link to={event.link} key={event.id} className="block relative mb-6 no-underline py-1 group">
                      {InnerContent}
                    </Link>
                  );
                }
                return <div key={event.id} className="relative mb-6 py-1">{InnerContent}</div>;
              })
            )}
          </div>
        </BentoCard>

        {/* ROW 2: StatCards */}
        <BentoStatCard 
          label="Accuracy" 
          value={accuracy} 
          subValue="Last 30 days" 
          icon={<Target />} 
          color="text-success"
          gradient="from-success/20 to-transparent"
        />
        
        <BentoStatCard 
          label="Velocity" 
          value={velocity} 
          subValue="Compared to last week" 
          icon={<TrendingUp />} 
          color="text-warning"
          gradient="from-warning/20 to-transparent"
        />

        {/* ROW 3: Next League Progress */}
        <BentoCard title="Next League: Master" icon={<Medal size={16} />} className="md:col-span-3">
           <div className="flex flex-col h-full justify-center gap-4">
             <div className="flex justify-between items-end">
               <div className="text-3xl font-black text-text tabular-nums tracking-tighter">
                 {totalScore} <span className="text-lg text-muted font-medium tracking-normal">/ {nextMilestone} XP</span>
               </div>
               <div className="text-xs font-bold uppercase tracking-widest text-primary">
                 {Math.round(xpPct)}% Complete
               </div>
             </div>
             <div className="h-4 bg-surface-2 rounded-full overflow-hidden border border-border/50 shadow-inner relative">
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-50 z-10" />
               <div
                 className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000 ease-out relative z-0"
                 style={{ width: `${xpPct}%` }}
               >
                 <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
               </div>
             </div>
           </div>
        </BentoCard>

      </div>
    </div>
  );
}
