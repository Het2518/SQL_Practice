import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getQuestionsForDb } from '@/data/index';
import { DB_INFO } from '@/data/schemas';

export function usePracticeState({ routeDb, progress, progressLoaded, settings, onProgressUpdate, user, onShowAuth, checkSafety, fireConfetti, toast, useSqlDatabase }) {
  const navigate = useNavigate();
  const initialDb = routeDb || 'airlines';
  const [db, setDb] = useState(initialDb);

  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');

  const [currentQ, setCurrentQ] = useState(() => {
    const dbQs = getQuestionsForDb(initialDb);
    if (qParam) {
      const found = dbQs.find((q) => String(q.id) === qParam);
      if (found) return found;
    }
    return dbQs.find((q) => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
  });

  useEffect(() => {
    if (!progressLoaded || qParam) return;
    const dbQs = getQuestionsForDb(initialDb);
    const preferredQuestion = dbQs.find((q) => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
    if (preferredQuestion && preferredQuestion.id !== currentQ?.id) {
      setCurrentQ(preferredQuestion);
    }
  }, [progressLoaded, qParam, initialDb, progress, currentQ?.id]);

  const [sql, setSql] = useState(() => {
    return settings?.persistEditorText ? (localStorage.getItem(`sql-persist-${currentQ?.id}`) || '') : '';
  });
  const [executedSql, setExecutedSql] = useState('');
  const [result, setResult] = useState(null);
  const [expectedResult, setExpectedResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showERDiagram, setShowERDiagram] = useState(false);
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [previewTableName, setPreviewTableName] = useState(null);
  const [showCteModal, setShowCteModal] = useState(false);
  const [showDbPicker, setShowDbPicker] = useState(false);
  const [joinAnalysisData, setJoinAnalysisData] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (routeDb) {
      if (routeDb !== db) setDb(routeDb);
      const dbQs = getQuestionsForDb(routeDb);
      let targetQ;
      if (qParam) {
        targetQ = dbQs.find((q) => String(q.id) === qParam);
      }
      if (!targetQ && (!currentQ || currentQ.db !== routeDb)) {
        targetQ = dbQs.find((q) => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
      }
      if (targetQ && targetQ.id !== currentQ?.id) {
        setCurrentQ(targetQ);
        setResult(null);
        setValidation(null);
        const savedSql = settings?.persistEditorText ? localStorage.getItem(`sql-persist-${targetQ.id}`) : null;
        setSql(savedSql || '');
        setPreviewTableName(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeDb, qParam]);

  useEffect(() => {
    if (settings?.persistEditorText) {
      const savedSql = localStorage.getItem(`sql-persist-${currentQ?.id}`);
      setSql(savedSql !== null ? savedSql : '');
    } else {
      setSql('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ?.id]);

  useEffect(() => {
    if (settings?.persistEditorText && sql !== undefined && currentQ?.id) {
      localStorage.setItem(`sql-persist-${currentQ.id}`, sql);
    }
  }, [sql, currentQ?.id, settings?.persistEditorText]);

  const dbSchemaContext = useMemo(() => {
    const dbInfo = DB_INFO[db];
    if (!dbInfo || !dbInfo.tables) return '';
    return dbInfo.tables
      .map((t) => `${t.name}(${(t.columns || []).map((c) => c.name).join(', ')})`)
      .join('; ');
  }, [db]);

  const {
    isLoading,
    error: dbError,
    executeQuery,
    validateAnswer,
    getExpectedResultDynamic,
  } = useSqlDatabase(db);

  const handleSwitchDb = useCallback(
    (newDb) => {
      if (newDb === db) {
        setShowDbPicker(false);
        return;
      }
      navigate('/practice/' + newDb);
      setShowDbPicker(false);
    },
    [db, navigate]
  );

  const [queryHistory, setQueryHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('sql-practice-history-v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sql-practice-history-v2', JSON.stringify(queryHistory.slice(0, 50)));
  }, [queryHistory]);

  useEffect(() => {
    let mounted = true;
    setExpectedResult(null);
    if (!isLoading && !dbError && currentQ) {
      getExpectedResultDynamic(currentQ.solutionSQL, currentQ.verificationSQL).then((er) => {
        if (mounted) setExpectedResult(er);
      });
    }
    return () => {
      mounted = false;
    };
  }, [currentQ, isLoading, dbError, getExpectedResultDynamic]);

  const handleRun = useCallback(async () => {
    if (!sql.trim()) return;

    if (!user) {
      const freemiumCount = parseInt(localStorage.getItem('freemiumCount') || '0', 10);
      if (freemiumCount >= 15) {
        toast({
          type: 'error',
          title: 'Free Limit Reached',
          message: 'You have solved 15 free problems! Create an account to continue your SQL journey and save your progress.'
        });
        if (onShowAuth) onShowAuth();
        return;
      }
    }

    const isSafe = await checkSafety(sql, currentQ);
    if (!isSafe) return;

    setIsExecuting(true);
    setExecutedSql(sql);

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
          if (!user) {
            const count = parseInt(localStorage.getItem('freemiumCount') || '0', 10);
            localStorage.setItem('freemiumCount', (count + 1).toString());
          }

          onProgressUpdate(currentQ, db, 'complete', sql);
          if (progress[currentQ.id] !== 'complete') {
            const diff = (currentQ.difficulty || '').toLowerCase();
            const pts = diff === 'hard' ? 50 : diff === 'medium' ? 30 : 10;
            fireConfetti();
            toast({
              type: 'success',
              title: diff === 'hard' ? 'Hard Problem Solved!' : diff === 'medium' ? 'Nice Work!' : 'Correct!',
              message: `+${pts} points earned • ${currentQ.difficulty || 'Easy'} question completed`,
            });
          }
        } else {
          if (progress[currentQ.id] !== 'complete') {
            onProgressUpdate(currentQ, db, 'attempted', sql);
          }
        }
      } else {
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
    db,
    user,
    checkSafety,
    toast,
    onShowAuth,
    validateAnswer,
    progress,
    onProgressUpdate,
    fireConfetti
  ]);

  const handleNavigate = useCallback(
    (dir) => {
      const dbQs = getQuestionsForDb(db);
      const currentIndex = dbQs.findIndex((q) => q.id === currentQ?.id);
      let nextIndex = currentIndex;
      if (dir === 'next' && currentIndex < dbQs.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (dir === 'prev' && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }
      if (nextIndex !== currentIndex) {
        const nextQ = dbQs[nextIndex];
        navigate(`/practice/${db}?q=${nextQ.id}`, { replace: true });
        setCurrentQ(nextQ);
        setResult(null);
        setValidation(null);
        setPreviewTableName(null);
      }
    },
    [db, currentQ, navigate]
  );

  return {
    db,
    setDb,
    currentQ,
    setCurrentQ,
    sql,
    setSql,
    executedSql,
    result,
    expectedResult,
    validation,
    showBrowser,
    setShowBrowser,
    showERDiagram,
    setShowERDiagram,
    showAiTutor,
    setShowAiTutor,
    previewTableName,
    setPreviewTableName,
    showCteModal,
    setShowCteModal,
    showDbPicker,
    setShowDbPicker,
    joinAnalysisData,
    setJoinAnalysisData,
    isExecuting,
    queryHistory,
    setQueryHistory,
    handleSwitchDb,
    handleRun,
    handleNavigate,
    dbSchemaContext,
    isLoading,
    dbError,
    executeQuery,
  };
}
