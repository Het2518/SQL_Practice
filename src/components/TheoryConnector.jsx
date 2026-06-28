import React, { useState, useEffect } from 'react';
import { CONCEPTS, CONCEPT_TRIGGERS } from '../data/concepts';

const detectConcept = (sql) => {
  const upperSql = sql.toUpperCase();
  for (const [pattern, conceptId] of Object.entries(CONCEPT_TRIGGERS)) {
    if (new RegExp(`\\b${pattern}\\b`, 'i').test(sql) || new RegExp(pattern, 'i').test(sql)) {
      return conceptId;
    }
  }
  return null;
};

export const TheoryConnector = ({ sql }) => {
  const [activeConceptId, setActiveConceptId] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    if (!sql) return;
    const detected = detectConcept(sql);
    if (detected && !dismissed.has(detected)) {
      setActiveConceptId(detected);
    }
  }, [sql, dismissed]);

  if (!activeConceptId) return null;

  const concept = CONCEPTS[activeConceptId];
  if (!concept) return null;

  const handleDismiss = () => {
    setDismissed(prev => new Set([...prev, activeConceptId]));
    setActiveConceptId(null);
  };

  return (
    <div className="theory-connector-panel" style={{
      marginTop: '16px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(139, 92, 246, 0.15)', // Purple tint for theory
        borderBottom: '1px solid var(--border)'
      }}>
        <span style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🎓</span> DBMS Theory: {concept.title}
        </span>
        <button onClick={handleDismiss} style={{
          background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px'
        }}>✖</button>
      </div>

      <div style={{ padding: '14px', fontSize: '13px', color: 'var(--text)' }}>
        <p style={{ margin: '0 0 12px 0', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
          {concept.tldr}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <h6 style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Key Points</h6>
            <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text)' }}>
              {concept.keyPoints.map((pt, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
              ))}
            </ul>
          </div>

          <div>
            <h6 style={{ margin: '0 0 6px 0', color: 'var(--error)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Common Mistakes</h6>
            <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text)' }}>
              {concept.commonMistakes.map((pt, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '10px', background: 'var(--surface)', borderRadius: '6px', borderLeft: '3px solid #8b5cf6' }}>
          <h6 style={{ margin: '0 0 4px 0', color: '#8b5cf6', fontSize: '11px', textTransform: 'uppercase' }}>Interview Prep</h6>
          <div style={{ fontWeight: 600 }}>{concept.interviewQuestion}</div>
        </div>
      </div>
    </div>
  );
};
