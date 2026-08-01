import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Send, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import './DiscussionsPanel.css';

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
    <div className="discussions-panel">
      <div className="discussions-header">
        <h3><MessageSquare size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: '-3px' }} /> Discussions</h3>
        <span className="comment-count">{comments.length} comments</span>
      </div>

      <div className="discussions-list">
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
            <Loader2 className="spinner" size={24} />
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            No discussions yet. Be the first to ask a question or share a solution!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={`comment-card ${comment.isAccepted ? 'accepted' : ''}`}>
              <div className="comment-header">
                <img src={comment.avatar} alt={comment.user} className="comment-avatar" />
                <div className="comment-meta">
                  <span className="comment-user">{comment.user} {comment.isOwner && <span style={{fontSize: 10, opacity: 0.7}}>(You)</span>}</span>
                  <span className="comment-time">{new Date(comment.time).toLocaleDateString()}</span>
                </div>
                {comment.isAccepted && (
                  <div className="accepted-badge">
                    <CheckCircle size={12} /> Accepted Solution
                  </div>
                )}
              </div>
              <div className="comment-body">
                {comment.content}
              </div>
              <div className="comment-footer">
                <button 
                  className="vote-btn" 
                  onClick={() => upvoteMutation.mutate(comment.id)}
                  disabled={upvoteMutation.isPending}
                >
                  <ThumbsUp size={14} /> {comment.upvotes}
                </button>
                <button className="vote-btn"><ThumbsDown size={14} /></button>
                <button className="reply-btn">Reply</button>
              </div>
            </div>
          ))
        )}
      </div>

      <form className="comment-input-area" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder={user ? "Ask a question or share a solution..." : "Log in to post a comment..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={postMutation.isPending || !user}
        />
        <button type="submit" disabled={!newComment.trim() || postMutation.isPending || !user} className="send-btn">
          {postMutation.isPending ? <Loader2 className="spinner" size={16} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
