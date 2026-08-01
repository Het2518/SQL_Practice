import { useEffect, useRef } from 'react';
import { useToast } from '@/shared/ui/ToastSystem';
import { hasGroqKey, groqChat, MODEL_FAST } from '@/lib/groq';

export function useProactiveTutor({
  sql,
  question,
  dbSchemaContext,
  delayMs = 45000,
  isEnabled = true,
}) {
  const { toast } = useToast();
  const timerRef = useRef(null);
  const lastAnalyzedSqlRef = useRef('');

  useEffect(() => {
    // If feature is disabled, or no API key, or empty SQL/Question, do nothing
    if (!isEnabled || !hasGroqKey() || !sql?.trim() || !question) return;

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // Don't re-analyze if the SQL hasn't changed since last analysis
      if (sql === lastAnalyzedSqlRef.current) return;
      lastAnalyzedSqlRef.current = sql;

      try {
        const systemPrompt = `You are a proactive SQL tutor observing a student typing.
Context:
- Schema: ${dbSchemaContext}
- Question: ${question.prompt}
- User's SQL: \`\`\`sql\n${sql}\n\`\`\`

Analyze the user's SQL. If they are making a CRITICAL mistake (e.g., missing ON clause causing Cartesian product, confusing WHERE and HAVING, severe syntax error, or completely wrong table), provide ONE short, gentle hint (MAX 15 words). Do not give the direct answer.
If they are on the right track, close to the answer, or making only minor mistakes, return EXACTLY the word "OK".`;

        // Use MODEL_FAST (Llama 3 8B) for ultra-fast, cheap background analysis
        const response = await groqChat([{ role: 'system', content: systemPrompt }], MODEL_FAST, 100, false);
        
        const cleanResponse = response?.trim() || '';
        
        if (
          cleanResponse && 
          cleanResponse.toUpperCase() !== 'OK' && 
          !cleanResponse.toUpperCase().startsWith('OK')
        ) {
           toast({
             title: 'AI Tutor Hint',
             message: cleanResponse.replace(/^['"]|['"]$/g, ''), // Strip quotes if any
             type: 'info'
           });
        }
      } catch (e) {
        // Ignore background network/rate limit errors silently
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sql, question, dbSchemaContext, isEnabled, toast, delayMs]);
}
