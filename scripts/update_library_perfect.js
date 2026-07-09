import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.join(__dirname, '../src/data/questions/library.jsx');

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

// LIBRARY QUESTIONS (IDs 1-60)
export const libraryQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(1, 'library', 'easy', ['topic:Basic SQL', 'Where', 'company:NYPL'], 
    "Find all books in the 'Fantasy' genre. Return their title and published_year.", 
    "Filter the books table by genre.", "Use WHERE genre = 'Fantasy'.", 
    "SELECT title, published_year FROM books WHERE genre = 'Fantasy';", 
    "SELECT title, published_year FROM books WHERE genre = 'Fantasy';"),

  make(2, 'library', 'easy', ['topic:String Functions', 'Basic SQL', 'company:BostonPublicLibrary'], 
    "Format author names for the catalog. Return a single column 'author_name' with the format 'Lastname, Firstname'.", 
    "Concatenate last_name, a comma and space, and first_name.", "Use the || operator.", 
    "SELECT last_name || ', ' || first_name AS author_name FROM authors;", 
    "SELECT last_name || ', ' || first_name AS author_name FROM authors;"),

  make(3, 'library', 'easy', ['topic:Math', 'Aggregate Functions', 'company:ChicagoPublicLibrary'], 
    "Calculate the total amount of all fines issued. Return as 'total_fines'.", 
    "Use SUM() on the amount column.", "Query the fines table.", 
    "SELECT SUM(amount) AS total_fines FROM fines;", 
    "SELECT SUM(amount) AS total_fines FROM fines;"),

  make(4, 'library', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:SFPublicLibrary'], 
    "Identify books that do not have a published_year listed (published_year IS NULL). Return book_id and title.", 
    "Check if published_year is NULL.", "Use WHERE published_year IS NULL.", 
    "SELECT book_id, title FROM books WHERE published_year IS NULL;", 
    "SELECT book_id, title FROM books WHERE published_year IS NULL;"),

  make(5, 'library', 'easy', ['topic:Data Analysis', 'Group By', 'company:SeattlePublicLibrary'], 
    "Count how many books we have for each genre. Return genre and the count of books.", 
    "Group by genre in the books table.", "Use COUNT(*).", 
    "SELECT genre, COUNT(*) AS book_count FROM books GROUP BY genre;", 
    "SELECT genre, COUNT(*) AS book_count FROM books GROUP BY genre;"),

  make(6, 'library', 'easy', ['topic:Date Functions', 'Where', 'company:BrooklynPublicLibrary'], 
    "Find all library members who joined in the year 2020. Return first_name, last_name, and joined_date.", 
    "Filter joined_date using LIKE or strftime.", "WHERE joined_date LIKE '2020-%'.", 
    "SELECT first_name, last_name, joined_date FROM members WHERE joined_date LIKE '2020-%';", 
    "SELECT first_name, last_name, joined_date FROM members WHERE joined_date LIKE '2020-%';"),

  make(7, 'library', 'easy', ['topic:Aggregate Functions', 'Math', 'company:QueensPublicLibrary'], 
    "What is the maximum number of pages of any book in the library? Return as 'max_pages'.", 
    "Use MAX(pages).", "Query the books table.", 
    "SELECT MAX(pages) AS max_pages FROM books;", 
    "SELECT MAX(pages) AS max_pages FROM books;"),

  make(8, 'library', 'easy', ['topic:Basic SQL', 'Limit', 'company:LAPublicLibrary'], 
    "List the 5 most recently joined members. Return first_name, last_name, and joined_date.", 
    "Sort by joined_date descending.", "Limit to 5.", 
    "SELECT first_name, last_name, joined_date FROM members ORDER BY joined_date DESC LIMIT 5;", 
    "SELECT first_name, last_name, joined_date FROM members ORDER BY joined_date DESC LIMIT 5;"),

  make(9, 'library', 'easy', ['topic:Basic SQL', 'In', 'company:DenverPublicLibrary'], 
    "Find all authors from 'British' or 'American' nationalities. Return first_name, last_name, and nationality.", 
    "Use the IN operator on the nationality column.", "WHERE nationality IN ('British', 'American').", 
    "SELECT first_name, last_name, nationality FROM authors WHERE nationality IN ('British', 'American');", 
    "SELECT first_name, last_name, nationality FROM authors WHERE nationality IN ('British', 'American');"),

  make(10, 'library', 'easy', ['topic:String Functions', 'Basic SQL', 'company:FreeLibraryOfPhiladelphia'], 
    "Find all members whose email domain is '@email.com'. Return first_name, last_name, and email.", 
    "Use LIKE '%@email.com'.", "Filter on the email column.", 
    "SELECT first_name, last_name, email FROM members WHERE email LIKE '%@email.com';", 
    "SELECT first_name, last_name, email FROM members WHERE email LIKE '%@email.com';"),

  make(11, 'library', 'easy', ['topic:Data Analysis', 'Group By', 'company:NYPL'], 
    "How many authors do we have from each nationality? Return nationality and count.", 
    "Use COUNT(*).", "Group by nationality in the authors table.", 
    "SELECT nationality, COUNT(*) AS author_count FROM authors GROUP BY nationality;", 
    "SELECT nationality, COUNT(*) AS author_count FROM authors GROUP BY nationality;"),

  make(12, 'library', 'easy', ['topic:Date Functions', 'String Functions', 'company:BostonPublicLibrary'], 
    "Extract the year from the loan_date for all loans. Return loan_id and loan_year.", 
    "Use substr() or strftime('%Y', loan_date).", "Query the loans table.", 
    "SELECT loan_id, strftime('%Y', loan_date) AS loan_year FROM loans;", 
    "SELECT loan_id, strftime('%Y', loan_date) AS loan_year FROM loans;"),

  make(13, 'library', 'easy', ['topic:Basic SQL', 'Where', 'company:ChicagoPublicLibrary'], 
    "Find all unpaid fines (paid_date IS NULL). Return fine_id and amount.", 
    "Filter by paid_date IS NULL.", "Check the fines table.", 
    "SELECT fine_id, amount FROM fines WHERE paid_date IS NULL;", 
    "SELECT fine_id, amount FROM fines WHERE paid_date IS NULL;"),

  make(14, 'library', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:SFPublicLibrary'], 
    "How many distinct genres of books do we have? Return the count as 'unique_genres'.", 
    "Use COUNT(DISTINCT genre).", "Query the books table.", 
    "SELECT COUNT(DISTINCT genre) AS unique_genres FROM books;", 
    "SELECT COUNT(DISTINCT genre) AS unique_genres FROM books;"),

  make(15, 'library', 'easy', ['topic:Basic SQL', 'Math', 'company:SeattlePublicLibrary'], 
    "List all books that have more than 500 pages. Return title and pages.", 
    "Filter for pages > 500.", "Look at the books table.", 
    "SELECT title, pages FROM books WHERE pages > 500;", 
    "SELECT title, pages FROM books WHERE pages > 500;"),

  make(16, 'library', 'easy', ['topic:Data Cleaning', 'Like', 'company:BrooklynPublicLibrary'], 
    "Find all books that have 'Harry Potter' in their title. Return book_id and title.", 
    "Use LIKE '%Harry Potter%'.", "Query the books table.", 
    "SELECT book_id, title FROM books WHERE title LIKE '%Harry Potter%';", 
    "SELECT book_id, title FROM books WHERE title LIKE '%Harry Potter%';"),

  make(17, 'library', 'easy', ['topic:Basic SQL', 'Where', 'company:QueensPublicLibrary'], 
    "Find all loans that have NOT yet been returned (return_date IS NULL). Return loan_id, book_id, and member_id.", 
    "Check if return_date IS NULL.", "Query the loans table.", 
    "SELECT loan_id, book_id, member_id FROM loans WHERE return_date IS NULL;", 
    "SELECT loan_id, book_id, member_id FROM loans WHERE return_date IS NULL;"),

  make(18, 'library', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:LAPublicLibrary'], 
    "Count the number of members registered at each branch (branch_id). Return branch_id and member_count.", 
    "Group by branch_id in the members table.", "Use COUNT(*).", 
    "SELECT branch_id, COUNT(*) AS member_count FROM members GROUP BY branch_id;", 
    "SELECT branch_id, COUNT(*) AS member_count FROM members GROUP BY branch_id;"),

  make(19, 'library', 'easy', ['topic:Basic SQL', 'Order By', 'company:DenverPublicLibrary'], 
    "Find the 3 oldest authors in the database based on their birth_year. Return first_name, last_name, and birth_year.", 
    "Order by birth_year ASC.", "Limit to 3.", 
    "SELECT first_name, last_name, birth_year FROM authors ORDER BY birth_year ASC LIMIT 3;", 
    "SELECT first_name, last_name, birth_year FROM authors ORDER BY birth_year ASC LIMIT 3;"),

  make(20, 'library', 'easy', ['topic:Basic SQL', 'Where', 'company:FreeLibraryOfPhiladelphia'], 
    "Find all loans made in March 2024. Return loan_id, book_id, and loan_date.", 
    "Filter loan_date using LIKE '2024-03-%'.", "Query loans.", 
    "SELECT loan_id, book_id, loan_date FROM loans WHERE loan_date LIKE '2024-03-%';", 
    "SELECT loan_id, book_id, loan_date FROM loans WHERE loan_date LIKE '2024-03-%';"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(21, 'library', 'medium', ['topic:Joins', 'Data Analysis', 'company:NYPL'], 
    "List all books and the full name of their author. Return book title, and author's first and last name.", 
    "Join books and authors.", "Select the correct columns.", 
    "SELECT b.title, a.first_name, a.last_name FROM books b JOIN authors a ON b.author_id = a.author_id;", 
    "SELECT b.title, a.first_name, a.last_name FROM books b JOIN authors a ON b.author_id = a.author_id;"),

  make(22, 'library', 'medium', ['topic:Joins', 'Math', 'company:BostonPublicLibrary'], 
    "How many books did we loan out from each branch? Return branch name and the loan count.", 
    "Join loans, members, and branches.", "Group by branch name and count.", 
    "SELECT b.name, COUNT(l.loan_id) AS loan_count FROM loans l JOIN members m ON l.member_id = m.member_id JOIN branches b ON m.branch_id = b.branch_id GROUP BY b.name;", 
    "SELECT b.name, COUNT(l.loan_id) AS loan_count FROM loans l JOIN members m ON l.member_id = m.member_id JOIN branches b ON m.branch_id = b.branch_id GROUP BY b.name;"),

  make(23, 'library', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:ChicagoPublicLibrary'], 
    "Find all members who are registered at the 'Central Library'. Return their first_name, last_name, and email.", 
    "Join members and branches.", "Filter for name = 'Central Library'.", 
    "SELECT m.first_name, m.last_name, m.email FROM members m JOIN branches b ON m.branch_id = b.branch_id WHERE b.name = 'Central Library';", 
    "SELECT m.first_name, m.last_name, m.email FROM members m JOIN branches b ON m.branch_id = b.branch_id WHERE b.name = 'Central Library';"),

  make(24, 'library', 'medium', ['topic:Joins', 'Group By', 'company:SFPublicLibrary'], 
    "Which book has been loaned the most times? Return book title and the loan_count.", 
    "Join books and loans.", "Group by book_id, sort desc, limit 1.", 
    "SELECT b.title, COUNT(l.loan_id) AS loan_count FROM books b JOIN loans l ON b.book_id = l.book_id GROUP BY b.book_id ORDER BY loan_count DESC LIMIT 1;", 
    "SELECT b.title, COUNT(l.loan_id) AS loan_count FROM books b JOIN loans l ON b.book_id = l.book_id GROUP BY b.book_id ORDER BY loan_count DESC LIMIT 1;"),

  make(25, 'library', 'medium', ['topic:Case Statements', 'Math', 'company:SeattlePublicLibrary'], 
    "Categorize books into 'Short' (< 200 pages), 'Medium' (200-500 pages), and 'Long' (> 500 pages). Return category and count.", 
    "Use a CASE statement on pages.", "Group by the CASE statement.", 
    "SELECT CASE WHEN pages < 200 THEN 'Short' WHEN pages <= 500 THEN 'Medium' ELSE 'Long' END AS length_category, COUNT(*) AS book_count FROM books GROUP BY length_category;", 
    "SELECT CASE WHEN pages < 200 THEN 'Short' WHEN pages <= 500 THEN 'Medium' ELSE 'Long' END AS length_category, COUNT(*) AS book_count FROM books GROUP BY length_category;"),

  make(26, 'library', 'medium', ['topic:Joins', 'Having', 'company:BrooklynPublicLibrary'], 
    "Find members who have loaned more than 2 books (historically). Return member first_name, last_name, and loan_count.", 
    "Join members and loans.", "Group by member_id and use HAVING count > 2.", 
    "SELECT m.first_name, m.last_name, COUNT(l.loan_id) AS loan_count FROM members m JOIN loans l ON m.member_id = l.member_id GROUP BY m.member_id HAVING COUNT(l.loan_id) > 2;", 
    "SELECT m.first_name, m.last_name, COUNT(l.loan_id) AS loan_count FROM members m JOIN loans l ON m.member_id = l.member_id GROUP BY m.member_id HAVING COUNT(l.loan_id) > 2;"),

  make(27, 'library', 'medium', ['topic:Subqueries', 'Null Handling', 'company:QueensPublicLibrary'], 
    "Identify books that have NEVER been loaned out. Return their book_id, title.", 
    "Use a subquery for book_id NOT IN (loans).", "Or use a LEFT JOIN.", 
    "SELECT book_id, title FROM books WHERE book_id NOT IN (SELECT book_id FROM loans);", 
    "SELECT book_id, title FROM books WHERE book_id NOT IN (SELECT book_id FROM loans);"),

  make(28, 'library', 'medium', ['topic:Date Functions', 'Math', 'company:LAPublicLibrary'], 
    "Calculate the average duration (in days) a book is kept out (return_date - loan_date). Return it rounded to 1 decimal place. Only include returned books.", 
    "Use julianday(return_date) - julianday(loan_date).", "Filter for return_date IS NOT NULL.", 
    "SELECT ROUND(AVG(julianday(return_date) - julianday(loan_date)), 1) AS avg_loan_duration FROM loans WHERE return_date IS NOT NULL;", 
    "SELECT ROUND(AVG(julianday(return_date) - julianday(loan_date)), 1) AS avg_loan_duration FROM loans WHERE return_date IS NOT NULL;"),

  make(29, 'library', 'medium', ['topic:Joins', 'Null Handling', 'company:DenverPublicLibrary'], 
    "List all members who currently have NO active loans (either never loaned, or all loans have a return_date). Return member_id and first_name.", 
    "Use LEFT JOIN to active loans (return_date IS NULL) and check for NULL.", "Or use NOT IN (SELECT member_id FROM loans WHERE return_date IS NULL).", 
    "SELECT member_id, first_name FROM members WHERE member_id NOT IN (SELECT member_id FROM loans WHERE return_date IS NULL);", 
    "SELECT member_id, first_name FROM members WHERE member_id NOT IN (SELECT member_id FROM loans WHERE return_date IS NULL);"),

  make(30, 'library', 'medium', ['topic:Joins', 'Data Analysis', 'company:FreeLibraryOfPhiladelphia'], 
    "Which author's books have been loaned the most? Return author first_name, last_name, and total_loans.", 
    "Join authors, books, loans.", "Group by author, order desc, limit 1.", 
    "SELECT a.first_name, a.last_name, COUNT(l.loan_id) AS total_loans FROM authors a JOIN books b ON a.author_id = b.author_id JOIN loans l ON b.book_id = l.book_id GROUP BY a.author_id ORDER BY total_loans DESC LIMIT 1;", 
    "SELECT a.first_name, a.last_name, COUNT(l.loan_id) AS total_loans FROM authors a JOIN books b ON a.author_id = b.author_id JOIN loans l ON b.book_id = l.book_id GROUP BY a.author_id ORDER BY total_loans DESC LIMIT 1;"),

  make(31, 'library', 'medium', ['topic:Subqueries', 'Math', 'company:NYPL'], 
    "Find books published after the average publication year of all books. Return title and published_year.", 
    "Use a subquery to get AVG(published_year).", "Compare published_year to it.", 
    "SELECT title, published_year FROM books WHERE published_year > (SELECT AVG(published_year) FROM books);", 
    "SELECT title, published_year FROM books WHERE published_year > (SELECT AVG(published_year) FROM books);"),

  make(32, 'library', 'medium', ['topic:Joins', 'Group By', 'company:BostonPublicLibrary'], 
    "Find the total amount of fines paid (paid_date IS NOT NULL) per branch. Return branch name and total_paid.", 
    "Join fines, loans, members, branches.", "Filter for paid_date IS NOT NULL, group by branch.", 
    "SELECT b.name, SUM(f.amount) as total_paid FROM fines f JOIN loans l ON f.loan_id = l.loan_id JOIN members m ON l.member_id = m.member_id JOIN branches b ON m.branch_id = b.branch_id WHERE f.paid_date IS NOT NULL GROUP BY b.name;", 
    "SELECT b.name, SUM(f.amount) as total_paid FROM fines f JOIN loans l ON f.loan_id = l.loan_id JOIN members m ON l.member_id = m.member_id JOIN branches b ON m.branch_id = b.branch_id WHERE f.paid_date IS NOT NULL GROUP BY b.name;"),

  make(33, 'library', 'medium', ['topic:Joins', 'Date Functions', 'company:ChicagoPublicLibrary'], 
    "Find all loans that are currently OVERDUE. (return_date IS NULL and due_date < current date '2024-04-01'). Return loan_id, member first_name, and days_overdue.", 
    "Join loans and members.", "Filter by return_date IS NULL AND due_date < '2024-04-01'.", 
    "SELECT l.loan_id, m.first_name, ROUND(julianday('2024-04-01') - julianday(l.due_date)) AS days_overdue FROM loans l JOIN members m ON l.member_id = m.member_id WHERE l.return_date IS NULL AND l.due_date < '2024-04-01';", 
    "SELECT l.loan_id, m.first_name, ROUND(julianday('2024-04-01') - julianday(l.due_date)) AS days_overdue FROM loans l JOIN members m ON l.member_id = m.member_id WHERE l.return_date IS NULL AND l.due_date < '2024-04-01';"),

  make(34, 'library', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:SFPublicLibrary'], 
    "Flag loans as 'On Time' or 'Late'. A loan is late if return_date > due_date. Return loan_id and the flag for all returned loans.", 
    "Use a CASE statement on return_date > due_date.", "Filter return_date IS NOT NULL.", 
    "SELECT loan_id, CASE WHEN return_date > due_date THEN 'Late' ELSE 'On Time' END AS return_status FROM loans WHERE return_date IS NOT NULL;", 
    "SELECT loan_id, CASE WHEN return_date > due_date THEN 'Late' ELSE 'On Time' END AS return_status FROM loans WHERE return_date IS NOT NULL;"),

  make(35, 'library', 'medium', ['topic:CTEs', 'Data Analysis', 'company:SeattlePublicLibrary'], 
    "Use a CTE to find the number of loans per member. Then find the member(s) with the most loans. Return member_id and count.", 
    "CTE groups by member_id and counts.", "Main query finds the MAX.", 
    "WITH LoanCounts AS (SELECT member_id, COUNT(*) as l_count FROM loans GROUP BY member_id) SELECT member_id, l_count FROM LoanCounts WHERE l_count = (SELECT MAX(l_count) FROM LoanCounts);", 
    "WITH LoanCounts AS (SELECT member_id, COUNT(*) as l_count FROM loans GROUP BY member_id) SELECT member_id, l_count FROM LoanCounts WHERE l_count = (SELECT MAX(l_count) FROM LoanCounts);"),

  make(36, 'library', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:BrooklynPublicLibrary'], 
    "Find members who have loaned BOTH a 'Classic' book AND a 'Fantasy' book. Return member_id.", 
    "Use INTERSECT.", "Query loans and books.", 
    "SELECT l.member_id FROM loans l JOIN books b ON l.book_id = b.book_id WHERE b.genre = 'Classic' INTERSECT SELECT l.member_id FROM loans l JOIN books b ON l.book_id = b.book_id WHERE b.genre = 'Fantasy';", 
    "SELECT l.member_id FROM loans l JOIN books b ON l.book_id = b.book_id WHERE b.genre = 'Classic' INTERSECT SELECT l.member_id FROM loans l JOIN books b ON l.book_id = b.book_id WHERE b.genre = 'Fantasy';"),

  make(37, 'library', 'medium', ['topic:Joins', 'Self Join', 'company:QueensPublicLibrary'], 
    "Find pairs of books that were published in the same year and have the exact same genre. Return book1_title, book2_title, and the shared year. Ensure unique pairs (b1.id < b2.id).", 
    "Self join books on published_year and genre.", "Use b1.book_id < b2.book_id.", 
    "SELECT b1.title AS book1_title, b2.title AS book2_title, b1.published_year FROM books b1 JOIN books b2 ON b1.published_year = b2.published_year AND b1.genre = b2.genre AND b1.book_id < b2.book_id;", 
    "SELECT b1.title AS book1_title, b2.title AS book2_title, b1.published_year FROM books b1 JOIN books b2 ON b1.published_year = b2.published_year AND b1.genre = b2.genre AND b1.book_id < b2.book_id;"),

  make(38, 'library', 'medium', ['topic:Joins', 'Group By', 'company:LAPublicLibrary'], 
    "Which genre has the highest average pages per book? Return genre and avg_pages.", 
    "Group by genre in books.", "Order by avg desc, limit 1.", 
    "SELECT genre, AVG(pages) as avg_pages FROM books GROUP BY genre ORDER BY avg_pages DESC LIMIT 1;", 
    "SELECT genre, AVG(pages) as avg_pages FROM books GROUP BY genre ORDER BY avg_pages DESC LIMIT 1;"),

  make(39, 'library', 'medium', ['topic:Joins', 'Date Functions', 'company:DenverPublicLibrary'], 
    "Find all members who incurred a fine within their first 30 days of joining the library. Return member name and fine amount.", 
    "Join members, loans, fines.", "Check if julianday(fines.paid_date OR loan_date...) - julianday(joined_date) <= 30. Better yet, check if loan_date - joined_date <= 30.", 
    "SELECT m.first_name || ' ' || m.last_name AS member_name, f.amount FROM members m JOIN loans l ON m.member_id = l.member_id JOIN fines f ON l.loan_id = f.loan_id WHERE (julianday(l.loan_date) - julianday(m.joined_date)) <= 30;", 
    "SELECT m.first_name || ' ' || m.last_name AS member_name, f.amount FROM members m JOIN loans l ON m.member_id = l.member_id JOIN fines f ON l.loan_id = f.loan_id WHERE (julianday(l.loan_date) - julianday(m.joined_date)) <= 30;"),

  make(40, 'library', 'medium', ['topic:Math', 'Data Analysis', 'company:FreeLibraryOfPhiladelphia'], 
    "Calculate the percentage of loans that resulted in a fine. Return as fine_percentage rounded to 2 decimals.", 
    "Count distinct loan_ids in fines / count of all loans.", "Cast to REAL.", 
    "SELECT ROUND(CAST((SELECT COUNT(DISTINCT loan_id) FROM fines) AS REAL) * 100.0 / (SELECT COUNT(*) FROM loans), 2) AS fine_percentage;", 
    "SELECT ROUND(CAST((SELECT COUNT(DISTINCT loan_id) FROM fines) AS REAL) * 100.0 / (SELECT COUNT(*) FROM loans), 2) AS fine_percentage;"),

  make(41, 'library', 'medium', ['topic:Joins', 'Null Handling', 'company:NYPL'], 
    "Find any branches that currently have NO active members registered. Return branch name.", 
    "Left join branches to members.", "Check for NULL member_id.", 
    "SELECT b.name FROM branches b LEFT JOIN members m ON b.branch_id = m.branch_id WHERE m.member_id IS NULL;", 
    "SELECT b.name FROM branches b LEFT JOIN members m ON b.branch_id = m.branch_id WHERE m.member_id IS NULL;"),

  make(42, 'library', 'medium', ['topic:String Functions', 'Basic SQL', 'company:BostonPublicLibrary'], 
    "Generate a citation format for books: 'Title (Published_Year)'. Return book_id and citation.", 
    "Use || operator.", "Query books.", 
    "SELECT book_id, title || ' (' || published_year || ')' AS citation FROM books;", 
    "SELECT book_id, title || ' (' || published_year || ')' AS citation FROM books;"),

  make(43, 'library', 'medium', ['topic:Math', 'Date Functions', 'company:ChicagoPublicLibrary'], 
    "Calculate how many years ago each author was born. Assume current year is 2024. Return first_name and years_ago.", 
    "Subtract birth_year from 2024.", "Query authors.", 
    "SELECT first_name, (2024 - birth_year) AS years_ago FROM authors;", 
    "SELECT first_name, (2024 - birth_year) AS years_ago FROM authors;"),

  make(44, 'library', 'medium', ['topic:Group By', 'Having', 'company:SFPublicLibrary'], 
    "Identify authors who have written more than 2 books in the library. Return author_id and book_count.", 
    "Group by author_id in books.", "Use HAVING count > 2.", 
    "SELECT author_id, COUNT(*) as book_count FROM books GROUP BY author_id HAVING COUNT(*) > 2;", 
    "SELECT author_id, COUNT(*) as book_count FROM books GROUP BY author_id HAVING COUNT(*) > 2;"),

  make(45, 'library', 'medium', ['topic:Joins', 'Data Analysis', 'company:SeattlePublicLibrary'], 
    "List the most common book genre borrowed by members at the 'North Branch'. Return genre and count.", 
    "Join branches, members, loans, books.", "Filter for North Branch, group by genre, sort desc, limit 1.", 
    "SELECT b.genre, COUNT(l.loan_id) as borrow_count FROM branches br JOIN members m ON br.branch_id = m.branch_id JOIN loans l ON m.member_id = l.member_id JOIN books b ON l.book_id = b.book_id WHERE br.name = 'North Branch' GROUP BY b.genre ORDER BY borrow_count DESC LIMIT 1;", 
    "SELECT b.genre, COUNT(l.loan_id) as borrow_count FROM branches br JOIN members m ON br.branch_id = m.branch_id JOIN loans l ON m.member_id = l.member_id JOIN books b ON l.book_id = b.book_id WHERE br.name = 'North Branch' GROUP BY b.genre ORDER BY borrow_count DESC LIMIT 1;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(46, 'library', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:BrooklynPublicLibrary'], 
    "Analyze borrowing habits. For member_id 1, calculate the number of days between consecutive loans. Return loan_date, and days_since_last_loan.", 
    "Use LAG() OVER(ORDER BY loan_date).", "Calculate difference.", 
    "WITH MemberLoans AS (SELECT loan_date, LAG(loan_date) OVER(ORDER BY loan_date) as prev_loan FROM loans WHERE member_id = 1) SELECT loan_date, ROUND(julianday(loan_date) - julianday(prev_loan)) as days_since_last_loan FROM MemberLoans WHERE prev_loan IS NOT NULL;", 
    "WITH MemberLoans AS (SELECT loan_date, LAG(loan_date) OVER(ORDER BY loan_date) as prev_loan FROM loans WHERE member_id = 1) SELECT loan_date, ROUND(julianday(loan_date) - julianday(prev_loan)) as days_since_last_loan FROM MemberLoans WHERE prev_loan IS NOT NULL;"),

  make(47, 'library', 'hard', ['topic:Window Functions', 'Rank', 'company:QueensPublicLibrary'], 
    "Rank the books within each genre by their total number of loans. Return genre, book title, loan_count, and rank.", 
    "Use DENSE_RANK() OVER(PARTITION BY genre ORDER BY loan_count DESC).", "Join books and loans.", 
    "WITH BookLoans AS (SELECT b.genre, b.title, COUNT(l.loan_id) as loan_count FROM books b LEFT JOIN loans l ON b.book_id = l.book_id GROUP BY b.book_id) SELECT genre, title, loan_count, DENSE_RANK() OVER(PARTITION BY genre ORDER BY loan_count DESC) as rank FROM BookLoans;", 
    "WITH BookLoans AS (SELECT b.genre, b.title, COUNT(l.loan_id) as loan_count FROM books b LEFT JOIN loans l ON b.book_id = l.book_id GROUP BY b.book_id) SELECT genre, title, loan_count, DENSE_RANK() OVER(PARTITION BY genre ORDER BY loan_count DESC) as rank FROM BookLoans;"),

  make(48, 'library', 'hard', ['topic:CTEs', 'Window Functions', 'company:LAPublicLibrary'], 
    "Calculate the cumulative total of fines collected (paid_date IS NOT NULL) over time. Return paid_date and running_total.", 
    "Sum amount per paid_date.", "Use SUM() OVER(ORDER BY paid_date).", 
    "WITH DailyFines AS (SELECT paid_date, SUM(amount) as daily_total FROM fines WHERE paid_date IS NOT NULL GROUP BY paid_date) SELECT paid_date, SUM(daily_total) OVER(ORDER BY paid_date) as running_total FROM DailyFines;", 
    "WITH DailyFines AS (SELECT paid_date, SUM(amount) as daily_total FROM fines WHERE paid_date IS NOT NULL GROUP BY paid_date) SELECT paid_date, SUM(daily_total) OVER(ORDER BY paid_date) as running_total FROM DailyFines;"),

  make(49, 'library', 'hard', ['topic:Window Functions', 'Partition By', 'company:DenverPublicLibrary'], 
    "Identify 'Long Books'. Find books whose page count is greater than the average page count of their specific genre. Return title, pages, and genre_avg_pages.", 
    "Calculate AVG(pages) OVER(PARTITION BY genre).", "Filter.", 
    "WITH GenreAvg AS (SELECT title, pages, genre, AVG(pages) OVER(PARTITION BY genre) as g_avg FROM books) SELECT title, pages, ROUND(g_avg, 1) as genre_avg_pages FROM GenreAvg WHERE pages > g_avg;", 
    "WITH GenreAvg AS (SELECT title, pages, genre, AVG(pages) OVER(PARTITION BY genre) as g_avg FROM books) SELECT title, pages, ROUND(g_avg, 1) as genre_avg_pages FROM GenreAvg WHERE pages > g_avg;"),

  make(50, 'library', 'hard', ['topic:CTEs', 'Self Join', 'company:FreeLibraryOfPhiladelphia'], 
    "Detect 'Serial Borrowers'. Find members who have borrowed a book, returned it, and then borrowed the EXACT SAME book again at a later date. Return member_id and book_id.", 
    "Join loans to itself.", "Check for same member and book, but different loan dates.", 
    "SELECT DISTINCT l1.member_id, l1.book_id FROM loans l1 JOIN loans l2 ON l1.member_id = l2.member_id AND l1.book_id = l2.book_id AND l1.loan_id != l2.loan_id WHERE l1.return_date IS NOT NULL AND l2.loan_date > l1.return_date;", 
    "SELECT DISTINCT l1.member_id, l1.book_id FROM loans l1 JOIN loans l2 ON l1.member_id = l2.member_id AND l1.book_id = l2.book_id AND l1.loan_id != l2.loan_id WHERE l1.return_date IS NOT NULL AND l2.loan_date > l1.return_date;"),

  make(51, 'library', 'hard', ['topic:Window Functions', 'Math', 'company:NYPL'], 
    "Calculate the percentage of total fines owed (paid and unpaid) that each branch is responsible for based on their members. Return branch name and percentage rounded to 2 decimals.", 
    "Sum fines per branch.", "Divide by SUM(fines) OVER().", 
    "WITH BranchFines AS (SELECT b.name, COALESCE(SUM(f.amount), 0) as total_fines FROM branches b LEFT JOIN members m ON b.branch_id = m.branch_id LEFT JOIN loans l ON m.member_id = l.member_id LEFT JOIN fines f ON l.loan_id = f.loan_id GROUP BY b.branch_id) SELECT name, ROUND(total_fines * 100.0 / NULLIF(SUM(total_fines) OVER(), 0), 2) as fine_percentage FROM BranchFines;", 
    "WITH BranchFines AS (SELECT b.name, COALESCE(SUM(f.amount), 0) as total_fines FROM branches b LEFT JOIN members m ON b.branch_id = m.branch_id LEFT JOIN loans l ON m.member_id = l.member_id LEFT JOIN fines f ON l.loan_id = f.loan_id GROUP BY b.branch_id) SELECT name, ROUND(total_fines * 100.0 / NULLIF(SUM(total_fines) OVER(), 0), 2) as fine_percentage FROM BranchFines;"),

  make(52, 'library', 'hard', ['topic:CTEs', 'Data Analysis', 'company:BostonPublicLibrary'], 
    "Identify 'Problematic Books'. A book is problematic if it has incurred fines on more than 50% of its total loans. Return title.", 
    "Count total loans and fined loans per book.", "Use CTEs and filter.", 
    "WITH BookStats AS (SELECT b.title, COUNT(l.loan_id) as total_loans, SUM(CASE WHEN f.fine_id IS NOT NULL THEN 1 ELSE 0 END) as fined_loans FROM books b JOIN loans l ON b.book_id = l.book_id LEFT JOIN fines f ON l.loan_id = f.loan_id GROUP BY b.book_id) SELECT title FROM BookStats WHERE total_loans > 0 AND (CAST(fined_loans AS REAL) / total_loans) > 0.5;", 
    "WITH BookStats AS (SELECT b.title, COUNT(l.loan_id) as total_loans, SUM(CASE WHEN f.fine_id IS NOT NULL THEN 1 ELSE 0 END) as fined_loans FROM books b JOIN loans l ON b.book_id = l.book_id LEFT JOIN fines f ON l.loan_id = f.loan_id GROUP BY b.book_id) SELECT title FROM BookStats WHERE total_loans > 0 AND (CAST(fined_loans AS REAL) / total_loans) > 0.5;"),

  make(53, 'library', 'hard', ['topic:Window Functions', 'Ntile', 'company:ChicagoPublicLibrary'], 
    "Create a 'Reader Tier'. Divide members into 3 tiers based on their total historical loans (1 being most active). Return member name, total_loans, and tier.", 
    "Use NTILE(3) OVER(ORDER BY total_loans DESC).", "Count loans per member.", 
    "WITH MemberLoans AS (SELECT m.first_name || ' ' || m.last_name as member_name, COUNT(l.loan_id) as total_loans FROM members m LEFT JOIN loans l ON m.member_id = l.member_id GROUP BY m.member_id) SELECT member_name, total_loans, NTILE(3) OVER(ORDER BY total_loans DESC) as tier FROM MemberLoans;", 
    "WITH MemberLoans AS (SELECT m.first_name || ' ' || m.last_name as member_name, COUNT(l.loan_id) as total_loans FROM members m LEFT JOIN loans l ON m.member_id = l.member_id GROUP BY m.member_id) SELECT member_name, total_loans, NTILE(3) OVER(ORDER BY total_loans DESC) as tier FROM MemberLoans;"),

  make(54, 'library', 'hard', ['topic:CTEs', 'Self Join', 'company:SFPublicLibrary'], 
    "Find 'Book Hoarders'. Members who borrowed a book before returning their previously borrowed book (overlapping loans). Return member_id.", 
    "Join loans to itself.", "Check if l2.loan_date between l1.loan_date and l1.return_date.", 
    "SELECT DISTINCT l1.member_id FROM loans l1 JOIN loans l2 ON l1.member_id = l2.member_id AND l1.loan_id != l2.loan_id WHERE l1.return_date IS NOT NULL AND l2.loan_date > l1.loan_date AND l2.loan_date < l1.return_date;", 
    "SELECT DISTINCT l1.member_id FROM loans l1 JOIN loans l2 ON l1.member_id = l2.member_id AND l1.loan_id != l2.loan_id WHERE l1.return_date IS NOT NULL AND l2.loan_date > l1.loan_date AND l2.loan_date < l1.return_date;"),

  make(55, 'library', 'hard', ['topic:CTEs', 'Data Analysis', 'company:SeattlePublicLibrary'], 
    "Calculate the 'Fine Collection Rate'. (Sum of Paid Fines / Sum of All Fines Issued) * 100. Return as collection_rate rounded to 2 decimals.", 
    "Sum amount where paid_date IS NOT NULL.", "Sum total amount.", "Divide.", 
    "WITH PaidFines AS (SELECT SUM(amount) as paid_total FROM fines WHERE paid_date IS NOT NULL), TotalFines AS (SELECT SUM(amount) as grand_total FROM fines) SELECT ROUND((pf.paid_total * 100.0) / tf.grand_total, 2) as collection_rate FROM PaidFines pf CROSS JOIN TotalFines tf;", 
    "WITH PaidFines AS (SELECT SUM(amount) as paid_total FROM fines WHERE paid_date IS NOT NULL), TotalFines AS (SELECT SUM(amount) as grand_total FROM fines) SELECT ROUND((pf.paid_total * 100.0) / tf.grand_total, 2) as collection_rate FROM PaidFines pf CROSS JOIN TotalFines tf;"),

  make(56, 'library', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:BrooklynPublicLibrary'], 
    "For the 'North Branch', find the change in the number of new members joining month-over-month. Return the join_month (YYYY-MM), member_count, and difference from previous month.", 
    "Count members joining per month for North Branch.", "Use LAG().", 
    "WITH MonthlyJoins AS (SELECT strftime('%Y-%m', m.joined_date) as join_month, COUNT(m.member_id) as member_count FROM members m JOIN branches b ON m.branch_id = b.branch_id WHERE b.name = 'North Branch' GROUP BY join_month) SELECT join_month, member_count, member_count - LAG(member_count) OVER(ORDER BY join_month) as diff_from_prev FROM MonthlyJoins;", 
    "WITH MonthlyJoins AS (SELECT strftime('%Y-%m', m.joined_date) as join_month, COUNT(m.member_id) as member_count FROM members m JOIN branches b ON m.branch_id = b.branch_id WHERE b.name = 'North Branch' GROUP BY join_month) SELECT join_month, member_count, member_count - LAG(member_count) OVER(ORDER BY join_month) as diff_from_prev FROM MonthlyJoins;"),

  make(57, 'library', 'hard', ['topic:CTEs', 'Null Handling', 'company:QueensPublicLibrary'], 
    "Identify 'Ghost Authors'. Authors in the database who do not have any books listed. Return their first_name and last_name.", 
    "Left join authors to books.", "Check for NULL book_id.", 
    "SELECT a.first_name, a.last_name FROM authors a LEFT JOIN books b ON a.author_id = b.author_id WHERE b.book_id IS NULL;", 
    "SELECT a.first_name, a.last_name FROM authors a LEFT JOIN books b ON a.author_id = b.author_id WHERE b.book_id IS NULL;"),

  make(58, 'library', 'hard', ['topic:Window Functions', 'Rank', 'company:LAPublicLibrary'], 
    "Who is the most popular author in each branch (based on loans)? Return branch_name, author_name, loan_count, and rank (must be 1).", 
    "Join branches, members, loans, books, authors.", "Count loans.", "ROW_NUMBER() OVER(PARTITION BY branch ORDER BY count DESC).", 
    "WITH BranchAuthors AS (SELECT br.name as branch, a.first_name || ' ' || a.last_name as author, COUNT(l.loan_id) as loan_count FROM branches br JOIN members m ON br.branch_id = m.branch_id JOIN loans l ON m.member_id = l.member_id JOIN books b ON l.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id GROUP BY br.branch_id, a.author_id), RankedAuthors AS (SELECT branch, author, loan_count, ROW_NUMBER() OVER(PARTITION BY branch ORDER BY loan_count DESC) as rn FROM BranchAuthors) SELECT branch, author, loan_count FROM RankedAuthors WHERE rn = 1;", 
    "WITH BranchAuthors AS (SELECT br.name as branch, a.first_name || ' ' || a.last_name as author, COUNT(l.loan_id) as loan_count FROM branches br JOIN members m ON br.branch_id = m.branch_id JOIN loans l ON m.member_id = l.member_id JOIN books b ON l.book_id = b.book_id JOIN authors a ON b.author_id = a.author_id GROUP BY br.branch_id, a.author_id), RankedAuthors AS (SELECT branch, author, loan_count, ROW_NUMBER() OVER(PARTITION BY branch ORDER BY loan_count DESC) as rn FROM BranchAuthors) SELECT branch, author, loan_count FROM RankedAuthors WHERE rn = 1;"),

  make(59, 'library', 'hard', ['topic:Math', 'Data Analysis', 'company:DenverPublicLibrary'], 
    "Calculate the 'Shelf Life Utilization' for each genre. (Total historical loan duration in days / Total pages of all books in that genre). Return genre and utilization_ratio.", 
    "Sum (return_date - loan_date).", "Sum pages per genre.", 
    "WITH GenreLoanDays AS (SELECT b.genre, SUM(julianday(l.return_date) - julianday(l.loan_date)) as total_days FROM books b JOIN loans l ON b.book_id = l.book_id WHERE l.return_date IS NOT NULL GROUP BY b.genre), GenrePages AS (SELECT genre, SUM(pages) as total_pages FROM books GROUP BY genre) SELECT gp.genre, ROUND(COALESCE(gld.total_days, 0) / gp.total_pages, 4) as utilization_ratio FROM GenrePages gp LEFT JOIN GenreLoanDays gld ON gp.genre = gld.genre;", 
    "WITH GenreLoanDays AS (SELECT b.genre, SUM(julianday(l.return_date) - julianday(l.loan_date)) as total_days FROM books b JOIN loans l ON b.book_id = l.book_id WHERE l.return_date IS NOT NULL GROUP BY b.genre), GenrePages AS (SELECT genre, SUM(pages) as total_pages FROM books GROUP BY genre) SELECT gp.genre, ROUND(COALESCE(gld.total_days, 0) / gp.total_pages, 4) as utilization_ratio FROM GenrePages gp LEFT JOIN GenreLoanDays gld ON gp.genre = gld.genre;"),

  make(60, 'library', 'hard', ['topic:CTEs', 'Data Analysis', 'company:FreeLibraryOfPhiladelphia'], 
    "Identify 'Active Fines'. Loans that have an unpaid fine AND the book is still not returned. Return loan_id, member email, and fine amount.", 
    "Join loans, fines, members.", "Filter unpaid fines and unreturned books.", 
    "SELECT l.loan_id, m.email, f.amount FROM loans l JOIN fines f ON l.loan_id = f.loan_id JOIN members m ON l.member_id = m.member_id WHERE l.return_date IS NULL AND f.paid_date IS NULL;", 
    "SELECT l.loan_id, m.email, f.amount FROM loans l JOIN fines f ON l.loan_id = f.loan_id JOIN members m ON l.member_id = m.member_id WHERE l.return_date IS NULL AND f.paid_date IS NULL;")
];
`;

fs.writeFileSync(targetFile, code);
console.log('Successfully generated the PERFECT library questions!');
