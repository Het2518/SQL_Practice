import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = true }) {
  const trapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onCancel}
    >
      <div 
        ref={trapRef}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          width: '100%', maxWidth: '400px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            background: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            color: isDanger ? '#ef4444' : '#3b82f6',
            padding: '12px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '48px', width: '48px', flexShrink: 0
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onCancel(); }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
