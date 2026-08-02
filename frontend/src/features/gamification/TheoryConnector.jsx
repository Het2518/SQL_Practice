import React, { useState, useEffect } from 'react';
import { CONCEPTS, CONCEPT_TRIGGERS } from '@/data/concepts';

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
    <div className="theory-connector-panel mt-4 bg-surface-2 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between py-2.5 px-3.5 bg-purple-500/15 border-b border-border">
        <span className="font-bold text-[#8b5cf6] text-[13px] flex items-center gap-1.5">
          <span>🎓</span> DBMS Theory: {concept.title}
        </span>
        <button onClick={handleDismiss} className="bg-transparent border-none text-muted cursor-pointer text-sm">✖</button>
      </div>

      <div className="p-3.5 text-[13px] text-text">
        <p className="m-0 mb-3 italic text-text-secondary">
          {concept.tldr}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h6 className="m-0 mb-1.5 text-text-secondary uppercase text-[11px] tracking-wider">Key Points</h6>
            <ul className="m-0 pl-4 text-text">
              {concept.keyPoints.map((pt, i) => (
                <li key={i} className="mb-1">{pt}</li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className="m-0 mb-1.5 text-error uppercase text-[11px] tracking-wider">Common Mistakes</h6>
            <ul className="m-0 pl-4 text-text">
              {concept.commonMistakes.map((pt, i) => (
                <li key={i} className="mb-1">{pt}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 p-2.5 bg-surface rounded-md border-l-[3px] border-l-[#8b5cf6]">
          <h6 className="m-0 mb-1 text-[#8b5cf6] text-[11px] uppercase">Interview Prep</h6>
          <div className="font-semibold">{concept.interviewQuestion}</div>
        </div>
      </div>
    </div>
  );
};
