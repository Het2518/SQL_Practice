import { useEffect, useRef, useState } from 'react';

export function useProctoring({
  isSubmittedRef,
  isTerminated,
  enforceViolation,
  addViolation
}) {
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const fullscreenTimeoutRef = useRef(null);

  // Zero-Tolerance Anti-Cheat
  useEffect(() => {
    if (isSubmittedRef.current || isTerminated) return;

    let gracePeriodActive = true;
    const graceTimer = setTimeout(() => {
      gracePeriodActive = false;
      if (!document.fullscreenElement && !isSubmittedRef.current) {
        enforceViolation('Exited fullscreen mode.');
      }
    }, 5000);

    const handleFullscreenChange = () => {
      if (gracePeriodActive || isSubmittedRef.current || isTerminated) return;
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
      if (gracePeriodActive || isSubmittedRef.current || isTerminated) return;
      if (document.hidden) {
        addViolation('Tab switched or minimized', 50);
        enforceViolation('Tab switching is strictly prohibited.');
      }
    };

    const handleBlur = () => {
      if (gracePeriodActive || isSubmittedRef.current || isTerminated) return;
      // In dev mode with dev tools open, blur triggers constantly.
      // We only flag it as a minor warning, not an immediate termination.
      addViolation('Window lost focus', 10);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      clearTimeout(graceTimer);
      if (fullscreenTimeoutRef.current) clearTimeout(fullscreenTimeoutRef.current);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSubmittedRef, isTerminated, enforceViolation, addViolation]);

  return {
    fullscreenWarning,
    setFullscreenWarning
  };
}
