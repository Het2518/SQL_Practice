import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiTutorPanel } from './AiTutorPanel';

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="icon-x" />,
  Send: () => <div data-testid="icon-send" />,
  Trash2: () => <div data-testid="icon-trash" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  User: () => <div data-testid="icon-user" />,
  Bot: () => <div data-testid="icon-bot" />,
}));

describe('AiTutorPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <AiTutorPanel
        isOpen={true}
        onClose={mockOnClose}
        currentSql="SELECT * FROM table;"
        dbSchemaContext="Schema info"
      />
    );
    expect(screen.getByText('AI SQL Tutor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask for a hint, explain an error...')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AiTutorPanel isOpen={true} onClose={mockOnClose} currentSql="" dbSchemaContext="" />);
    const closeBtn = screen.getByTestId('icon-x').parentElement;
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
