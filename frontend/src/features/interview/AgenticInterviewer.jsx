import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, User, Loader2, Play } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { hasGroqKey, groqChat, MODEL_SMART } from '@/lib/groq';
import { useToast } from '@/shared/ui/ToastSystem';

export function AgenticInterviewer({ isOpen, onClose, companyName = "FAANG" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sql, setSql] = useState('-- Write your solution here once you understand the requirements...\n\n');
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const [hasStarted, setHasStarted] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-surface z-[9999] flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-text">Agentic Interview Mode: {companyName}</h2>
          <p className="text-sm text-text-secondary">Clarify requirements with the AI before writing your code.</p>
        </div>
        <Button variant="ghost" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat */}
        <div className="w-1/3 min-w-[350px] border-r border-border flex flex-col bg-surface-2">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-bg' : 'bg-surface-3 text-text'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-bg rounded-tr-sm' : 'bg-surface shadow-sm rounded-tl-sm border border-border text-text'}`}>
                  {msg.content}
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
            <span className="text-xs text-text-secondary font-mono">-- Write your query above, but you can't execute it until you're done!</span>
            <Button className="hero-btn-primary" onClick={() => {
              toast({ title: 'Interview Completed', message: 'In a full version, this would evaluate your SQL against hidden tests!', type: 'success' });
              setTimeout(onClose, 2000);
            }}>
              Submit Final Answer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
