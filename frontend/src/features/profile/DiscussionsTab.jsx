import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Calendar, ChevronRight, Loader2, ThumbsUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { allQuestions } from '@/data/index';

export function DiscussionsTab() {
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['my-comments'],
    queryFn: async () => {
      const res = await api.comments.getMyComments();
      return res.data.data.comments;
    }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--muted)' }}>
        <Loader2 className="spinner" size={32} />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', padding: '60px', borderRadius: 16, textAlign: 'center', border: '1px solid var(--border)' }}>
        <MessageSquare size={48} style={{ color: 'var(--muted)', marginBottom: 16, opacity: 0.5 }} />
        <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>No Discussions Yet</h3>
        <p style={{ color: 'var(--muted)', margin: 0, maxWidth: 400, marginInline: 'auto' }}>
          You haven't posted any comments or solutions. Head over to the practice area to start engaging with the community!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {comments.map((comment) => {
        // Find the question info so we can link back to it
        const question = allQuestions.find(q => String(q.id) === String(comment.questionId));
        const dbName = question?.db || 'airlines';
        const questionTitle = question?.title || `Question #${comment.questionId}`;

        return (
          <div 
            key={comment._id} 
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Link 
                to={`/practice/${dbName}?q=${comment.questionId}`}
                style={{ 
                  color: 'var(--text)', 
                  textDecoration: 'none', 
                  fontWeight: 600, 
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
              >
                {questionTitle} <ChevronRight size={16} style={{ opacity: 0.5 }} />
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12 }}>
                <Calendar size={12} />
                {new Date(comment.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{ 
              background: 'var(--surface-2)', 
              padding: '16px', 
              borderRadius: 8,
              color: 'var(--text)',
              fontSize: 14,
              lineHeight: 1.5
            }}>
              "{comment.content}"
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
                <ThumbsUp size={14} style={{ color: 'var(--primary)' }} /> 
                {comment.upvotes} upvotes
              </div>
              {comment.isAcceptedSolution && (
                <div style={{ background: 'var(--success-muted)', color: 'var(--success)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  Accepted Solution
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
