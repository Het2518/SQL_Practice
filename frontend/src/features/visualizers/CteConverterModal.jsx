import React from 'react';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export const CteConverterModal = ({ isOpen, onClose, originalSql, convertedSql, onUseConverted }) => {
  const trapRef = useFocusTrap(isOpen);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6">
      <div ref={trapRef} className="bg-bg w-full max-w-[1200px] h-[80vh] rounded-xl flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
          <div>
            <h2 className="m-0 text-lg text-text">Subquery → CTE Conversion</h2>
            <div className="text-[13px] text-text-secondary mt-1">
              Both queries return identical results. CTEs are preferred for readability, reusability, and debugging.
            </div>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-muted cursor-pointer text-xl">✖</button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden bg-surface-2">
          {/* Original */}
          <div className="flex-1 flex flex-col border-r border-border">
            <div className="px-4 py-3 font-semibold text-error bg-error/5 border-b border-border">
              Original (Subquery)
            </div>
            <div className="flex-1 relative">
              <SqlEditor value={originalSql} readOnly={true} />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center w-10 bg-surface border-r border-border text-primary text-2xl font-bold z-10">
            →
          </div>

          {/* Converted */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 font-semibold text-success bg-success/5 border-b border-border">
              Converted (CTE)
            </div>
            <div className="flex-1 relative">
              <SqlEditor value={convertedSql} readOnly={true} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface">
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
