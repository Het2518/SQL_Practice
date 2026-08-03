import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Target, CheckCircle, XCircle, Clock, Calendar, TrendingUp, BarChart2, Swords, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({ label, value, sub, icon: Icon, colorClass = 'text-primary' }) {
  return (
    <div className="bg-surface border border-border/50 rounded-[20px] p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={13} className={colorClass} />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      </div>
      <div className="text-[28px] font-black tabular-nums tracking-tight text-text leading-none">{value}</div>
      {sub && <div className="text-[11px] text-muted font-medium">{sub}</div>}
    </div>
  );
}

function VerdictBadge({ verdict }) {
  const isHire = verdict === 'Strong Hire' || verdict === 'Hire';
  const isBorderline = verdict === 'Borderline';
  const cls = isHire
    ? 'bg-success/10 text-success border-success/25'
    : isBorderline
    ? 'bg-amber-400/10 text-amber-400 border-amber-400/25'
    : 'bg-error/10 text-error border-error/25';
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${cls}`}>{verdict}</span>
  );
}

function SessionCard({ session }) {
  const companyName  = session.companyId?.name || 'FAANG';
  const initial      = companyName.charAt(0).toUpperCase();
  const score        = session.overallScore ?? 0;
  const scoreGood    = score >= 70;
  const date         = new Date(session.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-surface border border-border/40 rounded-[20px] p-5 flex flex-col gap-4 hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-base flex-shrink-0">
            {initial}
          </div>
          <div>
            <div className="text-[14px] font-bold text-text">{companyName} Mock Interview</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted">
              <Calendar size={11} />{date}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-0.5">Score</div>
            <div className={`text-[22px] font-black tabular-nums leading-none ${scoreGood ? 'text-success' : 'text-error'}`}>
              {score}<span className="text-sm text-muted font-medium">/100</span>
            </div>
          </div>
          {session.verdict && <VerdictBadge verdict={session.verdict} />}
        </div>
      </div>
      {session.aiFeedbackSummary && (
        <div className="bg-bg border border-border/40 rounded-[14px] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">AI Feedback</div>
          <p className="text-[12px] text-text-secondary leading-relaxed m-0">{session.aiFeedbackSummary}</p>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface border border-border/50 rounded-[24px]">
      <div className="w-16 h-16 rounded-[20px] bg-primary/8 border border-primary/20 flex items-center justify-center mb-5">
        <Swords size={28} className="text-primary opacity-60" />
      </div>
      <h3 className="text-[16px] font-black text-text mb-2">No Interviews Yet</h3>
      <p className="text-[13px] text-muted font-medium max-w-[360px] mb-6 leading-relaxed">
        Take a mock FAANG SQL interview to test your skills and start building your interview history here.
      </p>
      <Link to="/interview"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold no-underline hover:bg-primary/90 transition-colors">
        <Swords size={15} />Start an Interview<ArrowRight size={15} />
      </Link>
    </div>
  );
}

export function MockInterviewsTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mockInterviews'],
    queryFn: async () => {
      const response = await api.interviews.getHistory();
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border/40 rounded-[20px] p-5 animate-pulse h-24" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border/40 rounded-[20px] p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-surface border border-border/50 rounded-[24px]">
        <XCircle className="w-12 h-12 text-error opacity-40 mb-4" />
        <p className="text-[13px] text-muted font-medium">Failed to load interview history.</p>
      </div>
    );
  }

  const { sessions = [], stats = { totalInterviews: 0, averageScore: 0 } } = data || {};
  if (sessions.length === 0) return <EmptyState />;

  const bestScore = sessions.reduce((best, s) => Math.max(best, s.overallScore ?? 0), 0);
  const hireRate  = Math.round((sessions.filter((s) => s.verdict === 'Hire' || s.verdict === 'Strong Hire').length / sessions.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Interviews" value={stats.totalInterviews} icon={BarChart2} />
        <StatCard label="Average Score"    value={stats.averageScore}   sub="out of 100" icon={Target} colorClass="text-primary" />
        <StatCard label="Best Score"       value={bestScore}            sub="personal record" icon={TrendingUp} colorClass="text-success" />
        <StatCard label="Hire Rate"        value={`${hireRate}%`}       sub="Hire / Strong Hire" icon={CheckCircle} colorClass="text-amber-400" />
      </div>

      {/* Session list */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-muted" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Interview History</span>
        </div>
        {sessions.map((session) => (
          <SessionCard key={session._id} session={session} />
        ))}
      </div>
    </div>
  );
}
