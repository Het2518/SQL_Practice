import React from 'react';
import { SqlEditor } from '@/features/practice/SqlEditor';

export const CteConverterModal = ({ isOpen, onClose, originalSql, convertedSql, onUseConverted }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg)',
        width: '100%',
        maxWidth: '1200px',
        height: '80vh',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>Subquery → CTE Conversion</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Both queries return identical results. CTEs are preferred for readability, reusability, and debugging.
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px'
          }}>✖</button>
        </div>

        {/* Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          background: 'var(--surface-2)'
        }}>
          {/* Original */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
            <div style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--error)', background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid var(--border)' }}>
              Original (Subquery)
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <SqlEditor value={originalSql} readOnly={true} />
            </div>
          </div>

          {/* Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            color: 'var(--primary)',
            fontSize: '24px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            →
          </div>

          {/* Converted */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)', borderBottom: '1px solid var(--border)' }}>
              Converted (CTE)
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <SqlEditor value={convertedSql} readOnly={true} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          background: 'var(--surface)'
        }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            onUseConverted(convertedSql);
            onClose();
          }}>
            Use This Version
          </button>
        </div>
      </div>
    </div>
  );
};
