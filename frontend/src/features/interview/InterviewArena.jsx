import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, User, Loader2, ShieldAlert, Clock, Smartphone, Code2, PenTool, AlertOctagon, Keyboard, X, FileText, CheckCircle2, Sun, Moon, Play, RotateCcw, Database } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { generateInterviewTask, chatInterview, dryRunInterview } from '@/lib/groq';
import { api } from '@/lib/api';
import { useToast } from '@/shared/ui/ToastSystem';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProctorStore } from './useProctorStore';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { ResultsPanel } from '@/features/practice/ResultsPanel';

export function InterviewArena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, toggleDarkMode } = useSettingsStore();
  
  const duration = parseInt(searchParams.get('duration') || '30', 10);
  const rawDifficulty = searchParams.get('difficulty') || 'mixed';
  const rawCompanyName = searchParams.get('company') || 'FAANG';
  const rawCandidateName = searchParams.get('name') || 'Candidate';
  const rawRoleName = searchParams.get('role') || 'Software Engineer';
  
  // Sanitize to prevent prompt injection
  const difficulty = ['easy', 'medium', 'hard', 'mixed'].includes(rawDifficulty.toLowerCase()) ? rawDifficulty.toLowerCase() : 'mixed';
  const companyName = rawCompanyName.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 30) || 'FAANG';
  const candidateName = rawCandidateName.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 30) || 'Candidate';
  const roleName = rawRoleName.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 40) || 'Software Engineer';
  
  const { cameraStream, screenStream, addViolation, isTerminated, restoreSessionState, saveSessionState, clearSessionState } = useProctorStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sql, setSql] = useState('-- Write your solution here once you understand the requirements...\n\n');
  const [scratchpad, setScratchpad] = useState('-- Use this scratchpad for notes or intermediate queries...\n\n');
  const [activeTab, setActiveTab] = useState('sql'); // sql or scratchpad
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  const [dryRunFeedback, setDryRunFeedback] = useState('');
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isDryRunPanelOpen, setIsDryRunPanelOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [leftTab, setLeftTab] = useState('problem'); // 'problem' or 'chat'
  const [bottomPanel, setBottomPanel] = useState(null); // 'ai' | 'results' | null
  const [queryResult, setQueryResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const { executeQuery, initWithSql } = useSqlDatabase();

  const messagesEndRef = useRef(null);
  const isSubmittedRef = useRef(false);

  const [initialTask, setInitialTask] = useState('');
  const [generatingQuestion, setGeneratingQuestion] = useState(true);

  // Restore or Initialize Session
  useEffect(() => {
    const saved = restoreSessionState();
    
    // Invalidate legacy sessions that don't have database initialization scripts
    if (saved && saved.initSql) {
      setInitialTask(saved.initialTask);
      setMessages(saved.messages || []);
      setSql(saved.sql || '');
      setScratchpad(saved.scratchpad || '');
      setTimeLeft(saved.timeLeft || duration * 60);
      setGeneratingQuestion(false);
      
      let cleanInitSql = saved.initSql || '-- init';
      cleanInitSql = cleanInitSql.replace(/```sql/ig, '').replace(/```/g, '').trim();
      initWithSql(cleanInitSql);
    } else {
      const fetchQuestion = async () => {
        try {
          const taskText = await generateInterviewTask({
            difficulty,
            companyName,
            candidateName,
            roleName
          });
          
          if (!taskText) throw new Error('Empty response');

          let taskData;
          try {
            taskData = JSON.parse(taskText);
          } catch(e) {
            // Fallback parsing just in case model wraps in markdown
            const cleaned = taskText.replace(/```json/i, '').replace(/```/g, '').trim();
            taskData = JSON.parse(cleaned);
          }

          setInitialTask(taskData.markdown);
          
          let cleanInitSql = taskData.initSql || '-- init';
          cleanInitSql = cleanInitSql.replace(/```sql/ig, '').replace(/```/g, '').trim();
          initWithSql(cleanInitSql);
          
          const welcomeMsg = {
            role: 'assistant',
            content: `Welcome to your ${companyName} interview, ${candidateName}! I'm your interviewer today.\n\nHere is your task:\n\n---\n\n${taskData.markdown}\n\n---\n\nBefore you start writing SQL, please ask me any clarifying questions about the data schema or edge cases.`
          };
          setMessages([welcomeMsg]);
          
          saveSessionState({
            difficulty, companyName, roleName, candidateName, initialTask: taskData.markdown,
            initSql: cleanInitSql, messages: [welcomeMsg], sql: '', scratchpad: '', timeLeft: duration * 60
          });
        } catch (err) {
          console.error(err);
          const fallbackMd = "Identify the top 3 users by total transaction volume in the last 30 days.\n\n**Schema**\n- `users` (user_id, name)\n- `transactions` (transaction_id, user_id, amount, date)";
          const fallbackSql = `
            CREATE TABLE users (user_id INT, name TEXT);
            CREATE TABLE transactions (transaction_id INT, user_id INT, amount DECIMAL, date DATE);
            INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie'), (4, 'David');
            INSERT INTO transactions VALUES (1, 1, 100, '2023-10-01'), (2, 2, 150, '2023-10-02'), (3, 1, 200, '2023-10-05');
          `;
          setInitialTask(fallbackMd);
          initWithSql(fallbackSql);
        } finally {
          setGeneratingQuestion(false);
        }
      };
      fetchQuestion();
    }
  }, []);

  // Timer & Auto-Save
  useEffect(() => {
    if (isSubmittedRef.current || generatingQuestion || isTerminated) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const saveInterval = setInterval(() => {
      if (!isSubmittedRef.current && !isTerminated) {
        saveSessionState({
          difficulty, companyName, roleName, candidateName, initialTask,
          messages, sql, scratchpad, timeLeft
        });
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(saveInterval);
    };
  }, [generatingQuestion, messages, sql, scratchpad, isTerminated]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Zero-Tolerance Anti-Cheat
  useEffect(() => {
    if (isSubmittedRef.current || isTerminated) return;

    let gracePeriodActive = true;
    const graceTimer = setTimeout(() => {
      gracePeriodActive = false;
      if (!document.fullscreenElement && !isSubmittedRef.current) {
        enforceViolation('Exited fullscreen mode.');
      }
    }, 4000);

    const enforceViolation = (reason) => {
      if (isSubmittedRef.current || isTerminated) return;
      if (gracePeriodActive) {
        console.warn('Violation ignored (grace period):', reason);
        return;
      }
      isSubmittedRef.current = true;
      addViolation('integrity_breach', reason);
      try {
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      } catch (e) {}
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') enforceViolation('Switched tabs or minimized window.');
    };
    
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) enforceViolation('Exited fullscreen mode.');
    };
    
    const onWindowBlur = () => {
      // 1-second grace period for interacting with browser UI (like the screen share "Hide" banner)
      setTimeout(() => {
        if (!document.hasFocus() && !isSubmittedRef.current && !isTerminated) {
          enforceViolation('Window lost focus. (Alt-Tabbed or clicked external monitor).');
        }
      }, 1000);
    };

    const disableCopyPaste = (e) => {
      e.preventDefault();
      enforceViolation('Attempted to use Copy/Paste/Cut.');
    };

    const disableContextMenu = (e) => {
      e.preventDefault();
      toast({ title: 'Warning', message: 'Context menu disabled.', type: 'warning' });
    };

    const disableKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'p', 'i', 'j'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        enforceViolation('Attempted to use prohibited keyboard shortcuts (Copy/Paste/Print/DevTools).');
      }
      if (e.key === 'F12' || e.key === 'PrintScreen') {
        e.preventDefault();
        enforceViolation('Attempted to use Developer Tools or Print Screen.');
      }
      if (e.key === 'Escape') {
        e.preventDefault(); // Browser handles ESC for fullscreen, handled by onFullscreenChange
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleStreamEnd = () => {
      if (!isSubmittedRef.current && !isTerminated) enforceViolation('Camera, Screen, or Mic stream disconnected.');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('copy', disableCopyPaste);
    document.addEventListener('paste', disableCopyPaste);
    document.addEventListener('cut', disableCopyPaste);
    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableKeyboard);
    window.addEventListener('beforeunload', handleBeforeUnload);

    if (cameraStream) cameraStream.getTracks().forEach(t => t.addEventListener('ended', handleStreamEnd));
    if (screenStream) screenStream.getTracks().forEach(t => t.addEventListener('ended', handleStreamEnd));

    return () => {
      clearTimeout(graceTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('copy', disableCopyPaste);
      document.removeEventListener('paste', disableCopyPaste);
      document.removeEventListener('cut', disableCopyPaste);
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableKeyboard);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (cameraStream) cameraStream.getTracks().forEach(t => t.removeEventListener('ended', handleStreamEnd));
      if (screenStream) screenStream.getTracks().forEach(t => t.removeEventListener('ended', handleStreamEnd));
    };
  }, [cameraStream, screenStream, isTerminated]);

  // Ensure streams are explicitly killed on unmount
  useEffect(() => {
    return () => {
      try {
        const { stopAllStreams } = useProctorStore.getState();
        stopAllStreams();
      } catch(e) {}
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitMsg = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isTerminated) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const responseText = await chatInterview({
        companyName,
        initialTask,
        messages: newMessages
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        toast({ title: 'Missing API Key', message: 'Please add your Groq API key in Settings.', type: 'error' });
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Error: Network request failed. Please try again.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDryRun = async () => {
    if (!sql.trim() || sql === '-- Write your solution here once you understand the requirements...\n\n') {
      toast({ title: 'No SQL to run', message: 'Write some SQL code first before asking for a dry run.', type: 'info' });
      return;
    }
    
    setDryRunFeedback('');
    setBottomPanel('ai');
    setIsDryRunning(true);

    try {
      const responseText = await dryRunInterview({
        companyName,
        messages,
        sql
      });
      setDryRunFeedback(responseText);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        setDryRunFeedback('⚠️ Please add your Groq API key in Settings to use the AI Dry Run feature.');
      } else {
        setDryRunFeedback('⚠️ Error: Network request failed. Please try again.');
      }
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleRunSql = async () => {
    const currentCode = activeTab === 'sql' ? sql : scratchpad;
    if (!currentCode.trim() || currentCode.includes('Write your solution here')) {
      toast({ title: 'No SQL', message: 'Please write some valid SQL to run.', type: 'info' });
      return;
    }
    
    setBottomPanel('results');
    setIsRunning(true);
    const res = await executeQuery(currentCode);
    setQueryResult(res);
    setIsRunning(false);
  };

  const handleFinalSubmit = async (isTimeUp = false) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsLoading(true);

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    try {
      const { stopAllStreams } = useProctorStore.getState();
      stopAllStreams();
    } catch(e) {}
    
    clearSessionState();
    
    const payload = {
      companyName,
      candidateName,
      roleName,
      sql,
      initialTask,
      durationMinutes: Math.round((duration * 60 - timeLeft) / 60),
      chatHistory: messages,
      forceZero: false
    };
    sessionStorage.setItem('pending_interview_report', JSON.stringify(payload));
    
    navigate('/interview/report', { 
      state: { sessionPayload: payload } 
    });
  };

  const handleFailToReport = () => {
    clearSessionState();
    try {
      const { stopAllStreams } = useProctorStore.getState();
      stopAllStreams();
    } catch(e) {}
    
    const payload = {
      companyName,
      candidateName,
      roleName,
      sql,
      initialTask,
      durationMinutes: Math.round((duration * 60 - timeLeft) / 60),
      chatHistory: messages,
      forceZero: true,
      violationMsg: useProctorStore.getState().violations[0]?.message || 'Integrity Policy Violation'
    };
    sessionStorage.setItem('pending_interview_report', JSON.stringify(payload));

    navigate('/interview/report', { 
      state: { sessionPayload: payload } 
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: '@media print { body { display: none !important; } }' }} />

      {/* ══ TERMINATED OVERLAY ══ */}
      {isTerminated && (
        <div className="fixed inset-0 z-[200] bg-surface/80 dark:bg-bg/95 backdrop-blur-xl dark:backdrop-blur-3xl overflow-y-auto animate-fade-in">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-error/5 rounded-full blur-[100px] dark:blur-[150px] pointer-events-none" />
            
            <div className="w-full max-w-2xl bg-surface dark:bg-surface/80 backdrop-blur-xl border border-border dark:border-error/30 rounded-3xl p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(239,68,68,0.15)] relative overflow-hidden transform scale-100 animate-in zoom-in-95 duration-500 ease-out z-10">
              {/* Top Red Gradient Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-error to-transparent" />
            
            <div className="w-24 h-24 bg-gradient-to-br from-error/20 to-error/5 border border-error/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-error/20 relative">
              <div className="absolute inset-0 bg-error/20 rounded-full animate-ping opacity-50" />
              <AlertOctagon size={48} className="text-error" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-text">Session Terminated</h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed mb-10">
              Your interview was automatically halted due to a strict zero-tolerance integrity policy violation.
            </p>
            
            <div className="bg-error/5 dark:bg-[#09090b] border border-error/20 dark:border-border/50 rounded-2xl p-6 text-left mb-10 shadow-inner">
              <span className="text-xs font-black uppercase tracking-widest text-error/80 mb-2 block flex items-center gap-2">
                <AlertOctagon size={14} /> Incident Reason
              </span>
              <span className="text-error font-medium text-lg leading-snug">
                {useProctorStore.getState().violations[0]?.message || 'Integrity Policy Violation'}
              </span>
            </div>
            
            <button 
              onClick={handleFailToReport}
              className="w-full sm:w-auto px-10 py-4 bg-error text-white font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:scale-[1.02] transition-all"
            >
              Acknowledge & View Report
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ══ SHORTCUTS OVERLAY ══ */}
      {showShortcuts && !isTerminated && (
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
              <h3 className="font-bold flex items-center gap-2"><Keyboard size={18} className="text-primary"/> Keyboard Rules & Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-text-secondary hover:text-text"><X size={18}/></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                <span className="text-text-secondary">Run / AI Dry Run</span>
                <kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Ctrl + Enter</kbd>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                <span className="text-text-secondary">Format SQL</span>
                <kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Shift + Alt + F</kbd>
              </div>
              <div className="mt-4 bg-error/10 border border-error/20 rounded-xl p-4 text-xs text-error font-medium leading-relaxed">
                <span className="font-bold block mb-1">PROHIBITED ACTION WARNING:</span>
                Copy (Ctrl+C), Paste (Ctrl+V), Developer Tools (F12), and exiting Fullscreen (ESC) are strictly monitored and will result in an instant termination.
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ══ MOBILE WARNING OVERLAY ══ */}
      <div className="md:hidden fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
          <Smartphone size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-text mb-3 tracking-tight">Desktop Required</h2>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-sm">
          DataDesk's Proctored Interview Arena requires a desktop or tablet for camera access, coding, and screen real estate.
        </p>
        <Button onClick={() => navigate('/')} variant="outline" size="lg">Back to Home</Button>
      </div>

      <div className={`w-full h-screen bg-bg flex flex-col select-none overflow-hidden ${isTerminated ? 'blur-md pointer-events-none' : ''}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-xl tracking-tight text-text flex items-center gap-2">
            {companyName} INTERVIEW
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20 uppercase tracking-wider ml-2">
              <ShieldAlert size={10} className="inline mr-1" /> Proctored
            </span>
            </h1>
          </div>
          
          {/* Progress Bar (Time) */}
          <div className="flex-1 max-w-[300px] mx-8 hidden lg:block">
             <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-1000 ${timeLeft < 300 ? 'bg-error' : 'bg-primary'}`} style={{ width: `${(timeLeft / (duration * 60)) * 100}%` }} />
             </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono font-bold text-sm ${timeLeft < 300 ? 'bg-error/10 text-error animate-pulse' : 'bg-surface-2 text-text'}`}>
              <Clock size={16} /> {formatTime(timeLeft)}
            </div>
            <button onClick={() => setShowShortcuts(true)} className="p-2 text-text-secondary hover:text-text hover:bg-surface-2 rounded-lg transition-colors" title="Keyboard Shortcuts">
              <Keyboard size={18} />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 text-text-secondary hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
              title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button variant="danger" size="sm" onClick={() => handleFinalSubmit(false)} disabled={isLoading || generatingQuestion}>
              Submit Final Solution
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Chat */}
          {/* Left: Problem / Chat */}
          <div className="w-[45%] min-w-[400px] max-w-[700px] border-r border-border flex flex-col bg-surface-2">
            <div className="flex bg-surface border-b border-border px-4 pt-2 gap-1 shrink-0">
              <button
                onClick={() => setLeftTab('problem')}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all ${leftTab === 'problem' ? 'bg-bg text-primary border border-border border-b-transparent shadow-[0_-2px_10px_rgba(0,0,0,0.05)]' : 'bg-transparent text-text-secondary hover:bg-surface-2'}`}
              >
                <FileText size={16} /> Description
              </button>
              <button
                onClick={() => setLeftTab('chat')}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all ${leftTab === 'chat' ? 'bg-bg text-primary border border-border border-b-transparent shadow-[0_-2px_10px_rgba(0,0,0,0.05)] relative' : 'bg-transparent text-text-secondary hover:bg-surface-2'}`}
              >
                <Bot size={16} /> AI Interviewer
                {messages.length > 1 && leftTab !== 'chat' && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error animate-pulse"></span>
                )}
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden bg-bg">
              {leftTab === 'problem' && (
                <div className="absolute inset-0 overflow-y-auto p-6 custom-scrollbar text-text prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-4 prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-th:bg-surface-2 prose-td:border-border prose-th:border-border">
                  {generatingQuestion ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                      <Loader2 size={32} className="animate-spin text-primary mb-4" />
                      <p className="font-medium text-text">Generating dynamic SQL problem...</p>
                      <p className="text-xs mt-2 opacity-70">Tailoring to {companyName} • {difficulty} level</p>
                    </div>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{initialTask}</ReactMarkdown>
                  )}
                </div>
              )}

              {leftTab === 'chat' && (
                <div className="absolute inset-0 flex flex-col bg-bg">
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary text-bg' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`px-5 py-4 rounded-2xl max-w-[95%] text-[14px] leading-relaxed shadow-sm border ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground border-transparent rounded-tr-sm' 
                            : 'bg-surface border-border text-text prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0 rounded-tl-sm'
                        }`}>
                          {msg.role === 'user' ? (
                            msg.content
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-sm">
                          <Bot size={16} className="text-purple-500" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-surface border border-border rounded-tl-sm flex items-center gap-3 shadow-sm">
                          <Loader2 size={16} className="animate-spin text-purple-500" />
                          <span className="text-sm text-text-secondary font-medium">Interviewer is typing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSubmitMsg} className="p-4 border-t border-border bg-surface shrink-0">
                    <div className="flex items-center gap-2 bg-bg border border-border rounded-xl p-1.5 shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for hints or clarify schema..."
                        className="flex-1 bg-transparent border-none text-sm px-3 py-1 outline-none text-text"
                        disabled={isLoading || generatingQuestion}
                      />
                      <Button type="submit" size="sm" disabled={!input.trim() || isLoading || generatingQuestion} className="rounded-lg h-8 px-4 shadow-sm font-bold">
                        Send
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right: SQL Editor & Scratchpad */}
          <div className="flex-1 flex flex-col bg-bg relative min-h-0 overflow-hidden">
            
            {generatingQuestion && (
              <div className="absolute inset-0 z-50 bg-bg/90 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary mb-4" />
                <h2 className="text-xl font-bold text-text mb-2">Generating Technical Assessment...</h2>
                <p className="text-sm text-text-secondary text-center max-w-md leading-relaxed">
                  The AI Principal Engineer is crafting a unique, highly realistic SQL problem tailored to your {difficulty} level.
                </p>
              </div>
            )}

            <div className="flex bg-surface border-b border-border px-4 pt-2 gap-1">
              <button
                onClick={() => setActiveTab('sql')}
                className={`px-6 py-2.5 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'sql' ? 'bg-bg text-primary border border-border border-b-transparent shadow-[0_-2px_10px_rgba(0,0,0,0.05)]' : 'bg-transparent text-text-secondary hover:bg-surface-2'}`}
              >
                <Code2 size={16} /> SQL Solution
              </button>
              <button
                onClick={() => setActiveTab('scratchpad')}
                className={`px-6 py-2.5 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'scratchpad' ? 'bg-bg text-primary border border-border border-b-transparent shadow-[0_-2px_10px_rgba(0,0,0,0.05)]' : 'bg-transparent text-text-secondary hover:bg-surface-2'}`}
              >
                <PenTool size={16} /> Scratchpad
              </button>
            </div>

            <div className="flex-1 w-full relative flex flex-col min-h-0">
              <div className="flex-1 relative min-h-0">
                {activeTab === 'sql' ? (
                  <SqlEditor
                    value={sql}
                    onChange={setSql}
                    onRun={handleRunSql}
                    disabled={isLoading || generatingQuestion}
                    height="100%"
                  />
                ) : (
                  <SqlEditor
                    value={scratchpad}
                    onChange={setScratchpad}
                    onRun={handleRunSql}
                    disabled={isLoading || generatingQuestion}
                    height="100%"
                  />
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-surface-2 border-t border-border shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => activeTab === 'sql' ? setSql('') : setScratchpad('')} title="Reset">
                    <RotateCcw size={13} /> <span className="hidden sm:inline">Reset</span>
                  </Button>
                </div>
                <Button size="sm" onClick={handleRunSql} isLoading={isRunning}>
                  <Play size={13} fill="currentColor" className="mr-1" /> Run Code (Ctrl+Enter)
                </Button>
              </div>

              {bottomPanel && (
                <div className="h-[280px] border-t border-border bg-surface flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-10 transition-all duration-300 relative">
                  <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-surface-2">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      {bottomPanel === 'ai' ? (
                        <>
                          {isDryRunning ? <Loader2 size={14} className="animate-spin text-purple-500" /> : <CheckCircle2 size={14} className="text-success" />}
                          AI Code Review (Dry Run)
                        </>
                      ) : (
                        <>
                          <Database size={14} className="text-blue-500" />
                          SQL Execution Output
                        </>
                      )}
                    </h3>
                    <button onClick={() => setBottomPanel(null)} className="p-1 hover:bg-surface-3 rounded text-text-secondary transition-colors"><X size={16} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-hidden relative">
                    {bottomPanel === 'ai' && (
                      <div className="absolute inset-0 overflow-y-auto p-5 bg-bg text-sm text-text leading-relaxed prose prose-sm dark:prose-invert max-w-none custom-scrollbar">
                        {isDryRunning ? (
                          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-secondary">
                            <Loader2 size={24} className="animate-spin text-purple-500" /> 
                            <p className="font-medium text-text">Evaluating execution plan and logic...</p>
                            <p className="text-xs opacity-70">The AI Principal Engineer is reviewing your SQL.</p>
                          </div>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{dryRunFeedback}</ReactMarkdown>
                        )}
                      </div>
                    )}

                    {bottomPanel === 'results' && (
                      <div className="absolute inset-0 bg-bg">
                        <ResultsPanel 
                          result={queryResult} 
                          sql={activeTab === 'sql' ? sql : scratchpad} 
                          isRunning={isRunning} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {activeTab === 'sql' && (
              <div className="p-3 border-t border-border bg-surface-2 flex items-center justify-between z-20 shrink-0">
                <span className="text-xs text-text-secondary font-mono flex items-center gap-2">
                  <ShieldAlert size={12} className="text-primary" /> Auto-saving query state.
                </span>
                <Button variant="secondary" size="sm" onClick={handleDryRun} disabled={isDryRunning || generatingQuestion} className="shadow-sm font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30">
                  <Bot size={16} className="mr-2" /> Request AI Dry Run
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
