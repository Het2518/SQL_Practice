import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmModal } from './ConfirmModal';
import React from 'react';

describe('ConfirmModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmModal isOpen={false} title="Test Title" message="Test Message" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <ConfirmModal 
        isOpen={true} 
        title="Delete Item" 
        message="Are you sure?" 
      />
    );
    
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();
    render(
      <ConfirmModal 
        isOpen={true} 
        title="Delete Item" 
        message="Are you sure?" 
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancelMock = vi.fn();
    render(
      <ConfirmModal 
        isOpen={true} 
        title="Delete Item" 
        message="Are you sure?" 
        onCancel={onCancelMock}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
