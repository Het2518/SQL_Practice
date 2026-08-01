import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Target, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

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
      <div className="flex justify-center items-center p-12 text-muted">
        Loading interview history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
        <XCircle className="w-12 h-12 text-error opacity-50 mb-4" />
        <p>Failed to load interview history.</p>
      </div>
    );
  }

  const { sessions, stats } = data || { sessions: [], stats: { totalInterviews: 0, averageScore: 0 } };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted bg-surface rounded-2xl border border-border mt-4">
        <Target className="w-16 h-16 opacity-30 mb-4 text-primary" />
        <h3 className="text-lg font-bold text-text mb-2">No Mock Interviews Yet</h3>
        <p className="max-w-[400px]">
          Take a mock FAANG interview in the Interview Prep section to test your skills and start tracking your scores here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-text mb-1">{stats.totalInterviews}</div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Interviews</div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-primary mb-1">{stats.averageScore}</div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Avg Score</div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface-2 flex items-center justify-between">
          <h3 className="font-bold text-text text-sm">Past Interviews</h3>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {sessions.map((session) => (
            <div key={session._id} className="p-6 hover:bg-surface-2 transition-colors flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {session.companyId ? session.companyId.name.charAt(0) : 'F'}
                  </div>
                  <div>
                    <div className="font-bold text-text text-base">
                      {session.companyId ? session.companyId.name : 'FAANG'} Mock Interview
                    </div>
                    <div className="text-xs text-text-secondary flex items-center gap-2 mt-1">
                      <Calendar size={12} /> {new Date(session.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-text-secondary">Score</span>
                    <span className={`text-xl font-black ${session.overallScore >= 70 ? 'text-success' : 'text-error'}`}>
                      {session.overallScore}<span className="text-sm text-text-secondary">/100</span>
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    session.verdict === 'Strong Hire' || session.verdict === 'Hire'
                      ? 'bg-success/10 text-success border border-success/20'
                      : session.verdict === 'Borderline'
                      ? 'bg-warning/10 text-warning border border-warning/20'
                      : 'bg-error/10 text-error border border-error/20'
                  }`}>
                    {session.verdict}
                  </div>
                </div>
              </div>
              {session.aiFeedbackSummary && (
                <div className="bg-bg border border-border p-4 rounded-xl text-sm text-text-secondary leading-relaxed whitespace-pre-wrap mt-2">
                  <strong className="text-text block mb-2">AI Feedback:</strong>
                  {session.aiFeedbackSummary}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
