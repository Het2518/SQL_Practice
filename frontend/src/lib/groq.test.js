import { describe, it, expect } from 'vitest';
import { safeParseJsonArray } from './groq';

describe('safeParseJsonArray', () => {
  it('parses a clean JSON array', () => {
    const raw = '[{"title":"Q1","prompt":"P1"},{"title":"Q2","prompt":"P2"}]';
    const result = safeParseJsonArray(raw);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Q1');
  });

  it('parses JSON array inside markdown code fences', () => {
    const raw = '```json\n[{"title":"Q1","prompt":"P1"}]\n```';
    const result = safeParseJsonArray(raw);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Q1');
  });

  it('parses JSON array with preambles and explanations', () => {
    const raw = 'Here are your requested interview questions:\n\n[{"title":"Q1","prompt":"P1"}]\n\nHope this helps!';
    const result = safeParseJsonArray(raw);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Q1');
  });

  it('parses an object containing an array property', () => {
    const raw = '{"questions": [{"title":"Q1","prompt":"P1"}]}';
    const result = safeParseJsonArray(raw);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Q1');
  });

  it('recovers completed questions when JSON array was truncated mid-stream', () => {
    // Truncated at question 2 mid-string
    const truncated = '[{"title":"Q1","prompt":"Prompt 1"},{"title":"Q2","prompt":"Prompt 2"},{"title":"Q3","prompt":"Incomplete';
    const result = safeParseJsonArray(truncated);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Q1');
    expect(result[1].title).toBe('Q2');
  });

  it('returns empty array on empty or non-string input', () => {
    expect(safeParseJsonArray(null)).toEqual([]);
    expect(safeParseJsonArray('')).toEqual([]);
    expect(safeParseJsonArray(undefined)).toEqual([]);
  });

  it('throws a descriptive error when no valid JSON questions can be parsed', () => {
    expect(() => safeParseJsonArray('no json content whatsoever')).toThrow('Failed to parse');
  });
});
