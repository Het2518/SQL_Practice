import React, { useState, useEffect, useRef } from 'react';
import { QuestionHeader } from './QuestionHeader';
import { QuestionBody } from './QuestionBody';
import { QuestionHintSection } from './QuestionHintSection';
import { QuestionAiSection } from './QuestionAiSection';
import { useProactiveTutor } from '@/features/ai/useProactiveTutor';
import { groqChat, buildAiSolutionPrompt } from '@/lib/groq';

export const QuestionCard = React.memo(function QuestionCard({
  question,
  expectedResult,
  status,
  onOpenBrowser,
  onOpenAiTutor,
  onNavigate,
  hasPrev,
  hasNext,
  questionNumber,
  totalQuestions,
  timedChallenges = false,
  onTimerExpire,
  currentSql = '',
  lastValidation = null,
  dbSchemaContext = '',
  executeQuery,
}) {
  const TIMER_DURATION = 5 * 60;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerExpiredRef = useRef(false);

  const [aiSolution, setAiSolution] = useState(null);
  const [aiSolutionLoading, setAiSolutionLoading] = useState(false);
  const [aiSolutionError, setAiSolutionError] = useState('');
  const [aiExpectedResult, setAiExpectedResult] = useState(null);

  const [realCompanies, setRealCompanies] = useState([]);

  // Check API Key
  const hasKey = true;

  useProactiveTutor({
    sql: currentSql,
    question: question,
    dbSchemaContext,
    delayMs: 30000, 
    isEnabled: status !== 'complete',
  });

  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
    setTimerStarted(timedChallenges);
    timerExpiredRef.current = false;
    setAiSolution(null);
    setAiSolutionError('');
    setAiExpectedResult(null);
    setRealCompanies(question.companies || []);
  }, [question.id, question.prompt, timedChallenges]);

  useEffect(() => {
    if (!timerStarted || !timedChallenges) return;
    if (timeLeft <= 0) {
      if (!timerExpiredRef.current) {
        timerExpiredRef.current = true;
        if (onTimerExpire) onTimerExpire();
      }
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timerStarted, timeLeft, timedChallenges, onTimerExpire]);

  // Auto-generate AI Solution and Expected Output on mount for AI questions
  useEffect(() => {
    let isMounted = true;
    if (!question.isAiGenerated) return;

    const generateExpectedOutput = async (sqlToRun) => {
      if (executeQuery) {
        try {
          const res = await executeQuery(sqlToRun);
          if (isMounted && res) {
            if (res.error) {
              setAiExpectedResult({ error: res.error });
            } else if (res.columns) {
              setAiExpectedResult({
                columns: res.columns,
                rows: res.rows ? res.rows.slice(0, 100) : [],
              });
            }
          }
        } catch (e) {
          if (isMounted) setAiExpectedResult({ error: e.message });
        }
      }
    };

    const cacheKey = `ai-sol-${question.id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setAiSolution(cached);
      generateExpectedOutput(cached);
      return;
    }

    const fetchAiSolution = async () => {
      setAiSolutionLoading(true);
      setAiSolutionError('');
      try {
        const msgs = buildAiSolutionPrompt({
          questionPrompt: question.prompt,
          schemaContext: dbSchemaContext,
          db: question.db || 'ecommerce',
        });
        const sql = await groqChat(msgs, undefined, 400, false);
        const clean = sql
          .replace(/```sql\n?/gi, '')
          .replace(/```/g, '')
          .trim();
        if (isMounted) {
          setAiSolution(clean);
          sessionStorage.setItem(cacheKey, clean);
          generateExpectedOutput(clean);
        }
      } catch (e) {
        if (isMounted) {
          setAiSolutionError(
            e.message === 'RATE_LIMIT'
              ? 'Rate limit. Wait 15 sec.'
              : 'Generation failed. Try again.'
          );
        }
      } finally {
        if (isMounted) setAiSolutionLoading(false);
      }
    };

    fetchAiSolution();

    return () => {
      isMounted = false;
    };
  }, [question.id, question.prompt, question.isAiGenerated, question.db, dbSchemaContext, executeQuery, hasKey]);

  return (
    <div className="flex flex-col h-full bg-bg border-r border-border">
      <div className="flex-1 overflow-y-auto p-5">
        <QuestionHeader
          question={question}
          status={status}
          timeLeft={timeLeft}
          timedChallenges={timedChallenges}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onNavigate={onNavigate}
          onOpenBrowser={onOpenBrowser}
        />

        <QuestionBody question={question} realCompanies={realCompanies} />

        <div className="flex flex-col gap-3 mb-6">
          <QuestionHintSection 
            question={question} 
            currentSql={currentSql} 
            hasKey={hasKey} 
            onOpenAiTutor={onOpenAiTutor} 
          />

          <QuestionAiSection 
            question={question}
            status={status}
            currentSql={currentSql}
            hasKey={hasKey}
            dbSchemaContext={dbSchemaContext}
            lastValidation={lastValidation}
            aiSolution={aiSolution}
            aiSolutionLoading={aiSolutionLoading}
            aiSolutionError={aiSolutionError}
            aiExpectedResult={aiExpectedResult}
            expectedResult={expectedResult}
            setAiSolution={setAiSolution}
            setAiExpectedResult={setAiExpectedResult}
            executeQuery={executeQuery}
          />
        </div>
      </div>
    </div>
  );
});
