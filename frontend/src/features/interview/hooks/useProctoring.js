import { useEffect, useRef, useState } from 'react';

export function useProctoring({
  isSubmittedRef,
  isTerminated,
  enforceViolation,
  addViolation
}) {
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const fullscreenTimeoutRef = useRef(null);
  const gracePeriodRef = useRef(true);

  // Zero-Tolerance Anti-Cheat
  useEffect(() => {
    if (isSubmittedRef.current || isTerminated) return;

    const graceTimer = setTimeout(() => {
      gracePeriodRef.current = false;
      if (!document.fullscreenElement && !isSubmittedRef.current) {
        enforceViolation('Exited fullscreen mode immediately after starting.');
      }
    }, 5000);

    return () => clearTimeout(graceTimer);
  }, []); // Run once on mount

  useEffect(() => {
    if (isSubmittedRef.current || isTerminated) return;

    const handleFullscreenChange = () => {
      if (gracePeriodRef.current || isSubmittedRef.current || isTerminated) return;
      if (!document.fullscreenElement) {
        setFullscreenWarning(true);
        addViolation('Exited fullscreen mode', 30);
        
        fullscreenTimeoutRef.current = setTimeout(() => {
          if (!document.fullscreenElement && !isSubmittedRef.current) {
            enforceViolation('Failed to return to fullscreen.');
          }
        }, 15000);
      } else {
        setFullscreenWarning(false);
        if (fullscreenTimeoutRef.current) {
          clearTimeout(fullscreenTimeoutRef.current);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (gracePeriodRef.current || isSubmittedRef.current || isTerminated) return;
      if (document.hidden) {
        enforceViolation('Tab switching is strictly prohibited.');
      }
    };

    const handleBlur = () => {
      if (gracePeriodRef.current || isSubmittedRef.current || isTerminated) return;
      // In dev mode with dev tools open, blur triggers constantly.
      // We only flag it as a minor warning, not an immediate termination.
      addViolation('Window lost focus', 10);
    };

    const handleClipboard = (e) => {
      if (isSubmittedRef.current || isTerminated) return;
      e.preventDefault();
      enforceViolation('Clipboard actions (copy/cut/paste) are strictly prohibited.');
    };

    const handleContextMenu = (e) => {
      if (isSubmittedRef.current || isTerminated) return;
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      if (fullscreenTimeoutRef.current) clearTimeout(fullscreenTimeoutRef.current);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isSubmittedRef, isTerminated, enforceViolation, addViolation]);

  return {
    fullscreenWarning,
    setFullscreenWarning
  };
}
