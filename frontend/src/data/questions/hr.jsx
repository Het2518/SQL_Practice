const noRows = {
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

// HR QUESTIONS (IDs 301-360)
export const hrQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(301, 'hr', 'easy', ['topic:Basic SQL', 'Where', 'company:LinkedIn'], 
    "Find all departments located in 'New York'. Return the department name and budget.", 
    "Filter the departments table.", "Use WHERE location = 'New York'.", 
    "SELECT name, budget FROM departments WHERE location = 'New York';", 
    "SELECT name, budget FROM departments WHERE location = 'New York';"),

  make(302, 'hr', 'easy', ['topic:String Functions', 'Basic SQL', 'company:Google'], 
    "Format the employee names for the directory. Return a column named 'full_name' with the format 'Firstname Lastname' for all employees.", 
    "Concatenate first_name, a space, and last_name.", "Use the || operator.", 
    "SELECT first_name || ' ' || last_name AS full_name FROM employees;", 
    "SELECT first_name || ' ' || last_name AS full_name FROM employees;"),

  make(303, 'hr', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Microsoft'], 
    "What is the total budget of all departments combined? Return it as 'total_budget'.", 
    "Use SUM() on the budget column.", "Query the departments table.", 
    "SELECT SUM(budget) AS total_budget FROM departments;", 
    "SELECT SUM(budget) AS total_budget FROM departments;"),

  make(304, 'hr', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:Apple'], 
    "Find the employees who do not have a manager assigned (they are at the top of the hierarchy). Return their first_name, last_name, and job_title.", 
    "Check if manager_id is NULL.", "Use WHERE manager_id IS NULL.", 
    "SELECT first_name, last_name, job_title FROM employees WHERE manager_id IS NULL;", 
    "SELECT first_name, last_name, job_title FROM employees WHERE manager_id IS NULL;"),

  make(305, 'hr', 'easy', ['topic:Data Analysis', 'Group By', 'company:Netflix'], 
    "Count how many employees have each job title. Return job_title and the count.", 
    "Group by job_title in the employees table.", "Use COUNT(*).", 
    "SELECT job_title, COUNT(*) AS employee_count FROM employees GROUP BY job_title;", 
    "SELECT job_title, COUNT(*) AS employee_count FROM employees GROUP BY job_title;"),

  make(306, 'hr', 'easy', ['topic:Date Functions', 'Where', 'company:Amazon'], 
    "Find all employees who were hired in the year 2020. Return first_name and hire_date.", 
    "Filter hire_date using LIKE or strftime.", "WHERE hire_date LIKE '2020-%'.", 
    "SELECT first_name, hire_date FROM employees WHERE hire_date LIKE '2020-%';", 
    "SELECT first_name, hire_date FROM employees WHERE hire_date LIKE '2020-%';"),

  make(307, 'hr', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Meta'], 
    "What is the highest salary currently paid to any employee? Return as 'max_salary'.", 
    "Use MAX(salary).", "Query the employees table.", 
    "SELECT MAX(salary) AS max_salary FROM employees;", 
    "SELECT MAX(salary) AS max_salary FROM employees;"),

  make(308, 'hr', 'easy', ['topic:Basic SQL', 'Limit', 'company:Airbnb'], 
    "List the 5 most recently hired employees. Return first_name, last_name, and hire_date.", 
    "Sort by hire_date descending.", "Use LIMIT 5.", 
    "SELECT first_name, last_name, hire_date FROM employees ORDER BY hire_date DESC LIMIT 5;", 
    "SELECT first_name, last_name, hire_date FROM employees ORDER BY hire_date DESC LIMIT 5;"),

  make(309, 'hr', 'easy', ['topic:Basic SQL', 'In', 'company:Uber'], 
    "Find all leaves of type 'Maternity' or 'Paternity'. Return leave_id, employee_id, and type.", 
    "Use the IN operator on the type column.", "WHERE type IN ('Maternity', 'Paternity').", 
    "SELECT leave_id, employee_id, type FROM leaves WHERE type IN ('Maternity', 'Paternity');", 
    "SELECT leave_id, employee_id, type FROM leaves WHERE type IN ('Maternity', 'Paternity');"),

  make(310, 'hr', 'easy', ['topic:String Functions', 'Basic SQL', 'company:Databricks'], 
    "Find all employees whose email ends with '@corp.com'. Return first_name, last_name, and email.", 
    "Use LIKE '%@corp.com'.", "Filter on the email column.", 
    "SELECT first_name, last_name, email FROM employees WHERE email LIKE '%@corp.com';", 
    "SELECT first_name, last_name, email FROM employees WHERE email LIKE '%@corp.com';"),

  make(311, 'hr', 'easy', ['topic:Data Analysis', 'Group By', 'company:Oracle'], 
    "Find out how many performance reviews resulted in each score (1 to 5). Return score and the count of reviews.", 
    "Group by score in the performance_reviews table.", "Use COUNT(*).", 
    "SELECT score, COUNT(*) AS review_count FROM performance_reviews GROUP BY score;", 
    "SELECT score, COUNT(*) AS review_count FROM performance_reviews GROUP BY score;"),

  make(312, 'hr', 'easy', ['topic:Date Functions', 'String Functions', 'company:Salesforce'], 
    "Extract the year from every employee's hire date. Return employee_id and the hire year as 'hire_year'.", 
    "Use substr() or strftime('%Y', hire_date).", "Query the employees table.", 
    "SELECT employee_id, strftime('%Y', hire_date) AS hire_year FROM employees;", 
    "SELECT employee_id, strftime('%Y', hire_date) AS hire_year FROM employees;"),

  make(313, 'hr', 'easy', ['topic:Basic SQL', 'Where', 'company:Snowflake'], 
    "Find all salary records where the amount is greater than $120,000. Return salary_id, employee_id, and amount.", 
    "Filter by amount > 120000.", "Check the salaries table.", 
    "SELECT salary_id, employee_id, amount FROM salaries WHERE amount > 120000;", 
    "SELECT salary_id, employee_id, amount FROM salaries WHERE amount > 120000;"),

  make(314, 'hr', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:Stripe'], 
    "How many distinct locations do we have departments in? Return the count as 'unique_locations'.", 
    "Use COUNT(DISTINCT location).", "Query the departments table.", 
    "SELECT COUNT(DISTINCT location) AS unique_locations FROM departments;", 
    "SELECT COUNT(DISTINCT location) AS unique_locations FROM departments;"),

  make(315, 'hr', 'easy', ['topic:Basic SQL', 'Math', 'company:PayPal'], 
    "List all unapproved leaves (approved = 0). Return leave_id, employee_id, and type.", 
    "Filter for approved = 0.", "Look at the leaves table.", 
    "SELECT leave_id, employee_id, type FROM leaves WHERE approved = 0;", 
    "SELECT leave_id, employee_id, type FROM leaves WHERE approved = 0;"),

  make(316, 'hr', 'easy', ['topic:Data Cleaning', 'Like', 'company:Square'], 
    "Find all employees who have 'Director' in their job title. Return their first_name, last_name, and job_title.", 
    "Use LIKE '%Director%'.", "Query the employees table.", 
    "SELECT first_name, last_name, job_title FROM employees WHERE job_title LIKE '%Director%';", 
    "SELECT first_name, last_name, job_title FROM employees WHERE job_title LIKE '%Director%';"),

  make(317, 'hr', 'easy', ['topic:Basic SQL', 'Where', 'company:Robinhood'], 
    "Find all job history records that indicate a role change (end_date IS NOT NULL). Return history_id, employee_id, and job_title.", 
    "Check if end_date IS NOT NULL.", "Query the job_history table.", 
    "SELECT history_id, employee_id, job_title FROM job_history WHERE end_date IS NOT NULL;", 
    "SELECT history_id, employee_id, job_title FROM job_history WHERE end_date IS NOT NULL;"),

  make(318, 'hr', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:Zoom'], 
    "Count the number of leaves requested per type. Return type and the count.", 
    "Group by type in the leaves table.", "Use COUNT(*).", 
    "SELECT type, COUNT(*) AS leave_count FROM leaves GROUP BY type;", 
    "SELECT type, COUNT(*) AS leave_count FROM leaves GROUP BY type;"),

  make(319, 'hr', 'easy', ['topic:Basic SQL', 'Order By', 'company:Slack'], 
    "Find the top 3 departments with the smallest budgets. Return name and budget.", 
    "Order by budget ASC.", "Limit to 3.", 
    "SELECT name, budget FROM departments ORDER BY budget ASC LIMIT 3;", 
    "SELECT name, budget FROM departments ORDER BY budget ASC LIMIT 3;"),

  make(320, 'hr', 'easy', ['topic:Math', 'Aggregate Functions', 'company:Asana'], 
    "Calculate the average score of all performance reviews. Return as 'avg_score' rounded to 1 decimal place.", 
    "Use AVG(score) and ROUND().", "Query performance_reviews.", 
    "SELECT ROUND(AVG(score), 1) AS avg_score FROM performance_reviews;", 
    "SELECT ROUND(AVG(score), 1) AS avg_score FROM performance_reviews;"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(321, 'hr', 'medium', ['topic:Joins', 'Math', 'company:LinkedIn'], 
    "What is the total current salary expenditure for the 'Engineering' department? Return the department name and total salary.", 
    "Join employees and departments.", "Group by department and sum salary.", 
    "SELECT d.name, SUM(e.salary) AS total_salary FROM employees e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering' GROUP BY d.name;", 
    "SELECT d.name, SUM(e.salary) AS total_salary FROM employees e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering' GROUP BY d.name;"),

  make(322, 'hr', 'medium', ['topic:Joins', 'Data Analysis', 'company:Google'], 
    "List all employees and the name of the department they work in. Return first_name, last_name, and department name.", 
    "Join employees and departments on department_id.", "Select the correct columns.", 
    "SELECT e.first_name, e.last_name, d.name AS department_name FROM employees e JOIN departments d ON e.department_id = d.department_id;", 
    "SELECT e.first_name, e.last_name, d.name AS department_name FROM employees e JOIN departments d ON e.department_id = d.department_id;"),

  make(323, 'hr', 'medium', ['topic:Self Join', 'Data Analysis', 'company:Microsoft'], 
    "Find the names of all employees who are managers. Return distinct first and last names.", 
    "Self join the employees table where employee.manager_id = manager.employee_id.", "Or use a subquery.", 
    "SELECT DISTINCT m.first_name, m.last_name FROM employees e JOIN employees m ON e.manager_id = m.employee_id;", 
    "SELECT DISTINCT m.first_name, m.last_name FROM employees e JOIN employees m ON e.manager_id = m.employee_id;"),

  make(324, 'hr', 'medium', ['topic:Joins', 'Group By', 'company:Apple'], 
    "Which department has the highest average salary? Return the department name and average salary rounded to 2 decimals.", 
    "Join employees and departments.", "Group by department name, order by avg(salary) desc, limit 1.", 
    "SELECT d.name, ROUND(AVG(e.salary), 2) AS avg_salary FROM employees e JOIN departments d ON e.department_id = d.department_id GROUP BY d.name ORDER BY avg_salary DESC LIMIT 1;", 
    "SELECT d.name, ROUND(AVG(e.salary), 2) AS avg_salary FROM employees e JOIN departments d ON e.department_id = d.department_id GROUP BY d.name ORDER BY avg_salary DESC LIMIT 1;"),

  make(325, 'hr', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:Netflix'], 
    "Categorize employees into salary bands: 'Tier 1' (< $80,000), 'Tier 2' ($80,000-$120,000), and 'Tier 3' (> $120,000). Return the tier and the count of employees in each.", 
    "Use a CASE statement inside the SELECT.", "Group by the CASE statement.", 
    "SELECT CASE WHEN salary < 80000 THEN 'Tier 1' WHEN salary <= 120000 THEN 'Tier 2' ELSE 'Tier 3' END AS salary_band, COUNT(*) AS employee_count FROM employees GROUP BY salary_band;", 
    "SELECT CASE WHEN salary < 80000 THEN 'Tier 1' WHEN salary <= 120000 THEN 'Tier 2' ELSE 'Tier 3' END AS salary_band, COUNT(*) AS employee_count FROM employees GROUP BY salary_band;"),

  make(326, 'hr', 'medium', ['topic:Joins', 'Having', 'company:Amazon'], 
    "Find departments that have more than 3 employees. Return the department name and employee count.", 
    "Join departments and employees.", "Group by department name and use HAVING count > 3.", 
    "SELECT d.name, COUNT(e.employee_id) AS employee_count FROM departments d JOIN employees e ON d.department_id = e.department_id GROUP BY d.name HAVING COUNT(e.employee_id) > 3;", 
    "SELECT d.name, COUNT(e.employee_id) AS employee_count FROM departments d JOIN employees e ON d.department_id = e.department_id GROUP BY d.name HAVING COUNT(e.employee_id) > 3;"),

  make(327, 'hr', 'medium', ['topic:Subqueries', 'Null Handling', 'company:Meta'], 
    "Identify employees who have NEVER received a performance review. Return their first_name and last_name.", 
    "Use a subquery for employee_id NOT IN (performance_reviews).", "Or use a LEFT JOIN.", 
    "SELECT first_name, last_name FROM employees WHERE employee_id NOT IN (SELECT employee_id FROM performance_reviews);", 
    "SELECT first_name, last_name FROM employees WHERE employee_id NOT IN (SELECT employee_id FROM performance_reviews);"),

  make(328, 'hr', 'medium', ['topic:Date Functions', 'Math', 'company:Airbnb'], 
    "Calculate the total number of days taken for 'Annual' leave by employee_id 3. Return as 'total_annual_leave_days'. (Assume end_date is inclusive, so difference + 1).", 
    "Use julianday(end_date) - julianday(start_date) + 1.", "Sum this value for employee_id = 3 and type = 'Annual'.", 
    "SELECT SUM(ROUND(julianday(end_date) - julianday(start_date) + 1)) AS total_annual_leave_days FROM leaves WHERE employee_id = 3 AND type = 'Annual';", 
    "SELECT SUM(ROUND(julianday(end_date) - julianday(start_date) + 1)) AS total_annual_leave_days FROM leaves WHERE employee_id = 3 AND type = 'Annual';"),

  make(329, 'hr', 'medium', ['topic:Joins', 'Math', 'company:Uber'], 
    "The finance team wants to check if any department's total current salary exceeds its budget. Return the department name, total_salary, and budget for departments where this is true.", 
    "Join departments and employees.", "Group by department, check HAVING SUM(salary) > budget.", 
    "SELECT d.name, SUM(e.salary) AS total_salary, d.budget FROM departments d JOIN employees e ON d.department_id = e.department_id GROUP BY d.department_id HAVING SUM(e.salary) > d.budget;", 
    "SELECT d.name, SUM(e.salary) AS total_salary, d.budget FROM departments d JOIN employees e ON d.department_id = e.department_id GROUP BY d.department_id HAVING SUM(e.salary) > d.budget;"),

  make(330, 'hr', 'medium', ['topic:Joins', 'Null Handling', 'company:Databricks'], 
    "Find all departments that currently have no employees. Return the department name.", 
    "Left join departments to employees.", "Check where employee_id IS NULL.", 
    "SELECT d.name FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id WHERE e.employee_id IS NULL;", 
    "SELECT d.name FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id WHERE e.employee_id IS NULL;"),

  make(331, 'hr', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:Oracle'], 
    "Find employees whose current salary is higher than the average salary of the entire company. Return first_name, last_name, and salary.", 
    "Use a subquery to get AVG(salary).", "Compare employee salary to it.", 
    "SELECT first_name, last_name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);", 
    "SELECT first_name, last_name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);"),

  make(332, 'hr', 'medium', ['topic:Joins', 'Data Analysis', 'company:Salesforce'], 
    "Which employee has received the highest number of 5-star performance reviews? Return their first_name, last_name, and the count.", 
    "Join employees and performance_reviews.", "Filter for score = 5, group by employee, sort desc, limit 1.", 
    "SELECT e.first_name, e.last_name, COUNT(r.review_id) AS top_reviews FROM employees e JOIN performance_reviews r ON e.employee_id = r.employee_id WHERE r.score = 5 GROUP BY e.employee_id ORDER BY top_reviews DESC LIMIT 1;", 
    "SELECT e.first_name, e.last_name, COUNT(r.review_id) AS top_reviews FROM employees e JOIN performance_reviews r ON e.employee_id = r.employee_id WHERE r.score = 5 GROUP BY e.employee_id ORDER BY top_reviews DESC LIMIT 1;"),

  make(333, 'hr', 'medium', ['topic:Joins', 'Date Functions', 'company:Snowflake'], 
    "Find employees who have been in their current role for less than 3 years (assume current date is '2024-08-01'). Return first_name, last_name, and hire_date.", 
    "Calculate (julianday('2024-08-01') - julianday(hire_date)) / 365.25 < 3.", "Or just difference in days < 1095.", 
    "SELECT first_name, last_name, hire_date FROM employees WHERE (julianday('2024-08-01') - julianday(hire_date)) < 1095;", 
    "SELECT first_name, last_name, hire_date FROM employees WHERE (julianday('2024-08-01') - julianday(hire_date)) < 1095;"),

  make(334, 'hr', 'medium', ['topic:Case Statements', 'Math', 'company:Stripe'], 
    "Create a report that flags long leaves. If a leave is over 14 days long, flag it as 'Extended', otherwise 'Normal'. Return leave_id, duration_days, and the flag.", 
    "Use julianday(end_date) - julianday(start_date) + 1.", "Use a CASE statement on the duration.", 
    "SELECT leave_id, ROUND(julianday(end_date) - julianday(start_date) + 1) AS duration_days, CASE WHEN (julianday(end_date) - julianday(start_date) + 1) > 14 THEN 'Extended' ELSE 'Normal' END AS flag FROM leaves;", 
    "SELECT leave_id, ROUND(julianday(end_date) - julianday(start_date) + 1) AS duration_days, CASE WHEN (julianday(end_date) - julianday(start_date) + 1) > 14 THEN 'Extended' ELSE 'Normal' END AS flag FROM leaves;"),

  make(335, 'hr', 'medium', ['topic:CTEs', 'Data Analysis', 'company:PayPal'], 
    "Use a CTE to find the average score for each employee. Then return the names of employees whose average score is exactly 5.", 
    "CTE to calculate avg_score per employee_id.", "Join with employees table where avg_score = 5.", 
    "WITH AvgScores AS (SELECT employee_id, AVG(score) as avg_score FROM performance_reviews GROUP BY employee_id) SELECT e.first_name, e.last_name FROM employees e JOIN AvgScores a ON e.employee_id = a.employee_id WHERE a.avg_score = 5;", 
    "WITH AvgScores AS (SELECT employee_id, AVG(score) as avg_score FROM performance_reviews GROUP BY employee_id) SELECT e.first_name, e.last_name FROM employees e JOIN AvgScores a ON e.employee_id = a.employee_id WHERE a.avg_score = 5;"),

  make(336, 'hr', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:Square'], 
    "Find employees who have worked in both 'Engineering' and 'Sales' departments at some point (either current or past history). Return employee_id.", 
    "Use INTERSECT.", "Query employees + job_history.", 
    "SELECT employee_id FROM (SELECT employee_id, department_id FROM employees UNION SELECT employee_id, department_id FROM job_history) e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering' INTERSECT SELECT employee_id FROM (SELECT employee_id, department_id FROM employees UNION SELECT employee_id, department_id FROM job_history) e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Sales';", 
    "SELECT employee_id FROM (SELECT employee_id, department_id FROM employees UNION SELECT employee_id, department_id FROM job_history) e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering' INTERSECT SELECT employee_id FROM (SELECT employee_id, department_id FROM employees UNION SELECT employee_id, department_id FROM job_history) e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Sales';"),

  make(337, 'hr', 'medium', ['topic:Joins', 'Self Join', 'company:Robinhood'], 
    "Identify any employees who have acted as a reviewer for their own manager. Return the employee's name and their manager's name.", 
    "Join employees to their manager.", "Join to performance_reviews where reviewer = employee and reviewee = manager.", 
    "SELECT e.first_name || ' ' || e.last_name AS employee, m.first_name || ' ' || m.last_name AS manager FROM employees e JOIN employees m ON e.manager_id = m.employee_id JOIN performance_reviews pr ON m.employee_id = pr.employee_id AND e.employee_id = pr.reviewer_id;", 
    "SELECT e.first_name || ' ' || e.last_name AS employee, m.first_name || ' ' || m.last_name AS manager FROM employees e JOIN employees m ON e.manager_id = m.employee_id JOIN performance_reviews pr ON m.employee_id = pr.employee_id AND e.employee_id = pr.reviewer_id;"),

  make(338, 'hr', 'medium', ['topic:Math', 'Data Analysis', 'company:Zoom'], 
    "Calculate the percentage of total company budget allocated to the 'Engineering' department. Return the percentage rounded to 2 decimals.", 
    "Divide Engineering budget by total budget.", "Use subqueries.", 
    "SELECT ROUND((SELECT budget FROM departments WHERE name = 'Engineering') * 100.0 / (SELECT SUM(budget) FROM departments), 2) AS engineering_budget_pct;", 
    "SELECT ROUND((SELECT budget FROM departments WHERE name = 'Engineering') * 100.0 / (SELECT SUM(budget) FROM departments), 2) AS engineering_budget_pct;"),

  make(339, 'hr', 'medium', ['topic:Joins', 'Date Functions', 'company:Slack'], 
    "Find all salary history records that lasted less than 1 year. Return salary_id, employee_id, and the duration in days.", 
    "Check effective_to - effective_from < 365.", "Filter for effective_to IS NOT NULL.", 
    "SELECT salary_id, employee_id, ROUND(julianday(effective_to) - julianday(effective_from)) AS duration_days FROM salaries WHERE effective_to IS NOT NULL AND (julianday(effective_to) - julianday(effective_from)) < 365;", 
    "SELECT salary_id, employee_id, ROUND(julianday(effective_to) - julianday(effective_from)) AS duration_days FROM salaries WHERE effective_to IS NOT NULL AND (julianday(effective_to) - julianday(effective_from)) < 365;"),

  make(340, 'hr', 'medium', ['topic:Joins', 'Data Analysis', 'company:Asana'], 
    "List the employees who have had more than 1 job title in the company (including their current role). Return employee_id and the distinct job title count.", 
    "Combine employees and job_history using UNION.", "Group by employee_id, count distinct job_title, HAVING count > 1.", 
    "SELECT employee_id, COUNT(DISTINCT job_title) as title_count FROM (SELECT employee_id, job_title FROM employees UNION SELECT employee_id, job_title FROM job_history) GROUP BY employee_id HAVING COUNT(DISTINCT job_title) > 1;", 
    "SELECT employee_id, COUNT(DISTINCT job_title) as title_count FROM (SELECT employee_id, job_title FROM employees UNION SELECT employee_id, job_title FROM job_history) GROUP BY employee_id HAVING COUNT(DISTINCT job_title) > 1;"),

  make(341, 'hr', 'medium', ['topic:String Functions', 'Basic SQL', 'company:LinkedIn'], 
    "Mask employee salaries for a public report. If salary > 100000, display '100k+', else 'Under 100k'. Return first_name and masked_salary.", 
    "Use a CASE statement.", "Apply logic to salary.", 
    "SELECT first_name, CASE WHEN salary > 100000 THEN '100k+' ELSE 'Under 100k' END AS masked_salary FROM employees;", 
    "SELECT first_name, CASE WHEN salary > 100000 THEN '100k+' ELSE 'Under 100k' END AS masked_salary FROM employees;"),

  make(342, 'hr', 'medium', ['topic:Joins', 'Group By', 'company:Google'], 
    "Which manager has the most direct reports? Return the manager's first_name, last_name, and the number of direct reports.", 
    "Join employees to themselves or group by manager_id.", "Count, sort desc, limit 1.", 
    "SELECT m.first_name, m.last_name, COUNT(e.employee_id) AS report_count FROM employees e JOIN employees m ON e.manager_id = m.employee_id GROUP BY m.employee_id ORDER BY report_count DESC LIMIT 1;", 
    "SELECT m.first_name, m.last_name, COUNT(e.employee_id) AS report_count FROM employees e JOIN employees m ON e.manager_id = m.employee_id GROUP BY m.employee_id ORDER BY report_count DESC LIMIT 1;"),

  make(343, 'hr', 'medium', ['topic:Math', 'Data Analysis', 'company:Microsoft'], 
    "Calculate the average duration (in days) of 'Sick' leaves taken by all employees. Return the average rounded to 2 decimals.", 
    "Use AVG() on the difference between end_date and start_date + 1.", "Filter for type = 'Sick'.", 
    "SELECT ROUND(AVG(julianday(end_date) - julianday(start_date) + 1), 2) AS avg_sick_leave_days FROM leaves WHERE type = 'Sick';", 
    "SELECT ROUND(AVG(julianday(end_date) - julianday(start_date) + 1), 2) AS avg_sick_leave_days FROM leaves WHERE type = 'Sick';"),

  make(344, 'hr', 'medium', ['topic:Joins', 'Data Analysis', 'company:Apple'], 
    "Find any employee whose current salary does not have a corresponding active record in the salaries table (where amount matches current salary and effective_to is NULL). Return employee_id.", 
    "Left join employees to salaries.", "Check for NULLs or mismatch.", 
    "SELECT e.employee_id FROM employees e LEFT JOIN salaries s ON e.employee_id = s.employee_id AND e.salary = s.amount AND s.effective_to IS NULL WHERE s.salary_id IS NULL;", 
    "SELECT e.employee_id FROM employees e LEFT JOIN salaries s ON e.employee_id = s.employee_id AND e.salary = s.amount AND s.effective_to IS NULL WHERE s.salary_id IS NULL;"),

  make(345, 'hr', 'medium', ['topic:Group By', 'Having', 'company:Netflix'], 
    "Identify employees who have been reviewed more than twice, but their average score is below 4. Return employee_id and avg_score.", 
    "Group by employee_id in performance_reviews.", "Use HAVING count > 2 AND avg < 4.", 
    "SELECT employee_id, AVG(score) as avg_score FROM performance_reviews GROUP BY employee_id HAVING COUNT(review_id) > 2 AND AVG(score) < 4;", 
    "SELECT employee_id, AVG(score) as avg_score FROM performance_reviews GROUP BY employee_id HAVING COUNT(review_id) > 2 AND AVG(score) < 4;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(346, 'hr', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:Amazon'], 
    "Calculate the percentage salary increase for employee_id 1 at each stage of their salary history. Return effective_from, new_salary, and the percentage increase from the previous salary.", 
    "Use LAG() OVER(ORDER BY effective_from).", "Calculate (new - old) * 100.0 / old.", 
    "WITH SalHist AS (SELECT effective_from, amount, LAG(amount) OVER(ORDER BY effective_from) as prev_amount FROM salaries WHERE employee_id = 1) SELECT effective_from, amount as new_salary, ROUND((amount - prev_amount) * 100.0 / prev_amount, 2) as pct_increase FROM SalHist WHERE prev_amount IS NOT NULL;", 
    "WITH SalHist AS (SELECT effective_from, amount, LAG(amount) OVER(ORDER BY effective_from) as prev_amount FROM salaries WHERE employee_id = 1) SELECT effective_from, amount as new_salary, ROUND((amount - prev_amount) * 100.0 / prev_amount, 2) as pct_increase FROM SalHist WHERE prev_amount IS NOT NULL;"),

  make(347, 'hr', 'hard', ['topic:Window Functions', 'Rank', 'company:Meta'], 
    "For each department, rank the employees by their salary. Return department name, employee last_name, salary, and rank (1 being highest).", 
    "Use DENSE_RANK() OVER(PARTITION BY department_id ORDER BY salary DESC).", "Join departments and employees.", 
    "SELECT d.name as department, e.last_name, e.salary, DENSE_RANK() OVER(PARTITION BY e.department_id ORDER BY e.salary DESC) as rank FROM employees e JOIN departments d ON e.department_id = d.department_id;", 
    "SELECT d.name as department, e.last_name, e.salary, DENSE_RANK() OVER(PARTITION BY e.department_id ORDER BY e.salary DESC) as rank FROM employees e JOIN departments d ON e.department_id = d.department_id;"),

  make(348, 'hr', 'hard', ['topic:CTEs', 'Window Functions', 'company:Airbnb'], 
    "Find the running total of the company's salary expenditure over time, based on employee hire dates. Return hire_date and running_total_salary.", 
    "Use SUM(salary) OVER(ORDER BY hire_date).", "This assumes they still work here and haven't left.", 
    "SELECT hire_date, SUM(salary) OVER(ORDER BY hire_date) as running_total_salary FROM employees;", 
    "SELECT hire_date, SUM(salary) OVER(ORDER BY hire_date) as running_total_salary FROM employees;"),

  make(349, 'hr', 'hard', ['topic:Window Functions', 'Partition By', 'company:Uber'], 
    "Identify 'Salary Outliers'. Find employees whose salary is more than 2 times the average salary of their specific department. Return employee name, salary, and department average.", 
    "Use AVG(salary) OVER(PARTITION BY department_id).", "Filter the results.", 
    "WITH DeptStats AS (SELECT first_name, last_name, salary, AVG(salary) OVER(PARTITION BY department_id) as dept_avg FROM employees) SELECT first_name, last_name, salary, ROUND(dept_avg, 2) as dept_avg FROM DeptStats WHERE salary > 2 * dept_avg;", 
    "WITH DeptStats AS (SELECT first_name, last_name, salary, AVG(salary) OVER(PARTITION BY department_id) as dept_avg FROM employees) SELECT first_name, last_name, salary, ROUND(dept_avg, 2) as dept_avg FROM DeptStats WHERE salary > 2 * dept_avg;"),

  make(350, 'hr', 'hard', ['topic:CTEs', 'Self Join', 'company:Databricks'], 
    "Detect 'Performance Bias'. Find managers who have consistently given their direct reports a perfect score of 5 on every single review. Return manager_id.", 
    "Find all reviews by a manager for their reports.", "Check if MIN(score) = 5 and MAX(score) = 5.", 
    "WITH ManagerReviews AS (SELECT e.manager_id, r.score FROM employees e JOIN performance_reviews r ON e.employee_id = r.employee_id AND e.manager_id = r.reviewer_id) SELECT manager_id FROM ManagerReviews GROUP BY manager_id HAVING MIN(score) = 5 AND MAX(score) = 5;", 
    "WITH ManagerReviews AS (SELECT e.manager_id, r.score FROM employees e JOIN performance_reviews r ON e.employee_id = r.employee_id AND e.manager_id = r.reviewer_id) SELECT manager_id FROM ManagerReviews GROUP BY manager_id HAVING MIN(score) = 5 AND MAX(score) = 5;"),

  make(351, 'hr', 'hard', ['topic:Window Functions', 'Math', 'company:Oracle'], 
    "Calculate the percentage of total company salary paid to each department. Return department name and the percentage rounded to 2 decimals.", 
    "Sum salary per department.", "Divide by SUM(salary) OVER().", 
    "WITH DeptSalaries AS (SELECT d.name, COALESCE(SUM(e.salary), 0) as total_salary FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id GROUP BY d.department_id) SELECT name, ROUND(total_salary * 100.0 / NULLIF(SUM(total_salary) OVER(), 0), 2) as salary_percentage FROM DeptSalaries;", 
    "WITH DeptSalaries AS (SELECT d.name, COALESCE(SUM(e.salary), 0) as total_salary FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id GROUP BY d.department_id) SELECT name, ROUND(total_salary * 100.0 / NULLIF(SUM(total_salary) OVER(), 0), 2) as salary_percentage FROM DeptSalaries;"),

  make(352, 'hr', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Salesforce'], 
    "Identify 'Rapid Promoters'. Find employees who have changed job titles more than 2 times within a 3-year period. Return employee_id.", 
    "Combine employees and job_history.", "Look at dates of title changes.", 
    "WITH AllRoles AS (SELECT employee_id, start_date FROM job_history UNION ALL SELECT employee_id, hire_date FROM employees), RoleLags AS (SELECT employee_id, start_date, LEAD(start_date, 2) OVER(PARTITION BY employee_id ORDER BY start_date) as third_role_date FROM AllRoles) SELECT DISTINCT employee_id FROM RoleLags WHERE third_role_date IS NOT NULL AND (julianday(third_role_date) - julianday(start_date)) <= (3 * 365.25);", 
    "WITH AllRoles AS (SELECT employee_id, start_date FROM job_history UNION ALL SELECT employee_id, hire_date FROM employees), RoleLags AS (SELECT employee_id, start_date, LEAD(start_date, 2) OVER(PARTITION BY employee_id ORDER BY start_date) as third_role_date FROM AllRoles) SELECT DISTINCT employee_id FROM RoleLags WHERE third_role_date IS NOT NULL AND (julianday(third_role_date) - julianday(start_date)) <= (3 * 365.25);"),

  make(353, 'hr', 'hard', ['topic:Window Functions', 'Ntile', 'company:Snowflake'], 
    "Create an 'Experience Tier' system. Divide employees into 3 tertiles based on their hire date (oldest to newest). Return first_name, hire_date, and tier.", 
    "Use NTILE(3) OVER(ORDER BY hire_date ASC).", "Query the employees table.", 
    "SELECT first_name, hire_date, NTILE(3) OVER(ORDER BY hire_date ASC) as tier FROM employees;", 
    "SELECT first_name, hire_date, NTILE(3) OVER(ORDER BY hire_date ASC) as tier FROM employees;"),

  make(354, 'hr', 'hard', ['topic:CTEs', 'Self Join', 'company:Stripe'], 
    "Find 'Skipped Levels'. Identify employees who earn more than their manager's manager. Return employee name and salary.", 
    "Self join twice to find the manager's manager.", "Compare salaries.", 
    "WITH Hierarchy AS (SELECT e.first_name, e.last_name, e.salary, m.manager_id as grand_manager_id FROM employees e JOIN employees m ON e.manager_id = m.employee_id) SELECT h.first_name, h.last_name, h.salary FROM Hierarchy h JOIN employees gm ON h.grand_manager_id = gm.employee_id WHERE h.salary > gm.salary;", 
    "WITH Hierarchy AS (SELECT e.first_name, e.last_name, e.salary, m.manager_id as grand_manager_id FROM employees e JOIN employees m ON e.manager_id = m.employee_id) SELECT h.first_name, h.last_name, h.salary FROM Hierarchy h JOIN employees gm ON h.grand_manager_id = gm.employee_id WHERE h.salary > gm.salary;"),

  make(355, 'hr', 'hard', ['topic:CTEs', 'Data Analysis', 'company:PayPal'], 
    "Calculate the 'Absence Rate' for the engineering department in 2022. Formula: (Total Leave Days in 2022) / (Total Employees * 365). Return as percentage.", 
    "Sum leave days for engineers in 2022.", "Count engineers, calculate.", 
    "WITH EngLeaves AS (SELECT SUM(julianday(l.end_date) - julianday(l.start_date) + 1) as total_days FROM leaves l JOIN employees e ON l.employee_id = e.employee_id JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering' AND l.start_date LIKE '2022-%'), EngCount AS (SELECT COUNT(*) as num_emps FROM employees e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering') SELECT ROUND(COALESCE(el.total_days, 0) * 100.0 / (ec.num_emps * 365.0), 2) as absence_rate FROM EngLeaves el CROSS JOIN EngCount ec;", 
    "WITH EngLeaves AS (SELECT SUM(julianday(l.end_date) - julianday(l.start_date) + 1) as total_days FROM leaves l JOIN employees e ON l.employee_id = e.employee_id JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering' AND l.start_date LIKE '2022-%'), EngCount AS (SELECT COUNT(*) as num_emps FROM employees e JOIN departments d ON e.department_id = d.department_id WHERE d.name = 'Engineering') SELECT ROUND(COALESCE(el.total_days, 0) * 100.0 / (ec.num_emps * 365.0), 2) as absence_rate FROM EngLeaves el CROSS JOIN EngCount ec;"),

  make(356, 'hr', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:Square'], 
    "For employee_id 3, find the difference in their performance review scores year-over-year. Return review_date, score, and the change from the previous score.", 
    "Use LAG() OVER(ORDER BY review_date).", "Subtract previous score from current.", 
    "WITH Scores AS (SELECT review_date, score, LAG(score) OVER(ORDER BY review_date) as prev_score FROM performance_reviews WHERE employee_id = 3) SELECT review_date, score, (score - prev_score) as score_change FROM Scores WHERE prev_score IS NOT NULL;", 
    "WITH Scores AS (SELECT review_date, score, LAG(score) OVER(ORDER BY review_date) as prev_score FROM performance_reviews WHERE employee_id = 3) SELECT review_date, score, (score - prev_score) as score_change FROM Scores WHERE prev_score IS NOT NULL;"),

  make(357, 'hr', 'hard', ['topic:CTEs', 'Null Handling', 'company:Robinhood'], 
    "Identify 'Ghost Departments'. Departments that have a budget > 0 but have had no employees assigned to them currently OR in the job_history table. Return department name.", 
    "Check employees and job_history.", "Use NOT IN or LEFT JOINs.", 
    "SELECT d.name FROM departments d WHERE d.budget > 0 AND d.department_id NOT IN (SELECT department_id FROM employees WHERE department_id IS NOT NULL) AND d.department_id NOT IN (SELECT department_id FROM job_history WHERE department_id IS NOT NULL);", 
    "SELECT d.name FROM departments d WHERE d.budget > 0 AND d.department_id NOT IN (SELECT department_id FROM employees WHERE department_id IS NOT NULL) AND d.department_id NOT IN (SELECT department_id FROM job_history WHERE department_id IS NOT NULL);"),

  make(358, 'hr', 'hard', ['topic:Window Functions', 'Rank', 'company:Zoom'], 
    "Who is the most recent hire in each department? Return department name, employee name, and hire_date.", 
    "Use ROW_NUMBER() OVER(PARTITION BY department_id ORDER BY hire_date DESC).", "Filter for rn = 1.", 
    "WITH RankedHires AS (SELECT d.name as dept, e.first_name, e.last_name, e.hire_date, ROW_NUMBER() OVER(PARTITION BY e.department_id ORDER BY e.hire_date DESC) as rn FROM employees e JOIN departments d ON e.department_id = d.department_id) SELECT dept, first_name, last_name, hire_date FROM RankedHires WHERE rn = 1;", 
    "WITH RankedHires AS (SELECT d.name as dept, e.first_name, e.last_name, e.hire_date, ROW_NUMBER() OVER(PARTITION BY e.department_id ORDER BY e.hire_date DESC) as rn FROM employees e JOIN departments d ON e.department_id = d.department_id) SELECT dept, first_name, last_name, hire_date FROM RankedHires WHERE rn = 1;"),

  make(359, 'hr', 'hard', ['topic:Math', 'Data Analysis', 'company:Slack'], 
    "Calculate the cost per point of performance. For each department, calculate (Total Salary / Sum of most recent performance review scores of employees). Return department name and cost_per_point.", 
    "Find most recent review per employee.", "Sum those scores per department and divide total salary by it.", 
    "WITH RecentReviews AS (SELECT employee_id, score, ROW_NUMBER() OVER(PARTITION BY employee_id ORDER BY review_date DESC) as rn FROM performance_reviews), DeptScores AS (SELECT e.department_id, SUM(r.score) as total_score FROM employees e JOIN RecentReviews r ON e.employee_id = r.employee_id WHERE r.rn = 1 GROUP BY e.department_id), DeptSalaries AS (SELECT department_id, SUM(salary) as total_salary FROM employees GROUP BY department_id) SELECT d.name, ROUND(dsal.total_salary / NULLIF(dsc.total_score, 0), 2) as cost_per_point FROM departments d JOIN DeptSalaries dsal ON d.department_id = dsal.department_id JOIN DeptScores dsc ON d.department_id = dsc.department_id;", 
    "WITH RecentReviews AS (SELECT employee_id, score, ROW_NUMBER() OVER(PARTITION BY employee_id ORDER BY review_date DESC) as rn FROM performance_reviews), DeptScores AS (SELECT e.department_id, SUM(r.score) as total_score FROM employees e JOIN RecentReviews r ON e.employee_id = r.employee_id WHERE r.rn = 1 GROUP BY e.department_id), DeptSalaries AS (SELECT department_id, SUM(salary) as total_salary FROM employees GROUP BY department_id) SELECT d.name, ROUND(dsal.total_salary / NULLIF(dsc.total_score, 0), 2) as cost_per_point FROM departments d JOIN DeptSalaries dsal ON d.department_id = dsal.department_id JOIN DeptScores dsc ON d.department_id = dsc.department_id;"),

  make(360, 'hr', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Asana'], 
    "Identify 'High Turnover' roles. Find job titles that have had more than 2 distinct employees hold them in the past (only counting those who have left the role, i.e., in job_history with an end_date). Return the job_title.", 
    "Count distinct employee_id per job_title in job_history.", "Use HAVING count > 2.", 
    "SELECT job_title FROM job_history WHERE end_date IS NOT NULL GROUP BY job_title HAVING COUNT(DISTINCT employee_id) > 2;", 
    "SELECT job_title FROM job_history WHERE end_date IS NOT NULL GROUP BY job_title HAVING COUNT(DISTINCT employee_id) > 2;")
];
