import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, User, Loader2, ShieldAlert, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { hasGroqKey, groqChat, MODEL_SMART } from '@/lib/groq';
import { useToast } from '@/shared/ui/ToastSystem';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProctorStore } from './useProctorStore';

const INTERVIEW_DURATION_MINUTES = 45;

export function InterviewArena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const duration = parseInt(searchParams.get('duration') || '30', 10);
  const difficulty = searchParams.get('difficulty') || 'mixed';
  const companyName = 'Generic Tech';
  const { cameraStream, screenStream } = useProctorStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sql, setSql] = useState('-- Write your solution here once you understand the requirements...\n\n');
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [warnings, setWarnings] = useState(0);
  
  const messagesEndRef = useRef(null);
  const isSubmittedRef = useRef(false);
  const warningsRef = useRef(0);

  // Dynamic Prompt Logic
  const getInitialTask = () => {
    if (difficulty === 'easy') return "Find our top 3 most valuable customers who joined this year.";
    if (difficulty === 'medium') return "Calculate the week-over-week retention rate of active users.";
    if (difficulty === 'hard') return "Write a recursive CTE to find the shortest path between two nodes in a graph table.";
    return "Identify the second highest salary in each department.";
  };

  const initialTask = getInitialTask();

  // Timer
  useEffect(() => {
    if (isSubmittedRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Anti-Cheat & Proctoring
  useEffect(() => {
    const handleAntiCheat = async (reason) => {
      if (isSubmittedRef.current) return;
      
      const isBlur = reason === 'blur';
      const isExit = !document.fullscreenElement;
      const isHidden = document.visibilityState === 'hidden';

      if (isExit || isHidden || isBlur) {
        let msg = 'You exited full-screen mode or switched tabs.';
        if (isBlur) msg = 'Window lost focus. Strict proctoring forbids switching to other applications or monitors.';

        warningsRef.current += 1;
        const currentWarnings = warningsRef.current;
        setWarnings(currentWarnings);

        if (currentWarnings >= 3) {
          toast({ title: 'Interview Terminated', message: `${msg} You reached the maximum number of warnings. Score recorded as 0.`, type: 'error' });
          isSubmittedRef.current = true;
          
          api.interviews.saveScore({
            companyName: 'Generic Tech',
            score: 0,
            verdict: 'No Hire',
            feedback: `Interview terminated early due to anti-cheat violation: ${msg}`,
            durationMinutes: Math.round((duration * 60 - timeLeft) / 60)
          }).then(res => {
            navigate('/interview/report', { state: { session: res.data.data.session } });
          }).catch(() => navigate('/interview'));
          
        } else {
          toast({ title: 'Proctoring Warning', message: `${msg} Warning ${currentWarnings} of 3.`, type: 'warning' });
          // Attempt to re-enter fullscreen if they exited
          if (isExit && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }
      }
    };

    const onVisibilityChange = () => handleAntiCheat('visibility');
    const onFullscreenChange = () => handleAntiCheat('fullscreen');
    const onWindowBlur = () => handleAntiCheat('blur');
    const disableCopyPaste = (e) => {
      e.preventDefault();
      toast({ title: 'Proctoring Violation', message: 'Copy, Paste, and Cut are disabled during the interview.', type: 'error' });
    };
    const disableContextMenu = (e) => e.preventDefault();
    const disableKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'v' || e.key.toLowerCase() === 'x')) {
        e.preventDefault();
        toast({ title: 'Proctoring Violation', message: 'Keyboard shortcuts disabled.', type: 'error' });
      }
      if (e.key === 'PrintScreen' || e.key === 'F12' || e.key === 'Escape') {
        e.preventDefault();
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    };

    const handleStreamEnd = () => {
      if (!isSubmittedRef.current) {
        handleAntiCheat('stream_ended');
      }
    };

    if (navigator.keyboard && navigator.keyboard.lock) {
      navigator.keyboard.lock(['Escape']).catch(() => {});
    }

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
  }, [navigate, duration, timeLeft, toast, cameraStream, screenStream]);

  // Initial Message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Welcome to your ${companyName} interview! I'm your interviewer today.\n\nHere is your task: **${initialTask}**\n\nBefore you start writing SQL, please ask me any clarifying questions about the data schema or edge cases.`
      }
    ]);
  }, [companyName, initialTask]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitMsg = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const systemPrompt = `You are a strict but fair SQL interviewer at ${companyName}.
The candidate was asked: "${initialTask}"
You must NOT give them the schema or the exact definitions upfront. Wait for them to ask.
Rules:
1. Do NOT write the SQL query for them under any circumstances.
2. Keep your answers concise and professional.
3. If they propose a SQL solution in the chat, evaluate it conceptually.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...newMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await groqChat(apiMessages, MODEL_SMART, 500, false);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered a network error. Try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (isTimeUp = false) => {
    if (!sql.trim() || sql === '-- Write your solution here once you understand the requirements...\n\n') {
      if (!isTimeUp) {
        toast({ title: 'No SQL provided', message: 'Please write your SQL solution in the editor before submitting.', type: 'error' });
        return;
      }
    }
    
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: isTimeUp ? 'Time is up! Submitting automatically.' : 'I am ready to submit my SQL solution for evaluation.' }]);

    try {
      const systemPrompt = `You are an expert ${companyName} SQL interviewer.
