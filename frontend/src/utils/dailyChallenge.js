import { allQuestions } from '@/data';

// Simple deterministic hash function for strings
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets the daily challenge question based on the current local date (YYYY-MM-DD).
 */
export function getDailyChallenge() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  if (!allQuestions || allQuestions.length === 0) return null;

  // Use the date string to deterministically pick a question
  const hash = hashString(dateStr);
  const index = hash % allQuestions.length;

  return allQuestions[index];
}

/**
 * Checks if a given question ID is today's daily challenge.
 */
export function isDailyChallenge(questionId) {
  const daily = getDailyChallenge();
  return daily && String(daily.id) === String(questionId);
}
