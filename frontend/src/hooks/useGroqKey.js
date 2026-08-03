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
    // sessionStorage doesn't fire storage events between tabs, so listen for the
    // app-level settings update event that the save flow emits.
    const checkKey = () => setHasKey(hasGroqKey());
    window.addEventListener('sql-practice-settings-updated', checkKey);
    window.addEventListener('storage', checkKey);
    return () => {
      window.removeEventListener('sql-practice-settings-updated', checkKey);
      window.removeEventListener('storage', checkKey);
    };
  }, []);

  return hasKey;
}
