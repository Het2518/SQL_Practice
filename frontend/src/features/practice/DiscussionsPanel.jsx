import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Send, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/useAuthStore';


export function DiscussionsPanel({ questionId }) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', questionId],
    queryFn: async () => {
      const res = await api.comments.getByQuestion(questionId);
      return res.data.data.comments;
    },
    enabled: !!questionId
  });

  const postMutation = useMutation({
    mutationFn: (content) => api.comments.create({ questionId, content }),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', questionId] });
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: (commentId) => api.comments.upvote(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', questionId] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      alert("Please log in to post a comment.");
      return;
    }
    postMutation.mutate(newComment);
  };

  const comments = data || [];

  return (
    <div className="flex flex-col h-full bg-surface text-text font-sans">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <h3 className="m-0 text-[15px] font-semibold text-text">
          <MessageSquare size={16} className="inline-block mr-2 align-[-3px]" /> Discussions
        </h3>
        <span className="text-xs text-muted bg-bg px-2 py-1 rounded-xl font-medium">{comments.length} comments</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="p-5 text-center text-muted flex justify-center">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 px-5 text-center text-muted">
            No discussions yet. Be the first to ask a question or share a solution!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={`bg-bg border border-border rounded-lg p-3 transition-all duration-200 ${comment.isAccepted ? 'border-success bg-success/5' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                <img src={comment.avatar} alt={comment.user} className="w-8 h-8 rounded-full bg-border" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-[13px] text-text">
                    {comment.user} {comment.isOwner && <span className="text-[10px] opacity-70">(You)</span>}
                  </span>
                  <span className="text-[11px] text-muted">{new Date(comment.time).toLocaleDateString()}</span>
                </div>
                {comment.isAccepted && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-success bg-success/10 px-2 py-1 rounded">
                    <CheckCircle size={12} /> Accepted Solution
                  </div>
                )}
              </div>
              <div className="text-[13px] leading-relaxed text-text-secondary mb-3">
                {comment.content}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="bg-transparent border-none flex items-center gap-1.5 text-muted text-xs font-medium cursor-pointer px-2 py-1 rounded transition-colors hover:bg-border hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={() => upvoteMutation.mutate(comment.id)}
                  disabled={upvoteMutation.isPending}
                >
                  <ThumbsUp size={14} /> {comment.upvotes}
                </button>
                <button className="bg-transparent border-none flex items-center gap-1.5 text-muted text-xs font-medium cursor-pointer px-2 py-1 rounded transition-colors hover:bg-border hover:text-primary">
                  <ThumbsDown size={14} />
                </button>
                <button className="bg-transparent border-none flex items-center gap-1.5 text-muted text-xs font-medium cursor-pointer px-2 py-1 rounded transition-colors hover:text-text">
                  Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form className="px-5 py-4 border-t border-border flex gap-3 bg-surface" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder={user ? "Ask a question or share a solution..." : "Log in to post a comment..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={postMutation.isPending || !user}
          className="flex-1 bg-bg border border-border rounded-full px-4 py-2.5 text-text text-[13px] outline-none transition-colors focus:border-primary disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={!newComment.trim() || postMutation.isPending || !user} 
          className="bg-primary text-primary-foreground border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 hover:not(:disabled):scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {postMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
