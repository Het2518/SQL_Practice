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

// UNIVERSITY QUESTIONS (IDs 1-60)
export const universityQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(1, 'university', 'easy', ['topic:Basic SQL', 'Where', 'company:Harvard'], 
    "Find all students majoring in 'Computer Science'. Return their first_name and last_name.", 
    "Filter by major.", "Use WHERE major = 'Computer Science'.", 
    "SELECT first_name, last_name FROM students WHERE major = 'Computer Science';", 
    "SELECT first_name, last_name FROM students WHERE major = 'Computer Science';"),

  make(2, 'university', 'easy', ['topic:String Functions', 'Basic SQL', 'company:MIT'], 
    "Format the course titles for a catalog. Return a single column 'catalog_name' with the format 'Course: [title]'.", 
    "Concatenate 'Course: ' and the title.", "Use the || operator.", 
    "SELECT 'Course: ' || title AS catalog_name FROM courses;", 
    "SELECT 'Course: ' || title AS catalog_name FROM courses;"),

  make(3, 'university', 'easy', ['topic:Math', 'Aggregate Functions', 'company:Stanford'], 
    "Calculate the total capacity of all classrooms in the 'Science Building'. Return as 'total_capacity'.", 
    "Use SUM() on the capacity column.", "Filter by building = 'Science Building'.", 
    "SELECT SUM(capacity) AS total_capacity FROM classrooms WHERE building = 'Science Building';", 
    "SELECT SUM(capacity) AS total_capacity FROM classrooms WHERE building = 'Science Building';"),

  make(4, 'university', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:Yale'], 
    "Identify students who have NO academic advisor assigned (advisor_id IS NULL). Return student_id, first_name, and last_name.", 
    "Check if advisor_id is NULL.", "Use WHERE advisor_id IS NULL.", 
    "SELECT student_id, first_name, last_name FROM students WHERE advisor_id IS NULL;", 
    "SELECT student_id, first_name, last_name FROM students WHERE advisor_id IS NULL;"),

  make(5, 'university', 'easy', ['topic:Data Analysis', 'Group By', 'company:Princeton'], 
    "Count how many students are in each major. Return the major and the count of students.", 
    "Group by major in the students table.", "Use COUNT(*).", 
    "SELECT major, COUNT(*) AS student_count FROM students GROUP BY major;", 
    "SELECT major, COUNT(*) AS student_count FROM students GROUP BY major;"),

  make(6, 'university', 'easy', ['topic:Date Functions', 'Where', 'company:Columbia'], 
    "Find all professors hired in the year 2010 or earlier. Return first_name, last_name, and hired_at.", 
    "Filter hired_at using <=.", "WHERE hired_at <= '2010-12-31'.", 
    "SELECT first_name, last_name, hired_at FROM professors WHERE hired_at <= '2010-12-31';", 
    "SELECT first_name, last_name, hired_at FROM professors WHERE hired_at <= '2010-12-31';"),

  make(7, 'university', 'easy', ['topic:Aggregate Functions', 'Math', 'company:UPenn'], 
    "What is the maximum final score achieved in any class? Return as 'highest_score'.", 
    "Use MAX(final_score).", "Query the grades table.", 
    "SELECT MAX(final_score) AS highest_score FROM grades;", 
    "SELECT MAX(final_score) AS highest_score FROM grades;"),

  make(8, 'university', 'easy', ['topic:Basic SQL', 'Limit', 'company:Cornell'], 
    "List the 5 most recently enrolled students. Return first_name, last_name, and enrolled_since.", 
    "Sort by enrolled_since descending.", "Limit to 5.", 
    "SELECT first_name, last_name, enrolled_since FROM students ORDER BY enrolled_since DESC LIMIT 5;", 
    "SELECT first_name, last_name, enrolled_since FROM students ORDER BY enrolled_since DESC LIMIT 5;"),

  make(9, 'university', 'easy', ['topic:Basic SQL', 'In', 'company:Brown'], 
    "Find all courses that offer 3 or 4 credit_hours. Return title and credit_hours.", 
    "Use the IN operator on the credit_hours column.", "WHERE credit_hours IN (3, 4).", 
    "SELECT title, credit_hours FROM courses WHERE credit_hours IN (3, 4);", 
    "SELECT title, credit_hours FROM courses WHERE credit_hours IN (3, 4);"),

  make(10, 'university', 'easy', ['topic:String Functions', 'Basic SQL', 'company:Dartmouth'], 
    "Find all students whose email ends with '@student.edu'. Return first_name and email.", 
    "Use LIKE '%@student.edu'.", "Filter on the email column.", 
    "SELECT first_name, email FROM students WHERE email LIKE '%@student.edu';", 
    "SELECT first_name, email FROM students WHERE email LIKE '%@student.edu';"),

  make(11, 'university', 'easy', ['topic:Data Analysis', 'Group By', 'company:UCBerkeley'], 
    "How many grades fall into each letter_grade category (A, B, C, D, F)? Return letter_grade and count.", 
    "Use COUNT(*).", "Group by letter_grade in the grades table.", 
    "SELECT letter_grade, COUNT(*) AS grade_count FROM grades GROUP BY letter_grade;", 
    "SELECT letter_grade, COUNT(*) AS grade_count FROM grades GROUP BY letter_grade;"),

  make(12, 'university', 'easy', ['topic:Date Functions', 'String Functions', 'company:UCLA'], 
    "Extract the enrollment year for all students. Return student_id and enrollment_year.", 
    "Use substr() or strftime('%Y', enrolled_since).", "Query the students table.", 
    "SELECT student_id, strftime('%Y', enrolled_since) AS enrollment_year FROM students;", 
    "SELECT student_id, strftime('%Y', enrolled_since) AS enrollment_year FROM students;"),

  make(13, 'university', 'easy', ['topic:Basic SQL', 'Where', 'company:UMich'], 
    "Find the currently active semester (is_current = 1). Return the semester_id and name.", 
    "Filter by is_current = 1.", "Check the semesters table.", 
    "SELECT semester_id, name FROM semesters WHERE is_current = 1;", 
    "SELECT semester_id, name FROM semesters WHERE is_current = 1;"),

  make(14, 'university', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:UTAustin'], 
    "How many distinct buildings have classrooms? Return the count as 'unique_buildings'.", 
    "Use COUNT(DISTINCT building).", "Query the classrooms table.", 
    "SELECT COUNT(DISTINCT building) AS unique_buildings FROM classrooms;", 
    "SELECT COUNT(DISTINCT building) AS unique_buildings FROM classrooms;"),

  make(15, 'university', 'easy', ['topic:Basic SQL', 'Math', 'company:UW'], 
    "List all professors who have tenure (tenure = 1). Return first_name, last_name, and department_id.", 
    "Filter for tenure = 1.", "Look at the professors table.", 
    "SELECT first_name, last_name, department_id FROM professors WHERE tenure = 1;", 
    "SELECT first_name, last_name, department_id FROM professors WHERE tenure = 1;"),

  make(16, 'university', 'easy', ['topic:Data Cleaning', 'Like', 'company:GeorgiaTech'], 
    "Find all courses that have 'Introduction' in their title. Return course_id and title.", 
    "Use LIKE '%Introduction%'.", "Query the courses table.", 
    "SELECT course_id, title FROM courses WHERE title LIKE '%Introduction%';", 
    "SELECT course_id, title FROM courses WHERE title LIKE '%Introduction%';"),

  make(17, 'university', 'easy', ['topic:Basic SQL', 'Where', 'company:CMU'], 
    "Find all classrooms that do NOT have a projector (has_projector = 0). Return classroom_id and room_number.", 
    "Check if has_projector = 0.", "Query the classrooms table.", 
    "SELECT classroom_id, room_number FROM classrooms WHERE has_projector = 0;", 
    "SELECT classroom_id, room_number FROM classrooms WHERE has_projector = 0;"),

  make(18, 'university', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:Purdue'], 
    "Count the number of courses offered by each department (department_id). Return department_id and course_count.", 
    "Group by department_id in the courses table.", "Use COUNT(*).", 
    "SELECT department_id, COUNT(*) AS course_count FROM courses GROUP BY department_id;", 
    "SELECT department_id, COUNT(*) AS course_count FROM courses GROUP BY department_id;"),

  make(19, 'university', 'easy', ['topic:Basic SQL', 'Order By', 'company:UIUC'], 
    "Find the 3 longest semesters based on end_date (furthest in the future). Return name, start_date, and end_date.", 
    "Order by end_date DESC.", "Limit to 3.", 
    "SELECT name, start_date, end_date FROM semesters ORDER BY end_date DESC LIMIT 3;", 
    "SELECT name, start_date, end_date FROM semesters ORDER BY end_date DESC LIMIT 3;"),

  make(20, 'university', 'easy', ['topic:Basic SQL', 'Where', 'company:Caltech'], 
    "Find all students born before the year 2000. Return first_name, last_name, and dob.", 
    "Filter dob < '2000-01-01'.", "Query students.", 
    "SELECT first_name, last_name, dob FROM students WHERE dob < '2000-01-01';", 
    "SELECT first_name, last_name, dob FROM students WHERE dob < '2000-01-01';"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(21, 'university', 'medium', ['topic:Joins', 'Data Analysis', 'company:Harvard'], 
    "List all courses and their corresponding department names. Return course title and department name.", 
    "Join courses and departments.", "Select the correct columns.", 
    "SELECT c.title, d.name AS department_name FROM courses c JOIN departments d ON c.department_id = d.department_id;", 
    "SELECT c.title, d.name AS department_name FROM courses c JOIN departments d ON c.department_id = d.department_id;"),

  make(22, 'university', 'medium', ['topic:Joins', 'Math', 'company:MIT'], 
    "How many students are enrolled in the 'Computer Science' major? Return the major and the count.", 
    "Group by major.", "Filter for Computer Science.", 
    "SELECT major, COUNT(*) AS student_count FROM students WHERE major = 'Computer Science' GROUP BY major;", 
    "SELECT major, COUNT(*) AS student_count FROM students WHERE major = 'Computer Science' GROUP BY major;"),

  make(23, 'university', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:Stanford'], 
    "Find all professors who are the head of a department. Return their first_name, last_name, and the department name they head.", 
    "Join professors and departments where professor_id = head_professor_id.", "Ensure correct join condition.", 
    "SELECT p.first_name, p.last_name, d.name AS department_name FROM professors p JOIN departments d ON p.professor_id = d.head_professor_id;", 
    "SELECT p.first_name, p.last_name, d.name AS department_name FROM professors p JOIN departments d ON p.professor_id = d.head_professor_id;"),

  make(24, 'university', 'medium', ['topic:Joins', 'Group By', 'company:Yale'], 
    "Which professor is advising the most students? Return professor first_name, last_name, and advisee_count.", 
    "Join professors and students on advisor_id.", "Group by professor, order desc, limit 1.", 
    "SELECT p.first_name, p.last_name, COUNT(s.student_id) AS advisee_count FROM professors p JOIN students s ON p.professor_id = s.advisor_id GROUP BY p.professor_id ORDER BY advisee_count DESC LIMIT 1;", 
    "SELECT p.first_name, p.last_name, COUNT(s.student_id) AS advisee_count FROM professors p JOIN students s ON p.professor_id = s.advisor_id GROUP BY p.professor_id ORDER BY advisee_count DESC LIMIT 1;"),

  make(25, 'university', 'medium', ['topic:Case Statements', 'Math', 'company:Princeton'], 
    "Categorize grades into 'Pass' (A, B, C) and 'Fail' (D, F). Return the category and the count of grades in each.", 
    "Use a CASE statement on letter_grade.", "Group by the CASE statement.", 
    "SELECT CASE WHEN letter_grade IN ('A','B','C') THEN 'Pass' ELSE 'Fail' END AS status, COUNT(*) AS count FROM grades GROUP BY status;", 
    "SELECT CASE WHEN letter_grade IN ('A','B','C') THEN 'Pass' ELSE 'Fail' END AS status, COUNT(*) AS count FROM grades GROUP BY status;"),

  make(26, 'university', 'medium', ['topic:Joins', 'Having', 'company:Columbia'], 
    "Find courses that have more than 3 students enrolled across all semesters. Return course title and enrollment count.", 
    "Join courses and enrollments.", "Group by course_id and use HAVING count > 3.", 
    "SELECT c.title, COUNT(e.student_id) AS enrollment_count FROM courses c JOIN enrollments e ON c.course_id = e.course_id GROUP BY c.course_id HAVING COUNT(e.student_id) > 3;", 
    "SELECT c.title, COUNT(e.student_id) AS enrollment_count FROM courses c JOIN enrollments e ON c.course_id = e.course_id GROUP BY c.course_id HAVING COUNT(e.student_id) > 3;"),

  make(27, 'university', 'medium', ['topic:Subqueries', 'Null Handling', 'company:UPenn'], 
    "Identify students who have NEVER enrolled in any course. Return their student_id, first_name, and last_name.", 
    "Use a subquery for student_id NOT IN (enrollments).", "Or use a LEFT JOIN.", 
    "SELECT student_id, first_name, last_name FROM students WHERE student_id NOT IN (SELECT student_id FROM enrollments);", 
    "SELECT student_id, first_name, last_name FROM students WHERE student_id NOT IN (SELECT student_id FROM enrollments);"),

  make(28, 'university', 'medium', ['topic:Date Functions', 'Math', 'company:Cornell'], 
    "Calculate the duration in days of each semester. Return semester name and duration_days. (end_date - start_date)", 
    "Use julianday(end_date) - julianday(start_date).", "Query the semesters table.", 
    "SELECT name, ROUND(julianday(end_date) - julianday(start_date)) AS duration_days FROM semesters;", 
    "SELECT name, ROUND(julianday(end_date) - julianday(start_date)) AS duration_days FROM semesters;"),

  make(29, 'university', 'medium', ['topic:Joins', 'Null Handling', 'company:Brown'], 
    "List all courses that do NOT have a prerequisite (prereq_course_id IS NULL). Return course title and department_name.", 
    "Join courses to departments.", "Filter where prereq_course_id IS NULL.", 
    "SELECT c.title, d.name AS department_name FROM courses c JOIN departments d ON c.department_id = d.department_id WHERE c.prereq_course_id IS NULL;", 
    "SELECT c.title, d.name AS department_name FROM courses c JOIN departments d ON c.department_id = d.department_id WHERE c.prereq_course_id IS NULL;"),

  make(30, 'university', 'medium', ['topic:Joins', 'Data Analysis', 'company:Dartmouth'], 
    "Which student has the highest average final_score across all their classes? Return first_name, last_name, and avg_score.", 
    "Join students, enrollments, grades.", "Group by student, order by avg(final_score) desc, limit 1.", 
    "SELECT s.first_name, s.last_name, ROUND(AVG(g.final_score), 2) AS avg_score FROM students s JOIN enrollments e ON s.student_id = e.student_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY s.student_id ORDER BY avg_score DESC LIMIT 1;", 
    "SELECT s.first_name, s.last_name, ROUND(AVG(g.final_score), 2) AS avg_score FROM students s JOIN enrollments e ON s.student_id = e.student_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY s.student_id ORDER BY avg_score DESC LIMIT 1;"),

  make(31, 'university', 'medium', ['topic:Subqueries', 'Math', 'company:UCBerkeley'], 
    "Find courses where the credit_hours are strictly greater than the average credit_hours of all courses. Return title and credit_hours.", 
    "Use a subquery to get AVG(credit_hours).", "Compare course credit_hours to it.", 
    "SELECT title, credit_hours FROM courses WHERE credit_hours > (SELECT AVG(credit_hours) FROM courses);", 
    "SELECT title, credit_hours FROM courses WHERE credit_hours > (SELECT AVG(credit_hours) FROM courses);"),

  make(32, 'university', 'medium', ['topic:Joins', 'Group By', 'company:UCLA'], 
    "Find the total number of 'A' grades awarded in each department. Return department_name and count_of_As.", 
    "Join grades, enrollments, courses, departments.", "Filter for letter_grade = 'A', group by department.", 
    "SELECT d.name AS department_name, COUNT(g.grade_id) AS count_of_As FROM grades g JOIN enrollments e ON g.enrollment_id = e.enrollment_id JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE g.letter_grade = 'A' GROUP BY d.name;", 
    "SELECT d.name AS department_name, COUNT(g.grade_id) AS count_of_As FROM grades g JOIN enrollments e ON g.enrollment_id = e.enrollment_id JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE g.letter_grade = 'A' GROUP BY d.name;"),

  make(33, 'university', 'medium', ['topic:Joins', 'Self Join', 'company:UMich'], 
    "Find the title of courses and the title of their direct prerequisite course. Return course_title and prereq_title.", 
    "Self join courses on prereq_course_id = course_id.", "Use LEFT JOIN to include courses without prereqs.", 
    "SELECT c1.title AS course_title, c2.title AS prereq_title FROM courses c1 LEFT JOIN courses c2 ON c1.prereq_course_id = c2.course_id;", 
    "SELECT c1.title AS course_title, c2.title AS prereq_title FROM courses c1 LEFT JOIN courses c2 ON c1.prereq_course_id = c2.course_id;"),

  make(34, 'university', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:UTAustin'], 
    "Calculate a pseudo-GPA for students based on letter grades: A=4, B=3, C=2, D=1, F=0. Return student_id and their calculated GPA (average of their points).", 
    "Use a CASE statement inside AVG().", "Group by student_id in enrollments/grades.", 
    "SELECT e.student_id, ROUND(AVG(CASE letter_grade WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 ELSE 0 END), 2) AS gpa FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY e.student_id;", 
    "SELECT e.student_id, ROUND(AVG(CASE letter_grade WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 ELSE 0 END), 2) AS gpa FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY e.student_id;"),

  make(35, 'university', 'medium', ['topic:CTEs', 'Data Analysis', 'company:UW'], 
    "Use a CTE to find the number of enrollments per course. Then find the course title with the absolute lowest number of enrollments (must be > 0).", 
    "CTE groups by course_id and counts.", "Main query finds the MIN.", 
    "WITH CourseCounts AS (SELECT course_id, COUNT(*) as e_count FROM enrollments GROUP BY course_id) SELECT c.title FROM CourseCounts cc JOIN courses c ON cc.course_id = c.course_id WHERE cc.e_count = (SELECT MIN(e_count) FROM CourseCounts);", 
    "WITH CourseCounts AS (SELECT course_id, COUNT(*) as e_count FROM enrollments GROUP BY course_id) SELECT c.title FROM CourseCounts cc JOIN courses c ON cc.course_id = c.course_id WHERE cc.e_count = (SELECT MIN(e_count) FROM CourseCounts);"),

  make(36, 'university', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:GeorgiaTech'], 
    "Find students who have enrolled in BOTH a 'Computer Science' department course AND a 'Mathematics' department course. Return student_id.", 
    "Use INTERSECT.", "Query enrollments and courses.", 
    "SELECT e.student_id FROM enrollments e JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE d.name = 'Computer Science' INTERSECT SELECT e.student_id FROM enrollments e JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE d.name = 'Mathematics';", 
    "SELECT e.student_id FROM enrollments e JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE d.name = 'Computer Science' INTERSECT SELECT e.student_id FROM enrollments e JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE d.name = 'Mathematics';"),

  make(37, 'university', 'medium', ['topic:Joins', 'Date Functions', 'company:CMU'], 
    "Find students whose advisor was hired AFTER the student enrolled. Return student name and professor name.", 
    "Join students and professors.", "Compare enrolled_since and hired_at.", 
    "SELECT s.first_name || ' ' || s.last_name AS student_name, p.first_name || ' ' || p.last_name AS professor_name FROM students s JOIN professors p ON s.advisor_id = p.professor_id WHERE p.hired_at > s.enrolled_since;", 
    "SELECT s.first_name || ' ' || s.last_name AS student_name, p.first_name || ' ' || p.last_name AS professor_name FROM students s JOIN professors p ON s.advisor_id = p.professor_id WHERE p.hired_at > s.enrolled_since;"),

  make(38, 'university', 'medium', ['topic:Joins', 'Group By', 'company:Purdue'], 
    "Which building has the most total classroom capacity? Return building name and total capacity.", 
    "Group by building in classrooms.", "Sort desc, limit 1.", 
    "SELECT building, SUM(capacity) AS total_cap FROM classrooms GROUP BY building ORDER BY total_cap DESC LIMIT 1;", 
    "SELECT building, SUM(capacity) AS total_cap FROM classrooms GROUP BY building ORDER BY total_cap DESC LIMIT 1;"),

  make(39, 'university', 'medium', ['topic:Joins', 'Math', 'company:UIUC'], 
    "Calculate the percentage of professors who have tenure. Return as 'tenure_rate' rounded to 2 decimals.", 
    "SUM(tenure) / COUNT(*).", "Query professors.", 
    "SELECT ROUND(SUM(tenure) * 100.0 / COUNT(*), 2) AS tenure_rate FROM professors;", 
    "SELECT ROUND(SUM(tenure) * 100.0 / COUNT(*), 2) AS tenure_rate FROM professors;"),

  make(40, 'university', 'medium', ['topic:Math', 'Data Analysis', 'company:Caltech'], 
    "What is the average number of credit_hours a student enrolls in per semester? Calculate (Total Credit Hours / Total Distinct Enrollments/Semesters). Return avg_credits rounded to 1 decimal.", 
    "Join enrollments and courses, sum credits.", "Divide by count of distinct student/semester pairs.", 
    "SELECT ROUND(CAST(SUM(c.credit_hours) AS REAL) / COUNT(DISTINCT e.student_id || '-' || e.semester_id), 1) AS avg_credits_per_semester FROM enrollments e JOIN courses c ON e.course_id = c.course_id;", 
    "SELECT ROUND(CAST(SUM(c.credit_hours) AS REAL) / COUNT(DISTINCT e.student_id || '-' || e.semester_id), 1) AS avg_credits_per_semester FROM enrollments e JOIN courses c ON e.course_id = c.course_id;"),

  make(41, 'university', 'medium', ['topic:Joins', 'Null Handling', 'company:Harvard'], 
    "Find departments that currently have no courses assigned to them. Return department name.", 
    "Left join departments to courses.", "Check for NULL course_id.", 
    "SELECT d.name FROM departments d LEFT JOIN courses c ON d.department_id = c.department_id WHERE c.course_id IS NULL;", 
    "SELECT d.name FROM departments d LEFT JOIN courses c ON d.department_id = c.department_id WHERE c.course_id IS NULL;"),

  make(42, 'university', 'medium', ['topic:String Functions', 'Basic SQL', 'company:MIT'], 
    "Generate a unique login ID for each student using the first letter of their first_name and their full last_name in lowercase. Return student_id and login_id.", 
    "Use lower() and substr().", "Concatenate.", 
    "SELECT student_id, lower(substr(first_name, 1, 1) || last_name) AS login_id FROM students;", 
    "SELECT student_id, lower(substr(first_name, 1, 1) || last_name) AS login_id FROM students;"),

  make(43, 'university', 'medium', ['topic:Math', 'Date Functions', 'company:Stanford'], 
    "Calculate the current age (in years) of student_id 1. Assume current date is '2024-08-01'. Return age rounded down.", 
    "Use (julianday('2024-08-01') - julianday(dob)) / 365.25.", "Cast to integer.", 
    "SELECT CAST((julianday('2024-08-01') - julianday(dob)) / 365.25 AS INTEGER) AS age FROM students WHERE student_id = 1;", 
    "SELECT CAST((julianday('2024-08-01') - julianday(dob)) / 365.25 AS INTEGER) AS age FROM students WHERE student_id = 1;"),

  make(44, 'university', 'medium', ['topic:Group By', 'Having', 'company:Yale'], 
    "Identify professors who teach (or are assigned to) courses totaling more than 6 credit hours. Wait, professors don't directly link to courses here. Let's find departments that offer more than 10 total credit_hours. Return department_id and total_credits.", 
    "Group by department_id in courses.", "Use HAVING SUM(credit_hours) > 10.", 
    "SELECT department_id, SUM(credit_hours) as total_credits FROM courses GROUP BY department_id HAVING SUM(credit_hours) > 10;", 
    "SELECT department_id, SUM(credit_hours) as total_credits FROM courses GROUP BY department_id HAVING SUM(credit_hours) > 10;"),

  make(45, 'university', 'medium', ['topic:Joins', 'Data Analysis', 'company:Princeton'], 
    "List the most commonly assigned letter_grade for courses in the 'Physics' department. Return letter_grade and count.", 
    "Join departments, courses, enrollments, grades.", "Filter for Physics, group by letter_grade, sort desc, limit 1.", 
    "SELECT g.letter_grade, COUNT(g.grade_id) as grade_count FROM grades g JOIN enrollments e ON g.enrollment_id = e.enrollment_id JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE d.name = 'Physics' GROUP BY g.letter_grade ORDER BY grade_count DESC LIMIT 1;", 
    "SELECT g.letter_grade, COUNT(g.grade_id) as grade_count FROM grades g JOIN enrollments e ON g.enrollment_id = e.enrollment_id JOIN courses c ON e.course_id = c.course_id JOIN departments d ON c.department_id = d.department_id WHERE d.name = 'Physics' GROUP BY g.letter_grade ORDER BY grade_count DESC LIMIT 1;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(46, 'university', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:Columbia'], 
    "Analyze grade trends. For student_id 1, compare their final_score in each semester to their previous semester's average final_score. Return semester_id, current_avg_score, and prev_avg_score.", 
    "Group by semester, calculate avg.", "Use LAG() OVER(ORDER BY semester_id).", 
    "WITH SemAvg AS (SELECT e.semester_id, AVG(g.final_score) as avg_score FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE e.student_id = 1 GROUP BY e.semester_id) SELECT semester_id, ROUND(avg_score, 2) as current_avg, ROUND(LAG(avg_score) OVER(ORDER BY semester_id), 2) as prev_avg FROM SemAvg;", 
    "WITH SemAvg AS (SELECT e.semester_id, AVG(g.final_score) as avg_score FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE e.student_id = 1 GROUP BY e.semester_id) SELECT semester_id, ROUND(avg_score, 2) as current_avg, ROUND(LAG(avg_score) OVER(ORDER BY semester_id), 2) as prev_avg FROM SemAvg;"),

  make(47, 'university', 'hard', ['topic:Window Functions', 'Rank', 'company:UPenn'], 
    "Rank students within each major by their GPA (using the A=4,B=3 scale). Return major, student_id, GPA, and rank.", 
    "Use DENSE_RANK() OVER(PARTITION BY major ORDER BY gpa DESC).", "Calculate GPA using a CTE.", 
    "WITH StudentGPA AS (SELECT s.major, s.student_id, ROUND(AVG(CASE g.letter_grade WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 ELSE 0 END), 2) as gpa FROM students s JOIN enrollments e ON s.student_id = e.student_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY s.student_id) SELECT major, student_id, gpa, DENSE_RANK() OVER(PARTITION BY major ORDER BY gpa DESC) as rank FROM StudentGPA;", 
    "WITH StudentGPA AS (SELECT s.major, s.student_id, ROUND(AVG(CASE g.letter_grade WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 ELSE 0 END), 2) as gpa FROM students s JOIN enrollments e ON s.student_id = e.student_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY s.student_id) SELECT major, student_id, gpa, DENSE_RANK() OVER(PARTITION BY major ORDER BY gpa DESC) as rank FROM StudentGPA;"),

  make(48, 'university', 'hard', ['topic:CTEs', 'Window Functions', 'company:Cornell'], 
    "Calculate the cumulative number of credits earned by student_id 1 over time (ordered by semester_id). Assume only A, B, C grades earn credit. Return semester_id and running_credits.", 
    "Sum credits per semester.", "Use SUM() OVER(ORDER BY semester_id).", 
    "WITH SemCredits AS (SELECT e.semester_id, SUM(c.credit_hours) as earned_credits FROM enrollments e JOIN courses c ON e.course_id = c.course_id JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE e.student_id = 1 AND g.letter_grade IN ('A','B','C') GROUP BY e.semester_id) SELECT semester_id, SUM(earned_credits) OVER(ORDER BY semester_id) as running_credits FROM SemCredits;", 
    "WITH SemCredits AS (SELECT e.semester_id, SUM(c.credit_hours) as earned_credits FROM enrollments e JOIN courses c ON e.course_id = c.course_id JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE e.student_id = 1 AND g.letter_grade IN ('A','B','C') GROUP BY e.semester_id) SELECT semester_id, SUM(earned_credits) OVER(ORDER BY semester_id) as running_credits FROM SemCredits;"),

  make(49, 'university', 'hard', ['topic:Window Functions', 'Partition By', 'company:Brown'], 
    "Identify 'Tough Courses'. Find courses where the average final_score is lower than the department's overall average final_score. Return course title, course avg, and department avg.", 
    "Calculate course avg, use AVG() OVER(PARTITION BY department_id).", "Filter.", 
    "WITH CourseAvg AS (SELECT c.department_id, c.title, AVG(g.final_score) as c_avg FROM courses c JOIN enrollments e ON c.course_id = e.course_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY c.course_id), DeptAvg AS (SELECT *, AVG(c_avg) OVER(PARTITION BY department_id) as d_avg FROM CourseAvg) SELECT title, ROUND(c_avg, 2) as course_avg, ROUND(d_avg, 2) as dept_avg FROM DeptAvg WHERE c_avg < d_avg;", 
    "WITH CourseAvg AS (SELECT c.department_id, c.title, AVG(g.final_score) as c_avg FROM courses c JOIN enrollments e ON c.course_id = e.course_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY c.course_id), DeptAvg AS (SELECT *, AVG(c_avg) OVER(PARTITION BY department_id) as d_avg FROM CourseAvg) SELECT title, ROUND(c_avg, 2) as course_avg, ROUND(d_avg, 2) as dept_avg FROM DeptAvg WHERE c_avg < d_avg;"),

  make(50, 'university', 'hard', ['topic:CTEs', 'Self Join', 'company:Dartmouth'], 
    "Detect 'Prerequisite Violations'. Find enrollments where a student took a course WITHOUT ever passing (grade A, B, C) its required prerequisite course in a PRIOR semester. Return student_id and course_id of the violation.", 
    "Check course prereq.", "Join student history to see if prereq was taken earlier.", 
    "WITH PassedCourses AS (SELECT e.student_id, e.course_id, e.semester_id FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE g.letter_grade IN ('A','B','C')) SELECT e.student_id, e.course_id FROM enrollments e JOIN courses c ON e.course_id = c.course_id WHERE c.prereq_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM PassedCourses pc WHERE pc.student_id = e.student_id AND pc.course_id = c.prereq_course_id AND pc.semester_id < e.semester_id);", 
    "WITH PassedCourses AS (SELECT e.student_id, e.course_id, e.semester_id FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE g.letter_grade IN ('A','B','C')) SELECT e.student_id, e.course_id FROM enrollments e JOIN courses c ON e.course_id = c.course_id WHERE c.prereq_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM PassedCourses pc WHERE pc.student_id = e.student_id AND pc.course_id = c.prereq_course_id AND pc.semester_id < e.semester_id);"),

  make(51, 'university', 'hard', ['topic:Window Functions', 'Math', 'company:UCBerkeley'], 
    "Calculate the percentage of total university enrollments handled by each department. Return department name and the percentage rounded to 2 decimals.", 
    "Count enrollments per department.", "Divide by SUM(count) OVER().", 
    "WITH DeptEnrolls AS (SELECT d.name, COUNT(e.enrollment_id) as e_count FROM departments d LEFT JOIN courses c ON d.department_id = c.department_id LEFT JOIN enrollments e ON c.course_id = e.course_id GROUP BY d.department_id) SELECT name, ROUND(e_count * 100.0 / NULLIF(SUM(e_count) OVER(), 0), 2) as enrollment_percentage FROM DeptEnrolls;", 
    "WITH DeptEnrolls AS (SELECT d.name, COUNT(e.enrollment_id) as e_count FROM departments d LEFT JOIN courses c ON d.department_id = c.department_id LEFT JOIN enrollments e ON c.course_id = e.course_id GROUP BY d.department_id) SELECT name, ROUND(e_count * 100.0 / NULLIF(SUM(e_count) OVER(), 0), 2) as enrollment_percentage FROM DeptEnrolls;"),

  make(52, 'university', 'hard', ['topic:CTEs', 'Data Analysis', 'company:UCLA'], 
    "Identify 'Grade Inflators'. Departments where the percentage of 'A' grades is greater than 50% of all their grades. Return department_name and a_percentage.", 
    "Count A grades vs total grades per department.", "Use a CTE.", 
    "WITH DeptGrades AS (SELECT d.name as dept, SUM(CASE WHEN g.letter_grade = 'A' THEN 1 ELSE 0 END) as a_grades, COUNT(g.grade_id) as total_grades FROM departments d JOIN courses c ON d.department_id = c.department_id JOIN enrollments e ON c.course_id = e.course_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY d.department_id) SELECT dept, ROUND(a_grades * 100.0 / total_grades, 2) as a_percentage FROM DeptGrades WHERE a_grades * 100.0 / total_grades > 50;", 
    "WITH DeptGrades AS (SELECT d.name as dept, SUM(CASE WHEN g.letter_grade = 'A' THEN 1 ELSE 0 END) as a_grades, COUNT(g.grade_id) as total_grades FROM departments d JOIN courses c ON d.department_id = c.department_id JOIN enrollments e ON c.course_id = e.course_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY d.department_id) SELECT dept, ROUND(a_grades * 100.0 / total_grades, 2) as a_percentage FROM DeptGrades WHERE a_grades * 100.0 / total_grades > 50;"),

  make(53, 'university', 'hard', ['topic:Window Functions', 'Ntile', 'company:UMich'], 
    "Create a 'Class Size Tier'. Divide courses into 3 tiers based on their total historical enrollment (1 being most enrolled). Return course_title, total_enrollment, and tier.", 
    "Use NTILE(3) OVER(ORDER BY total_enrollment DESC).", "Count enrollments per course.", 
    "WITH CourseEnroll AS (SELECT c.title, COUNT(e.enrollment_id) as total_enrollment FROM courses c LEFT JOIN enrollments e ON c.course_id = e.course_id GROUP BY c.course_id) SELECT title, total_enrollment, NTILE(3) OVER(ORDER BY total_enrollment DESC) as tier FROM CourseEnroll;", 
    "WITH CourseEnroll AS (SELECT c.title, COUNT(e.enrollment_id) as total_enrollment FROM courses c LEFT JOIN enrollments e ON c.course_id = e.course_id GROUP BY c.course_id) SELECT title, total_enrollment, NTILE(3) OVER(ORDER BY total_enrollment DESC) as tier FROM CourseEnroll;"),

  make(54, 'university', 'hard', ['topic:CTEs', 'Self Join', 'company:UTAustin'], 
    "Find 'Simultaneous Enrollments'. Identify students who enrolled in a course AND its prerequisite in the EXACT SAME semester. Return student_id, course_id, and prereq_course_id.", 
    "Join enrollments to itself.", "Check for same semester, but c1 is prereq of c2.", 
    "SELECT e1.student_id, e1.course_id as course_id, e2.course_id as prereq_course_id FROM enrollments e1 JOIN courses c ON e1.course_id = c.course_id JOIN enrollments e2 ON e1.student_id = e2.student_id AND e1.semester_id = e2.semester_id AND c.prereq_course_id = e2.course_id;", 
    "SELECT e1.student_id, e1.course_id as course_id, e2.course_id as prereq_course_id FROM enrollments e1 JOIN courses c ON e1.course_id = c.course_id JOIN enrollments e2 ON e1.student_id = e2.student_id AND e1.semester_id = e2.semester_id AND c.prereq_course_id = e2.course_id;"),

  make(55, 'university', 'hard', ['topic:CTEs', 'Data Analysis', 'company:UW'], 
    "Calculate the 'Dropout Rate' per major. (Number of students who have NO enrollments in the current semester (is_current=1) / Total students in that major). Return major and dropout_rate percentage.", 
    "Count total students.", "Count students enrolled in current.", "Subtract and divide.", 
    "WITH CurrentEnroll AS (SELECT DISTINCT e.student_id FROM enrollments e JOIN semesters s ON e.semester_id = s.semester_id WHERE s.is_current = 1), MajorStats AS (SELECT major, COUNT(*) as total_students, SUM(CASE WHEN student_id IN (SELECT student_id FROM CurrentEnroll) THEN 1 ELSE 0 END) as active_students FROM students GROUP BY major) SELECT major, ROUND((total_students - active_students) * 100.0 / total_students, 2) as dropout_rate FROM MajorStats;", 
    "WITH CurrentEnroll AS (SELECT DISTINCT e.student_id FROM enrollments e JOIN semesters s ON e.semester_id = s.semester_id WHERE s.is_current = 1), MajorStats AS (SELECT major, COUNT(*) as total_students, SUM(CASE WHEN student_id IN (SELECT student_id FROM CurrentEnroll) THEN 1 ELSE 0 END) as active_students FROM students GROUP BY major) SELECT major, ROUND((total_students - active_students) * 100.0 / total_students, 2) as dropout_rate FROM MajorStats;"),

  make(56, 'university', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:GeorgiaTech'], 
    "For course 'Algorithms' (id=3), find the change in average final_score between consecutive semesters it was offered. Return semester_id, avg_score, and change_from_prev.", 
    "Use LAG() OVER(ORDER BY semester_id).", "Calculate avg_score per semester for course 3.", 
    "WITH CourseAvg AS (SELECT e.semester_id, AVG(g.final_score) as avg_score FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE e.course_id = 3 GROUP BY e.semester_id) SELECT semester_id, ROUND(avg_score, 2) as current_avg, ROUND(avg_score - LAG(avg_score) OVER(ORDER BY semester_id), 2) as change_from_prev FROM CourseAvg;", 
    "WITH CourseAvg AS (SELECT e.semester_id, AVG(g.final_score) as avg_score FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE e.course_id = 3 GROUP BY e.semester_id) SELECT semester_id, ROUND(avg_score, 2) as current_avg, ROUND(avg_score - LAG(avg_score) OVER(ORDER BY semester_id), 2) as change_from_prev FROM CourseAvg;"),

  make(57, 'university', 'hard', ['topic:CTEs', 'Null Handling', 'company:CMU'], 
    "Identify 'Ghost Courses'. Courses that exist in the catalog (courses table) but have NEVER had a single enrollment. Return course title.", 
    "Left join courses to enrollments.", "Check where enrollment_id is NULL.", 
    "SELECT c.title FROM courses c LEFT JOIN enrollments e ON c.course_id = e.course_id WHERE e.enrollment_id IS NULL;", 
    "SELECT c.title FROM courses c LEFT JOIN enrollments e ON c.course_id = e.course_id WHERE e.enrollment_id IS NULL;"),

  make(58, 'university', 'hard', ['topic:Window Functions', 'Rank', 'company:Purdue'], 
    "Who is the highest performing student (by GPA) advised by each professor? Return professor_name, student_name, GPA, and rank (must be 1).", 
    "Calculate GPA.", "Use ROW_NUMBER() OVER(PARTITION BY advisor_id ORDER BY gpa DESC).", 
    "WITH StudentGPA AS (SELECT advisor_id, first_name || ' ' || last_name as student_name, ROUND(AVG(CASE letter_grade WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 ELSE 0 END), 2) as gpa FROM students s JOIN enrollments e ON s.student_id = e.student_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY s.student_id), RankedStudents AS (SELECT advisor_id, student_name, gpa, ROW_NUMBER() OVER(PARTITION BY advisor_id ORDER BY gpa DESC) as rn FROM StudentGPA WHERE advisor_id IS NOT NULL) SELECT p.first_name || ' ' || p.last_name as professor_name, rs.student_name, rs.gpa FROM RankedStudents rs JOIN professors p ON rs.advisor_id = p.professor_id WHERE rs.rn = 1;", 
    "WITH StudentGPA AS (SELECT advisor_id, first_name || ' ' || last_name as student_name, ROUND(AVG(CASE letter_grade WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 ELSE 0 END), 2) as gpa FROM students s JOIN enrollments e ON s.student_id = e.student_id JOIN grades g ON e.enrollment_id = g.enrollment_id GROUP BY s.student_id), RankedStudents AS (SELECT advisor_id, student_name, gpa, ROW_NUMBER() OVER(PARTITION BY advisor_id ORDER BY gpa DESC) as rn FROM StudentGPA WHERE advisor_id IS NOT NULL) SELECT p.first_name || ' ' || p.last_name as professor_name, rs.student_name, rs.gpa FROM RankedStudents rs JOIN professors p ON rs.advisor_id = p.professor_id WHERE rs.rn = 1;"),

  make(59, 'university', 'hard', ['topic:Math', 'Data Analysis', 'company:UIUC'], 
    "Calculate the 'Classroom Utilization Rate' for the Science Building. (Total enrollments in that building / Total capacity of that building). Return rate as a percentage.", 
    "Sum capacity of Science Building.", "Count enrollments mapped to that building's departments (or classrooms if courses mapped, but here classrooms map to departments). Wait, enrollments map to courses -> departments. Classrooms map to departments. Let's just find sum of capacities of Science Building, and divide enrollments of departments in that building by it.", 
    "WITH BldgCap AS (SELECT SUM(capacity) as total_cap FROM classrooms WHERE building = 'Science Building'), BldgDepts AS (SELECT department_id FROM classrooms WHERE building = 'Science Building'), BldgEnrolls AS (SELECT COUNT(e.enrollment_id) as total_enrolls FROM enrollments e JOIN courses c ON e.course_id = c.course_id WHERE c.department_id IN (SELECT department_id FROM BldgDepts)) SELECT ROUND(CAST(be.total_enrolls AS REAL) * 100.0 / bc.total_cap, 2) as utilization_rate FROM BldgCap bc CROSS JOIN BldgEnrolls be;", 
    "WITH BldgCap AS (SELECT SUM(capacity) as total_cap FROM classrooms WHERE building = 'Science Building'), BldgDepts AS (SELECT department_id FROM classrooms WHERE building = 'Science Building'), BldgEnrolls AS (SELECT COUNT(e.enrollment_id) as total_enrolls FROM enrollments e JOIN courses c ON e.course_id = c.course_id WHERE c.department_id IN (SELECT department_id FROM BldgDepts)) SELECT ROUND(CAST(be.total_enrolls AS REAL) * 100.0 / bc.total_cap, 2) as utilization_rate FROM BldgCap bc CROSS JOIN BldgEnrolls be;"),

  make(60, 'university', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Caltech'], 
    "Identify 'Double Dippers'. Students who took the exact same course twice across different semesters and passed (A,B,C) both times. Return student_id and course_id.", 
    "Group by student, course.", "Count where grade in A,B,C.", "HAVING count > 1.", 
    "SELECT e.student_id, e.course_id FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE g.letter_grade IN ('A','B','C') GROUP BY e.student_id, e.course_id HAVING COUNT(DISTINCT e.semester_id) > 1;", 
    "SELECT e.student_id, e.course_id FROM enrollments e JOIN grades g ON e.enrollment_id = g.enrollment_id WHERE g.letter_grade IN ('A','B','C') GROUP BY e.student_id, e.course_id HAVING COUNT(DISTINCT e.semester_id) > 1;")
];
