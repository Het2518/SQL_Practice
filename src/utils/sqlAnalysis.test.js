import { describe, it, expect } from 'vitest';
import { parseQueryClauses, extractFromTable } from './sqlAnalysis';

describe('sqlAnalysis utils', () => {
  describe('parseQueryClauses', () => {
    it('detects standard SQL clauses', () => {
      const sql = 'SELECT DISTINCT id FROM users JOIN roles ON users.id = roles.user_id WHERE age > 18 GROUP BY id HAVING count(*) > 1 ORDER BY id LIMIT 10';
      const clauses = parseQueryClauses(sql);
      expect(clauses).toEqual({
        hasFROM: true,
        hasJOIN: true,
        hasWHERE: true,
        hasGROUPBY: true,
        hasHAVING: true,
        hasDISTINCT: true,
        hasORDERBY: true,
        hasLIMIT: true,
        hasCTE: false,
        hasSubquery: false,
      });
    });

    it('detects CTE and Subqueries', () => {
      const sql = 'WITH active_users AS (SELECT * FROM users) SELECT * FROM (SELECT id FROM active_users) WHERE id IN (SELECT user_id FROM orders)';
      const clauses = parseQueryClauses(sql);
      expect(clauses.hasCTE).toBe(true);
      expect(clauses.hasSubquery).toBe(true);
    });
  });

  describe('extractFromTable', () => {
    it('extracts table name from FROM clause', () => {
      expect(extractFromTable('SELECT * FROM users')).toBe('users');
      expect(extractFromTable('SELECT * FROM user_data WHERE id = 1')).toBe('user_data');
      expect(extractFromTable('SELECT id FROM USERS')).toBe('USERS');
    });

    it('returns null if no FROM clause', () => {
      expect(extractFromTable('SELECT 1')).toBeNull();
    });
  });
});
