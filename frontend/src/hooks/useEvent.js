import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Hook to create a stable callback that always has access to the latest state/props.
 * Equivalent to React's experimental useEffectEvent.
 * @param {Function} handler
 * @returns {Function} Stable reference to the handler
 */
export function useEvent(handler) {
  const handlerRef = useRef(null);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn?.(...args);
  }, []);
}
