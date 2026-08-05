import React from 'react';

/**
 * Reusable Skeleton loader for async content.
 * Follows the design system's border-radius and background colors.
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-3 ${className || ''}`}
      {...props}
    />
  );
};
