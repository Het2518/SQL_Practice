import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuestionHeader } from './QuestionHeader';
import React from 'react';

describe('QuestionHeader', () => {
  const defaultProps = {
    question: { id: 1, title: 'Test Question', difficulty: 'easy' },
    status: 'incomplete',
    timeLeft: 300,
    timedChallenges: false,
    questionNumber: 1,
    totalQuestions: 10,
    hasPrev: true,
    hasNext: true,
    onNavigate: vi.fn(),
    onOpenBrowser: vi.fn(),
  };

  it('renders question title and difficulty', () => {
    render(<QuestionHeader {...defaultProps} />);
    expect(screen.getByText('Test Question')).toBeInTheDocument();
    expect(screen.getByText('EASY')).toBeInTheDocument();
  });

  it('renders timer when timedChallenges is true', () => {
    render(<QuestionHeader {...defaultProps} timedChallenges={true} timeLeft={300} />);
    // 300 seconds is 5:00
    expect(screen.getByText(/5:00/)).toBeInTheDocument();
  });

  it('does not render timer when timedChallenges is false', () => {
    render(<QuestionHeader {...defaultProps} timedChallenges={false} />);
    expect(screen.queryByText(/5:00/)).not.toBeInTheDocument();
  });

  it('calls onNavigate with prev when prev button clicked', () => {
    const onNavigate = vi.fn();
    render(<QuestionHeader {...defaultProps} onNavigate={onNavigate} />);
    
    // The Previous button is identified by the text ◀
    const prevBtn = screen.getByRole('button', { name: '◀' });
    fireEvent.click(prevBtn);
    expect(onNavigate).toHaveBeenCalledWith('prev');
  });

  it('calls onNavigate with next when next button clicked', () => {
    const onNavigate = vi.fn();
    render(<QuestionHeader {...defaultProps} onNavigate={onNavigate} />);
    
    // The Next button is identified by the text ▶
    const nextBtn = screen.getByRole('button', { name: '▶' });
    fireEvent.click(nextBtn);
    expect(onNavigate).toHaveBeenCalledWith('next');
  });

  it('calls onOpenBrowser when center text is clicked', () => {
    const onOpenBrowser = vi.fn();
    // question.db must be rendered to find the button
    const propsWithDb = { ...defaultProps, question: { ...defaultProps.question, db: 'Test DB' } };
    render(<QuestionHeader {...propsWithDb} onOpenBrowser={onOpenBrowser} />);
    
    // The browser button contains the db name
    const browserButton = screen.getByRole('button', { name: /test db/i });
    fireEvent.click(browserButton);
    expect(onOpenBrowser).toHaveBeenCalledTimes(1);
  });
});
