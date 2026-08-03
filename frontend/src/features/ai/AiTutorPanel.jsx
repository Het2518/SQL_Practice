import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, Code2, Play } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { CodeBlock } from '@/shared/ui/CodeBlock';
// useGroqKey removed
import { groqChat, MODEL_SMART } from '@/lib/groq';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AiTutorPanel({ isOpen, onClose, question, currentSql, dbSchemaContext }) {
  const hasKey = true;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm your AI SQL Tutor. I can help you with the question: **${question?.title}**.\n\nStuck? Ask me for a hint, or explain what you are trying to do!`,
        },
      ]);
    }
  }, [isOpen, question]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !hasKey || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      posthog.capture('ai_tutor_requested', {
        question_id: question?.id,
        difficulty: question?.difficulty,
      });

      // Build system prompt with context
      const systemPrompt = `You are an expert SQL tutor. 
Context:
- Database Schema: ${dbSchemaContext}
- Question: ${question?.prompt}
- Expected Approach: ${question?.expected_approach || 'N/A'}
- User's Current SQL: \`\`\`sql\n${currentSql || 'No SQL written yet'}\n\`\`\`

Rules:
1. NEVER give the user the exact full solution query.
2. Guide them using hints, syntax examples, and explanations.
3. Be encouraging and concise. Use markdown formatting.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...newMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await groqChat(apiMessages, MODEL_SMART, 800, false);

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '❌ Sorry, I encountered an error. Please check your API key in Settings or try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9998] animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-surface shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[9999] flex flex-col animate-in slide-in-from-right duration-300 border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text m-0 leading-tight">AI SQL Tutor</h2>
              <p className="text-xs text-text-secondary m-0">Powered by Groq</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:bg-surface hover:text-text rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!hasKey && (
            <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl text-sm text-text">
              <p className="font-semibold text-warning m-0 mb-1">API Key Required</p>
              <p className="m-0 mb-3 text-text-secondary">
                Please add your Groq API key in the settings to use the AI Tutor.
              </p>
              <Button
                size="sm"
                onClick={() => document.dispatchEvent(new CustomEvent('open-settings'))}
              >
                Open Settings
              </Button>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
                  msg.role === 'user'
                    ? 'bg-surface-3 text-text-secondary'
                    : 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                )}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={cn(
                  'px-4 py-2.5 rounded-2xl max-w-[85%] text-[14px] leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-surface-2 text-text border border-border rounded-tl-none prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0'
                )}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
  pre({ node, children, ...props }) {
    const child = Array.isArray(children) ? children[0] : children;
    if (child && child.props && child.props.node && child.props.node.tagName === 'code') {
      const className = child.props.className || '';
      const match = /language-(\w+)/.exec(className);
      const codeText = String(child.props.children).replace(/\n$/, '');
      return (
        <div className="not-prose">
          <CodeBlock code={codeText} language={match ? match[1] : 'sql'} />
        </div>
      );
    }
    return <pre {...props}>{children}</pre>;
  },
  code({ node, className, children, ...props }) {
    return (
      <code className="bg-primary-muted text-text px-1.5 py-0.5 rounded text-[13px] font-mono border border-border" {...props}>
        {children}
      </code>
    );
  }
}}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-surface-2 text-text border border-border rounded-tl-none">
                <Loader2 size={18} className="animate-spin text-text-secondary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-surface">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a hint, explain an error..."
              disabled={isLoading || !hasKey}
              className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isLoading || !hasKey}
              className="absolute right-1.5 top-1.5 bottom-1.5 h-auto px-4 rounded-lg shadow-none"
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
