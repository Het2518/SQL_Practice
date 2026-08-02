import React from 'react';

export const JoinVennDiagram = ({ joinType }) => {
  const type = (joinType || '').toUpperCase();
  const isLeft = type.includes('LEFT');
  const isRight = type.includes('RIGHT');
  const isOuter = type.includes('FULL') || type.includes('OUTER');
  const isInner = type.includes('INNER') || type === 'JOIN';
  
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" className="block shrink-0">
      <defs>
        <clipPath id={`clip-right-${type.replace(/\s+/g, '-')}`}>
          <circle cx="40" cy="20" r="16" />
        </clipPath>
      </defs>
      <circle cx="24" cy="20" r="16" fill="transparent" stroke="var(--primary)" strokeWidth="2" opacity="0.4" />
      <circle cx="40" cy="20" r="16" fill="transparent" stroke="var(--success)" strokeWidth="2" opacity="0.4" />
      
      {(isLeft || isOuter) && <circle cx="24" cy="20" r="16" fill="var(--primary)" opacity="0.3" />}
      {(isRight || isOuter) && <circle cx="40" cy="20" r="16" fill="var(--success)" opacity="0.3" />}
      
      {(isInner || isLeft || isRight || isOuter) && (
        <circle cx="24" cy="20" r="16" fill="var(--text)" opacity="0.5" clipPath={`url(#clip-right-${type.replace(/\s+/g, '-')})`} />
      )}
    </svg>
  );
};
