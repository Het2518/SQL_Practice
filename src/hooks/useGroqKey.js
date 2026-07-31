import { useState, useEffect } from 'react';
import { hasGroqKey } from '@/lib/groq';

/**
 * useGroqKey — React hook to reactively track whether a Groq API key is available.
 * Listens for storage events so the UI updates immediately when the user saves a key.
 * Separated from groq.js to keep the library file free of React dependencies.
 */
export function useGroqKey() {
  const [hasKey, setHasKey] = useState(hasGroqKey());

  useEffect(() => {
    // sessionStorage doesn't fire storage events between tabs, but this handler
    // still works for same-tab key changes dispatched via window.dispatchEvent.
    const checkKey = () => setHasKey(hasGroqKey());
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  return hasKey;
}
