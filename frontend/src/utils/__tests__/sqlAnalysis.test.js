import { describe, it, expect } from 'vitest';
import { parseQueryClauses, extractFromTable } from '../sqlAnalysis';

describe('sqlAnalysis utilities', () => {
  it('parseQueryClauses should correctly identify CTEs and JOINs', () => {
    const sql = `
      WITH ActiveUsers AS (SELECT * FROM users WHERE active = 1)
      SELECT * FROM ActiveUsers JOIN RecentOrders USING (user_id)
    `;
    const clauses = parseQueryClauses(sql);
    expect(clauses.hasCTE).toBe(true);
    expect(clauses.hasJOIN).toBe(true);
    expect(clauses.hasGROUPBY).toBe(false);
  });

  it('extractFromTable should extract the base table', () => {
    expect(extractFromTable('SELECT * FROM users;')).toBe('users');
    expect(extractFromTable('SELECT * FROM active_users WHERE age > 10;')).toBe('active_users');
    expect(extractFromTable('SELECT 1')).toBe(null);
  });
});
