/**
 * useInterviewSession.js — Multi-Question Interview & Learning Session Manager
 *
 * Manages a structured 10-question interview & learning session:
 *   Q1–Q5  → SQL coding questions (each has its own dedicated SQLite DB)
 *   Q6–Q10 → MCQ conceptual questions (auto-graded, no DB needed)
 *
 * Key features:
 *  - Dedicated Web Worker SQL engine (WASM) per question
 *  - Multi-tier dynamic curriculum from Beginner / Foundations up to Staff Master
 *  - Dynamic fallback catalog with industry-diverse scenarios (no duplicate questions)
 *  - Level-adapted MCQ conceptual tests
 *  - Full state persistence and resume support
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateFullInterviewSession } from '@/lib/groq';
import { useInterviewDatabase } from './useInterviewDatabase';

// ─── SQLite Helpers ──────────────────────────────────────────────────────────

const mapToSqliteType = (type = 'TEXT') => {
  const t = String(type).toUpperCase().trim();
  if (t.includes('INT') || t.includes('SERIAL') || t.includes('BOOL')) return 'INTEGER';
  if (t.includes('FLOAT') || t.includes('DOUBLE') || t.includes('DEC') || t.includes('NUM') || t.includes('REAL')) return 'REAL';
  if (t.includes('BLOB') || t.includes('BYTE') || t.includes('BINARY')) return 'BLOB';
  return 'TEXT';
};

const formatSqlValue = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? 'NULL' : String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  return `'${String(val).replace(/'/g, "''")}'`;
};

export const buildInitSqlFromTables = (tables) => {
  if (!Array.isArray(tables) || tables.length === 0) return null;
  let sql = '';
  for (const t of tables) {
    if (!t || typeof t.name !== 'string') continue;
    const tableName = t.name.trim().replace(/"/g, '');
    if (!tableName) continue;

    let colDefs = '';
    if (Array.isArray(t.columns) && t.columns.length > 0) {
      const defs = t.columns
        .filter(c => c && (typeof c === 'string' || typeof c.name === 'string'))
        .map(c => {
          const name = (typeof c === 'string' ? c : c.name).trim().replace(/"/g, '');
          const type = typeof c === 'object' && c.type ? mapToSqliteType(c.type) : 'TEXT';
          return `"${name}" ${type}`;
        });
      colDefs = defs.join(', ');
    }
    if (!colDefs && Array.isArray(t.sampleData) && t.sampleData.length > 0) {
      const firstRow = t.sampleData[0];
      if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
        colDefs = Object.keys(firstRow).map(k => `"${k.replace(/"/g, '')}" TEXT`).join(', ');
      }
    }
    if (!colDefs) colDefs = '"id" INTEGER';

    sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (${colDefs});\n`;
    if (Array.isArray(t.sampleData)) {
      for (const row of t.sampleData) {
        if (!row) continue;
        if (Array.isArray(row)) {
          sql += `INSERT INTO "${tableName}" VALUES (${row.map(formatSqlValue).join(', ')});\n`;
        } else if (typeof row === 'object') {
          const keys = Object.keys(row);
          if (keys.length > 0) {
            const ks = keys.map(k => `"${k.replace(/"/g, '')}"`).join(', ');
            const vs = keys.map(k => formatSqlValue(row[k])).join(', ');
            sql += `INSERT INTO "${tableName}" (${ks}) VALUES (${vs});\n`;
          }
        }
      }
    }
  }
  return sql || null;
};

const sanitizeInitSql = (rawSql, tables) => {
  let sql = rawSql
    ? rawSql.replace(/```(?:sql|sqlite)?\s*/gi, '').replace(/```/g, '').trim()
    : null;
  if (!sql || !sql.toLowerCase().includes('create table') || !sql.toLowerCase().includes('insert into')) {
    const generated = buildInitSqlFromTables(tables);
    if (generated) sql = generated;
  }
  return sql || null;
};

// ─── Curated Multi-Tier Question Catalog ─────────────────────────────────────

const FALLBACK_CATALOG = {
  // ── BEGINNER / SQL 101 POOL ────────────────────────────────────────────────
  beginner: [
    {
      id: 'beg_ecom_products',
      industry: 'ecommerce',
      topic: 'filtering',
      problemStatement: 'Find all active products with a unit price under $35.00. Return product_id, product_name, and price, sorted by price ascending.',
      explanation: 'Filter products table where is_active is 1 and price < 35.0, then order results by price in ascending order.',
      constraints: 'Include only products with is_active = 1. Sort by price ASC.',
      tables: [
        {
          name: 'products',
          columns: [{ name: 'product_id', type: 'INTEGER' }, { name: 'product_name', type: 'TEXT' }, { name: 'price', type: 'REAL' }, { name: 'is_active', type: 'INTEGER' }],
          sampleData: [
            { product_id: 1, product_name: 'Wireless Mouse', price: 24.99, is_active: 1 },
            { product_id: 2, product_name: 'Mechanical Keyboard', price: 89.99, is_active: 1 },
            { product_id: 3, product_name: 'USB-C Cable', price: 12.50, is_active: 1 },
            { product_id: 4, product_name: 'Desk Mat', price: 18.00, is_active: 1 },
            { product_id: 5, product_name: 'Laptop Stand', price: 45.00, is_active: 1 },
            { product_id: 6, product_name: 'Webcam Cover', price: 5.99, is_active: 0 },
            { product_id: 7, product_name: 'Bluetooth Earbuds', price: 29.99, is_active: 1 },
            { product_id: 8, product_name: '4K Monitor', price: 299.00, is_active: 1 },
          ],
        },
      ],
      expectedOutput: [
        { product_id: 3, product_name: 'USB-C Cable', price: 12.50 },
        { product_id: 4, product_name: 'Desk Mat', price: 18.00 },
        { product_id: 1, product_name: 'Wireless Mouse', price: 24.99 },
        { product_id: 7, product_name: 'Bluetooth Earbuds', price: 29.99 },
      ],
    },
    {
      id: 'beg_fintech_deposits',
      industry: 'fintech',
      topic: 'filtering',
      problemStatement: 'Find all completed deposit transactions of $500 or more. Return transaction_id, account_id, amount, and status, sorted by amount descending.',
      explanation: 'Filter transactions where type = deposit, status = completed, and amount >= 500.',
      constraints: 'Sort by amount DESC.',
      tables: [
        {
          name: 'transactions',
          columns: [{ name: 'transaction_id', type: 'INTEGER' }, { name: 'account_id', type: 'INTEGER' }, { name: 'type', type: 'TEXT' }, { name: 'amount', type: 'REAL' }, { name: 'status', type: 'TEXT' }],
          sampleData: [
            { transaction_id: 101, account_id: 1, type: 'deposit', amount: 1200.0, status: 'completed' },
            { transaction_id: 102, account_id: 2, type: 'withdrawal', amount: 300.0, status: 'completed' },
            { transaction_id: 103, account_id: 3, type: 'deposit', amount: 450.0, status: 'completed' },
            { transaction_id: 104, account_id: 1, type: 'deposit', amount: 800.0, status: 'completed' },
            { transaction_id: 105, account_id: 4, type: 'deposit', amount: 2500.0, status: 'completed' },
            { transaction_id: 106, account_id: 2, type: 'deposit', amount: 750.0, status: 'pending' },
            { transaction_id: 107, account_id: 5, type: 'deposit', amount: 600.0, status: 'completed' },
          ],
        },
      ],
      expectedOutput: [
        { transaction_id: 105, account_id: 4, amount: 2500.0, status: 'completed' },
        { transaction_id: 101, account_id: 1, amount: 1200.0, status: 'completed' },
        { transaction_id: 104, account_id: 1, amount: 800.0, status: 'completed' },
        { transaction_id: 107, account_id: 5, amount: 600.0, status: 'completed' },
      ],
    },
    {
      id: 'beg_health_patients',
      industry: 'health',
      topic: 'filtering',
      problemStatement: 'Find all patients admitted to the Cardiology ward who are 60 years or older. Return patient_id, full_name, age, and ward, sorted by age descending.',
      explanation: 'Filter patients where ward is Cardiology and age >= 60, ordering by age DESC.',
      constraints: 'Sort by age DESC.',
      tables: [
        {
          name: 'patients',
          columns: [{ name: 'patient_id', type: 'INTEGER' }, { name: 'full_name', type: 'TEXT' }, { name: 'age', type: 'INTEGER' }, { name: 'ward', type: 'TEXT' }],
          sampleData: [
            { patient_id: 1, full_name: 'Arthur Dent', age: 65, ward: 'Cardiology' },
            { patient_id: 2, full_name: 'Sarah Connor', age: 48, ward: 'Cardiology' },
            { patient_id: 3, full_name: 'Walter White', age: 72, ward: 'Cardiology' },
            { patient_id: 4, full_name: 'Ellen Ripley', age: 61, ward: 'Neurology' },
            { patient_id: 5, full_name: 'Bruce Wayne', age: 70, ward: 'Cardiology' },
            { patient_id: 6, full_name: 'Diana Prince', age: 55, ward: 'Orthopedics' },
          ],
        },
      ],
      expectedOutput: [
        { patient_id: 3, full_name: 'Walter White', age: 72, ward: 'Cardiology' },
        { patient_id: 5, full_name: 'Bruce Wayne', age: 70, ward: 'Cardiology' },
        { patient_id: 1, full_name: 'Arthur Dent', age: 65, ward: 'Cardiology' },
      ],
    },
    {
      id: 'beg_hr_salaries',
      industry: 'faang',
      topic: 'aggregations',
      problemStatement: 'Calculate the total headcount and average annual salary for full-time employees. Return total_employees and avg_salary.',
      explanation: 'Use COUNT(*) and AVG(salary) with WHERE employment_type = full-time.',
      constraints: 'Round avg_salary to 2 decimal places if applicable.',
      tables: [
        {
          name: 'employees',
          columns: [{ name: 'employee_id', type: 'INTEGER' }, { name: 'full_name', type: 'TEXT' }, { name: 'employment_type', type: 'TEXT' }, { name: 'salary', type: 'REAL' }],
          sampleData: [
            { employee_id: 1, full_name: 'Alice Smith', employment_type: 'full-time', salary: 90000.0 },
            { employee_id: 2, full_name: 'Bob Jones', employment_type: 'part-time', salary: 40000.0 },
            { employee_id: 3, full_name: 'Charlie Brown', employment_type: 'full-time', salary: 110000.0 },
            { employee_id: 4, full_name: 'Diana Evans', employment_type: 'full-time', salary: 95000.0 },
            { employee_id: 5, full_name: 'Ethan Hunt', employment_type: 'contractor', salary: 85000.0 },
            { employee_id: 6, full_name: 'Fiona Gallagher', employment_type: 'full-time', salary: 105000.0 },
          ],
        },
      ],
      expectedOutput: [
        { total_employees: 4, avg_salary: 100000.0 },
      ],
    },
    {
      id: 'beg_ecom_joins',
      industry: 'ecommerce',
      topic: 'joins',
      problemStatement: 'Join customers with orders to list all placed orders. Return customer_name, order_id, and total_amount, sorted by total_amount descending.',
      explanation: 'INNER JOIN customers on customer_id, ordered by total_amount DESC.',
      constraints: 'Sort by total_amount DESC.',
      tables: [
        {
          name: 'customers',
          columns: [{ name: 'customer_id', type: 'INTEGER' }, { name: 'customer_name', type: 'TEXT' }, { name: 'city', type: 'TEXT' }],
          sampleData: [
            { customer_id: 1, customer_name: 'Emma Watson', city: 'London' },
            { customer_id: 2, customer_name: 'Liam Neeson', city: 'New York' },
            { customer_id: 3, customer_name: 'Noah Centineo', city: 'Miami' },
          ],
        },
        {
          name: 'orders',
          columns: [{ name: 'order_id', type: 'INTEGER' }, { name: 'customer_id', type: 'INTEGER' }, { name: 'total_amount', type: 'REAL' }],
          sampleData: [
            { order_id: 501, customer_id: 1, total_amount: 149.99 },
            { order_id: 502, customer_id: 2, total_amount: 89.50 },
            { order_id: 503, customer_id: 1, total_amount: 230.00 },
            { order_id: 504, customer_id: 3, total_amount: 45.00 },
          ],
        },
      ],
      expectedOutput: [
        { customer_name: 'Emma Watson', order_id: 503, total_amount: 230.00 },
        { customer_name: 'Emma Watson', order_id: 501, total_amount: 149.99 },
        { customer_name: 'Liam Neeson', order_id: 502, total_amount: 89.50 },
        { customer_name: 'Noah Centineo', order_id: 504, total_amount: 45.00 },
      ],
    },
  ],

  // ── INTERMEDIATE / APPLIED POOL ────────────────────────────────────────────
  intermediate: [
    {
      id: 'int_airline_delays',
      industry: 'airlines',
      topic: 'filtering',
      problemStatement: 'Find all flights departing from JFK that were delayed by more than 15 minutes. Return flight_id, airline_code, origin_airport, and delay_minutes, sorted by delay_minutes descending.',
      explanation: 'Filter flight_logs where origin_airport is JFK and delay_minutes > 15, then sort by delay_minutes DESC.',
      constraints: 'Include only flights with delay_minutes > 15. Sort by delay_minutes in descending order.',
      tables: [
        {
          name: 'flight_logs',
          columns: [{ name: 'flight_id', type: 'INTEGER' }, { name: 'airline_code', type: 'TEXT' }, { name: 'origin_airport', type: 'TEXT' }, { name: 'delay_minutes', type: 'INTEGER' }],
          sampleData: [
            { flight_id: 101, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 45 },
            { flight_id: 102, airline_code: 'DL', origin_airport: 'LAX', delay_minutes: 10 },
            { flight_id: 103, airline_code: 'UA', origin_airport: 'JFK', delay_minutes: 25 },
            { flight_id: 104, airline_code: 'B6', origin_airport: 'JFK', delay_minutes: 5 },
            { flight_id: 105, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 80 },
            { flight_id: 106, airline_code: 'UA', origin_airport: 'ORD', delay_minutes: 30 },
            { flight_id: 107, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 18 },
            { flight_id: 108, airline_code: 'SW', origin_airport: 'MDW', delay_minutes: 12 },
            { flight_id: 109, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 60 },
            { flight_id: 110, airline_code: 'B6', origin_airport: 'BOS', delay_minutes: 40 },
            { flight_id: 111, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 95 },
            { flight_id: 112, airline_code: 'UA', origin_airport: 'SFO', delay_minutes: 15 },
            { flight_id: 113, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 32 },
          ],
        },
      ],
      expectedOutput: [
        { flight_id: 111, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 95 },
        { flight_id: 105, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 80 },
        { flight_id: 109, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 60 },
        { flight_id: 101, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 45 },
        { flight_id: 113, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 32 },
        { flight_id: 103, airline_code: 'UA', origin_airport: 'JFK', delay_minutes: 25 },
        { flight_id: 107, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 18 },
      ],
    },
    {
      id: 'int_music_payouts',
      industry: 'startup',
      topic: 'joins',
      problemStatement: 'Calculate the total streaming revenue for each music artist. Return artist_name and total_payout, sorted by total_payout descending.',
      explanation: 'Join artists with streaming_events on artist_id, group by artist_name, and compute SUM(streams_count * rate_per_stream).',
      constraints: 'Only include artists with at least one stream. Sort by total_payout DESC.',
      tables: [
        {
          name: 'artists',
          columns: [{ name: 'artist_id', type: 'INTEGER' }, { name: 'artist_name', type: 'TEXT' }, { name: 'rate_per_stream', type: 'REAL' }],
          sampleData: [
            { artist_id: 1, artist_name: 'Luna Ray', rate_per_stream: 0.004 },
            { artist_id: 2, artist_name: 'The Echoes', rate_per_stream: 0.005 },
            { artist_id: 3, artist_name: 'Solaris', rate_per_stream: 0.0035 },
            { artist_id: 4, artist_name: 'Neon Pulse', rate_per_stream: 0.006 },
            { artist_id: 5, artist_name: 'Acoustic Drift', rate_per_stream: 0.0045 },
          ],
        },
        {
          name: 'streaming_events',
          columns: [{ name: 'event_id', type: 'INTEGER' }, { name: 'artist_id', type: 'INTEGER' }, { name: 'streams_count', type: 'INTEGER' }],
          sampleData: [
            { event_id: 10, artist_id: 1, streams_count: 50000 },
            { event_id: 11, artist_id: 2, streams_count: 80000 },
            { event_id: 12, artist_id: 1, streams_count: 20000 },
            { event_id: 13, artist_id: 3, streams_count: 10000 },
            { event_id: 14, artist_id: 4, streams_count: 60000 },
            { event_id: 15, artist_id: 2, streams_count: 40000 },
            { event_id: 16, artist_id: 5, streams_count: 30000 },
            { event_id: 17, artist_id: 1, streams_count: 15000 },
            { event_id: 18, artist_id: 4, streams_count: 25000 },
            { event_id: 19, artist_id: 3, streams_count: 20000 },
            { event_id: 20, artist_id: 5, streams_count: 10000 },
          ],
        },
      ],
      expectedOutput: [
        { artist_name: 'The Echoes', total_payout: 600.0 },
        { artist_name: 'Neon Pulse', total_payout: 510.0 },
        { artist_name: 'Luna Ray', total_payout: 340.0 },
        { artist_name: 'Acoustic Drift', total_payout: 180.0 },
        { artist_name: 'Solaris', total_payout: 105.0 },
      ],
    },
    {
      id: 'int_fintech_merchants',
      industry: 'fintech',
      topic: 'aggregations',
      problemStatement: 'Calculate total volume and average charge for merchants with at least 3 transactions. Return merchant_name, total_volume, and avg_charge, sorted by total_volume descending.',
      explanation: 'Join merchants with charges on merchant_id, GROUP BY merchant_name, and apply HAVING COUNT(*) >= 3.',
      constraints: 'Sort by total_volume DESC.',
      tables: [
        {
          name: 'merchants',
          columns: [{ name: 'merchant_id', type: 'INTEGER' }, { name: 'merchant_name', type: 'TEXT' }],
          sampleData: [
            { merchant_id: 1, merchant_name: 'Tech Haven' },
            { merchant_id: 2, merchant_name: 'Brew & Bean' },
            { merchant_id: 3, merchant_name: 'Green Grocer' },
          ],
        },
        {
          name: 'charges',
          columns: [{ name: 'charge_id', type: 'INTEGER' }, { name: 'merchant_id', type: 'INTEGER' }, { name: 'amount', type: 'REAL' }],
          sampleData: [
            { charge_id: 1, merchant_id: 1, amount: 250.0 },
            { charge_id: 2, merchant_id: 1, amount: 350.0 },
            { charge_id: 3, merchant_id: 1, amount: 400.0 },
            { charge_id: 4, merchant_id: 2, amount: 15.0 },
            { charge_id: 5, merchant_id: 2, amount: 25.0 },
            { charge_id: 6, merchant_id: 3, amount: 80.0 },
            { charge_id: 7, merchant_id: 3, amount: 120.0 },
            { charge_id: 8, merchant_id: 3, amount: 100.0 },
          ],
        },
      ],
      expectedOutput: [
        { merchant_name: 'Tech Haven', total_volume: 1000.0, avg_charge: 333.33 },
        { merchant_name: 'Green Grocer', total_volume: 300.0, avg_charge: 100.0 },
      ],
    },
    {
      id: 'int_hr_dept_salaries',
      industry: 'faang',
      topic: 'aggregations',
      problemStatement: 'Find departments with more than 2 employees that have an average salary greater than $85,000. Return department_name, headcount, and avg_salary, sorted by avg_salary descending.',
      explanation: 'Join departments with staff on department_id, GROUP BY department_name, and apply HAVING COUNT(*) > 2 AND AVG(salary) > 85000.',
      constraints: 'Sort by avg_salary DESC.',
      tables: [
        {
          name: 'departments',
          columns: [{ name: 'department_id', type: 'INTEGER' }, { name: 'department_name', type: 'TEXT' }],
          sampleData: [
            { department_id: 1, department_name: 'Engineering' },
            { department_id: 2, department_name: 'Marketing' },
            { department_id: 3, department_name: 'Sales' },
          ],
        },
        {
          name: 'staff',
          columns: [{ name: 'staff_id', type: 'INTEGER' }, { name: 'department_id', type: 'INTEGER' }, { name: 'salary', type: 'REAL' }],
          sampleData: [
            { staff_id: 1, department_id: 1, salary: 120000.0 },
            { staff_id: 2, department_id: 1, salary: 135000.0 },
            { staff_id: 3, department_id: 1, salary: 110000.0 },
            { staff_id: 4, department_id: 2, salary: 70000.0 },
            { staff_id: 5, department_id: 2, salary: 75000.0 },
            { staff_id: 6, department_id: 3, salary: 90000.0 },
            { staff_id: 7, department_id: 3, salary: 95000.0 },
            { staff_id: 8, department_id: 3, salary: 88000.0 },
          ],
        },
      ],
      expectedOutput: [
        { department_name: 'Engineering', headcount: 3, avg_salary: 121666.67 },
        { department_name: 'Sales', headcount: 3, avg_salary: 91000.0 },
      ],
    },
    {
      id: 'int_cloud_pipelines',
      industry: 'data',
      topic: 'subqueries',
      problemStatement: 'Identify cloud clusters that experienced more than 1 failed pipeline run. Return cluster_name and failed_runs, sorted by failed_runs descending.',
      explanation: 'Filter pipeline_runs where status = failed, group by cluster_id, count failures, and join cluster_name.',
      constraints: 'Sort by failed_runs DESC.',
      tables: [
        {
          name: 'clusters',
          columns: [{ name: 'cluster_id', type: 'INTEGER' }, { name: 'cluster_name', type: 'TEXT' }],
          sampleData: [
            { cluster_id: 1, cluster_name: 'etl-prod-cluster' },
            { cluster_id: 2, cluster_name: 'ml-train-cluster' },
            { cluster_id: 3, cluster_name: 'bi-reporting-cluster' },
          ],
        },
        {
          name: 'pipeline_runs',
          columns: [{ name: 'run_id', type: 'INTEGER' }, { name: 'cluster_id', type: 'INTEGER' }, { name: 'status', type: 'TEXT' }],
          sampleData: [
            { run_id: 1, cluster_id: 1, status: 'failed' },
            { run_id: 2, cluster_id: 1, status: 'failed' },
            { run_id: 3, cluster_id: 1, status: 'success' },
            { run_id: 4, cluster_id: 2, status: 'failed' },
            { run_id: 5, cluster_id: 3, status: 'failed' },
            { run_id: 6, cluster_id: 3, status: 'failed' },
            { run_id: 7, cluster_id: 3, status: 'failed' },
          ],
        },
      ],
      expectedOutput: [
        { cluster_name: 'bi-reporting-cluster', failed_runs: 3 },
        { cluster_name: 'etl-prod-cluster', failed_runs: 2 },
      ],
    },
  ],

  // ── SENIOR / PRODUCTION POOL ───────────────────────────────────────────────
  senior: [
    {
      id: 'sen_esports_ranks',
      industry: 'startup',
      topic: 'window',
      problemStatement: 'Rank the top 2 highest scoring esports players within each tournament team. Return team_name, player_name, and total_points.',
      explanation: 'Use DENSE_RANK() or ROW_NUMBER() partitioned by team_id ordered by total_points descending, then filter rank <= 2.',
      constraints: 'Order by team_name ASC, total_points DESC.',
      tables: [
        {
          name: 'teams',
          columns: [{ name: 'team_id', type: 'INTEGER' }, { name: 'team_name', type: 'TEXT' }],
          sampleData: [
            { team_id: 1, team_name: 'Vortex Gaming' },
            { team_id: 2, team_name: 'Titan Syndicate' },
            { team_id: 3, team_name: 'Apex Phantoms' },
          ],
        },
        {
          name: 'player_stats',
          columns: [{ name: 'player_id', type: 'INTEGER' }, { name: 'team_id', type: 'INTEGER' }, { name: 'player_name', type: 'TEXT' }, { name: 'total_points', type: 'INTEGER' }],
          sampleData: [
            { player_id: 1, team_id: 1, player_name: 'Zephyr', total_points: 3400 },
            { player_id: 2, team_id: 1, player_name: 'Blaze', total_points: 3100 },
            { player_id: 3, team_id: 1, player_name: 'Frost', total_points: 2700 },
            { player_id: 4, team_id: 2, player_name: 'Shadow', total_points: 4200 },
            { player_id: 5, team_id: 2, player_name: 'Viper', total_points: 3900 },
            { player_id: 6, team_id: 2, player_name: 'Rogue', total_points: 3500 },
            { player_id: 7, team_id: 3, player_name: 'Titan', total_points: 4600 },
            { player_id: 8, team_id: 3, player_name: 'Spectre', total_points: 4100 },
            { player_id: 9, team_id: 3, player_name: 'Ghost', total_points: 3800 },
          ],
        },
      ],
      expectedOutput: [
        { team_name: 'Apex Phantoms', player_name: 'Titan', total_points: 4600 },
        { team_name: 'Apex Phantoms', player_name: 'Spectre', total_points: 4100 },
        { team_name: 'Titan Syndicate', player_name: 'Shadow', total_points: 4200 },
        { team_name: 'Titan Syndicate', player_name: 'Viper', total_points: 3900 },
        { team_name: 'Vortex Gaming', player_name: 'Zephyr', total_points: 3400 },
        { team_name: 'Vortex Gaming', player_name: 'Blaze', total_points: 3100 },
      ],
    },
    {
      id: 'sen_rideshare_surge',
      industry: 'startup',
      topic: 'analytics',
      problemStatement: 'Identify ride-sharing drivers who have completed at least 2 trips with surge >= 1.5 and avg rating >= 4.8. Return driver_name, qualified_trips, and avg_rating.',
      explanation: 'Filter trips by surge >= 1.5, group by driver, and apply HAVING COUNT(*) >= 2 AND AVG(rating) >= 4.8.',
      constraints: 'Round avg_rating to 2 decimal places. Sort by qualified_trips DESC, avg_rating DESC.',
      tables: [
        {
          name: 'drivers',
          columns: [{ name: 'driver_id', type: 'INTEGER' }, { name: 'driver_name', type: 'TEXT' }],
          sampleData: [
            { driver_id: 1, driver_name: 'Marcus Chen' },
            { driver_id: 2, driver_name: 'Elena Rostova' },
            { driver_id: 3, driver_name: 'David Kim' },
            { driver_id: 4, driver_name: 'Sophia Patel' },
            { driver_id: 5, driver_name: 'James Wilson' },
          ],
        },
        {
          name: 'trips',
          columns: [{ name: 'trip_id', type: 'INTEGER' }, { name: 'driver_id', type: 'INTEGER' }, { name: 'surge_multiplier', type: 'REAL' }, { name: 'passenger_rating', type: 'REAL' }],
          sampleData: [
            { trip_id: 101, driver_id: 1, surge_multiplier: 1.8, passenger_rating: 5.0 },
            { trip_id: 102, driver_id: 1, surge_multiplier: 2.0, passenger_rating: 4.9 },
            { trip_id: 103, driver_id: 2, surge_multiplier: 1.6, passenger_rating: 4.2 },
            { trip_id: 104, driver_id: 2, surge_multiplier: 1.5, passenger_rating: 4.5 },
            { trip_id: 105, driver_id: 3, surge_multiplier: 1.7, passenger_rating: 5.0 },
            { trip_id: 106, driver_id: 3, surge_multiplier: 1.9, passenger_rating: 4.8 },
            { trip_id: 107, driver_id: 3, surge_multiplier: 1.5, passenger_rating: 4.9 },
            { trip_id: 108, driver_id: 4, surge_multiplier: 1.6, passenger_rating: 5.0 },
            { trip_id: 109, driver_id: 4, surge_multiplier: 1.7, passenger_rating: 4.9 },
            { trip_id: 110, driver_id: 5, surge_multiplier: 1.2, passenger_rating: 4.9 },
          ],
        },
      ],
      expectedOutput: [
        { driver_name: 'David Kim', qualified_trips: 3, avg_rating: 4.9 },
        { driver_name: 'Marcus Chen', qualified_trips: 2, avg_rating: 4.95 },
        { driver_name: 'Sophia Patel', qualified_trips: 2, avg_rating: 4.95 },
      ],
    },
    {
      id: 'sen_fintech_running_balance',
      industry: 'fintech',
      topic: 'window',
      problemStatement: 'Calculate the running account balance for account_id = 1001 ordered chronologically by transaction_date. Return txn_id, txn_date, amount, and running_balance.',
      explanation: 'Use SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_date ASC, txn_id ASC).',
      constraints: 'Filter for account_id = 1001. Sort by txn_date ASC, txn_id ASC.',
      tables: [
        {
          name: 'bank_ledger',
          columns: [{ name: 'txn_id', type: 'INTEGER' }, { name: 'account_id', type: 'INTEGER' }, { name: 'txn_date', type: 'TEXT' }, { name: 'amount', type: 'REAL' }],
          sampleData: [
            { txn_id: 1, account_id: 1001, txn_date: '2024-01-01', amount: 500.0 },
            { txn_id: 2, account_id: 1001, txn_date: '2024-01-03', amount: -150.0 },
            { txn_id: 3, account_id: 1002, txn_date: '2024-01-04', amount: 800.0 },
            { txn_id: 4, account_id: 1001, txn_date: '2024-01-05', amount: 200.0 },
            { txn_id: 5, account_id: 1001, txn_date: '2024-01-08', amount: -50.0 },
          ],
        },
      ],
      expectedOutput: [
        { txn_id: 1, txn_date: '2024-01-01', amount: 500.0, running_balance: 500.0 },
        { txn_id: 2, txn_date: '2024-01-03', amount: -150.0, running_balance: 350.0 },
        { txn_id: 4, txn_date: '2024-01-05', amount: 200.0, running_balance: 550.0 },
        { txn_id: 5, txn_date: '2024-01-08', amount: -50.0, running_balance: 500.0 },
      ],
    },
    {
      id: 'sen_saas_mom_growth',
      industry: 'data',
      topic: 'analytics',
      problemStatement: 'Calculate month-over-month active SaaS subscriber growth percentage for 2024. Return billing_month, active_subscribers, and mom_growth_pct.',
      explanation: 'Count distinct active subscribers by month, then use LAG() to compute ((current - previous) / previous) * 100.',
      constraints: 'Order chronologically by billing_month ASC. Format growth percentage rounded to 2 decimal places.',
      tables: [
        {
          name: 'subscription_logs',
          columns: [{ name: 'tenant_id', type: 'INTEGER' }, { name: 'billing_month', type: 'TEXT' }],
          sampleData: [
            { tenant_id: 1, billing_month: '2024-01' },
            { tenant_id: 2, billing_month: '2024-01' },
            { tenant_id: 3, billing_month: '2024-01' },
            { tenant_id: 1, billing_month: '2024-02' },
            { tenant_id: 2, billing_month: '2024-02' },
            { tenant_id: 3, billing_month: '2024-02' },
            { tenant_id: 4, billing_month: '2024-02' },
            { tenant_id: 5, billing_month: '2024-02' },
            { tenant_id: 1, billing_month: '2024-03' },
            { tenant_id: 2, billing_month: '2024-03' },
            { tenant_id: 3, billing_month: '2024-03' },
            { tenant_id: 4, billing_month: '2024-03' },
            { tenant_id: 5, billing_month: '2024-03' },
            { tenant_id: 6, billing_month: '2024-03' },
            { tenant_id: 7, billing_month: '2024-03' },
          ],
        },
      ],
      expectedOutput: [
        { billing_month: '2024-01', active_subscribers: 3, mom_growth_pct: null },
        { billing_month: '2024-02', active_subscribers: 5, mom_growth_pct: 66.67 },
        { billing_month: '2024-03', active_subscribers: 7, mom_growth_pct: 40.0 },
      ],
    },
  ],

  // ── MASTER / STAFF ARCHITECT POOL ──────────────────────────────────────────
  master: [
    {
      id: 'mas_gaps_islands',
      industry: 'faang',
      topic: 'optimization',
      problemStatement: 'Identify consecutive login streaks of 3 or more days for each user (Gaps & Islands). Return user_id, streak_start, and streak_days, sorted by streak_days descending.',
      explanation: 'Use DATE(login_date, -ROW_NUMBER() OVER ...) to group contiguous days into islands, then filter COUNT(*) >= 3.',
      constraints: 'Sort by streak_days DESC, user_id ASC.',
      tables: [
        {
          name: 'user_logins',
          columns: [{ name: 'user_id', type: 'INTEGER' }, { name: 'login_date', type: 'TEXT' }],
          sampleData: [
            { user_id: 1, login_date: '2024-01-01' },
            { user_id: 1, login_date: '2024-01-02' },
            { user_id: 1, login_date: '2024-01-03' },
            { user_id: 1, login_date: '2024-01-04' },
            { user_id: 2, login_date: '2024-01-01' },
            { user_id: 2, login_date: '2024-01-03' },
            { user_id: 3, login_date: '2024-01-05' },
            { user_id: 3, login_date: '2024-01-06' },
            { user_id: 3, login_date: '2024-01-07' },
          ],
        },
      ],
      expectedOutput: [
        { user_id: 1, streak_start: '2024-01-01', streak_days: 4 },
        { user_id: 3, streak_start: '2024-01-05', streak_days: 3 },
      ],
    },
    {
      id: 'mas_cohort_retention',
      industry: 'ecommerce',
      topic: 'analytics',
      problemStatement: 'Calculate the month-1 customer retention percentage for users acquired in 2024-01. Return signup_month, active_users_m0, active_users_m1, and retention_rate_pct.',
      explanation: 'Track users registered in month 0 who also made an order in month 1, dividing active_users_m1 by active_users_m0.',
      constraints: 'Round retention_rate_pct to 2 decimal places.',
      tables: [
        {
          name: 'signups',
          columns: [{ name: 'user_id', type: 'INTEGER' }, { name: 'signup_month', type: 'TEXT' }],
          sampleData: [
            { user_id: 101, signup_month: '2024-01' },
            { user_id: 102, signup_month: '2024-01' },
            { user_id: 103, signup_month: '2024-01' },
            { user_id: 104, signup_month: '2024-01' },
          ],
        },
        {
          name: 'monthly_activity',
          columns: [{ name: 'user_id', type: 'INTEGER' }, { name: 'activity_month', type: 'TEXT' }],
          sampleData: [
            { user_id: 101, activity_month: '2024-02' },
            { user_id: 102, activity_month: '2024-02' },
            { user_id: 103, activity_month: '2024-03' },
          ],
        },
      ],
      expectedOutput: [
        { signup_month: '2024-01', active_users_m0: 4, active_users_m1: 2, retention_rate_pct: 50.0 },
      ],
    },
  ],
};

// ─── Level-Tailored MCQ Pools ────────────────────────────────────────────────

const FALLBACK_MCQS = {
  beginner: [
    { question: 'What is the primary difference between WHERE and HAVING in SQL?', options: ['WHERE filters rows before grouping; HAVING filters aggregated groups', 'HAVING filters rows before grouping; WHERE filters after grouping', 'They are completely interchangeable aliases', 'HAVING only works with string columns'], correctIndex: 0, explanation: 'WHERE evaluates individual rows prior to GROUP BY. HAVING evaluates aggregated group metrics.' },
    { question: 'What happens when you run COUNT(column_name) on a column with NULL values?', options: ['NULL values are ignored and not counted', 'NULL values raise a runtime error', 'NULL values are converted to zero', 'All rows including NULLs are counted'], correctIndex: 0, explanation: 'COUNT(column) skips NULL values, while COUNT(*) counts every record in the table.' },
    { question: 'Which SQL keyword is used to remove duplicate rows from a query result set?', options: ['DISTINCT', 'UNIQUE', 'GROUP', 'DEDUPE'], correctIndex: 0, explanation: 'The DISTINCT keyword in the SELECT clause removes duplicate rows from the final result set.' },
    { question: 'What is the default sort order when ORDER BY is specified without ASC or DESC?', options: ['ASC (Ascending)', 'DESC (Descending)', 'Random order', 'Primary key order'], correctIndex: 0, explanation: 'In standard SQL, ORDER BY defaults to ascending (ASC) order if not specified.' },
    { question: 'What does an INNER JOIN return between Table A and Table B?', options: ['Only rows where there is a matching key in both tables', 'All rows from Table A regardless of Table B', 'All rows from both tables filled with NULLs', 'A Cartesian product of all rows'], correctIndex: 0, explanation: 'INNER JOIN selects records that have matching values in both joined tables.' },
  ],
  intermediate: [
    { question: 'What does LEFT JOIN return when there is no matching row in the right table?', options: ['NULL for right table columns', 'The row is excluded', 'An error is raised', 'Zero for numeric columns'], correctIndex: 0, explanation: 'LEFT JOIN preserves all rows from the left table and fills right table columns with NULL if no match exists.' },
    { question: 'What is the result of evaluating NULL = NULL in standard SQL three-valued logic?', options: ['NULL (Unknown)', 'TRUE', 'FALSE', 'Syntax error'], correctIndex: 0, explanation: 'In SQL three-valued logic, any comparison with NULL evaluates to NULL (unknown). Use IS NULL to check for nulls.' },
    { question: 'How does COALESCE(col1, col2, "N/A") operate in SQL?', options: ['Returns the first non-NULL expression from the list', 'Returns the concatenation of all columns', 'Returns NULL if any argument is NULL', 'Converts all values into strings'], correctIndex: 0, explanation: 'COALESCE evaluates arguments in sequence and returns the first non-null value.' },
    { question: 'What is the logical query processing order in standard SQL?', options: ['FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY', 'SELECT -> FROM -> WHERE -> GROUP BY -> ORDER BY', 'WHERE -> FROM -> SELECT -> GROUP BY -> HAVING', 'FROM -> SELECT -> WHERE -> HAVING -> ORDER BY'], correctIndex: 0, explanation: 'SQL conceptually begins by determining the data sources in FROM, filtering with WHERE, grouping with GROUP BY, filtering groups with HAVING, evaluating projections in SELECT, and finally ordering results with ORDER BY.' },
    { question: 'When is the IN operator required instead of the = operator for subqueries in a WHERE clause?', options: ['When the subquery can return multiple rows', 'When the subquery returns NULL', 'When joining across different database engines', 'When comparing float numbers'], correctIndex: 0, explanation: 'The equality operator = expects a single scalar value. When a subquery can return multiple records, IN or ANY must be used.' },
  ],
  senior: [
    { question: 'What is the key difference between RANK() and DENSE_RANK() in window functions?', options: ['RANK() leaves gaps in sequence numbers after ties; DENSE_RANK() leaves no gaps', 'DENSE_RANK() sorts descending while RANK() sorts ascending', 'RANK() is only for numeric columns', 'They produce identical values in all cases'], correctIndex: 0, explanation: 'When ties occur, RANK() skips subsequent ranking positions (e.g. 1, 1, 3), whereas DENSE_RANK() produces consecutive rank numbers (e.g. 1, 1, 2).' },
    { question: 'What is a covering index in database optimization?', options: ['An index that includes all columns needed by a query, avoiding table heap lookups', 'An index on every column in a table', 'An index that covers foreign keys only', 'A full-text search index'], correctIndex: 0, explanation: 'A covering index contains all columns referenced in the SELECT, WHERE, and JOIN clauses, enabling the engine to fulfill the query directly from index pages.' },
    { question: 'In window functions, what is the default frame when ORDER BY is present without a ROWS/RANGE clause?', options: ['RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING', 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING', 'RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING'], correctIndex: 0, explanation: 'When ORDER BY is specified without an explicit frame, SQL defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, causing ties to be aggregated together.' },
    { question: 'Which transaction isolation level completely prevents dirty reads, non-repeatable reads, and phantom reads?', options: ['SERIALIZABLE', 'REPEATABLE READ', 'READ COMMITTED', 'READ UNCOMMITTED'], correctIndex: 0, explanation: 'SERIALIZABLE is the highest isolation level and provides full serial execution guarantees, eliminating dirty reads, non-repeatable reads, and phantom rows.' },
    { question: 'What is the performance implication of a Cartesian product (CROSS JOIN) between two tables of size N and M?', options: ['It generates N * M rows, causing exponential quadratic execution overhead', 'The database optimizer automatically rewrites it into an index scan', 'It runs in O(N + M) linear time', 'It causes a table corruption error in SQLite'], correctIndex: 0, explanation: 'Unconstrained joins generate an N x M result set, which quickly exhausts memory and causes severe I/O degradation on non-trivial datasets.' },
  ],
  master: [
    { question: 'How does Multi-Version Concurrency Control (MVCC) eliminate read-write blocking in modern databases?', options: ['Readers read snapshot versions without acquiring shared locks against concurrent writers', 'Writers immediately terminate any reading transactions', 'All queries are buffered into an in-memory queue', 'Tables are cloned into temp files on every query'], correctIndex: 0, explanation: 'MVCC maintains multiple version tuples of data records, allowing read operations to access historical snapshots without conflicting with active write transactions.' },
    { question: 'What is lock escalation in relational database engines?', options: ['Converting many fine-grained row/page locks into a single table lock when lock memory thresholds are exceeded', 'Escalating read locks to write locks automatically', 'Granting admin privileges during a deadlock', 'Promoting a non-clustered index into a clustered index'], correctIndex: 0, explanation: 'Lock escalation occurs when the database manager converts numerous individual row locks into an exclusive table lock to conserve lock memory, reducing concurrency.' },
    { question: 'What is the danger of an unindexed correlated subquery inside a large SELECT projection?', options: ['It forces row-by-row nested loop execution (O(N*M)) rather than a set-based hash/merge join', 'It always raises a division by zero error', 'It corrupts the write-ahead log', 'It forces an automatic server restart'], correctIndex: 0, explanation: 'Correlated subqueries in the projection evaluate once per outer row, resulting in pathological O(N*M) performance when unindexed.' },
    { question: 'What is the role of a Write-Ahead Log (WAL) checkpoint in database durability?', options: ['Flushes modified pages from memory buffer pool to data files and updates the checkpoint LSN', 'Deletes all indexes to rebuild them faster', 'Terminates idle client connections', 'Compresses archived transaction logs into zip files'], correctIndex: 0, explanation: 'Checkpointing synchronizes dirty pages from the buffer cache to persistent storage, establishing a recovery point and enabling log truncation.' },
    { question: 'How does a cost-based optimizer (CBO) choose between a Hash Join and an Index Nested Loop Join?', options: ['It estimates cardinality and compares disk I/O / CPU costs based on table statistics and index selectivity', 'It always chooses Hash Join for all queries', 'It picks whichever table was created first in DDL', 'It checks user role permissions'], correctIndex: 0, explanation: 'The CBO calculates mathematical cost estimates based on catalog statistics, column histograms, and whether selective indexes exist on join keys.' },
  ],
};

// ─── Dynamic Fallback Generator ──────────────────────────────────────────────

const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

const buildFallbackSession = ({ difficulty = 'intermediate', companyName = 'FAANG', roleName = 'Data Engineer', focusTopic = 'all' } = {}) => {
  const normDiff = ['beginner', 'intermediate', 'senior', 'master', 'mixed', 'easy', 'medium', 'hard'].includes(String(difficulty).toLowerCase())
    ? String(difficulty).toLowerCase()
    : 'intermediate';

  const diffKey = normDiff === 'easy' ? 'beginner' : normDiff === 'medium' ? 'intermediate' : normDiff === 'hard' ? 'senior' : normDiff;

  let selectedSql = [];

  if (diffKey === 'beginner') {
    // 5 beginner questions
    const pool = shuffle(FALLBACK_CATALOG.beginner);
    selectedSql = pool.slice(0, 5);
  } else if (diffKey === 'intermediate') {
    // 5 intermediate questions
    const pool = shuffle(FALLBACK_CATALOG.intermediate);
    selectedSql = pool.slice(0, 5);
  } else if (diffKey === 'senior') {
    // 5 senior questions
    const pool = shuffle(FALLBACK_CATALOG.senior);
    selectedSql = pool.slice(0, 5);
  } else if (diffKey === 'master') {
    // Combine master + senior for a deep 5-question test
    const pool = shuffle([...FALLBACK_CATALOG.master, ...FALLBACK_CATALOG.senior]);
    selectedSql = pool.slice(0, 5);
  } else {
    // Mixed adaptive ladder: 1 beginner, 2 intermediate, 1 senior, 1 master
    const b = shuffle(FALLBACK_CATALOG.beginner)[0];
    const i = shuffle(FALLBACK_CATALOG.intermediate).slice(0, 2);
    const s = shuffle(FALLBACK_CATALOG.senior)[0];
    const m = shuffle(FALLBACK_CATALOG.master)[0];
    selectedSql = [b, ...i, s, m].filter(Boolean);
  }

  // Ensure 5 questions minimum by padding with other tiers if needed
  if (selectedSql.length < 5) {
    const allRemaining = shuffle([
      ...FALLBACK_CATALOG.intermediate,
      ...FALLBACK_CATALOG.senior,
      ...FALLBACK_CATALOG.beginner,
    ]);
    for (const q of allRemaining) {
      if (!selectedSql.some(s => s.id === q.id)) {
        selectedSql.push(q);
        if (selectedSql.length >= 5) break;
      }
    }
  }

  // Build initSql for each question
  const sql_questions = selectedSql.slice(0, 5).map(q => {
    const clone = { ...q };
    clone.initSql = buildInitSqlFromTables(clone.tables);
    return clone;
  });

  // Select level-appropriate MCQs
  const mcqPool = FALLBACK_MCQS[diffKey] || FALLBACK_MCQS.intermediate;
  const mcq_questions = shuffle(mcqPool).slice(0, 5);

  return { sql_questions, mcq_questions };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useInterviewSession({
  duration,
  difficulty,
  companyName,
  candidateName,
  roleName,
  mode = 'standard',
  focusTopic = 'all',
  restoreSessionState,
  saveSessionState,
  isTerminated,
  handleFinalSubmit,
  toast,
}) {
  // Dedicated DB for all SQL questions in this session
  const { dbStatus, dbError, initDb, executeQuery } = useInterviewDatabase();

  // ── Session state ─────────────────────────────────────────────────────────
  const [sessionData, setSessionData]       = useState(null); // { sql_questions: [], mcq_questions: [] }
  const [currentIndex, setCurrentIndex]     = useState(0);    // 0-9
  const [answers, setAnswers]               = useState(Array(10).fill(null));

  const [generating, setGenerating]         = useState(true);
  const [dbSwitching, setDbSwitching]       = useState(false);
  const [timeLeft, setTimeLeft]             = useState(duration * 60);
  const [chatMessages, setChatMessages]     = useState([]); // shared AI chat

  const isSubmittedRef = useRef(false);
  const questionInitSqlsRef = useRef([]); // initSql per SQL question [0..4]

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isMCQ       = currentIndex >= 5;
  const sqlIndex    = isMCQ ? null : currentIndex;
  const mcqIndex    = isMCQ ? currentIndex - 5 : null;
  const currentQuestion = sessionData
    ? (isMCQ ? sessionData.mcq_questions?.[mcqIndex] : sessionData.sql_questions?.[sqlIndex])
    : null;
  const totalQuestions = 10;

  // ── Switch DB when navigating between SQL questions ───────────────────────
  useEffect(() => {
    if (!sessionData || isMCQ) return;
    const initSql = questionInitSqlsRef.current[currentIndex];
    if (!initSql) return;

    setDbSwitching(true);
    initDb(initSql).catch(err => {
      console.error('[InterviewSession] DB switch failed:', err.message);
      toast({ title: 'Database Error', message: `Could not load schema for Q${currentIndex + 1}.`, type: 'error' });
    }).finally(() => setDbSwitching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, sessionData]);

  // ── Parse and validate AI response ───────────────────────────────────────
  const parseSessionData = (raw) => {
    let parsed = null;
    let cleaned = String(raw || '').replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      try {
        const noTrailing = cleaned.replace(/,\s*([\]}])/g, '$1');
        parsed = JSON.parse(noTrailing);
      } catch {
        try {
          let candidate = cleaned;
          const openBraces = (candidate.match(/\{/g) || []).length;
          const closeBraces = (candidate.match(/\}/g) || []).length;
          const openBrackets = (candidate.match(/\[/g) || []).length;
          const closeBrackets = (candidate.match(/\]/g) || []).length;

          if (openBrackets > closeBrackets) {
            candidate += ']'.repeat(openBrackets - closeBrackets);
          }
          if (openBraces > closeBraces) {
            candidate += '}'.repeat(openBraces - closeBraces);
          }
          parsed = JSON.parse(candidate);
        } catch {}
      }
    }

    const fallback = buildFallbackSession({ difficulty, companyName, roleName, focusTopic });
    let sqlQuestions = parsed?.sql_questions || parsed?.data?.sql_questions || parsed?.session?.sql_questions;
    let mcqQuestions = parsed?.mcq_questions || parsed?.data?.mcq_questions || parsed?.session?.mcq_questions;

    if (!Array.isArray(sqlQuestions) || sqlQuestions.length === 0) {
      sqlQuestions = fallback.sql_questions;
    }
    if (!Array.isArray(mcqQuestions) || mcqQuestions.length === 0) {
      mcqQuestions = fallback.mcq_questions;
    }

    const sqlQs = [...sqlQuestions.slice(0, 5)];
    while (sqlQs.length < 5) {
      sqlQs.push(fallback.sql_questions[sqlQs.length]);
    }

    const mcqQs = [...mcqQuestions.slice(0, 5)];
    while (mcqQs.length < 5) {
      mcqQs.push(fallback.mcq_questions[mcqQs.length]);
    }

    const sanitizedSqlQs = sqlQs.map(q => ({
      ...q,
      initSql: sanitizeInitSql(q.initSql, q.tables),
    }));

    return { sql_questions: sanitizedSqlQs, mcq_questions: mcqQs };
  };

  // ── Main initialization ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isExplicitNewSession = urlParams.get('newSession') === '1';

      // 1. Try to restore saved session if NOT explicitly requested as new
      if (!isExplicitNewSession && typeof restoreSessionState === 'function') {
        const saved = restoreSessionState();
        if (saved?.sessionData?.sql_questions && saved.sessionData.sql_questions.length === 5) {
          if (!cancelled) {
            saved.sessionData.sql_questions.forEach((q, i) => {
              questionInitSqlsRef.current[i] = q.initSql || null;
            });

            setSessionData(saved.sessionData);
            setCurrentIndex(saved.currentIndex ?? 0);
            setAnswers(saved.answers ?? Array(10).fill(null));
            setTimeLeft(saved.timeLeft ?? duration * 60);
            setChatMessages(saved.chatMessages ?? []);
            setGenerating(false);
          }
          return;
        }
      }

      // 2. Generate fresh session matching chosen parameters
      try {
        const raw = await generateFullInterviewSession({
          difficulty,
          companyName,
          candidateName,
          roleName,
          focusTopic,
          mode,
        });

        if (cancelled) return;
        if (!raw) throw new Error('Empty AI response');

        const data = parseSessionData(raw);

        data.sql_questions.forEach((q, i) => {
          questionInitSqlsRef.current[i] = q.initSql || null;
        });

        if (!cancelled) {
          const welcomeMsg = {
            role: 'assistant',
            content: `Welcome to your **${companyName}** ${difficulty.toUpperCase()} ${mode === 'learning' ? 'learning workshop' : 'interview'}, **${candidateName}**! 🎯\n\nThis session contains **5 hands-on SQL problems** and **5 conceptual questions** tailored specifically for a **${roleName}** track.\n\n- Questions 1–5 have live, dedicated SQLite databases for execution.\n- Questions 6–10 test key core SQL mechanics.\n\nTake your time, write your queries, and run them to verify results! Good luck! 💪`,
          };

          setSessionData(data);
          setChatMessages([welcomeMsg]);
          setGenerating(false);

          saveSessionState({
            sessionData: data,
            currentIndex: 0,
            answers: Array(10).fill(null),
            timeLeft: duration * 60,
            chatMessages: [welcomeMsg],
          });
        }
      } catch (err) {
        console.error('[InterviewSession] Session generation using dynamic fallback:', err.message);
        if (!cancelled) {
          const fallback = buildFallbackSession({ difficulty, companyName, roleName, focusTopic });
          fallback.sql_questions.forEach((q, i) => {
            questionInitSqlsRef.current[i] = q.initSql || null;
          });
          setSessionData(fallback);
          setGenerating(false);

          let errorNote = `Curated ${difficulty.toUpperCase()} question set loaded.`;
          if (err.message === 'BAD_KEY') {
            errorNote = 'Your Groq API key is invalid (401). Using curated questions.';
            toast({ title: 'Invalid Groq API Key', message: 'Update your Groq API key in Settings → AI Configuration.', type: 'error' });
          } else if (err.message === 'MISSING_API_KEY') {
            errorNote = 'Using built-in curriculum tailored to your selected level.';
            toast({ title: 'Curated Question Set', message: `Loaded 10 ${difficulty.toUpperCase()} questions for ${companyName}.`, type: 'info' });
          } else {
            toast({ title: 'Curriculum Active', message: `Loaded tailored ${difficulty.toUpperCase()} session for ${companyName}.`, type: 'info' });
          }

          setChatMessages([{
            role: 'assistant',
            content: `Welcome to your **${companyName}** ${difficulty.toUpperCase()} session! 🎯\n\n${errorNote}\n\nWork through the 5 SQL challenges and 5 conceptual questions at your own pace.`
          }]);
        }
      }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigate between questions ────────────────────────────────────────────
  const navigateTo = useCallback((index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
    }
  }, [totalQuestions]);

  const goNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // ── Save answer for current question ──────────────────────────────────────
  const saveAnswer = useCallback((answerData) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = answerData;
      return next;
    });
  }, [currentIndex]);

  // ── Timer countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (generating || isTerminated || isSubmittedRef.current) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generating, isTerminated, handleFinalSubmit]);

  // ── Auto-save session state every 5 seconds ───────────────────────────────
  useEffect(() => {
    if (generating || !sessionData) return;

    const interval = setInterval(() => {
      saveSessionState({
        sessionData,
        currentIndex,
        answers,
        timeLeft,
        chatMessages,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionData, currentIndex, answers, timeLeft, chatMessages, saveSessionState, generating]);

  return {
    sessionData,
    currentIndex,
    currentQuestion,
    isMCQ,
    sqlIndex,
    mcqIndex,
    totalQuestions,
    answers,
    saveAnswer,
    navigateTo,
    goNext,
    goPrev,
    generating,
    dbStatus,
    dbSwitching,
    timeLeft,
    chatMessages,
    setChatMessages,
    isSubmittedRef,
    executeQuery,
  };
}
