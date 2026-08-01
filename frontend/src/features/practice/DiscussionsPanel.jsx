import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Send } from 'lucide-react';
import './DiscussionsPanel.css';

const MOCK_COMMENTS = [
  {
    id: 1,
    user: 'DataWizard99',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DataWizard',
    content: "A great trick here is to use a LEFT JOIN instead of INNER JOIN. The edge case fails if there are users with no orders!",
    upvotes: 42,
    isAccepted: true,
    time: '2 hours ago'
  },
  {
    id: 2,
    user: 'SQL_Newbie',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Newbie',
    content: "I tried using a subquery in the WHERE clause, but it timed out on the large dataset. Any tips for optimizing?",
    upvotes: 5,
    isAccepted: false,
    time: '5 hours ago'
  },
  {
    id: 3,
    user: 'QueryMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master',
    content: "To the newbie above: try using a CTE (Common Table Expression). It makes it much easier to read and often performs better on Postgres.",
    upvotes: 18,
    isAccepted: false,
    time: '4 hours ago'
  }
];

export function DiscussionsPanel({ questionId }) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // In a real app, this would hit api.comments.create(...)
    alert("Discussion features will be fully connected to the backend soon!");
    setNewComment('');
  };

  return (
    <div className="discussions-panel">
      <div className="discussions-header">
        <h3><MessageSquare size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: '-3px' }} /> Discussions</h3>
        <span className="comment-count">{MOCK_COMMENTS.length} comments</span>
      </div>

      <div className="discussions-list">
        {MOCK_COMMENTS.map(comment => (
          <div key={comment.id} className={`comment-card ${comment.isAccepted ? 'accepted' : ''}`}>
            <div className="comment-header">
              <img src={comment.avatar} alt={comment.user} className="comment-avatar" />
              <div className="comment-meta">
                <span className="comment-user">{comment.user}</span>
                <span className="comment-time">{comment.time}</span>
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
              <button className="vote-btn"><ThumbsUp size={14} /> {comment.upvotes}</button>
              <button className="vote-btn"><ThumbsDown size={14} /></button>
              <button className="reply-btn">Reply</button>
            </div>
          </div>
        ))}
      </div>

      <form className="comment-input-area" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Ask a question or share a solution..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" disabled={!newComment.trim()} className="send-btn">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
