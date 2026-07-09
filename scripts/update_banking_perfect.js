import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.join(__dirname, '../src/data/questions/banking.jsx');

const code = `const noRows = {
  columns: [],
  rows: []
};

const make = (id, db, diff, kw, prompt, h1, h2, h3, sql) => ({
  id,
  db,
  difficulty: diff,
  keywords: kw,
  prompt,
  hint1: h1,
  hint2: h2,
  hint3: h3,
  solutionSQL: sql,
  expectedResult: noRows
});

// BANKING QUESTIONS (IDs 1-60)
export const bankingQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(1, 'banking', 'easy', ['topic:Basic SQL', 'Where', 'company:JPMorgan'], 
    "Find all branches located in 'New York'. Return the branch name and city.", 
    "Filter by city.", "Use WHERE city = 'New York'.", 
    "SELECT name, city FROM branches WHERE city = 'New York';", 
    "SELECT name, city FROM branches WHERE city = 'New York';"),

  make(2, 'banking', 'easy', ['topic:String Functions', 'Basic SQL', 'company:GoldmanSachs'], 
    "Format customer names for mailing labels. Return a single column 'full_name' with the format 'Lastname, Firstname' for all customers.", 
    "Concatenate last_name, a comma and space, and first_name.", "Use the || operator in SQLite.", 
    "SELECT last_name || ', ' || first_name AS full_name FROM customers;", 
    "SELECT last_name || ', ' || first_name AS full_name FROM customers;"),

  make(3, 'banking', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Citi'], 
    "What is the average salary of all bank employees? Return the average as 'avg_salary' rounded to 2 decimal places.", 
    "Use AVG() on the salary column.", "Use ROUND() for formatting.", 
    "SELECT ROUND(AVG(salary), 2) AS avg_salary FROM employees;", 
    "SELECT ROUND(AVG(salary), 2) AS avg_salary FROM employees;"),

  make(4, 'banking', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:MorganStanley'], 
    "Identify customers who haven't provided a phone number. Return their customer_id, first_name, and last_name.", 
    "Check if phone is NULL.", "Use WHERE phone IS NULL.", 
    "SELECT customer_id, first_name, last_name FROM customers WHERE phone IS NULL;", 
    "SELECT customer_id, first_name, last_name FROM customers WHERE phone IS NULL;"),

  make(5, 'banking', 'easy', ['topic:Data Analysis', 'Group By', 'company:BankOfAmerica'], 
    "Count the number of accounts of each type. Return the type and the count.", 
    "Group by type in the accounts table.", "Use COUNT(*).", 
    "SELECT type, COUNT(*) AS account_count FROM accounts GROUP BY type;", 
    "SELECT type, COUNT(*) AS account_count FROM accounts GROUP BY type;"),

  make(6, 'banking', 'easy', ['topic:Date Functions', 'Where', 'company:CapitalOne'], 
    "Find all loans that were disbursed in the year 2021. Return the loan_id and disbursed_at date.", 
    "Use LIKE or strftime to filter the date.", "WHERE disbursed_at LIKE '2021-%'", 
    "SELECT loan_id, disbursed_at FROM loans WHERE disbursed_at LIKE '2021-%';", 
    "SELECT loan_id, disbursed_at FROM loans WHERE disbursed_at LIKE '2021-%';"),

  make(7, 'banking', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:HSBC'], 
    "How many unique cities have bank branches? Return the count as 'unique_cities'.", 
    "Use COUNT(DISTINCT city).", "Query the branches table.", 
    "SELECT COUNT(DISTINCT city) AS unique_cities FROM branches;", 
    "SELECT COUNT(DISTINCT city) AS unique_cities FROM branches;"),

  make(8, 'banking', 'easy', ['topic:Data Analysis', 'Order By', 'company:WellsFargo'], 
    "Find the top 3 highest balances in the accounts table. Return the account_id and balance.", 
    "Sort by balance in descending order.", "Limit to 3.", 
    "SELECT account_id, balance FROM accounts ORDER BY balance DESC LIMIT 3;", 
    "SELECT account_id, balance FROM accounts ORDER BY balance DESC LIMIT 3;"),

  make(9, 'banking', 'easy', ['topic:Basic SQL', 'In', 'company:Barclays'], 
    "Find all transactions that were either a 'Fee' or a 'Payment'. Return the txn_id, type, and amount.", 
    "Use the IN operator on the type column.", "WHERE type IN ('Fee', 'Payment')", 
    "SELECT txn_id, type, amount FROM transactions WHERE type IN ('Fee', 'Payment');", 
    "SELECT txn_id, type, amount FROM transactions WHERE type IN ('Fee', 'Payment');"),

  make(10, 'banking', 'easy', ['topic:Basic SQL', 'Limit', 'company:UBS'], 
    "List the 5 most recently opened accounts. Return the account_id and opened_at date.", 
    "Sort by opened_at descending.", "Limit to 5.", 
    "SELECT account_id, opened_at FROM accounts ORDER BY opened_at DESC LIMIT 5;", 
    "SELECT account_id, opened_at FROM accounts ORDER BY opened_at DESC LIMIT 5;"),

  make(11, 'banking', 'easy', ['topic:Aggregate Functions', 'Math', 'company:JPMorgan'], 
    "Calculate the total sum of all loan principals. Return it as 'total_loan_amount'.", 
    "Use SUM() on the principal column in loans.", "No grouping needed.", 
    "SELECT SUM(principal) AS total_loan_amount FROM loans;", 
    "SELECT SUM(principal) AS total_loan_amount FROM loans;"),

  make(12, 'banking', 'easy', ['topic:Data Cleaning', 'Like', 'company:GoldmanSachs'], 
    "Find all employees whose role title contains 'Manager'. Return their first_name, last_name, and role.", 
    "Use LIKE '%Manager%'.", "Filter on the role column.", 
    "SELECT first_name, last_name, role FROM employees WHERE role LIKE '%Manager%';", 
    "SELECT first_name, last_name, role FROM employees WHERE role LIKE '%Manager%';"),

  make(13, 'banking', 'easy', ['topic:Basic SQL', 'Where', 'company:Citi'], 
    "Find all active accounts (is_active = 1) that have a balance below $1,000. Return account_id and balance.", 
    "Use multiple conditions in the WHERE clause.", "WHERE is_active = 1 AND balance < 1000", 
    "SELECT account_id, balance FROM accounts WHERE is_active = 1 AND balance < 1000;", 
    "SELECT account_id, balance FROM accounts WHERE is_active = 1 AND balance < 1000;"),

  make(14, 'banking', 'easy', ['topic:Date Functions', 'String Functions', 'company:MorganStanley'], 
    "Extract the birth year of every customer. Return the customer_id and the birth year (as 'birth_year').", 
    "Use substr() or strftime('%Y', dob).", "Select from the customers table.", 
    "SELECT customer_id, strftime('%Y', dob) AS birth_year FROM customers;", 
    "SELECT customer_id, strftime('%Y', dob) AS birth_year FROM customers;"),

  make(15, 'banking', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:BankOfAmerica'], 
    "Count the number of employees in each branch. Return branch_id and employee_count.", 
    "Group by branch_id in the employees table.", "Use COUNT(employee_id).", 
    "SELECT branch_id, COUNT(employee_id) AS employee_count FROM employees GROUP BY branch_id;", 
    "SELECT branch_id, COUNT(employee_id) AS employee_count FROM employees GROUP BY branch_id;"),

  make(16, 'banking', 'easy', ['topic:Basic SQL', 'Math', 'company:CapitalOne'], 
    "Find accounts that are in overdraft (balance < 0). Return the account_id and balance.", 
    "Filter for balance < 0.", "Look at the accounts table.", 
    "SELECT account_id, balance FROM accounts WHERE balance < 0;", 
    "SELECT account_id, balance FROM accounts WHERE balance < 0;"),

  make(17, 'banking', 'easy', ['topic:Data Analysis', 'Group By', 'company:HSBC'], 
    "Find out how many transactions occurred for each transaction type. Return type and transaction_count.", 
    "Group by type in transactions.", "Use COUNT(*).", 
    "SELECT type, COUNT(*) AS transaction_count FROM transactions GROUP BY type;", 
    "SELECT type, COUNT(*) AS transaction_count FROM transactions GROUP BY type;"),

  make(18, 'banking', 'easy', ['topic:Basic SQL', 'Where', 'company:WellsFargo'], 
    "Find any loan payments that were marked as late. Return the payment_id and loan_id.", 
    "Filter for is_late = 1.", "Look in loan_payments.", 
    "SELECT payment_id, loan_id FROM loan_payments WHERE is_late = 1;", 
    "SELECT payment_id, loan_id FROM loan_payments WHERE is_late = 1;"),

  make(19, 'banking', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Barclays'], 
    "What is the maximum overdraft limit offered on any account? Return as 'max_limit'.", 
    "Use MAX(overdraft_limit).", "Query the accounts table.", 
    "SELECT MAX(overdraft_limit) AS max_limit FROM accounts;", 
    "SELECT MAX(overdraft_limit) AS max_limit FROM accounts;"),

  make(20, 'banking', 'easy', ['topic:Basic SQL', 'Where', 'company:UBS'], 
    "Find all interest rates that are currently active (effective_to is NULL). Return rate_id, account_type, and annual_rate.", 
    "Filter for effective_to IS NULL.", "Check the interest_rates table.", 
    "SELECT rate_id, account_type, annual_rate FROM interest_rates WHERE effective_to IS NULL;", 
    "SELECT rate_id, account_type, annual_rate FROM interest_rates WHERE effective_to IS NULL;"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(21, 'banking', 'medium', ['topic:Joins', 'Math', 'company:JPMorgan'], 
    "For customer_id 1, calculate their total net worth within the bank by summing up all their account balances. Return the first_name, last_name, and total_balance.", 
    "Join customers and accounts.", "Sum the balance, filter for customer 1.", 
    "SELECT c.first_name, c.last_name, SUM(a.balance) AS total_balance FROM customers c JOIN accounts a ON c.customer_id = a.customer_id WHERE c.customer_id = 1 GROUP BY c.customer_id;", 
    "SELECT c.first_name, c.last_name, SUM(a.balance) AS total_balance FROM customers c JOIN accounts a ON c.customer_id = a.customer_id WHERE c.customer_id = 1 GROUP BY c.customer_id;"),

  make(22, 'banking', 'medium', ['topic:Joins', 'Data Analysis', 'company:GoldmanSachs'], 
    "List all employees and the name of the branch they work at. Return employee first_name, last_name, and branch name.", 
    "Join employees and branches on branch_id.", "Select the appropriate columns.", 
    "SELECT e.first_name, e.last_name, b.name FROM employees e JOIN branches b ON e.branch_id = b.branch_id;", 
    "SELECT e.first_name, e.last_name, b.name FROM employees e JOIN branches b ON e.branch_id = b.branch_id;"),

  make(23, 'banking', 'medium', ['topic:Joins', 'Self Join', 'company:Citi'], 
    "Find the names of all employees who are managers (they manage someone else). Return distinct first and last names of these managers.", 
    "Join the employee table to itself or use a subquery.", "Match manager_id to employee_id.", 
    "SELECT DISTINCT m.first_name, m.last_name FROM employees e JOIN employees m ON e.manager_id = m.employee_id;", 
    "SELECT DISTINCT m.first_name, m.last_name FROM employees e JOIN employees m ON e.manager_id = m.employee_id;"),

  make(24, 'banking', 'medium', ['topic:Joins', 'Group By', 'company:MorganStanley'], 
    "Which branch handles the highest volume (count) of loans? Return the branch name and the number of loans.", 
    "Join branches and loans.", "Group by branch_id, count, sort descending, limit 1.", 
    "SELECT b.name, COUNT(l.loan_id) AS loan_count FROM branches b JOIN loans l ON b.branch_id = l.branch_id GROUP BY b.branch_id ORDER BY loan_count DESC LIMIT 1;", 
    "SELECT b.name, COUNT(l.loan_id) AS loan_count FROM branches b JOIN loans l ON b.branch_id = l.branch_id GROUP BY b.branch_id ORDER BY loan_count DESC LIMIT 1;"),

  make(25, 'banking', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:BankOfAmerica'], 
    "Classify loans by size: 'Small' (< $10,000), 'Medium' ($10,000-$50,000), and 'Large' (> $50,000). Return the tier and the count of loans in each.", 
    "Use a CASE statement inside the SELECT.", "Group by the CASE statement.", 
    "SELECT CASE WHEN principal < 10000 THEN 'Small' WHEN principal <= 50000 THEN 'Medium' ELSE 'Large' END AS loan_size, COUNT(*) AS loan_count FROM loans GROUP BY loan_size;", 
    "SELECT CASE WHEN principal < 10000 THEN 'Small' WHEN principal <= 50000 THEN 'Medium' ELSE 'Large' END AS loan_size, COUNT(*) AS loan_count FROM loans GROUP BY loan_size;"),

  make(26, 'banking', 'medium', ['topic:Joins', 'Having', 'company:CapitalOne'], 
    "Find customers who have more than one account. Return their customer_id, first_name, and the number of accounts they hold.", 
    "Join customers and accounts.", "Group by customer_id and use HAVING count > 1.", 
    "SELECT c.customer_id, c.first_name, COUNT(a.account_id) AS account_count FROM customers c JOIN accounts a ON c.customer_id = a.customer_id GROUP BY c.customer_id HAVING COUNT(a.account_id) > 1;", 
    "SELECT c.customer_id, c.first_name, COUNT(a.account_id) AS account_count FROM customers c JOIN accounts a ON c.customer_id = a.customer_id GROUP BY c.customer_id HAVING COUNT(a.account_id) > 1;"),

  make(27, 'banking', 'medium', ['topic:Subqueries', 'Null Handling', 'company:HSBC'], 
    "Identify customers who have an account but do NOT have a loan. Return their distinct first and last names.", 
    "Use a subquery for customer_id NOT IN (loans).", "Join to accounts to ensure they have an account.", 
    "SELECT DISTINCT c.first_name, c.last_name FROM customers c JOIN accounts a ON c.customer_id = a.customer_id WHERE c.customer_id NOT IN (SELECT customer_id FROM loans);", 
    "SELECT DISTINCT c.first_name, c.last_name FROM customers c JOIN accounts a ON c.customer_id = a.customer_id WHERE c.customer_id NOT IN (SELECT customer_id FROM loans);"),

  make(28, 'banking', 'medium', ['topic:Joins', 'Math', 'company:WellsFargo'], 
    "Calculate the total interest the bank will earn annually from all active loans (principal * interest_rate / 100). Return the total as 'annual_interest_revenue' rounded to 2 decimals.", 
    "Multiply principal by interest_rate / 100.", "Filter for status = 'Active'.", 
    "SELECT ROUND(SUM(principal * (interest_rate / 100.0)), 2) AS annual_interest_revenue FROM loans WHERE status = 'Active';", 
    "SELECT ROUND(SUM(principal * (interest_rate / 100.0)), 2) AS annual_interest_revenue FROM loans WHERE status = 'Active';"),

  make(29, 'banking', 'medium', ['topic:Date Functions', 'Aggregate Functions', 'company:Barclays'], 
    "Find the average age (in years) of customers when they opened their first account. Group by branch_id where the account was opened. Return branch_id and avg_age.", 
    "Calculate age as (julianday(opened_at) - julianday(dob))/365.25.", "Take MIN(opened_at) per customer or join.", 
    "WITH FirstAcc AS (SELECT a.customer_id, a.branch_id, MIN(a.opened_at) as first_open FROM accounts a GROUP BY a.customer_id, a.branch_id) SELECT f.branch_id, ROUND(AVG((julianday(f.first_open) - julianday(c.dob))/365.25), 1) as avg_age FROM FirstAcc f JOIN customers c ON f.customer_id = c.customer_id GROUP BY f.branch_id;", 
    "WITH FirstAcc AS (SELECT a.customer_id, a.branch_id, MIN(a.opened_at) as first_open FROM accounts a GROUP BY a.customer_id, a.branch_id) SELECT f.branch_id, ROUND(AVG((julianday(f.first_open) - julianday(c.dob))/365.25), 1) as avg_age FROM FirstAcc f JOIN customers c ON f.customer_id = c.customer_id GROUP BY f.branch_id;"),

  make(30, 'banking', 'medium', ['topic:Joins', 'Null Handling', 'company:UBS'], 
    "Find all branches that currently do not have a manager assigned (manager_employee_id IS NULL). Return the branch name.", 
    "Check the branches table.", "WHERE manager_employee_id IS NULL.", 
    "SELECT name FROM branches WHERE manager_employee_id IS NULL;", 
    "SELECT name FROM branches WHERE manager_employee_id IS NULL;"),

  make(31, 'banking', 'medium', ['topic:Math', 'Group By', 'company:JPMorgan'], 
    "Determine the total amount withdrawn ('Withdrawal') vs deposited ('Deposit') across all accounts. Return type and total amount.", 
    "Group by type in transactions.", "Filter for 'Withdrawal' and 'Deposit'.", 
    "SELECT type, SUM(amount) AS total_amount FROM transactions WHERE type IN ('Withdrawal', 'Deposit') GROUP BY type;", 
    "SELECT type, SUM(amount) AS total_amount FROM transactions WHERE type IN ('Withdrawal', 'Deposit') GROUP BY type;"),

  make(32, 'banking', 'medium', ['topic:Joins', 'Data Analysis', 'company:GoldmanSachs'], 
    "Who processed the highest number of transactions? Return the employee's first name, last name, and the count of transactions they processed.", 
    "Join transactions to employees on processed_by = employee_id.", "Count, sort, limit.", 
    "SELECT e.first_name, e.last_name, COUNT(t.txn_id) AS txn_count FROM transactions t JOIN employees e ON t.processed_by = e.employee_id GROUP BY e.employee_id ORDER BY txn_count DESC LIMIT 1;", 
    "SELECT e.first_name, e.last_name, COUNT(t.txn_id) AS txn_count FROM transactions t JOIN employees e ON t.processed_by = e.employee_id GROUP BY e.employee_id ORDER BY txn_count DESC LIMIT 1;"),

  make(33, 'banking', 'medium', ['topic:Subqueries', 'Math', 'company:Citi'], 
    "Find accounts that have a balance higher than the average balance of all accounts in the bank. Return account_id and balance.", 
    "Use a subquery to find the average balance.", "Compare account balance to the subquery.", 
    "SELECT account_id, balance FROM accounts WHERE balance > (SELECT AVG(balance) FROM accounts);", 
    "SELECT account_id, balance FROM accounts WHERE balance > (SELECT AVG(balance) FROM accounts);"),

  make(34, 'banking', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:MorganStanley'], 
    "Create a report that shows transaction IDs and flags large transactions. If amount > 5000, flag as 'Large', otherwise 'Normal'. Return txn_id, amount, and flag.", 
    "Use a CASE statement.", "Filter or just SELECT.", 
    "SELECT txn_id, amount, CASE WHEN amount > 5000 THEN 'Large' ELSE 'Normal' END AS flag FROM transactions;", 
    "SELECT txn_id, amount, CASE WHEN amount > 5000 THEN 'Large' ELSE 'Normal' END AS flag FROM transactions;"),

  make(35, 'banking', 'medium', ['topic:Joins', 'Math', 'company:BankOfAmerica'], 
    "The risk department needs to know the total outstanding loan principal per customer. Return customer first name, last name, and total principal.", 
    "Join customers and loans.", "Group by customer_id and sum principal where status is 'Active'.", 
    "SELECT c.first_name, c.last_name, SUM(l.principal) AS total_principal FROM customers c JOIN loans l ON c.customer_id = l.customer_id WHERE l.status = 'Active' GROUP BY c.customer_id;", 
    "SELECT c.first_name, c.last_name, SUM(l.principal) AS total_principal FROM customers c JOIN loans l ON c.customer_id = l.customer_id WHERE l.status = 'Active' GROUP BY c.customer_id;"),

  make(36, 'banking', 'medium', ['topic:CTEs', 'Date Functions', 'company:CapitalOne'], 
    "Use a CTE to find the total amount of late loan payments per month. Return the month (YYYY-MM) and the total late amount.", 
    "Extract YYYY-MM from paid_at.", "Filter for is_late = 1.", 
    "WITH LatePayments AS (SELECT strftime('%Y-%m', paid_at) as month, amount FROM loan_payments WHERE is_late = 1 AND paid_at IS NOT NULL) SELECT month, SUM(amount) as total_late_amount FROM LatePayments GROUP BY month;", 
    "WITH LatePayments AS (SELECT strftime('%Y-%m', paid_at) as month, amount FROM loan_payments WHERE is_late = 1 AND paid_at IS NOT NULL) SELECT month, SUM(amount) as total_late_amount FROM LatePayments GROUP BY month;"),

  make(37, 'banking', 'medium', ['topic:Joins', 'Data Analysis', 'company:HSBC'], 
    "Which rate type (account_type in interest_rates) applies to the most accounts? Return the account_type and the count of accounts.", 
    "Join accounts and interest_rates on rate_id.", "Group by account_type.", 
    "SELECT i.account_type, COUNT(a.account_id) AS account_count FROM accounts a JOIN interest_rates i ON a.rate_id = i.rate_id GROUP BY i.account_type ORDER BY account_count DESC LIMIT 1;", 
    "SELECT i.account_type, COUNT(a.account_id) AS account_count FROM accounts a JOIN interest_rates i ON a.rate_id = i.rate_id GROUP BY i.account_type ORDER BY account_count DESC LIMIT 1;"),

  make(38, 'banking', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:WellsFargo'], 
    "Find customers who hold BOTH a Savings and a Checking account. Return their customer_id.", 
    "Use INTERSECT.", "Select customer_id from accounts where type = 'Savings' INTERSECT ... type = 'Checking'.", 
    "SELECT customer_id FROM accounts WHERE type = 'Savings' INTERSECT SELECT customer_id FROM accounts WHERE type = 'Checking';", 
    "SELECT customer_id FROM accounts WHERE type = 'Savings' INTERSECT SELECT customer_id FROM accounts WHERE type = 'Checking';"),

  make(39, 'banking', 'medium', ['topic:Joins', 'Null Handling', 'company:Barclays'], 
    "Are there any customers who have no accounts and no loans? Return their first and last names.", 
    "Left join customers to accounts and loans.", "Check where account_id and loan_id are NULL.", 
    "SELECT c.first_name, c.last_name FROM customers c LEFT JOIN accounts a ON c.customer_id = a.customer_id LEFT JOIN loans l ON c.customer_id = l.customer_id WHERE a.account_id IS NULL AND l.loan_id IS NULL;", 
    "SELECT c.first_name, c.last_name FROM customers c LEFT JOIN accounts a ON c.customer_id = a.customer_id LEFT JOIN loans l ON c.customer_id = l.customer_id WHERE a.account_id IS NULL AND l.loan_id IS NULL;"),

  make(40, 'banking', 'medium', ['topic:Math', 'Data Analysis', 'company:UBS'], 
    "Calculate the loan-to-balance ratio for customer 1 (Total Active Loan Principal / Total Account Balance). Return the ratio rounded to 2 decimals.", 
    "Use subqueries to get total loans and total balances.", "Divide them.", 
    "SELECT ROUND(CAST((SELECT COALESCE(SUM(principal),0) FROM loans WHERE customer_id = 1 AND status = 'Active') AS REAL) / CAST((SELECT COALESCE(SUM(balance),1) FROM accounts WHERE customer_id = 1) AS REAL), 2) AS loan_to_balance_ratio;", 
    "SELECT ROUND(CAST((SELECT COALESCE(SUM(principal),0) FROM loans WHERE customer_id = 1 AND status = 'Active') AS REAL) / CAST((SELECT COALESCE(SUM(balance),1) FROM accounts WHERE customer_id = 1) AS REAL), 2) AS loan_to_balance_ratio;"),

  make(41, 'banking', 'medium', ['topic:Date Functions', 'CTEs', 'company:JPMorgan'], 
    "Find transactions made during business hours (9 AM to 5 PM, inclusive). Return txn_id, txn_date, and amount.", 
    "Extract the hour from txn_date using strftime('%H').", "Filter between '09' and '17'.", 
    "SELECT txn_id, txn_date, amount FROM transactions WHERE strftime('%H', txn_date) BETWEEN '09' AND '17';", 
    "SELECT txn_id, txn_date, amount FROM transactions WHERE strftime('%H', txn_date) BETWEEN '09' AND '17';"),

  make(42, 'banking', 'medium', ['topic:Joins', 'Group By', 'company:GoldmanSachs'], 
    "List the total number of late loan payments for each branch. Return branch name and late payment count. Only include branches with at least 1 late payment.", 
    "Join branches, loans, and loan_payments.", "Filter for is_late = 1, group by branch.", 
    "SELECT b.name, COUNT(lp.payment_id) as late_count FROM branches b JOIN loans l ON b.branch_id = l.branch_id JOIN loan_payments lp ON l.loan_id = lp.loan_id WHERE lp.is_late = 1 GROUP BY b.branch_id HAVING late_count > 0;", 
    "SELECT b.name, COUNT(lp.payment_id) as late_count FROM branches b JOIN loans l ON b.branch_id = l.branch_id JOIN loan_payments lp ON l.loan_id = lp.loan_id WHERE lp.is_late = 1 GROUP BY b.branch_id HAVING late_count > 0;"),

  make(43, 'banking', 'medium', ['topic:String Functions', 'Basic SQL', 'company:Citi'], 
    "Mask the customer National IDs for privacy. Return customer_id and the national_id with all but the last 3 characters replaced by '*'. (e.g., SSN001 -> ***001).", 
    "Use length() and substr() functions.", "Concatenate '*' with the last 3 chars.", 
    "SELECT customer_id, '***' || substr(national_id, -3, 3) AS masked_id FROM customers;", 
    "SELECT customer_id, '***' || substr(national_id, -3, 3) AS masked_id FROM customers;"),

  make(44, 'banking', 'medium', ['topic:Joins', 'Math', 'company:MorganStanley'], 
    "Calculate the total net cash flow for account_id 1. (Sum of Deposits/Transfers in minus Sum of Withdrawals/Payments/Fees).", 
    "Use a CASE statement inside SUM based on transaction type.", "Consider Deposit as +, others as -.", 
    "SELECT SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END) AS net_cash_flow FROM transactions WHERE account_id = 1;", 
    "SELECT SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END) AS net_cash_flow FROM transactions WHERE account_id = 1;"),

  make(45, 'banking', 'medium', ['topic:Data Analysis', 'Group By', 'company:BankOfAmerica'], 
    "Determine which transaction type has the highest average transaction amount. Return the type and the average amount.", 
    "Group by type, avg(amount), sort descending, limit 1.", "No trick here.", 
    "SELECT type, AVG(amount) as avg_amount FROM transactions GROUP BY type ORDER BY avg_amount DESC LIMIT 1;", 
    "SELECT type, AVG(amount) as avg_amount FROM transactions GROUP BY type ORDER BY avg_amount DESC LIMIT 1;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(46, 'banking', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:CapitalOne'], 
    "Calculate the time difference in days between consecutive transactions for account_id 1. Return txn_id, txn_date, and days_since_last_txn.", 
    "Use LAG() OVER(ORDER BY txn_date).", "Use julianday to subtract dates.", 
    "WITH Txns AS (SELECT txn_id, txn_date, LAG(txn_date) OVER(ORDER BY txn_date) as prev_date FROM transactions WHERE account_id = 1) SELECT txn_id, txn_date, ROUND(julianday(txn_date) - julianday(prev_date), 1) as days_since_last_txn FROM Txns WHERE prev_date IS NOT NULL;", 
    "WITH Txns AS (SELECT txn_id, txn_date, LAG(txn_date) OVER(ORDER BY txn_date) as prev_date FROM transactions WHERE account_id = 1) SELECT txn_id, txn_date, ROUND(julianday(txn_date) - julianday(prev_date), 1) as days_since_last_txn FROM Txns WHERE prev_date IS NOT NULL;"),

  make(47, 'banking', 'hard', ['topic:Window Functions', 'Rank', 'company:HSBC'], 
    "Rank the branches by their total active loan principal. Return the branch name, total principal, and the rank (1 being highest).", 
    "Sum principal group by branch.", "Use RANK() OVER(ORDER BY total_principal DESC).", 
    "WITH BranchLoans AS (SELECT b.name, COALESCE(SUM(l.principal), 0) as total_principal FROM branches b LEFT JOIN loans l ON b.branch_id = l.branch_id AND l.status = 'Active' GROUP BY b.branch_id) SELECT name, total_principal, RANK() OVER(ORDER BY total_principal DESC) as rank FROM BranchLoans;", 
    "WITH BranchLoans AS (SELECT b.name, COALESCE(SUM(l.principal), 0) as total_principal FROM branches b LEFT JOIN loans l ON b.branch_id = l.branch_id AND l.status = 'Active' GROUP BY b.branch_id) SELECT name, total_principal, RANK() OVER(ORDER BY total_principal DESC) as rank FROM BranchLoans;"),

  make(48, 'banking', 'hard', ['topic:CTEs', 'Window Functions', 'company:WellsFargo'], 
    "Find the running total of balance for account_id 1 over time based on its transactions. Assume the account started at 0 before the first transaction. (Deposit = +, others = -). Return txn_date and running_balance.", 
    "Assign positive/negative signs to amount.", "Use SUM() OVER(ORDER BY txn_date).", 
    "WITH SignedTxns AS (SELECT txn_date, CASE WHEN type = 'Deposit' THEN amount ELSE -amount END as signed_amount FROM transactions WHERE account_id = 1) SELECT txn_date, SUM(signed_amount) OVER(ORDER BY txn_date) as running_balance FROM SignedTxns;", 
    "WITH SignedTxns AS (SELECT txn_date, CASE WHEN type = 'Deposit' THEN amount ELSE -amount END as signed_amount FROM transactions WHERE account_id = 1) SELECT txn_date, SUM(signed_amount) OVER(ORDER BY txn_date) as running_balance FROM SignedTxns;"),

  make(49, 'banking', 'hard', ['topic:Window Functions', 'Partition By', 'company:Barclays'], 
    "For each branch, find the employee with the highest salary. Return branch name, employee last_name, and salary.", 
    "Use ROW_NUMBER() OVER(PARTITION BY branch_id ORDER BY salary DESC).", "Filter for row number 1.", 
    "WITH RankedEmps AS (SELECT b.name as branch_name, e.last_name, e.salary, ROW_NUMBER() OVER(PARTITION BY e.branch_id ORDER BY e.salary DESC) as rn FROM employees e JOIN branches b ON e.branch_id = b.branch_id) SELECT branch_name, last_name, salary FROM RankedEmps WHERE rn = 1;", 
    "WITH RankedEmps AS (SELECT b.name as branch_name, e.last_name, e.salary, ROW_NUMBER() OVER(PARTITION BY e.branch_id ORDER BY e.salary DESC) as rn FROM employees e JOIN branches b ON e.branch_id = b.branch_id) SELECT branch_name, last_name, salary FROM RankedEmps WHERE rn = 1;"),

  make(50, 'banking', 'hard', ['topic:CTEs', 'Date Functions', 'company:UBS'], 
    "Detect 'Kiting' or suspicious transfer chains. Find transactions where a Withdrawal/Payment was made within 1 day of a Deposit in the same account, and the Withdrawal amount is more than 90% of the Deposit. Return account_id and the two txn_ids.", 
    "Self join transactions on account_id.", "Check date difference and amount ratio.", 
    "WITH Deposits AS (SELECT txn_id, account_id, txn_date, amount FROM transactions WHERE type = 'Deposit'), Withdrawals AS (SELECT txn_id, account_id, txn_date, amount FROM transactions WHERE type IN ('Withdrawal', 'Payment', 'Transfer')) SELECT d.account_id, d.txn_id as deposit_txn, w.txn_id as withdrawal_txn FROM Deposits d JOIN Withdrawals w ON d.account_id = w.account_id WHERE w.txn_date >= d.txn_date AND (julianday(w.txn_date) - julianday(d.txn_date)) <= 1 AND w.amount > (d.amount * 0.90);", 
    "WITH Deposits AS (SELECT txn_id, account_id, txn_date, amount FROM transactions WHERE type = 'Deposit'), Withdrawals AS (SELECT txn_id, account_id, txn_date, amount FROM transactions WHERE type IN ('Withdrawal', 'Payment', 'Transfer')) SELECT d.account_id, d.txn_id as deposit_txn, w.txn_id as withdrawal_txn FROM Deposits d JOIN Withdrawals w ON d.account_id = w.account_id WHERE w.txn_date >= d.txn_date AND (julianday(w.txn_date) - julianday(d.txn_date)) <= 1 AND w.amount > (d.amount * 0.90);"),

  make(51, 'banking', 'hard', ['topic:Window Functions', 'Math', 'company:JPMorgan'], 
    "Calculate the percentage of total bank deposits held in each branch. Return branch name and the percentage rounded to 2 decimals.", 
    "Sum deposits per branch.", "Divide by SUM() OVER().", 
    "WITH BranchDeposits AS (SELECT b.name, COALESCE(SUM(t.amount), 0) as deposits FROM branches b LEFT JOIN accounts a ON b.branch_id = a.branch_id LEFT JOIN transactions t ON a.account_id = t.account_id AND t.type = 'Deposit' GROUP BY b.branch_id) SELECT name, ROUND(deposits * 100.0 / NULLIF(SUM(deposits) OVER(), 0), 2) as deposit_percentage FROM BranchDeposits;", 
    "WITH BranchDeposits AS (SELECT b.name, COALESCE(SUM(t.amount), 0) as deposits FROM branches b LEFT JOIN accounts a ON b.branch_id = a.branch_id LEFT JOIN transactions t ON a.account_id = t.account_id AND t.type = 'Deposit' GROUP BY b.branch_id) SELECT name, ROUND(deposits * 100.0 / NULLIF(SUM(deposits) OVER(), 0), 2) as deposit_percentage FROM BranchDeposits;"),

  make(52, 'banking', 'hard', ['topic:CTEs', 'Null Handling', 'company:GoldmanSachs'], 
    "Audit account balances. Find accounts where the current 'balance' in the accounts table does NOT equal the calculated running total of all their transactions. Return account_id, current_balance, and calculated_balance.", 
    "Sum transactions treating deposits as positive, others as negative.", "Compare to accounts.balance.", 
    "WITH Calculated AS (SELECT account_id, SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END) as calc_bal FROM transactions GROUP BY account_id) SELECT a.account_id, a.balance as current_balance, COALESCE(c.calc_bal, 0) as calculated_balance FROM accounts a LEFT JOIN Calculated c ON a.account_id = c.account_id WHERE a.balance != COALESCE(c.calc_bal, 0);", 
    "WITH Calculated AS (SELECT account_id, SUM(CASE WHEN type = 'Deposit' THEN amount ELSE -amount END) as calc_bal FROM transactions GROUP BY account_id) SELECT a.account_id, a.balance as current_balance, COALESCE(c.calc_bal, 0) as calculated_balance FROM accounts a LEFT JOIN Calculated c ON a.account_id = c.account_id WHERE a.balance != COALESCE(c.calc_bal, 0);"),

  make(53, 'banking', 'hard', ['topic:Window Functions', 'Ntile', 'company:Citi'], 
    "Create a salary bracket system for employees. Divide employees into 4 quartiles based on their salary (1 being highest). Return first_name, last_name, salary, and quartile.", 
    "Use NTILE(4) OVER(ORDER BY salary DESC).", "Query the employees table.", 
    "SELECT first_name, last_name, salary, NTILE(4) OVER(ORDER BY salary DESC) as quartile FROM employees;", 
    "SELECT first_name, last_name, salary, NTILE(4) OVER(ORDER BY salary DESC) as quartile FROM employees;"),

  make(54, 'banking', 'hard', ['topic:CTEs', 'Data Analysis', 'company:MorganStanley'], 
    "Find 'Risky Loans'. A loan is risky if the borrower has missed or been late on more than 50% of their total payments. Return loan_id and the percentage of late payments.", 
    "Count total payments and late payments per loan.", "Filter for late_ratio > 0.5.", 
    "WITH LoanStats AS (SELECT loan_id, COUNT(*) as total_pmts, SUM(is_late) as late_pmts FROM loan_payments GROUP BY loan_id) SELECT loan_id, ROUND(late_pmts * 100.0 / total_pmts, 2) as late_percentage FROM LoanStats WHERE (late_pmts * 1.0 / total_pmts) > 0.5;", 
    "WITH LoanStats AS (SELECT loan_id, COUNT(*) as total_pmts, SUM(is_late) as late_pmts FROM loan_payments GROUP BY loan_id) SELECT loan_id, ROUND(late_pmts * 100.0 / total_pmts, 2) as late_percentage FROM LoanStats WHERE (late_pmts * 1.0 / total_pmts) > 0.5;"),

  make(55, 'banking', 'hard', ['topic:Self Join', 'CTEs', 'company:BankOfAmerica'], 
    "Identify 'Manager-Employee Salary Inversions'. Find employees who earn MORE than their direct manager. Return the employee name, their salary, their manager's name, and manager's salary.", 
    "Self join employees on manager_id.", "Filter where employee.salary > manager.salary.", 
    "SELECT e.first_name || ' ' || e.last_name as employee_name, e.salary as emp_salary, m.first_name || ' ' || m.last_name as manager_name, m.salary as mgr_salary FROM employees e JOIN employees m ON e.manager_id = m.employee_id WHERE e.salary > m.salary;", 
    "SELECT e.first_name || ' ' || e.last_name as employee_name, e.salary as emp_salary, m.first_name || ' ' || m.last_name as manager_name, m.salary as mgr_salary FROM employees e JOIN employees m ON e.manager_id = m.employee_id WHERE e.salary > m.salary;"),

  make(56, 'banking', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:CapitalOne'], 
    "Determine the Month-over-Month growth in loan disbursements. Return month (YYYY-MM), total disbursed, and the percentage growth compared to the previous month.", 
    "Group loans by month.", "Use LAG() to find previous month's total.", 
    "WITH Mthly AS (SELECT strftime('%Y-%m', disbursed_at) as month, SUM(principal) as total FROM loans GROUP BY month), Prev AS (SELECT month, total, LAG(total) OVER(ORDER BY month) as prev_total FROM Mthly) SELECT month, total, ROUND((total - prev_total) * 100.0 / prev_total, 2) as growth_pct FROM Prev WHERE prev_total IS NOT NULL;", 
    "WITH Mthly AS (SELECT strftime('%Y-%m', disbursed_at) as month, SUM(principal) as total FROM loans GROUP BY month), Prev AS (SELECT month, total, LAG(total) OVER(ORDER BY month) as prev_total FROM Mthly) SELECT month, total, ROUND((total - prev_total) * 100.0 / prev_total, 2) as growth_pct FROM Prev WHERE prev_total IS NOT NULL;"),

  make(57, 'banking', 'hard', ['topic:CTEs', 'Self Join', 'company:HSBC'], 
    "Find customers who hold multiple accounts that have different interest rates. Return the customer_id and the number of distinct rate_ids they have.", 
    "Group by customer_id in accounts.", "Count distinct rate_id and use HAVING count > 1.", 
    "SELECT customer_id, COUNT(DISTINCT rate_id) as distinct_rates FROM accounts GROUP BY customer_id HAVING COUNT(DISTINCT rate_id) > 1;", 
    "SELECT customer_id, COUNT(DISTINCT rate_id) as distinct_rates FROM accounts GROUP BY customer_id HAVING COUNT(DISTINCT rate_id) > 1;"),

  make(58, 'banking', 'hard', ['topic:Window Functions', 'Rank', 'company:WellsFargo'], 
    "Identify the 'Whales'. For each transaction type, find the top 2 largest transactions ever recorded. Return type, txn_id, amount, and rank.", 
    "Use DENSE_RANK() OVER(PARTITION BY type ORDER BY amount DESC).", "Filter for rank <= 2.", 
    "WITH RankedTxns AS (SELECT type, txn_id, amount, DENSE_RANK() OVER(PARTITION BY type ORDER BY amount DESC) as rnk FROM transactions) SELECT type, txn_id, amount, rnk FROM RankedTxns WHERE rnk <= 2;", 
    "WITH RankedTxns AS (SELECT type, txn_id, amount, DENSE_RANK() OVER(PARTITION BY type ORDER BY amount DESC) as rnk FROM transactions) SELECT type, txn_id, amount, rnk FROM RankedTxns WHERE rnk <= 2;"),

  make(59, 'banking', 'hard', ['topic:Math', 'Data Analysis', 'company:Barclays'], 
    "Calculate the 'Loan Utilization Rate' for each branch (Total Active Loan Principal / Total Deposits). Return branch name and the ratio.", 
    "Use subqueries or CTEs for loans and deposits.", "Join them by branch_id.", 
    "WITH BranchLoans AS (SELECT branch_id, SUM(principal) as total_loans FROM loans WHERE status = 'Active' GROUP BY branch_id), BranchDeposits AS (SELECT a.branch_id, SUM(t.amount) as total_deposits FROM accounts a JOIN transactions t ON a.account_id = t.account_id WHERE t.type = 'Deposit' GROUP BY a.branch_id) SELECT b.name, ROUND(COALESCE(l.total_loans, 0) / COALESCE(d.total_deposits, 1), 2) as utilization_rate FROM branches b LEFT JOIN BranchLoans l ON b.branch_id = l.branch_id LEFT JOIN BranchDeposits d ON b.branch_id = d.branch_id;", 
    "WITH BranchLoans AS (SELECT branch_id, SUM(principal) as total_loans FROM loans WHERE status = 'Active' GROUP BY branch_id), BranchDeposits AS (SELECT a.branch_id, SUM(t.amount) as total_deposits FROM accounts a JOIN transactions t ON a.account_id = t.account_id WHERE t.type = 'Deposit' GROUP BY a.branch_id) SELECT b.name, ROUND(COALESCE(l.total_loans, 0) / COALESCE(d.total_deposits, 1), 2) as utilization_rate FROM branches b LEFT JOIN BranchLoans l ON b.branch_id = l.branch_id LEFT JOIN BranchDeposits d ON b.branch_id = d.branch_id;"),

  make(60, 'banking', 'hard', ['topic:CTEs', 'Math', 'company:UBS'], 
    "Calculate the compounding monthly interest for account_id 1 based on its current balance and its assigned interest rate. Assume the rate is annual, so monthly rate is annual_rate / 12. Return the expected interest amount for the next month.", 
    "Join accounts and interest_rates.", "Calculate balance * (annual_rate / 12 / 100).", 
    "SELECT a.account_id, ROUND(a.balance * (i.annual_rate / 12.0 / 100.0), 2) as expected_monthly_interest FROM accounts a JOIN interest_rates i ON a.rate_id = i.rate_id WHERE a.account_id = 1;", 
    "SELECT a.account_id, ROUND(a.balance * (i.annual_rate / 12.0 / 100.0), 2) as expected_monthly_interest FROM accounts a JOIN interest_rates i ON a.rate_id = i.rate_id WHERE a.account_id = 1;")
];
`;

fs.writeFileSync(targetFile, code);
console.log('Successfully generated the PERFECT banking questions!');
