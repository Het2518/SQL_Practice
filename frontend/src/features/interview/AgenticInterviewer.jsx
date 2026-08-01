import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Bot, User, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { hasGroqKey, groqChat, MODEL_SMART } from '@/lib/groq';
import { useToast } from '@/shared/ui/ToastSystem';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AgenticInterviewer({ isOpen, onClose, companyName = "FAANG" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sql, setSql] = useState('-- Write your solution here once you understand the requirements...\n\n');
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const [hasStarted, setHasStarted] = useState(false);
  const isSubmittedRef = useRef(false);

  useEffect(() => {
    const handleAntiCheat = async () => {
      if (!isOpen || isSubmittedRef.current) return;
      
      // If user exits full screen or switches tabs
      if (!document.fullscreenElement || document.visibilityState === 'hidden') {
        toast({ title: 'Interview Terminated', message: 'You exited full-screen mode or switched tabs. Score recorded as 0.', type: 'error' });
        isSubmittedRef.current = true;
        
        try {
          await api.interviews.saveScore({
            companyName,
            score: 0,
            verdict: 'No Hire',
            feedback: 'Interview terminated early due to anti-cheat violation (exited full screen or lost focus).',
            durationMinutes: 0
          });
        } catch(e) {
          console.error(e);
        }
        
        onClose();
      }
    };

    const handleProctoring = (e) => {
      if (!isOpen || isSubmittedRef.current) return;

      // Prevent Context Menu
      if (e.type === 'contextmenu') {
        e.preventDefault();
      }

      // Prevent Copy / Cut
      if (e.type === 'copy' || e.type === 'cut') {
        e.preventDefault();
        toast({ title: 'Proctoring Alert', message: 'Copy/Cut operations are disabled during the interview.', type: 'warning' });
      }

      // Prevent Paste
      if (e.type === 'paste') {
        e.preventDefault();
        toast({ title: 'Proctoring Alert', message: 'Pasting external code is strictly prohibited.', type: 'error' });
      }

      if (e.type === 'keydown') {
        // Print Screen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          navigator.clipboard?.writeText('');
          toast({ title: 'Proctoring Alert', message: 'Screenshots are prohibited!', type: 'error' });
        }

        // Block Inspect / Save / Print
        if (
          e.key === 'F12' ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c')) ||
          ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P'))
        ) {
          e.preventDefault();
        }

        // Block Win+Shift+S / Mac Cmd+Shift+4 (Common screenshot shortcuts)
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4' || e.key === '5')) {
          e.preventDefault();
          navigator.clipboard?.writeText('');
          toast({ title: 'Proctoring Alert', message: 'Screenshots are prohibited!', type: 'error' });
        }
      }
    };

    document.addEventListener('fullscreenchange', handleAntiCheat);
    document.addEventListener('visibilitychange', handleAntiCheat);
    document.addEventListener('contextmenu', handleProctoring, { capture: true });
    document.addEventListener('copy', handleProctoring, { capture: true });
    document.addEventListener('cut', handleProctoring, { capture: true });
    document.addEventListener('paste', handleProctoring, { capture: true });
    document.addEventListener('keydown', handleProctoring, { capture: true });

    return () => {
      document.removeEventListener('fullscreenchange', handleAntiCheat);
      document.removeEventListener('visibilitychange', handleAntiCheat);
      document.removeEventListener('contextmenu', handleProctoring, { capture: true });
      document.removeEventListener('copy', handleProctoring, { capture: true });
      document.removeEventListener('cut', handleProctoring, { capture: true });
      document.removeEventListener('paste', handleProctoring, { capture: true });
      document.removeEventListener('keydown', handleProctoring, { capture: true });
    };
  }, [isOpen, companyName, onClose, toast]);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setHasStarted(true);
      setMessages([
        {
          role: 'assistant',
          content: `Welcome to your ${companyName} interview! I'm your interviewer today.\n\nHere is your task: **Find our most valuable customers.**\n\nBefore you start writing SQL, please ask me any clarifying questions about the data schema or how we define "valuable".`
        }
      ]);
    }
    if (!isOpen) {
      setHasStarted(false);
      setMessages([]);
      setSql('-- Write your solution here once you understand the requirements...\n\n');
    }
  }, [isOpen, companyName, hasStarted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!hasGroqKey()) {
      toast({ title: 'API Key Missing', message: 'Please add a Groq API Key in settings first.', type: 'error' });
      return;
    }

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const systemPrompt = `You are a strict but fair SQL interviewer at ${companyName}.
The candidate was asked: "Find our most valuable customers."
You must NOT give them the schema or the exact definitions upfront. Wait for them to ask.

If they ask about the schema, tell them we have two tables:
- users (user_id, name, join_date)
- orders (order_id, user_id, order_total, order_date)

If they ask what "valuable" means, tell them it means customers who have spent more than $1000 in total across all their orders in the current year.

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

  const handleFinalSubmit = async () => {
    if (!sql.trim() || sql === '-- Write your solution here once you understand the requirements...\n\n') {
      toast({ title: 'No SQL provided', message: 'Please write your SQL solution in the editor before submitting.', type: 'error' });
      return;
    }
    if (!hasGroqKey()) {
      toast({ title: 'API Key Missing', message: 'Please add a Groq API Key in settings first.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: 'I am ready to submit my SQL solution for evaluation.' }]);

    try {
      const systemPrompt = `You are an expert FAANG SQL interviewer.
