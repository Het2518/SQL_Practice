import { describe, it, expect } from 'vitest';
import { formatTime, compareQueryResult } from './interviewUtils';

describe('interviewUtils', () => {
  describe('formatTime', () => {
    it('formats seconds into MM:SS correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(1800)).toBe('30:00');
    });
  });

  describe('compareQueryResult', () => {
    it('returns idle status when userResult is null', () => {
      expect(compareQueryResult(null, [])).toEqual({ status: 'idle' });
    });

    it('returns error status when userResult contains error', () => {
      const res = compareQueryResult({ error: 'near "WHERE": syntax error' }, []);
      expect(res.status).toBe('error');
      expect(res.message).toContain('syntax error');
    });

    it('returns accepted when rows and columns match expected output', () => {
      const userResult = {
        columns: ['flight_id', 'airline_code', 'delay_minutes'],
        rows: [
          [101, 'AA', 45],
          [103, 'UA', 25],
        ],
      };
      const expectedOutput = [
        { flight_id: 101, airline_code: 'AA', delay_minutes: 45 },
        { flight_id: 103, airline_code: 'UA', delay_minutes: 25 },
      ];

      const res = compareQueryResult(userResult, expectedOutput);
      expect(res.status).toBe('accepted');
      expect(res.match).toBe(true);
    });

    it('detects row count mismatch', () => {
      const userResult = {
        columns: ['id'],
        rows: [[1], [2], [3]],
      };
      const expectedOutput = [{ id: 1 }, { id: 2 }];

      const res = compareQueryResult(userResult, expectedOutput);
      expect(res.status).toBe('wrong_answer');
      expect(res.message).toContain('Row count mismatch');
    });

    it('detects column mismatch', () => {
      const userResult = {
        columns: ['wrong_col'],
        rows: [[1]],
      };
      const expectedOutput = [{ expected_col: 1 }];

      const res = compareQueryResult(userResult, expectedOutput);
      expect(res.status).toBe('wrong_answer');
      expect(res.message).toContain('Column mismatch');
    });
  });
});

