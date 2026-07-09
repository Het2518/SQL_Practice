import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.join(__dirname, '../src/data/questions/movies.jsx');

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

// MOVIES QUESTIONS (IDs 1-60)
export const moviesQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(1, 'movies', 'easy', ['topic:Basic SQL', 'Where', 'company:Netflix'], 
    "Find all movies released in the year 2010. Return their title and rating.", 
    "Filter the movies table.", "Use WHERE release_year = 2010.", 
    "SELECT title, rating FROM movies WHERE release_year = 2010;", 
    "SELECT title, rating FROM movies WHERE release_year = 2010;"),

  make(2, 'movies', 'easy', ['topic:String Functions', 'Basic SQL', 'company:Disney'], 
    "Format the actor names for a cast list. Return a single column 'actor_name' with the format 'Firstname Lastname'.", 
    "Concatenate first_name, a space, and last_name.", "Use the || operator.", 
    "SELECT first_name || ' ' || last_name AS actor_name FROM actors;", 
    "SELECT first_name || ' ' || last_name AS actor_name FROM actors;"),

  make(3, 'movies', 'easy', ['topic:Math', 'Aggregate Functions', 'company:WarnerBros'], 
    "Calculate the total box office revenue of all movies in the database. Return as 'total_revenue'.", 
    "Use SUM() on the box_office column.", "Query the movies table.", 
    "SELECT SUM(box_office) AS total_revenue FROM movies;", 
    "SELECT SUM(box_office) AS total_revenue FROM movies;"),

  make(4, 'movies', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:Universal'], 
    "Identify movies where the box office revenue is unknown (box_office IS NULL). Return movie_id and title.", 
    "Check if box_office is NULL.", "Use WHERE box_office IS NULL.", 
    "SELECT movie_id, title FROM movies WHERE box_office IS NULL;", 
    "SELECT movie_id, title FROM movies WHERE box_office IS NULL;"),

  make(5, 'movies', 'easy', ['topic:Data Analysis', 'Group By', 'company:Paramount'], 
    "Count how many directors we have from each nationality. Return nationality and the count.", 
    "Group by nationality in the directors table.", "Use COUNT(*).", 
    "SELECT nationality, COUNT(*) AS director_count FROM directors GROUP BY nationality;", 
    "SELECT nationality, COUNT(*) AS director_count FROM directors GROUP BY nationality;"),

  make(6, 'movies', 'easy', ['topic:Basic SQL', 'Where', 'company:SonyPictures'], 
    "Find all movies with a rating of 8.5 or higher. Return title and rating.", 
    "Filter rating using >=.", "WHERE rating >= 8.5.", 
    "SELECT title, rating FROM movies WHERE rating >= 8.5;", 
    "SELECT title, rating FROM movies WHERE rating >= 8.5;"),

  make(7, 'movies', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Lionsgate'], 
    "What is the maximum budget of any movie in the database? Return as 'max_budget'.", 
    "Use MAX(budget).", "Query the movies table.", 
    "SELECT MAX(budget) AS max_budget FROM movies;", 
    "SELECT MAX(budget) AS max_budget FROM movies;"),

  make(8, 'movies', 'easy', ['topic:Basic SQL', 'Limit', 'company:A24'], 
    "List the 5 longest movies by duration. Return title and duration_mins.", 
    "Sort by duration_mins descending.", "Limit to 5.", 
    "SELECT title, duration_mins FROM movies ORDER BY duration_mins DESC LIMIT 5;", 
    "SELECT title, duration_mins FROM movies ORDER BY duration_mins DESC LIMIT 5;"),

  make(9, 'movies', 'easy', ['topic:Basic SQL', 'In', 'company:MGM'], 
    "Find all actors who are 'British' or 'Canadian'. Return first_name, last_name, and nationality.", 
    "Use the IN operator on the nationality column.", "WHERE nationality IN ('British', 'Canadian').", 
    "SELECT first_name, last_name, nationality FROM actors WHERE nationality IN ('British', 'Canadian');", 
    "SELECT first_name, last_name, nationality FROM actors WHERE nationality IN ('British', 'Canadian');"),

  make(10, 'movies', 'easy', ['topic:String Functions', 'Basic SQL', 'company:HBO'], 
    "Find all movies where the title starts with 'The'. Return movie_id and title.", 
    "Use LIKE 'The %'.", "Filter on the title column.", 
    "SELECT movie_id, title FROM movies WHERE title LIKE 'The %';", 
    "SELECT movie_id, title FROM movies WHERE title LIKE 'The %';"),

  make(11, 'movies', 'easy', ['topic:Data Analysis', 'Group By', 'company:AmazonStudios'], 
    "How many movies were released each year? Return release_year and the movie_count.", 
    "Use COUNT(*).", "Group by release_year in the movies table.", 
    "SELECT release_year, COUNT(*) AS movie_count FROM movies GROUP BY release_year;", 
    "SELECT release_year, COUNT(*) AS movie_count FROM movies GROUP BY release_year;"),

  make(12, 'movies', 'easy', ['topic:Math', 'Data Analysis', 'company:AppleTV'], 
    "Calculate the profit for each movie (box_office - budget). Return title and profit. Only include movies where both are known.", 
    "Subtract budget from box_office.", "Filter for IS NOT NULL on both.", 
    "SELECT title, (box_office - budget) AS profit FROM movies WHERE box_office IS NOT NULL AND budget IS NOT NULL;", 
    "SELECT title, (box_office - budget) AS profit FROM movies WHERE box_office IS NOT NULL AND budget IS NOT NULL;"),

  make(13, 'movies', 'easy', ['topic:Basic SQL', 'Where', 'company:Hulu'], 
    "Find all movie_actors records where the actor_id is unknown (actor_id IS NULL). Return id and movie_id.", 
    "Filter by actor_id IS NULL.", "Check the movie_actors table.", 
    "SELECT id, movie_id FROM movie_actors WHERE actor_id IS NULL;", 
    "SELECT id, movie_id FROM movie_actors WHERE actor_id IS NULL;"),

  make(14, 'movies', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:Peacock'], 
    "How many distinct release years are represented in the movies table? Return the count as 'unique_years'.", 
    "Use COUNT(DISTINCT release_year).", "Query the movies table.", 
    "SELECT COUNT(DISTINCT release_year) AS unique_years FROM movies;", 
    "SELECT COUNT(DISTINCT release_year) AS unique_years FROM movies;"),

  make(15, 'movies', 'easy', ['topic:Basic SQL', 'Math', 'company:AMC'], 
    "List all movies that are less than 2 hours long (duration_mins < 120). Return title and duration_mins.", 
    "Filter for duration_mins < 120.", "Look at the movies table.", 
    "SELECT title, duration_mins FROM movies WHERE duration_mins < 120;", 
    "SELECT title, duration_mins FROM movies WHERE duration_mins < 120;"),

  make(16, 'movies', 'easy', ['topic:Data Cleaning', 'Like', 'company:Cinemark'], 
    "Find all genres that have 'Fiction' in their name. Return genre_id and name.", 
    "Use LIKE '%Fiction%'.", "Query the genres table.", 
    "SELECT genre_id, name FROM genres WHERE name LIKE '%Fiction%';", 
    "SELECT genre_id, name FROM genres WHERE name LIKE '%Fiction%';"),

  make(17, 'movies', 'easy', ['topic:Basic SQL', 'Where', 'company:Regal'], 
    "Find all actors born after 1980. Return first_name, last_name, and birth_year.", 
    "Check if birth_year > 1980.", "Query the actors table.", 
    "SELECT first_name, last_name, birth_year FROM actors WHERE birth_year > 1980;", 
    "SELECT first_name, last_name, birth_year FROM actors WHERE birth_year > 1980;"),

  make(18, 'movies', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:IMDb'], 
    "Count the number of actors from each nationality. Return nationality and actor_count.", 
    "Group by nationality in the actors table.", "Use COUNT(*).", 
    "SELECT nationality, COUNT(*) AS actor_count FROM actors GROUP BY nationality;", 
    "SELECT nationality, COUNT(*) AS actor_count FROM actors GROUP BY nationality;"),

  make(19, 'movies', 'easy', ['topic:Basic SQL', 'Order By', 'company:RottenTomatoes'], 
    "Find the 3 most recent movies based on release_year. Return title and release_year.", 
    "Order by release_year DESC.", "Limit to 3.", 
    "SELECT title, release_year FROM movies ORDER BY release_year DESC LIMIT 3;", 
    "SELECT title, release_year FROM movies ORDER BY release_year DESC LIMIT 3;"),

  make(20, 'movies', 'easy', ['topic:Basic SQL', 'Math', 'company:Metacritic'], 
    "Find the average rating of all movies in the database. Return as 'avg_rating' rounded to 2 decimals.", 
    "Use AVG() and ROUND().", "Query movies.", 
    "SELECT ROUND(AVG(rating), 2) AS avg_rating FROM movies;", 
    "SELECT ROUND(AVG(rating), 2) AS avg_rating FROM movies;"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(21, 'movies', 'medium', ['topic:Joins', 'Data Analysis', 'company:Netflix'], 
    "List all movies and the full name of their director. Return movie title, and director's first and last name.", 
    "Join movies and directors.", "Select the correct columns.", 
    "SELECT m.title, d.first_name, d.last_name FROM movies m JOIN directors d ON m.director_id = d.director_id;", 
    "SELECT m.title, d.first_name, d.last_name FROM movies m JOIN directors d ON m.director_id = d.director_id;"),

  make(22, 'movies', 'medium', ['topic:Joins', 'Math', 'company:Disney'], 
    "How many movies did each director direct? Return the director's last_name and the movie_count.", 
    "Join movies and directors.", "Group by director last_name and count.", 
    "SELECT d.last_name, COUNT(m.movie_id) AS movie_count FROM directors d JOIN movies m ON d.director_id = m.director_id GROUP BY d.last_name;", 
    "SELECT d.last_name, COUNT(m.movie_id) AS movie_count FROM directors d JOIN movies m ON d.director_id = m.director_id GROUP BY d.last_name;"),

  make(23, 'movies', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:WarnerBros'], 
    "Find all actors who starred in 'Inception' (movie_id = 1). Return their first_name and last_name.", 
    "Join actors and movie_actors.", "Filter for movie_id = 1.", 
    "SELECT a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id WHERE ma.movie_id = 1;", 
    "SELECT a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id WHERE ma.movie_id = 1;"),

  make(24, 'movies', 'medium', ['topic:Joins', 'Group By', 'company:Universal'], 
    "Which movie has the most genres associated with it? Return movie title and the genre_count.", 
    "Join movies and movie_genres.", "Group by movie_id, sort desc, limit 1.", 
    "SELECT m.title, COUNT(mg.genre_id) AS genre_count FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id GROUP BY m.movie_id ORDER BY genre_count DESC LIMIT 1;", 
    "SELECT m.title, COUNT(mg.genre_id) AS genre_count FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id GROUP BY m.movie_id ORDER BY genre_count DESC LIMIT 1;"),

  make(25, 'movies', 'medium', ['topic:Case Statements', 'Math', 'company:Paramount'], 
    "Categorize movies based on box office: 'Blockbuster' (> 500M), 'Hit' (100M-500M), 'Flop' (< 100M). Ignore NULLs. Return category and count.", 
    "Use a CASE statement on box_office.", "Group by the CASE statement.", 
    "SELECT CASE WHEN box_office > 500000000 THEN 'Blockbuster' WHEN box_office >= 100000000 THEN 'Hit' ELSE 'Flop' END AS status, COUNT(*) AS movie_count FROM movies WHERE box_office IS NOT NULL GROUP BY status;", 
    "SELECT CASE WHEN box_office > 500000000 THEN 'Blockbuster' WHEN box_office >= 100000000 THEN 'Hit' ELSE 'Flop' END AS status, COUNT(*) AS movie_count FROM movies WHERE box_office IS NOT NULL GROUP BY status;"),

  make(26, 'movies', 'medium', ['topic:Joins', 'Having', 'company:SonyPictures'], 
    "Find actors who have been in more than 2 movies. Return actor first_name, last_name, and movie_count.", 
    "Join actors and movie_actors.", "Group by actor_id and use HAVING count > 2.", 
    "SELECT a.first_name, a.last_name, COUNT(ma.movie_id) AS movie_count FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id GROUP BY a.actor_id HAVING COUNT(ma.movie_id) > 2;", 
    "SELECT a.first_name, a.last_name, COUNT(ma.movie_id) AS movie_count FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id GROUP BY a.actor_id HAVING COUNT(ma.movie_id) > 2;"),

  make(27, 'movies', 'medium', ['topic:Subqueries', 'Null Handling', 'company:Lionsgate'], 
    "Identify movies that have NO genres assigned to them in the movie_genres table. Return their movie_id and title.", 
    "Use a subquery for movie_id NOT IN (movie_genres).", "Or use a LEFT JOIN.", 
    "SELECT movie_id, title FROM movies WHERE movie_id NOT IN (SELECT movie_id FROM movie_genres);", 
    "SELECT movie_id, title FROM movies WHERE movie_id NOT IN (SELECT movie_id FROM movie_genres);"),

  make(28, 'movies', 'medium', ['topic:Math', 'Data Analysis', 'company:A24'], 
    "Calculate the Return on Investment (ROI) percentage for each movie. Formula: ((Box Office - Budget) / Budget) * 100. Return title and roi_percentage rounded to 2 decimals.", 
    "Ignore NULLs.", "Apply the formula.", 
    "SELECT title, ROUND(((box_office - budget) / budget) * 100.0, 2) AS roi_percentage FROM movies WHERE box_office IS NOT NULL AND budget IS NOT NULL;", 
    "SELECT title, ROUND(((box_office - budget) / budget) * 100.0, 2) AS roi_percentage FROM movies WHERE box_office IS NOT NULL AND budget IS NOT NULL;"),

  make(29, 'movies', 'medium', ['topic:Joins', 'Null Handling', 'company:MGM'], 
    "List all actors who currently have NO roles assigned in the movie_actors table. Return actor_id and last_name.", 
    "Left join actors to movie_actors.", "Filter where id IS NULL.", 
    "SELECT a.actor_id, a.last_name FROM actors a LEFT JOIN movie_actors ma ON a.actor_id = ma.actor_id WHERE ma.id IS NULL;", 
    "SELECT a.actor_id, a.last_name FROM actors a LEFT JOIN movie_actors ma ON a.actor_id = ma.actor_id WHERE ma.id IS NULL;"),

  make(30, 'movies', 'medium', ['topic:Joins', 'Data Analysis', 'company:HBO'], 
    "Which genre is the most common among all movies? Return genre name and the movie_count.", 
    "Join genres and movie_genres.", "Group by genre, order desc, limit 1.", 
    "SELECT g.name, COUNT(mg.movie_id) AS movie_count FROM genres g JOIN movie_genres mg ON g.genre_id = mg.genre_id GROUP BY g.genre_id ORDER BY movie_count DESC LIMIT 1;", 
    "SELECT g.name, COUNT(mg.movie_id) AS movie_count FROM genres g JOIN movie_genres mg ON g.genre_id = mg.genre_id GROUP BY g.genre_id ORDER BY movie_count DESC LIMIT 1;"),

  make(31, 'movies', 'medium', ['topic:Subqueries', 'Math', 'company:AmazonStudios'], 
    "Find movies with a rating strictly higher than the average rating of all movies. Return title and rating.", 
    "Use a subquery to get AVG(rating).", "Compare rating to it.", 
    "SELECT title, rating FROM movies WHERE rating > (SELECT AVG(rating) FROM movies);", 
    "SELECT title, rating FROM movies WHERE rating > (SELECT AVG(rating) FROM movies);"),

  make(32, 'movies', 'medium', ['topic:Joins', 'Group By', 'company:AppleTV'], 
    "Find the total box office revenue generated by movies in the 'Action' genre. Return genre name and total_revenue.", 
    "Join genres, movie_genres, movies.", "Filter for 'Action', sum box_office.", 
    "SELECT g.name, SUM(m.box_office) as total_revenue FROM genres g JOIN movie_genres mg ON g.genre_id = mg.genre_id JOIN movies m ON mg.movie_id = m.movie_id WHERE g.name = 'Action' GROUP BY g.name;", 
    "SELECT g.name, SUM(m.box_office) as total_revenue FROM genres g JOIN movie_genres mg ON g.genre_id = mg.genre_id JOIN movies m ON mg.movie_id = m.movie_id WHERE g.name = 'Action' GROUP BY g.name;"),

  make(33, 'movies', 'medium', ['topic:Joins', 'Date Functions', 'company:Hulu'], 
    "Find all movies where the director was under 40 years old when the movie was released. Return movie title, director last_name, and director age at release.", 
    "Join movies and directors.", "Check release_year - birth_year < 40.", 
    "SELECT m.title, d.last_name, (m.release_year - d.birth_year) AS age_at_release FROM movies m JOIN directors d ON m.director_id = d.director_id WHERE (m.release_year - d.birth_year) < 40;", 
    "SELECT m.title, d.last_name, (m.release_year - d.birth_year) AS age_at_release FROM movies m JOIN directors d ON m.director_id = d.director_id WHERE (m.release_year - d.birth_year) < 40;"),

  make(34, 'movies', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:Peacock'], 
    "Create a 'Decade' column for movies (e.g., '1990s', '2000s', '2010s'). Return movie title, release_year, and decade.", 
    "Use a CASE statement or math (release_year / 10 * 10) || 's'.", "Apply to movies table.", 
    "SELECT title, release_year, CAST((release_year / 10) * 10 AS TEXT) || 's' AS decade FROM movies;", 
    "SELECT title, release_year, CAST((release_year / 10) * 10 AS TEXT) || 's' AS decade FROM movies;"),

  make(35, 'movies', 'medium', ['topic:CTEs', 'Data Analysis', 'company:AMC'], 
    "Use a CTE to calculate the average budget of movies. Then find all movies with a budget greater than that average. Return title and budget.", 
    "CTE calculates single value.", "Main query joins or uses where.", 
    "WITH AvgBudget AS (SELECT AVG(budget) as avg_b FROM movies) SELECT title, budget FROM movies, AvgBudget WHERE budget > avg_b;", 
    "WITH AvgBudget AS (SELECT AVG(budget) as avg_b FROM movies) SELECT title, budget FROM movies, AvgBudget WHERE budget > avg_b;"),

  make(36, 'movies', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:Cinemark'], 
    "Find movies that are classified as BOTH 'Drama' and 'Thriller' genres. Return movie_id.", 
    "Use INTERSECT.", "Query movie_genres and genres.", 
    "SELECT mg.movie_id FROM movie_genres mg JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Drama' INTERSECT SELECT mg.movie_id FROM movie_genres mg JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Thriller';", 
    "SELECT mg.movie_id FROM movie_genres mg JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Drama' INTERSECT SELECT mg.movie_id FROM movie_genres mg JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Thriller';"),

  make(37, 'movies', 'medium', ['topic:Joins', 'Data Analysis', 'company:Regal'], 
    "Find actors who have starred in a movie directed by 'Christopher Nolan'. Return distinct actor first_name and last_name.", 
    "Join actors, movie_actors, movies, directors.", "Filter for director name.", 
    "SELECT DISTINCT a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movies m ON ma.movie_id = m.movie_id JOIN directors d ON m.director_id = d.director_id WHERE d.first_name = 'Christopher' AND d.last_name = 'Nolan';", 
    "SELECT DISTINCT a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movies m ON ma.movie_id = m.movie_id JOIN directors d ON m.director_id = d.director_id WHERE d.first_name = 'Christopher' AND d.last_name = 'Nolan';"),

  make(38, 'movies', 'medium', ['topic:Joins', 'Group By', 'company:IMDb'], 
    "Which director has the highest average movie rating? Return director last_name and avg_rating.", 
    "Group by director in movies.", "Order by avg desc, limit 1.", 
    "SELECT d.last_name, AVG(m.rating) as avg_rating FROM directors d JOIN movies m ON d.director_id = m.director_id GROUP BY d.director_id ORDER BY avg_rating DESC LIMIT 1;", 
    "SELECT d.last_name, AVG(m.rating) as avg_rating FROM directors d JOIN movies m ON d.director_id = m.director_id GROUP BY d.director_id ORDER BY avg_rating DESC LIMIT 1;"),

  make(39, 'movies', 'medium', ['topic:Joins', 'Math', 'company:RottenTomatoes'], 
    "Find all movies where the lead actor (role is not null, just find any actor) has the same nationality as the director. Return movie title, actor last_name, director last_name, and their shared nationality.", 
    "Join movies, directors, movie_actors, actors.", "Check if a.nationality = d.nationality.", 
    "SELECT m.title, a.last_name AS actor_name, d.last_name AS director_name, a.nationality FROM movies m JOIN directors d ON m.director_id = d.director_id JOIN movie_actors ma ON m.movie_id = ma.movie_id JOIN actors a ON ma.actor_id = a.actor_id WHERE a.nationality = d.nationality AND a.nationality IS NOT NULL;", 
    "SELECT m.title, a.last_name AS actor_name, d.last_name AS director_name, a.nationality FROM movies m JOIN directors d ON m.director_id = d.director_id JOIN movie_actors ma ON m.movie_id = ma.movie_id JOIN actors a ON ma.actor_id = a.actor_id WHERE a.nationality = d.nationality AND a.nationality IS NOT NULL;"),

  make(40, 'movies', 'medium', ['topic:Math', 'Data Analysis', 'company:Metacritic'], 
    "Calculate the percentage of movies that made a profit (box_office > budget). Ignore NULLs. Return as profit_percentage rounded to 2 decimals.", 
    "Count profitable / total valid.", "Cast to REAL.", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM movies WHERE box_office > budget) AS REAL) * 100.0 / (SELECT COUNT(*) FROM movies WHERE box_office IS NOT NULL AND budget IS NOT NULL), 2) AS profit_percentage;", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM movies WHERE box_office > budget) AS REAL) * 100.0 / (SELECT COUNT(*) FROM movies WHERE box_office IS NOT NULL AND budget IS NOT NULL), 2) AS profit_percentage;"),

  make(41, 'movies', 'medium', ['topic:Joins', 'Null Handling', 'company:Netflix'], 
    "Find any genres that are NOT associated with any movie. Return genre name.", 
    "Left join genres to movie_genres.", "Check for NULL movie_id.", 
    "SELECT g.name FROM genres g LEFT JOIN movie_genres mg ON g.genre_id = mg.genre_id WHERE mg.movie_id IS NULL;", 
    "SELECT g.name FROM genres g LEFT JOIN movie_genres mg ON g.genre_id = mg.genre_id WHERE mg.movie_id IS NULL;"),

  make(42, 'movies', 'medium', ['topic:String Functions', 'Basic SQL', 'company:Disney'], 
    "Generate a summary string for movies: 'Title (Year) - Rating'. Return movie_id and summary.", 
    "Use || operator.", "Query movies.", 
    "SELECT movie_id, title || ' (' || release_year || ') - ' || rating AS summary FROM movies;", 
    "SELECT movie_id, title || ' (' || release_year || ') - ' || rating AS summary FROM movies;"),

  make(43, 'movies', 'medium', ['topic:Math', 'Data Analysis', 'company:WarnerBros'], 
    "Find the average age of actors when 'Inception' (released in 2010) came out. Return the average age rounded to 1 decimal.", 
    "Find actors in Inception (id=1).", "Average (2010 - birth_year).", 
    "SELECT ROUND(AVG(2010 - a.birth_year), 1) AS avg_age FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id WHERE ma.movie_id = 1;", 
    "SELECT ROUND(AVG(2010 - a.birth_year), 1) AS avg_age FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id WHERE ma.movie_id = 1;"),

  make(44, 'movies', 'medium', ['topic:Group By', 'Having', 'company:Universal'], 
    "Identify directors who have directed movies totaling over 500 million in box office revenue. Return director_id and total_box_office.", 
    "Group by director_id in movies.", "Use HAVING sum > 500000000.", 
    "SELECT director_id, SUM(box_office) as total_box_office FROM movies GROUP BY director_id HAVING SUM(box_office) > 500000000;", 
    "SELECT director_id, SUM(box_office) as total_box_office FROM movies GROUP BY director_id HAVING SUM(box_office) > 500000000;"),

  make(45, 'movies', 'medium', ['topic:Joins', 'Data Analysis', 'company:Paramount'], 
    "List the most common genre for movies directed by 'Martin Scorsese'. Return genre name and count.", 
    "Join directors, movies, movie_genres, genres.", "Filter for Scorsese, group by genre, sort desc, limit 1.", 
    "SELECT g.name, COUNT(mg.genre_id) as genre_count FROM directors d JOIN movies m ON d.director_id = m.director_id JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE d.last_name = 'Scorsese' GROUP BY g.name ORDER BY genre_count DESC LIMIT 1;", 
    "SELECT g.name, COUNT(mg.genre_id) as genre_count FROM directors d JOIN movies m ON d.director_id = m.director_id JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE d.last_name = 'Scorsese' GROUP BY g.name ORDER BY genre_count DESC LIMIT 1;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(46, 'movies', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:SonyPictures'], 
    "Analyze director consistency. For director 'Christopher Nolan' (id=1), find the difference in rating between each movie he released chronologically. Return release_year, title, rating, and difference from his previous movie's rating.", 
    "Use LAG(rating) OVER(ORDER BY release_year).", "Calculate difference.", 
    "WITH NolanMovies AS (SELECT release_year, title, rating, LAG(rating) OVER(ORDER BY release_year) as prev_rating FROM movies WHERE director_id = 1) SELECT release_year, title, rating, ROUND(rating - prev_rating, 1) as rating_change FROM NolanMovies WHERE prev_rating IS NOT NULL;", 
    "WITH NolanMovies AS (SELECT release_year, title, rating, LAG(rating) OVER(ORDER BY release_year) as prev_rating FROM movies WHERE director_id = 1) SELECT release_year, title, rating, ROUND(rating - prev_rating, 1) as rating_change FROM NolanMovies WHERE prev_rating IS NOT NULL;"),

  make(47, 'movies', 'hard', ['topic:Window Functions', 'Rank', 'company:Lionsgate'], 
    "Rank the movies within each genre by their box office revenue. Return genre name, movie title, box_office, and rank (1 being highest).", 
    "Use DENSE_RANK() OVER(PARTITION BY genre_name ORDER BY box_office DESC).", "Join tables.", 
    "WITH GenreBoxOffice AS (SELECT g.name as genre, m.title, m.box_office FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE m.box_office IS NOT NULL) SELECT genre, title, box_office, DENSE_RANK() OVER(PARTITION BY genre ORDER BY box_office DESC) as rank FROM GenreBoxOffice;", 
    "WITH GenreBoxOffice AS (SELECT g.name as genre, m.title, m.box_office FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE m.box_office IS NOT NULL) SELECT genre, title, box_office, DENSE_RANK() OVER(PARTITION BY genre ORDER BY box_office DESC) as rank FROM GenreBoxOffice;"),

  make(48, 'movies', 'hard', ['topic:CTEs', 'Window Functions', 'company:A24'], 
    "Calculate the cumulative (running) total of box office revenue for 'Action' movies over time (ordered by release_year). Return release_year, title, and running_total.", 
    "Sum box_office per movie.", "Use SUM() OVER(ORDER BY release_year ROWS UNBOUNDED PRECEDING).", 
    "WITH ActionMovies AS (SELECT m.release_year, m.title, m.box_office FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Action' AND m.box_office IS NOT NULL) SELECT release_year, title, SUM(box_office) OVER(ORDER BY release_year, title) as running_total FROM ActionMovies;", 
    "WITH ActionMovies AS (SELECT m.release_year, m.title, m.box_office FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Action' AND m.box_office IS NOT NULL) SELECT release_year, title, SUM(box_office) OVER(ORDER BY release_year, title) as running_total FROM ActionMovies;"),

  make(49, 'movies', 'hard', ['topic:Window Functions', 'Partition By', 'company:MGM'], 
    "Identify 'Outperformer Movies'. Find movies whose rating is greater than the average rating of ALL movies by the SAME director. Return director last_name, movie title, rating, and director_avg_rating.", 
    "Calculate AVG(rating) OVER(PARTITION BY director_id).", "Filter.", 
    "WITH DirAvg AS (SELECT d.last_name as director, m.title, m.rating, AVG(m.rating) OVER(PARTITION BY m.director_id) as d_avg FROM movies m JOIN directors d ON m.director_id = d.director_id) SELECT director, title, rating, ROUND(d_avg, 2) as director_avg_rating FROM DirAvg WHERE rating > d_avg;", 
    "WITH DirAvg AS (SELECT d.last_name as director, m.title, m.rating, AVG(m.rating) OVER(PARTITION BY m.director_id) as d_avg FROM movies m JOIN directors d ON m.director_id = d.director_id) SELECT director, title, rating, ROUND(d_avg, 2) as director_avg_rating FROM DirAvg WHERE rating > d_avg;"),

  make(50, 'movies', 'hard', ['topic:CTEs', 'Self Join', 'company:HBO'], 
    "Detect 'Frequent Collaborators'. Find pairs of actors who have starred in AT LEAST TWO movies together. Return actor1_id, actor2_id, and the count of movies they share. Ensure unique pairs (id1 < id2).", 
    "Self join movie_actors on movie_id.", "Group by the two actors, HAVING count >= 2.", 
    "SELECT ma1.actor_id as actor1_id, ma2.actor_id as actor2_id, COUNT(ma1.movie_id) as shared_movies FROM movie_actors ma1 JOIN movie_actors ma2 ON ma1.movie_id = ma2.movie_id AND ma1.actor_id < ma2.actor_id GROUP BY ma1.actor_id, ma2.actor_id HAVING COUNT(ma1.movie_id) >= 2;", 
    "SELECT ma1.actor_id as actor1_id, ma2.actor_id as actor2_id, COUNT(ma1.movie_id) as shared_movies FROM movie_actors ma1 JOIN movie_actors ma2 ON ma1.movie_id = ma2.movie_id AND ma1.actor_id < ma2.actor_id GROUP BY ma1.actor_id, ma2.actor_id HAVING COUNT(ma1.movie_id) >= 2;"),

  make(51, 'movies', 'hard', ['topic:Window Functions', 'Math', 'company:AmazonStudios'], 
    "Calculate the percentage of total box office revenue generated by each genre. Return genre name and percentage rounded to 2 decimals.", 
    "Sum box office per genre.", "Divide by SUM(box_office) OVER().", 
    "WITH GenreRev AS (SELECT g.name, SUM(m.box_office) as total_rev FROM genres g LEFT JOIN movie_genres mg ON g.genre_id = mg.genre_id LEFT JOIN movies m ON mg.movie_id = m.movie_id WHERE m.box_office IS NOT NULL GROUP BY g.genre_id) SELECT name, ROUND(total_rev * 100.0 / NULLIF(SUM(total_rev) OVER(), 0), 2) as revenue_percentage FROM GenreRev;", 
    "WITH GenreRev AS (SELECT g.name, SUM(m.box_office) as total_rev FROM genres g LEFT JOIN movie_genres mg ON g.genre_id = mg.genre_id LEFT JOIN movies m ON mg.movie_id = m.movie_id WHERE m.box_office IS NOT NULL GROUP BY g.genre_id) SELECT name, ROUND(total_rev * 100.0 / NULLIF(SUM(total_rev) OVER(), 0), 2) as revenue_percentage FROM GenreRev;"),

  make(52, 'movies', 'hard', ['topic:CTEs', 'Data Analysis', 'company:AppleTV'], 
    "Identify 'Versatile Actors'. Actors who have starred in movies across 3 OR MORE different genres. Return actor first_name, last_name, and distinct_genre_count.", 
    "Count distinct genre_id per actor.", "Use CTEs and filter.", 
    "WITH ActorGenres AS (SELECT a.actor_id, a.first_name, a.last_name, COUNT(DISTINCT mg.genre_id) as genre_count FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movie_genres mg ON ma.movie_id = mg.movie_id GROUP BY a.actor_id) SELECT first_name, last_name, genre_count FROM ActorGenres WHERE genre_count >= 3;", 
    "WITH ActorGenres AS (SELECT a.actor_id, a.first_name, a.last_name, COUNT(DISTINCT mg.genre_id) as genre_count FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movie_genres mg ON ma.movie_id = mg.movie_id GROUP BY a.actor_id) SELECT first_name, last_name, genre_count FROM ActorGenres WHERE genre_count >= 3;"),

  make(53, 'movies', 'hard', ['topic:Window Functions', 'Ntile', 'company:Hulu'], 
    "Create a 'Movie Era'. Divide all movies into 4 quartiles based on their release_year (1 being the oldest). Return title, release_year, and era_quartile.", 
    "Use NTILE(4) OVER(ORDER BY release_year ASC).", "Query movies.", 
    "SELECT title, release_year, NTILE(4) OVER(ORDER BY release_year ASC) as era_quartile FROM movies;", 
    "SELECT title, release_year, NTILE(4) OVER(ORDER BY release_year ASC) as era_quartile FROM movies;"),

  make(54, 'movies', 'hard', ['topic:CTEs', 'Self Join', 'company:Peacock'], 
    "Find 'Directorial Rematches'. Directors who cast the EXACT SAME actor in more than one of their movies. Return director name and actor name.", 
    "Join director to movies to movie_actors to actors.", "Group by director and actor, HAVING COUNT(distinct movie_id) > 1.", 
    "SELECT d.first_name || ' ' || d.last_name as director, a.first_name || ' ' || a.last_name as actor FROM directors d JOIN movies m ON d.director_id = m.director_id JOIN movie_actors ma ON m.movie_id = ma.movie_id JOIN actors a ON ma.actor_id = a.actor_id GROUP BY d.director_id, a.actor_id HAVING COUNT(DISTINCT m.movie_id) > 1;", 
    "SELECT d.first_name || ' ' || d.last_name as director, a.first_name || ' ' || a.last_name as actor FROM directors d JOIN movies m ON d.director_id = m.director_id JOIN movie_actors ma ON m.movie_id = ma.movie_id JOIN actors a ON ma.actor_id = a.actor_id GROUP BY d.director_id, a.actor_id HAVING COUNT(DISTINCT m.movie_id) > 1;"),

  make(55, 'movies', 'hard', ['topic:CTEs', 'Data Analysis', 'company:AMC'], 
    "Calculate the 'Box Office Dominance'. For the year 2010, what percentage of the total box office for that year was generated by the highest grossing movie? Return title, year_total, movie_total, and dominance_percentage.", 
    "Sum total for 2010.", "Find MAX for 2010.", "Divide.", 
    "WITH Year2010 AS (SELECT title, box_office, SUM(box_office) OVER() as year_total, ROW_NUMBER() OVER(ORDER BY box_office DESC) as rn FROM movies WHERE release_year = 2010 AND box_office IS NOT NULL) SELECT title, year_total, box_office as movie_total, ROUND(box_office * 100.0 / year_total, 2) as dominance_percentage FROM Year2010 WHERE rn = 1;", 
    "WITH Year2010 AS (SELECT title, box_office, SUM(box_office) OVER() as year_total, ROW_NUMBER() OVER(ORDER BY box_office DESC) as rn FROM movies WHERE release_year = 2010 AND box_office IS NOT NULL) SELECT title, year_total, box_office as movie_total, ROUND(box_office * 100.0 / year_total, 2) as dominance_percentage FROM Year2010 WHERE rn = 1;"),

  make(56, 'movies', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:Cinemark'], 
    "For the 'Action' genre, find the time gap (in years) between consecutive movie releases. Return release_year, title, and years_since_last_action_movie.", 
    "Use LAG() OVER(ORDER BY release_year).", "Filter for Action genre.", 
    "WITH ActionMvs AS (SELECT m.release_year, m.title, LAG(m.release_year) OVER(ORDER BY m.release_year) as prev_year FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Action') SELECT release_year, title, release_year - prev_year as years_since_last_action_movie FROM ActionMvs WHERE prev_year IS NOT NULL;", 
    "WITH ActionMvs AS (SELECT m.release_year, m.title, LAG(m.release_year) OVER(ORDER BY m.release_year) as prev_year FROM movies m JOIN movie_genres mg ON m.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Action') SELECT release_year, title, release_year - prev_year as years_since_last_action_movie FROM ActionMvs WHERE prev_year IS NOT NULL;"),

  make(57, 'movies', 'hard', ['topic:CTEs', 'Null Handling', 'company:Regal'], 
    "Identify 'Missing Cast'. Movies that exist in the database but have absolutely NO actors assigned to them in the movie_actors table. Return movie title.", 
    "Left join movies to movie_actors.", "Check for NULL actor_id.", 
    "SELECT m.title FROM movies m LEFT JOIN movie_actors ma ON m.movie_id = ma.movie_id WHERE ma.actor_id IS NULL;", 
    "SELECT m.title FROM movies m LEFT JOIN movie_actors ma ON m.movie_id = ma.movie_id WHERE ma.actor_id IS NULL;"),

  make(58, 'movies', 'hard', ['topic:Window Functions', 'Rank', 'company:IMDb'], 
    "Who is the youngest actor in each movie? Return movie title, actor name, their birth_year, and rank (must be 1).", 
    "Join movies, movie_actors, actors.", "ROW_NUMBER() OVER(PARTITION BY movie_id ORDER BY birth_year DESC).", 
    "WITH RankedActors AS (SELECT m.title, a.first_name || ' ' || a.last_name as actor_name, a.birth_year, ROW_NUMBER() OVER(PARTITION BY m.movie_id ORDER BY a.birth_year DESC) as rn FROM movies m JOIN movie_actors ma ON m.movie_id = ma.movie_id JOIN actors a ON ma.actor_id = a.actor_id WHERE a.birth_year IS NOT NULL) SELECT title, actor_name, birth_year FROM RankedActors WHERE rn = 1;", 
    "WITH RankedActors AS (SELECT m.title, a.first_name || ' ' || a.last_name as actor_name, a.birth_year, ROW_NUMBER() OVER(PARTITION BY m.movie_id ORDER BY a.birth_year DESC) as rn FROM movies m JOIN movie_actors ma ON m.movie_id = ma.movie_id JOIN actors a ON ma.actor_id = a.actor_id WHERE a.birth_year IS NOT NULL) SELECT title, actor_name, birth_year FROM RankedActors WHERE rn = 1;"),

  make(59, 'movies', 'hard', ['topic:Math', 'Data Analysis', 'company:RottenTomatoes'], 
    "Calculate the 'Cost Per Minute' for each director. (Total budget of all their movies / Total duration of all their movies). Return director name and cost_per_minute.", 
    "Sum budget.", "Sum duration.", "Divide.", 
    "WITH DirStats AS (SELECT d.first_name || ' ' || d.last_name as director, SUM(m.budget) as total_budget, SUM(m.duration_mins) as total_duration FROM directors d JOIN movies m ON d.director_id = m.director_id WHERE m.budget IS NOT NULL GROUP BY d.director_id) SELECT director, ROUND(total_budget / total_duration, 2) as cost_per_minute FROM DirStats;", 
    "WITH DirStats AS (SELECT d.first_name || ' ' || d.last_name as director, SUM(m.budget) as total_budget, SUM(m.duration_mins) as total_duration FROM directors d JOIN movies m ON d.director_id = m.director_id WHERE m.budget IS NOT NULL GROUP BY d.director_id) SELECT director, ROUND(total_budget / total_duration, 2) as cost_per_minute FROM DirStats;"),

  make(60, 'movies', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Metacritic'], 
    "Identify 'Crossover Stars'. Actors who have starred in both a 'Sci-Fi' (Science Fiction) movie AND a 'Romance' movie. Return actor_id and name.", 
    "Join actors, movie_actors, movie_genres, genres.", "Filter for Sci-Fi, INTERSECT with Romance.", 
    "SELECT a.actor_id, a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movie_genres mg ON ma.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Science Fiction' INTERSECT SELECT a.actor_id, a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movie_genres mg ON ma.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Romance';", 
    "SELECT a.actor_id, a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movie_genres mg ON ma.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Science Fiction' INTERSECT SELECT a.actor_id, a.first_name, a.last_name FROM actors a JOIN movie_actors ma ON a.actor_id = ma.actor_id JOIN movie_genres mg ON ma.movie_id = mg.movie_id JOIN genres g ON mg.genre_id = g.genre_id WHERE g.name = 'Romance';")
];
`;

fs.writeFileSync(targetFile, code);
console.log('Successfully generated the PERFECT movies questions!');
