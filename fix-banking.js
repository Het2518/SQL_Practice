import fs from 'fs';
import path from 'path';

const file = path.join('src/data/databases', 'banking.sql');
let c = fs.readFileSync(file, 'utf-8');

// 1. branches.manager_employee_id
c = c.replace(/manager_employee_id INTEGER/g, 'manager_employee_id INTEGER REFERENCES employees(employee_id)');

// 2. accounts - add rate_id
// Accounts table originally:
// CREATE TABLE IF NOT EXISTS accounts (
//   account_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id),
//   branch_id INTEGER REFERENCES branches(branch_id), type TEXT, balance REAL,
//   opened_at DATE, overdraft_limit REAL DEFAULT 0, is_active INTEGER DEFAULT 1
// );

c = c.replace(
  /CREATE TABLE IF NOT EXISTS accounts \([\s\S]*?is_active INTEGER DEFAULT 1\s*\);/,
  `CREATE TABLE IF NOT EXISTS accounts (
  account_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id),
  branch_id INTEGER REFERENCES branches(branch_id), type TEXT, balance REAL,
  opened_at DATE, overdraft_limit REAL DEFAULT 0, is_active INTEGER DEFAULT 1,
  rate_id INTEGER REFERENCES interest_rates(rate_id)
);`
);

// We need to update INSERT INTO accounts values.
// Original insert has 50 accounts: (account_id, customer_id, branch_id, type, balance, opened_at, overdraft_limit, is_active)
// Let's replace the whole INSERT block dynamically using a replacer function.

c = c.replace(/INSERT INTO accounts VALUES\s*([\s\S]*?);/, (match, valuesBlock) => {
  // valuesBlock contains `(1,1,1,'Savings',5000.00,'2020-01-15',0,1),\n  (2,2,1,'Checking'...`
  const newValues = valuesBlock.trim().split(/\s*\),\s*\(/).map(row => {
    // remove leading '(' and trailing ')'
    let cleanRow = row.replace(/^\(/, '').replace(/\)$/, '');
    const parts = cleanRow.split(',');
    const type = parts[3].replace(/'/g, '').trim(); // e.g. 'Savings' or 'Checking'
    // Rate mapping based on current interest_rates values (e.g. 5 is current Savings, 6 is current Checking)
    // Rate IDs in DB:
    // (1,'Savings',2.5,'2020-01-01',NULL),
    // (2,'Checking',0.5,'2020-01-01',NULL),
    // Let's just use 1 for Savings, 2 for Checking
    const rateId = type === 'Savings' ? 1 : (type === 'Checking' ? 2 : (type === 'Credit' ? 7 : (type === 'Business' ? 8 : 1)));
    return `(${cleanRow},${rateId})`;
  }).join(',\n  ');
  return `INSERT INTO accounts VALUES\n  ${newValues};`;
});

fs.writeFileSync(file, c);
console.log('Fixed banking.sql');
