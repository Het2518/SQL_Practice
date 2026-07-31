import { useState, useCallback } from 'react';
import { getQuestionsForDb } from '@/data/index';
import { isDailyChallenge } from '@/utils/dailyChallenge';
import posthog from 'posthog-js';

/**
 * Custom hook to manage execution of SQL queries and verifying answers.
 */
export function useQueryExecution({
  db,
  currentQ,
  sql,
  progress,
  onProgressUpdate,
  executeQuery,
  runVerification,
  validateAnswer,
  checkSafety,
  fireConfetti,
  toast,
  setQueryHistory,
}) {
  const [executedSql, setExecutedSql] = useState('');
  const [result, setResult] = useState(null);
  const [expectedResult, setExpectedResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = useCallback(async () => {
    if (!sql.trim()) return;

    // Run safety check first
    const isSafe = await checkSafety(sql, currentQ);
    if (!isSafe) return; // user chose to edit query

    setIsExecuting(true);
    setExecutedSql(sql);

    posthog.capture('query_executed', {
      db_name: db,
      question_id: currentQ?.id,
      difficulty: currentQ?.difficulty,
      is_ai_generated: currentQ?.isAiGenerated || false,
    });

    // Add full context entry to history if not a duplicate of last
    setQueryHistory((prev) => {
      const entry = {
        sql,
        questionId: currentQ.id,
        dbName: db,
        prompt: currentQ.prompt?.substring(0, 50),
      };
      const filtered = prev.filter((h) => h.sql !== sql);
      return [entry, ...filtered].slice(0, 50);
    });

    try {
      if (currentQ && currentQ.solutionSQL && !currentQ.isAiGenerated) {
        const val = await validateAnswer(
          sql,
          currentQ.solutionSQL,
          currentQ.verificationSQL,
          currentQ.requiresOrder
        );
        if (val.userResult) {
          setResult(val.userResult);
        } else if (
          val.message.startsWith('SQL Error:') ||
          val.message.startsWith('System Error:')
        ) {
          setResult({ error: val.message });
        }

        setValidation(val);
        if (val.isCorrect) {
          posthog.capture('question_completed', {
            db_name: db,
            question_id: currentQ?.id,
            difficulty: currentQ?.difficulty,
          });

          onProgressUpdate(currentQ, db, 'complete');
          if (progress[currentQ.id] !== 'complete') {
            const diff = (currentQ.difficulty || '').toLowerCase();
            let pts = diff === 'hard' ? 50 : diff === 'medium' ? 30 : 10;
            const isDaily = isDailyChallenge(currentQ.id);
            if (isDaily) pts *= 3;
            fireConfetti();
            toast({
              type: 'success',
              title:
                diff === 'hard'
                  ? '🔥 Hard Problem Solved!'
                  : diff === 'medium'
                    ? '⭐ Nice Work!'
                    : '✅ Correct!',
              message: `You earned ${pts} XP!${isDaily ? ' (3x Daily Bonus 🔥)' : ''}`,
            });
          }
        } else {
          if (progress[currentQ.id] !== 'complete') {
            onProgressUpdate(currentQ, db, 'attempted');
          }
        }
      } else {
        // Sandbox mode or free-play mode (no active question checking)
        const originalRes = await executeQuery(sql);
        setResult(originalRes);
        if (originalRes.error) {
          setValidation({ isCorrect: false, message: originalRes.error });
        } else {
          setValidation(null);
        }
      }
    } finally {
      setIsExecuting(false);
    }
  }, [
    sql,
    executeQuery,
    currentQ,
    validateAnswer,
    onProgressUpdate,
    progress,
    db,
    fireConfetti,
    toast,
    setQueryHistory,
    checkSafety,
  ]);

  const handleExplain = useCallback(async () => {
    if (!sql.trim()) return;
    setIsExecuting(true);
    const res = await executeQuery(`EXPLAIN QUERY PLAN ${sql}`);
    setResult(res);
    setValidation(null);
    setExecutedSql(sql);
    setIsExecuting(false);
  }, [sql, executeQuery]);

  return {
    executedSql,
    setExecutedSql,
    result,
    setResult,
    expectedResult,
    setExpectedResult,
    validation,
    setValidation,
    isExecuting,
    setIsExecuting,
    handleRun,
    handleExplain,
  };
}
