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
      <div className="flex justify-center p-[60px] text-muted">
        <Loader2 className="spinner" size={32} />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-surface p-[60px] rounded-2xl text-center border border-border">
        <MessageSquare size={48} className="text-muted mb-4 opacity-50 mx-auto" />
        <h3 className="m-0 mb-2 text-xl text-text">No Discussions Yet</h3>
        <p className="text-muted m-0 max-w-[400px] mx-auto">
          You haven't posted any comments or solutions. Head over to the practice area to start engaging with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => {
        // Find the question info so we can link back to it
        const question = allQuestions.find(q => String(q.id) === String(comment.questionId));
        const dbName = question?.db || 'airlines';
        const questionTitle = question?.title || `Question #${comment.questionId}`;

        return (
          <div 
            key={comment._id} 
            className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <Link 
                to={`/practice/${dbName}?q=${comment.questionId}`}
                className="text-text no-underline font-semibold text-base flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                {questionTitle} <ChevronRight size={16} className="opacity-50" />
              </Link>
              <div className="flex items-center gap-1.5 text-muted text-xs">
                <Calendar size={12} />
                {new Date(comment.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-surface-2 p-4 rounded-lg text-text text-sm leading-relaxed">
              "{comment.content}"
            </div>

            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-text-secondary text-[13px] font-medium">
                <ThumbsUp size={14} className="text-primary" /> 
                {comment.upvotes} upvotes
              </div>
              {comment.isAcceptedSolution && (
                <div className="bg-success/10 text-success px-2 py-0.5 rounded-full text-[11px] font-bold">
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
