import React, { useState } from 'react';
import { ChevronDown, Code, Sparkles, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { CodeBlock } from '@/shared/ui/CodeBlock';
import { groqChat, buildAiValidationPrompt } from '@/lib/groq';

export function QuestionAiSection({
  question,
  status,
  currentSql,
  hasKey,
  dbSchemaContext,
  lastValidation,
  aiSolution,
  aiSolutionLoading,
  aiSolutionError,
  aiExpectedResult,
  expectedResult,
  setAiSolution,
  setAiExpectedResult,
  executeQuery
}) {
  const [showSolution, setShowSolution] = useState(false);
  const [aiValidation, setAiValidation] = useState(null);
  const [aiValidationLoading, setAiValidationLoading] = useState(false);

  const hasAttempted = Boolean(
    currentSql?.trim() || status === 'attempted' || status === 'complete'
  );

  const handleAiValidation = async () => {
    if (!hasKey) return;
    setAiValidationLoading(true);
    try {
      const msgs = buildAiValidationPrompt({
        questionPrompt: question.prompt,
        userSQL: currentSql,
        sampleRows: lastValidation?.result?.rows?.slice(0, 5) || [],
        schemaContext: dbSchemaContext,
      });
      const raw = await groqChat(msgs, undefined, 300, false);
      const m = raw.match(/\{[\s\S]*\}/);
      const parsed = m
        ? JSON.parse(m[0])
        : { correct: false, score: 60, feedback: raw, suggestion: null };
      setAiValidation(parsed);
    } catch {
      setAiValidation({
        correct: false,
        score: 0,
        feedback: 'Validation failed. Try again.',
        suggestion: null,
      });
    } finally {
      setAiValidationLoading(false);
    }
  };

  return (
    <div className="bg-surface-2 rounded-lg border border-border overflow-hidden">
      {!hasAttempted && (
        <div className="px-4 py-2 bg-surface border-b border-border text-[11px] text-muted flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0 inline-block" />
          Write and run a query first to unlock the solution
        </div>
      )}

      <button
        onClick={() => {
          if (hasAttempted) setShowSolution(!showSolution);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 border-none font-semibold text-[13px] transition-all duration-150 ease-in-out ${
          hasAttempted ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
        } ${
          showSolution
            ? question.isAiGenerated
              ? 'bg-purple-500/10 text-primary'
              : 'bg-emerald-500/10 text-success'
            : hasAttempted
              ? 'bg-transparent text-text-secondary hover:bg-surface'
              : 'bg-transparent text-muted'
        }`}
      >
        <div className="flex items-center gap-2">
          <Code size={15} strokeWidth={2} />
          <span>Solution & AI Review</span>
          {question.isAiGenerated && (
            <span className="ai-badge text-[10px] px-1.5 py-[1px] flex items-center gap-1">
              <Cpu size={9} /> AI
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`transition-transform duration-250 opacity-60 ${showSolution ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${showSolution ? 'max-h-[2000px] overflow-y-auto' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4">
          <div className="mt-4">
            {question.isAiGenerated ? (
              <div>
                {!aiValidation && !aiValidationLoading && (
                  <button
                    onClick={handleAiValidation}
                    disabled={!currentSql?.trim() || !hasKey}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-blue-500/5 text-sm font-semibold text-primary transition-all duration-200 ${currentSql?.trim() && hasKey ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} strokeWidth={2.5} />
                      <span>🤖 Validate Query with AI</span>
                      <span className="ai-badge">Groq</span>
                    </div>
                    <span className="text-xs text-muted font-medium">
                      {!currentSql?.trim() ? 'Write SQL first' : 'Get AI grade →'}
                    </span>
                  </button>
                )}
                {aiValidationLoading && (
                  <div className="flex flex-col gap-3 px-4 py-4 border border-border rounded-lg bg-surface-2">
                    <div className="flex items-center gap-2.5 text-muted text-[13px]">
                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      AI is evaluating your query...
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-3/4" />
                    <Skeleton className="h-2 w-5/6" />
                  </div>
                )}
                {aiValidation && (
                  <div className={`p-4 rounded-lg border ${aiValidation.correct ? 'bg-success/5 border-success/30' : 'bg-error/5 border-error/30'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {aiValidation.correct ? (
                        <CheckCircle size={18} className="text-success" />
                      ) : (
                        <AlertTriangle size={18} className="text-error" />
                      )}
                      <h4 className={`m-0 text-sm font-bold ${aiValidation.correct ? 'text-success' : 'text-error'}`}>
                        {aiValidation.correct ? 'AI Grade: Correct! 🎉' : 'AI Grade: Incorrect'}
                      </h4>
                      <div className="ml-auto text-xs font-mono font-bold bg-surface px-2 py-0.5 rounded border border-border">
                        Score: {aiValidation.score}/100
                      </div>
                    </div>
                    <p className="m-0 text-[13px] text-text-secondary leading-relaxed mb-3">
                      {aiValidation.feedback}
                    </p>
                    {!aiValidation.correct && aiValidation.suggestion && (
                      <div className="mt-3 p-3 bg-surface rounded border border-border">
                        <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                          Fix Suggestion
                        </div>
                        <p className="m-0 text-[13px] text-text-secondary">
                          {aiValidation.suggestion}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => setAiValidation(null)}
                      className="mt-4 text-xs font-semibold text-text-secondary hover:text-text bg-transparent border-none cursor-pointer"
                    >
                      ↺ Run validation again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-surface rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="m-0 text-sm font-semibold text-text">Reference Solution</h4>
                  <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                    PostgreSQL
                  </span>
                </div>
                <CodeBlock code={question.solution || '-- Solution not provided for this question'} language="sql" />
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h4 className="m-0 mb-3 text-[13px] font-semibold text-text">Expected Output</h4>
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              {aiSolutionLoading ? (
                <div className="p-4 text-center text-muted text-xs">
                  Computing expected result via AI...
                </div>
              ) : question.isAiGenerated && !aiExpectedResult ? (
                <div className="px-4 py-8 text-center text-muted">
                  <div className="text-3xl mb-3">🤖</div>
                  <div className="text-sm font-semibold text-text mb-1.5">
                    AI challenges are open-ended
                  </div>
                  <div className="text-[13px] leading-relaxed max-w-[300px] mx-auto">
                    There is no fixed expected output. Run your SQL, then use the{' '}
                    <strong>Validate Query with AI</strong> button above to grade your approach!
                    <div className="mt-3 text-xs text-muted">
                      (Or click <strong>Generate AI Solution</strong> in the Solution tab to generate
                      a reference output table)
                    </div>
                  </div>
                </div>
              ) : question.isAiGenerated && aiExpectedResult && aiExpectedResult.error ? (
                <div className="px-4 py-6 text-center text-error">
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className="text-[13px] font-semibold mb-1">
                    AI-Generated SQL Error
                  </div>
                  <div className="text-xs leading-relaxed opacity-80 max-w-[300px] mx-auto">
                    {aiExpectedResult.error}
                  </div>
                  <button
                    onClick={() => {
                      setAiSolution(null);
                      setAiExpectedResult(null);
                      sessionStorage.removeItem(`ai-sol-${question.id}`);
                    }}
                    className="mt-3 text-xs px-3 py-1.5 bg-transparent text-error border border-error/30 rounded cursor-pointer hover:bg-error/10 transition-colors"
                  >
                    Regenerate AI Solution
                  </button>
                </div>
              ) : !question.isAiGenerated && !expectedResult ? (
                <div className="p-4 text-center text-muted text-xs">
                  Computing expected result...
                </div>
              ) : (question.isAiGenerated ? aiExpectedResult : expectedResult)?.columns?.length >
                0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        {(question.isAiGenerated ? aiExpectedResult : expectedResult).columns.map(
                          (col) => (
                            <th
                              key={col}
                              className="px-3 py-2 text-left border-b border-border bg-surface-2 sticky top-0 font-semibold text-text"
                            >
                              {col}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {((question.isAiGenerated ? aiExpectedResult : expectedResult).rows || []).map(
                        (row, i) => (
                          <tr key={i} className="border-b border-border">
                            {row.map((val, j) => (
                              <td
                                key={j}
                                className="px-3 py-2 text-text-secondary"
                              >
                                {val === null ? (
                                  <span className="text-muted italic">
                                    null
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (question.isAiGenerated ? aiExpectedResult : expectedResult)?.columns ? (
                <div className="px-4 py-8 text-center text-muted">
                  <CheckCircle size={24} strokeWidth={1.5} className="text-success mb-2 mx-auto" />
                  <div className="text-sm font-semibold text-text mb-1">
                    Query Successful
                  </div>
                  <div className="text-[13px]">Returned 0 rows</div>
                </div>
              ) : (
                <div className="p-4 text-center text-muted text-xs">
                  No specific output required.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