The candidate was asked to: "Find our most valuable customers." (defined as spending > $1000 in the current year).
Schema:
- users (user_id, name, join_date)
- orders (order_id, user_id, order_total, order_date)

Here is the candidate's SQL submission:
\`\`\`sql
${sql}
\`\`\`

Evaluate this query rigorously. Tell them if they passed or failed, and point out any edge cases they missed.
CRITICAL: You MUST end your response with a JSON-like block containing the numeric score out of 100 and a short verdict ("Strong Hire", "Hire", "Borderline", "No Hire"), in exactly this format:
[SCORE: 85/100]
[VERDICT: Hire]`;
      
      const response = await groqChat([{ role: 'system', content: systemPrompt }], MODEL_SMART, 500, false);
      setMessages((prev) => [...prev, { role: 'assistant', content: `**Evaluation:**\n\n${response}` }]);

      // Extract score and verdict
      const scoreMatch = response.match(/\[SCORE:\s*(\d+)\/100\]/i);
      const verdictMatch = response.match(/\[VERDICT:\s*(.+?)\]/i);
      
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const verdict = verdictMatch ? verdictMatch[1].trim() : 'Borderline';
      
      isSubmittedRef.current = true;

      try {
        await api.interviews.saveScore({
          companyName,
          score,
          verdict,
          feedback: response,
          durationMinutes: 30
        });
      } catch (saveErr) {
        console.error('Failed to save score:', saveErr);
      }

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '❌ Sorry, I could not evaluate your SQL due to a network error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-surface z-[9999] flex flex-col animate-in fade-in duration-200 select-none">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text">Agentic Interview Mode: {companyName}</h2>
            <div className="px-2 py-1 rounded bg-error/10 text-error border border-error/20 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert size={14} /> Proctored Environment
            </div>
          </div>
          <p className="text-sm text-text-secondary">Clarify requirements with the AI before writing your code.</p>
        </div>
        <Button variant="ghost" onClick={onClose}><X size={20} /></Button>
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

          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-surface">
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl p-1 shadow-inner focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a clarifying question..."
                className="flex-1 bg-transparent border-none text-sm px-3 py-2 outline-none"
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
          <div className="flex-1 relative">
            <SqlEditor
              value={sql}
              onChange={setSql}
              dbName="interview_sandbox"
              fontSize={14}
            />
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between bg-surface-2">
            <span className="text-xs text-text-secondary font-mono">-- Write your query above, then submit for AI evaluation!</span>
            <Button className="hero-btn-primary" onClick={handleFinalSubmit} disabled={isLoading}>
              Submit Final Answer
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
