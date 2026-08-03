import React from 'react';
import { Lock, Target, Star, Award, Shield } from 'lucide-react';
import { BADGE_DEFS } from '@/hooks/useGamification';

function BadgeCard({ badge, isEarned }) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] p-6 border flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 group ${
      isEarned 
        ? 'bg-surface/80 backdrop-blur-md border-primary/30 shadow-[0_8px_30px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_8px_40px_rgba(var(--primary-rgb),0.25)] hover:border-primary/60' 
        : 'bg-bg/50 border-border/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
    }`}>
      {/* Shine effect overlay */}
      {isEarned && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      )}
      
      {!isEarned && (
        <div className="absolute top-4 right-4 bg-surface p-1.5 rounded-full border border-border">
          <Lock size={12} className="text-muted" />
        </div>
      )}
      
      <div className={`text-[48px] mb-4 transform transition-transform duration-500 group-hover:scale-110 ${isEarned ? 'drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]' : ''}`}>
        {badge.icon}
      </div>
      
      <h4 className="text-sm font-black text-text mb-1.5 tracking-wide uppercase">{badge.title}</h4>
      <p className="text-[11px] text-text-secondary leading-relaxed font-medium">{badge.description}</p>
    </div>
  );
}

export function AchievementsTab({ gameState, quests }) {
  const earnedBadges = new Set(gameState?.badges || []);

  return (
    <div className="animate-[smoothFadeIn_0.4s_ease-out_forwards] flex flex-col gap-10">
      
      {/* ACTIVE QUESTS SECTION */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-border/50 pb-3">
          <Target size={20} className="text-primary" />
          <h2 className="text-lg font-black text-text uppercase tracking-widest m-0">Active Quests</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quests.map((quest) => {
            const pct = Math.min((quest.current / quest.target) * 100, 100);
            const isDone = quest.current >= quest.target;
            
            return (
              <div key={quest.id} className="relative overflow-hidden bg-surface/80 backdrop-blur-xl rounded-[24px] border border-border/50 p-6 flex flex-col shadow-lg">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h4 className={`text-sm font-bold uppercase tracking-widest ${isDone ? 'text-success' : 'text-text'}`}>
                    {quest.title} {isDone && '✓'}
                  </h4>
                  <div className="text-xs font-black bg-surface-2 px-2 py-1 rounded-md border border-border/50">
                    {quest.current} / {quest.target}
                  </div>
                </div>
                
                <p className="text-[11px] text-text-secondary font-medium mb-6 flex-1 relative z-10">
                  {quest.desc}
                </p>
                
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden border border-border/30 relative z-10">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isDone ? 'bg-success shadow-[0_0_10px_rgba(var(--success-rgb),0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BADGE GALLERY SECTION */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-border/50 pb-3">
          <div className="flex items-center gap-3">
            <Award size={20} className="text-warning" />
            <h2 className="text-lg font-black text-text uppercase tracking-widest m-0">Badge Collection</h2>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-text-secondary">
            <span className="text-text">{earnedBadges.size}</span> / {BADGE_DEFS.length} Unlocked
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {BADGE_DEFS.map((badge) => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              isEarned={earnedBadges.has(badge.id)} 
            />
          ))}
        </div>
      </div>
      
    </div>
  );
}