The candidate was asked to: "${initialTask}"

Here is the candidate's SQL submission:
\`\`\`sql
${sql}
\`\`\`

Evaluate this query rigorously. Tell them if they passed or failed, and point out any edge cases they missed.
CRITICAL: You MUST end your response with a JSON-like block containing the numeric score out of 100 and a short verdict ("Strong Hire", "Hire", "Borderline", "No Hire"), in exactly this format:
[SCORE: 85/100]
[VERDICT: Hire]`;
      
      const response = await groqChat([{ role: 'system', content: systemPrompt }], MODEL_SMART, 500, false);
      
      const scoreMatch = response.match(/\[SCORE:\s*(\d+)\/100\]/i);
      const verdictMatch = response.match(/\[VERDICT:\s*(.+?)\]/i);
      
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const verdict = verdictMatch ? verdictMatch[1].trim() : 'Borderline';
      
      isSubmittedRef.current = true;

      try {
        const res = await api.interviews.saveScore({
          companyName,
          score,
          verdict,
          feedback: response,
          durationMinutes: Math.round((INTERVIEW_DURATION_MINUTES * 60 - timeLeft) / 60)
        });
        
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          }
        } catch (e) {}

        try {
          const { stopAllStreams } = useProctorStore.getState();
          stopAllStreams();
        } catch(e) {}
        
        navigate('/interview/report', { state: { session: res.data.data.session } });
      } catch (saveErr) {
        console.error('Failed to save score:', saveErr);
        toast({ title: 'Error saving score', type: 'error' });
      }

    } catch (err) {
      toast({ title: 'Evaluation Failed', message: 'Network error.', type: 'error' });
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: '@media print { body { display: none !important; } }' }} />
      <div className="w-full h-screen bg-bg flex flex-col select-none overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-xl tracking-tight text-text flex items-center gap-2">
            MOCK INTERVIEW
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20 uppercase tracking-wider">
              <ShieldAlert size={10} className="inline mr-1" /> Proctored Arena
            </span>
            {warnings > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 ml-2">
                Warnings: {warnings}/3
              </span>
            )}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono font-bold text-sm ${timeLeft < 300 ? 'bg-error/10 text-error animate-pulse' : 'bg-surface-2 text-text'}`}>
              <Clock size={16} /> {formatTime(timeLeft)}
            </div>
            <Button variant="danger" size="sm" onClick={() => handleFinalSubmit(false)} disabled={isLoading}>
              End Interview Early
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Chat */}
          <div className="w-1/3 min-w-[400px] border-r border-border flex flex-col bg-surface-2">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-bg' : 'bg-surface-3 text-text'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-[13.5px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-bg rounded-tr-sm' 
                      : 'bg-surface shadow-sm rounded-tl-sm border border-border text-text prose prose-sm prose-p:my-1 prose-pre:my-1 prose-pre:bg-surface-3 prose-pre:text-text prose-code:text-primary dark:prose-invert max-w-none'
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
                  <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center">
                    <Bot size={16} className="text-text-secondary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-surface border border-border rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-sm text-text-secondary">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmitMsg} className="p-4 border-t border-border bg-surface">
              <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl p-1 shadow-inner focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a clarifying question..."
                  className="flex-1 bg-transparent border-none text-sm px-3 py-2 outline-none text-text"
                  disabled={isLoading}
                />
                <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="rounded-lg h-8 px-4">
                  Ask
                </Button>
              </div>
            </form>
          </div>

          {/* Right: SQL Editor */}
          <div className="flex-1 flex flex-col bg-bg">
            <div className="flex-1 w-full relative">
            <SqlEditor
              value={sql}
              onChange={setSql}
              onRun={handleSubmitMsg}
              disabled={isLoading}
              height="100%"
            />

            {/* Webcam PIP */}
            {cameraStream && (
              <div className="absolute bottom-4 right-4 w-32 aspect-video bg-black rounded-lg border border-border shadow-2xl overflow-hidden z-50">
                <VideoPreview stream={cameraStream} />
                <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-error">
                  <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" /> REC
                </div>
              </div>
            )}
          </div>
            <div className="p-4 border-t border-border flex items-center justify-between bg-surface-2">
              <span className="text-xs text-text-secondary font-mono">-- Write your query above, then submit for AI evaluation!</span>
              <Button className="hero-btn-primary px-8" onClick={() => handleFinalSubmit(false)} disabled={isLoading}>
                Submit Final Answer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
