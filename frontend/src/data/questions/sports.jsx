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

// SPORTS QUESTIONS (IDs 1-60)
export const sportsQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(1, 'sports', 'easy', ['topic:Basic SQL', 'Where', 'company:ESPN'], 
    "Find all teams in the 'Premier' division. Return their name and city.", 
    "Filter the teams table.", "Use WHERE division = 'Premier'.", 
    "SELECT name, city FROM teams WHERE division = 'Premier';", 
    "SELECT name, city FROM teams WHERE division = 'Premier';"),

  make(2, 'sports', 'easy', ['topic:String Functions', 'Basic SQL', 'company:SkySports'], 
    "Format the player names for a lineup display. Return a single column 'full_name' with the format 'Firstname Lastname'.", 
    "Concatenate first_name, a space, and last_name.", "Use the || operator.", 
    "SELECT first_name || ' ' || last_name AS full_name FROM players;", 
    "SELECT first_name || ' ' || last_name AS full_name FROM players;"),

  make(3, 'sports', 'easy', ['topic:Math', 'Aggregate Functions', 'company:Opta'], 
    "Calculate the total number of goals scored across all matches in the goals table. Return as 'total_goals'.", 
    "Use COUNT() on the goals table.", "Query the goals table.", 
    "SELECT COUNT(*) AS total_goals FROM goals;", 
    "SELECT COUNT(*) AS total_goals FROM goals;"),

  make(4, 'sports', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:BBCSport'], 
    "Identify any players who do not have a team assigned (team_id IS NULL). Return first_name and last_name.", 
    "Check if team_id is NULL.", "Use WHERE team_id IS NULL.", 
    "SELECT first_name, last_name FROM players WHERE team_id IS NULL;", 
    "SELECT first_name, last_name FROM players WHERE team_id IS NULL;"),

  make(5, 'sports', 'easy', ['topic:Data Analysis', 'Group By', 'company:TheAthletic'], 
    "Count how many players play in each position. Return position and the count.", 
    "Group by position in the players table.", "Use COUNT(*).", 
    "SELECT position, COUNT(*) AS player_count FROM players GROUP BY position;", 
    "SELECT position, COUNT(*) AS player_count FROM players GROUP BY position;"),

  make(6, 'sports', 'easy', ['topic:Basic SQL', 'Where', 'company:DAZN'], 
    "Find all matches that took place on '2023-10-29'. Return match_id, home_team_id, and away_team_id.", 
    "Filter match_date.", "WHERE match_date = '2023-10-29'.", 
    "SELECT match_id, home_team_id, away_team_id FROM matches WHERE match_date = '2023-10-29';", 
    "SELECT match_id, home_team_id, away_team_id FROM matches WHERE match_date = '2023-10-29';"),

  make(7, 'sports', 'easy', ['topic:Aggregate Functions', 'Math', 'company:ESPN'], 
    "What is the earliest founded year among all teams? Return as 'oldest_team_year'.", 
    "Use MIN(founded_year).", "Query the teams table.", 
    "SELECT MIN(founded_year) AS oldest_team_year FROM teams;", 
    "SELECT MIN(founded_year) AS oldest_team_year FROM teams;"),

  make(8, 'sports', 'easy', ['topic:Basic SQL', 'Limit', 'company:SkySports'], 
    "List the 3 most recently played matches based on match_date. Return match_id and match_date.", 
    "Sort by match_date descending.", "Limit to 3.", 
    "SELECT match_id, match_date FROM matches ORDER BY match_date DESC LIMIT 3;", 
    "SELECT match_id, match_date FROM matches ORDER BY match_date DESC LIMIT 3;"),

  make(9, 'sports', 'easy', ['topic:Basic SQL', 'In', 'company:Opta'], 
    "Find all players who are 'English' or 'Brazilian'. Return first_name, last_name, and nationality.", 
    "Use the IN operator on the nationality column.", "WHERE nationality IN ('English', 'Brazilian').", 
    "SELECT first_name, last_name, nationality FROM players WHERE nationality IN ('English', 'Brazilian');", 
    "SELECT first_name, last_name, nationality FROM players WHERE nationality IN ('English', 'Brazilian');"),

  make(10, 'sports', 'easy', ['topic:String Functions', 'Basic SQL', 'company:BBCSport'], 
    "Find all teams located in a city starting with 'M'. Return team name and city.", 
    "Use LIKE 'M%'.", "Filter on the city column.", 
    "SELECT name, city FROM teams WHERE city LIKE 'M%';", 
    "SELECT name, city FROM teams WHERE city LIKE 'M%';"),

  make(11, 'sports', 'easy', ['topic:Data Analysis', 'Group By', 'company:TheAthletic'], 
    "How many players does each team have? Return team_id and the player_count.", 
    "Use COUNT(*).", "Group by team_id in the players table.", 
    "SELECT team_id, COUNT(*) AS player_count FROM players GROUP BY team_id;", 
    "SELECT team_id, COUNT(*) AS player_count FROM players GROUP BY team_id;"),

  make(12, 'sports', 'easy', ['topic:Date Functions', 'String Functions', 'company:DAZN'], 
    "Extract the month from the start_date of all seasons. Return name and start_month.", 
    "Use substr() or strftime('%m', start_date).", "Query the seasons table.", 
    "SELECT name, strftime('%m', start_date) AS start_month FROM seasons;", 
    "SELECT name, strftime('%m', start_date) AS start_month FROM seasons;"),

  make(13, 'sports', 'easy', ['topic:Basic SQL', 'Where', 'company:ESPN'], 
    "Find all goals that were 'own goals' (is_own_goal = 1). Return goal_id, match_id, and player_id.", 
    "Filter by is_own_goal = 1.", "Check the goals table.", 
    "SELECT goal_id, match_id, player_id FROM goals WHERE is_own_goal = 1;", 
    "SELECT goal_id, match_id, player_id FROM goals WHERE is_own_goal = 1;"),

  make(14, 'sports', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:SkySports'], 
    "How many distinct cities have at least one team? Return the count as 'unique_cities'.", 
    "Use COUNT(DISTINCT city).", "Query the teams table.", 
    "SELECT COUNT(DISTINCT city) AS unique_cities FROM teams;", 
    "SELECT COUNT(DISTINCT city) AS unique_cities FROM teams;"),

  make(15, 'sports', 'easy', ['topic:Basic SQL', 'Math', 'company:Opta'], 
    "List all matches where the home team scored 3 or more goals (home_score >= 3). Return match_id and home_score.", 
    "Filter for home_score >= 3.", "Look at the matches table.", 
    "SELECT match_id, home_score FROM matches WHERE home_score >= 3;", 
    "SELECT match_id, home_score FROM matches WHERE home_score >= 3;"),

  make(16, 'sports', 'easy', ['topic:Data Cleaning', 'Like', 'company:BBCSport'], 
    "Find all players whose last name contains 'son'. Return player_id and last_name.", 
    "Use LIKE '%son%'.", "Query the players table.", 
    "SELECT player_id, last_name FROM players WHERE last_name LIKE '%son%';", 
    "SELECT player_id, last_name FROM players WHERE last_name LIKE '%son%';"),

  make(17, 'sports', 'easy', ['topic:Basic SQL', 'Where', 'company:TheAthletic'], 
    "Find all matches played in matchday 1. Return match_id, home_team_id, and away_team_id.", 
    "Check if matchday = 1.", "Query the matches table.", 
    "SELECT match_id, home_team_id, away_team_id FROM matches WHERE matchday = 1;", 
    "SELECT match_id, home_team_id, away_team_id FROM matches WHERE matchday = 1;"),

  make(18, 'sports', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:DAZN'], 
    "Count the number of teams founded in each year. Return founded_year and team_count.", 
    "Group by founded_year in the teams table.", "Use COUNT(*).", 
    "SELECT founded_year, COUNT(*) AS team_count FROM teams GROUP BY founded_year;", 
    "SELECT founded_year, COUNT(*) AS team_count FROM teams GROUP BY founded_year;"),

  make(19, 'sports', 'easy', ['topic:Basic SQL', 'Order By', 'company:ESPN'], 
    "Find the 5 youngest players based on Date of Birth (dob). Return first_name, last_name, and dob.", 
    "Order by dob DESC (most recent dates are younger).", "Limit to 5.", 
    "SELECT first_name, last_name, dob FROM players ORDER BY dob DESC LIMIT 5;", 
    "SELECT first_name, last_name, dob FROM players ORDER BY dob DESC LIMIT 5;"),

  make(20, 'sports', 'easy', ['topic:Basic SQL', 'Math', 'company:SkySports'], 
    "Calculate the total points accumulated by all teams in season_id 3. Return as 'total_points'.", 
    "Use SUM(points).", "Query standings where season_id = 3.", 
    "SELECT SUM(points) AS total_points FROM standings WHERE season_id = 3;", 
    "SELECT SUM(points) AS total_points FROM standings WHERE season_id = 3;"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(21, 'sports', 'medium', ['topic:Joins', 'Data Analysis', 'company:Opta'], 
    "List all players and the name of the team they play for. Return player last_name and team name.", 
    "Join players and teams.", "Select the correct columns.", 
    "SELECT p.last_name, t.name FROM players p JOIN teams t ON p.team_id = t.team_id;", 
    "SELECT p.last_name, t.name FROM players p JOIN teams t ON p.team_id = t.team_id;"),

  make(22, 'sports', 'medium', ['topic:Joins', 'Math', 'company:BBCSport'], 
    "How many goals did each player score (including own goals)? Return the player's last_name and the goal_count.", 
    "Join goals and players.", "Group by player last_name and count.", 
    "SELECT p.last_name, COUNT(g.goal_id) AS goal_count FROM players p JOIN goals g ON p.player_id = g.player_id GROUP BY p.last_name;", 
    "SELECT p.last_name, COUNT(g.goal_id) AS goal_count FROM players p JOIN goals g ON p.player_id = g.player_id GROUP BY p.last_name;"),

  make(23, 'sports', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:TheAthletic'], 
    "Find all matches played in the '2023-24' season. Return match_id and match_date.", 
    "Join matches and seasons.", "Filter for name = '2023-24'.", 
    "SELECT m.match_id, m.match_date FROM matches m JOIN seasons s ON m.season_id = s.season_id WHERE s.name = '2023-24';", 
    "SELECT m.match_id, m.match_date FROM matches m JOIN seasons s ON m.season_id = s.season_id WHERE s.name = '2023-24';"),

  make(24, 'sports', 'medium', ['topic:Joins', 'Group By', 'company:DAZN'], 
    "Which team has won the most matches across all recorded standings? Return team name and total_wins.", 
    "Join teams and standings.", "Group by team_id, sum(won), sort desc, limit 1.", 
    "SELECT t.name, SUM(s.won) AS total_wins FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.team_id ORDER BY total_wins DESC LIMIT 1;", 
    "SELECT t.name, SUM(s.won) AS total_wins FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.team_id ORDER BY total_wins DESC LIMIT 1;"),

  make(25, 'sports', 'medium', ['topic:Case Statements', 'Math', 'company:ESPN'], 
    "Determine the result of each match for the HOME team: 'Win', 'Loss', or 'Draw'. Return match_id, home_team_id, and result.", 
    "Use a CASE statement comparing home_score and away_score.", "Group by match_id.", 
    "SELECT match_id, home_team_id, CASE WHEN home_score > away_score THEN 'Win' WHEN home_score < away_score THEN 'Loss' ELSE 'Draw' END AS result FROM matches;", 
    "SELECT match_id, home_team_id, CASE WHEN home_score > away_score THEN 'Win' WHEN home_score < away_score THEN 'Loss' ELSE 'Draw' END AS result FROM matches;"),

  make(26, 'sports', 'medium', ['topic:Joins', 'Having', 'company:SkySports'], 
    "Find players who have scored more than 3 goals. Return player first_name, last_name, and goal_count.", 
    "Join players and goals.", "Group by player_id and use HAVING count > 3.", 
    "SELECT p.first_name, p.last_name, COUNT(g.goal_id) AS goal_count FROM players p JOIN goals g ON p.player_id = g.player_id GROUP BY p.player_id HAVING COUNT(g.goal_id) > 3;", 
    "SELECT p.first_name, p.last_name, COUNT(g.goal_id) AS goal_count FROM players p JOIN goals g ON p.player_id = g.player_id GROUP BY p.player_id HAVING COUNT(g.goal_id) > 3;"),

  make(27, 'sports', 'medium', ['topic:Subqueries', 'Null Handling', 'company:Opta'], 
    "Identify teams that have NEVER recorded any stats in the standings table. Return their team_id and name.", 
    "Use a subquery for team_id NOT IN (standings).", "Or use a LEFT JOIN.", 
    "SELECT team_id, name FROM teams WHERE team_id NOT IN (SELECT team_id FROM standings);", 
    "SELECT team_id, name FROM teams WHERE team_id NOT IN (SELECT team_id FROM standings);"),

  make(28, 'sports', 'medium', ['topic:Math', 'Data Analysis', 'company:BBCSport'], 
    "Calculate the goal difference (home_score - away_score) for all matches. Return match_id and goal_difference.", 
    "Subtract away_score from home_score.", "Query matches.", 
    "SELECT match_id, (home_score - away_score) AS goal_difference FROM matches;", 
    "SELECT match_id, (home_score - away_score) AS goal_difference FROM matches;"),

  make(29, 'sports', 'medium', ['topic:Joins', 'Null Handling', 'company:TheAthletic'], 
    "List all matches that had NO goals scored in them (0-0 draws). Return match_id.", 
    "Left join matches to goals.", "Filter where goal_id IS NULL OR use where home_score=0 and away_score=0.", 
    "SELECT match_id FROM matches WHERE home_score = 0 AND away_score = 0;", 
    "SELECT match_id FROM matches WHERE home_score = 0 AND away_score = 0;"),

  make(30, 'sports', 'medium', ['topic:Joins', 'Data Analysis', 'company:DAZN'], 
    "Which nationality has produced the most goals? Return nationality and goal_count.", 
    "Join players and goals.", "Group by nationality, order desc, limit 1.", 
    "SELECT p.nationality, COUNT(g.goal_id) AS goal_count FROM players p JOIN goals g ON p.player_id = g.player_id GROUP BY p.nationality ORDER BY goal_count DESC LIMIT 1;", 
    "SELECT p.nationality, COUNT(g.goal_id) AS goal_count FROM players p JOIN goals g ON p.player_id = g.player_id GROUP BY p.nationality ORDER BY goal_count DESC LIMIT 1;"),

  make(31, 'sports', 'medium', ['topic:Subqueries', 'Math', 'company:ESPN'], 
    "Find matches where the total number of goals (home + away) was strictly greater than the average total goals per match. Return match_id, home_score, away_score.", 
    "Use a subquery to get AVG(home_score + away_score).", "Compare (home+away) to it.", 
    "SELECT match_id, home_score, away_score FROM matches WHERE (home_score + away_score) > (SELECT AVG(home_score + away_score) FROM matches);", 
    "SELECT match_id, home_score, away_score FROM matches WHERE (home_score + away_score) > (SELECT AVG(home_score + away_score) FROM matches);"),

  make(32, 'sports', 'medium', ['topic:Joins', 'Group By', 'company:SkySports'], 
    "Find the total number of points accumulated by each division across all standings. Return division and total_points.", 
    "Join teams and standings.", "Group by division, sum points.", 
    "SELECT t.division, SUM(s.points) as total_points FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.division;", 
    "SELECT t.division, SUM(s.points) as total_points FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.division;"),

  make(33, 'sports', 'medium', ['topic:Joins', 'Date Functions', 'company:Opta'], 
    "Find all matches played in the month of December (any year). Return match_id, match_date, and home_team_id.", 
    "Use strftime('%m', match_date) = '12' or LIKE '%-12-%'.", "Query matches.", 
    "SELECT match_id, match_date, home_team_id FROM matches WHERE strftime('%m', match_date) = '12';", 
    "SELECT match_id, match_date, home_team_id FROM matches WHERE strftime('%m', match_date) = '12';"),

  make(34, 'sports', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:BBCSport'], 
    "Create a 'Match Excitement' label based on total goals: 0-1 'Boring', 2-3 'Normal', >3 'Exciting'. Return match_id, total_goals, and excitement_label.", 
    "Use CASE statement on (home_score + away_score).", "Query matches.", 
    "SELECT match_id, (home_score + away_score) AS total_goals, CASE WHEN (home_score + away_score) <= 1 THEN 'Boring' WHEN (home_score + away_score) <= 3 THEN 'Normal' ELSE 'Exciting' END AS excitement_label FROM matches;", 
    "SELECT match_id, (home_score + away_score) AS total_goals, CASE WHEN (home_score + away_score) <= 1 THEN 'Boring' WHEN (home_score + away_score) <= 3 THEN 'Normal' ELSE 'Exciting' END AS excitement_label FROM matches;"),

  make(35, 'sports', 'medium', ['topic:CTEs', 'Data Analysis', 'company:TheAthletic'], 
    "Use a CTE to calculate total points for each team in season 3. Find the team with the maximum points. Return team name and points.", 
    "CTE selects points per team for season 3.", "Main query finds MAX.", 
    "WITH SeasonPoints AS (SELECT t.name, s.points FROM teams t JOIN standings s ON t.team_id = s.team_id WHERE s.season_id = 3) SELECT name, points FROM SeasonPoints WHERE points = (SELECT MAX(points) FROM SeasonPoints);", 
    "WITH SeasonPoints AS (SELECT t.name, s.points FROM teams t JOIN standings s ON t.team_id = s.team_id WHERE s.season_id = 3) SELECT name, points FROM SeasonPoints WHERE points = (SELECT MAX(points) FROM SeasonPoints);"),

  make(36, 'sports', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:DAZN'], 
    "Find teams that played as a Home team in season 3 AND played as an Away team in season 3. Return team_id.", 
    "Use INTERSECT.", "Query matches.", 
    "SELECT home_team_id AS team_id FROM matches WHERE season_id = 3 INTERSECT SELECT away_team_id AS team_id FROM matches WHERE season_id = 3;", 
    "SELECT home_team_id AS team_id FROM matches WHERE season_id = 3 INTERSECT SELECT away_team_id AS team_id FROM matches WHERE season_id = 3;"),

  make(37, 'sports', 'medium', ['topic:Joins', 'Self Join', 'company:ESPN'], 
    "Find 'Derby Matches'. Matches where the home team and away team are from the exact same city. Return match_id, home_team name, away_team name, and city.", 
    "Join matches to teams twice (once for home, once for away).", "Filter where home.city = away.city.", 
    "SELECT m.match_id, th.name AS home_team, ta.name AS away_team, th.city FROM matches m JOIN teams th ON m.home_team_id = th.team_id JOIN teams ta ON m.away_team_id = ta.team_id WHERE th.city = ta.city;", 
    "SELECT m.match_id, th.name AS home_team, ta.name AS away_team, th.city FROM matches m JOIN teams th ON m.home_team_id = th.team_id JOIN teams ta ON m.away_team_id = ta.team_id WHERE th.city = ta.city;"),

  make(38, 'sports', 'medium', ['topic:Joins', 'Group By', 'company:SkySports'], 
    "Which player scored the most own goals? Return player last_name and own_goal_count.", 
    "Join players and goals.", "Filter for is_own_goal = 1, group by player, order desc, limit 1.", 
    "SELECT p.last_name, COUNT(g.goal_id) AS own_goal_count FROM players p JOIN goals g ON p.player_id = g.player_id WHERE g.is_own_goal = 1 GROUP BY p.player_id ORDER BY own_goal_count DESC LIMIT 1;", 
    "SELECT p.last_name, COUNT(g.goal_id) AS own_goal_count FROM players p JOIN goals g ON p.player_id = g.player_id WHERE g.is_own_goal = 1 GROUP BY p.player_id ORDER BY own_goal_count DESC LIMIT 1;"),

  make(39, 'sports', 'medium', ['topic:Joins', 'Math', 'company:Opta'], 
    "Calculate the total number of matches played by 'Arsenal FC' (as home OR away). Return total_matches.", 
    "Count matches where home_team = Arsenal OR away_team = Arsenal.", "Join teams.", 
    "SELECT COUNT(*) AS total_matches FROM matches m JOIN teams t1 ON m.home_team_id = t1.team_id JOIN teams t2 ON m.away_team_id = t2.team_id WHERE t1.name = 'Arsenal FC' OR t2.name = 'Arsenal FC';", 
    "SELECT COUNT(*) AS total_matches FROM matches m JOIN teams t1 ON m.home_team_id = t1.team_id JOIN teams t2 ON m.away_team_id = t2.team_id WHERE t1.name = 'Arsenal FC' OR t2.name = 'Arsenal FC';"),

  make(40, 'sports', 'medium', ['topic:Math', 'Data Analysis', 'company:BBCSport'], 
    "Calculate the percentage of matches that ended in a draw. Return as draw_percentage rounded to 2 decimals.", 
    "Count where home_score = away_score / total matches.", "Cast to REAL.", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM matches WHERE home_score = away_score) AS REAL) * 100.0 / (SELECT COUNT(*) FROM matches), 2) AS draw_percentage;", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM matches WHERE home_score = away_score) AS REAL) * 100.0 / (SELECT COUNT(*) FROM matches), 2) AS draw_percentage;"),

  make(41, 'sports', 'medium', ['topic:Joins', 'Null Handling', 'company:TheAthletic'], 
    "Find players who have NEVER scored a goal (own goals included). Return player_id and last_name.", 
    "Left join players to goals.", "Check for NULL goal_id.", 
    "SELECT p.player_id, p.last_name FROM players p LEFT JOIN goals g ON p.player_id = g.player_id WHERE g.goal_id IS NULL;", 
    "SELECT p.player_id, p.last_name FROM players p LEFT JOIN goals g ON p.player_id = g.player_id WHERE g.goal_id IS NULL;"),

  make(42, 'sports', 'medium', ['topic:String Functions', 'Basic SQL', 'company:DAZN'], 
    "Generate a match summary string: 'HomeTeamScore - AwayTeamScore'. Return match_id and summary.", 
    "Use || operator.", "Query matches.", 
    "SELECT match_id, home_score || '-' || away_score AS summary FROM matches;", 
    "SELECT match_id, home_score || '-' || away_score AS summary FROM matches;"),

  make(43, 'sports', 'medium', ['topic:Math', 'Data Analysis', 'company:ESPN'], 
    "Find the average age of players at the start of season 3 ('2023-08-12'). Return average_age in years rounded to 1 decimal.", 
    "Calculate (2023-08-12 - dob).", "Use AVG().", 
    "SELECT ROUND(AVG(julianday('2023-08-12') - julianday(dob)) / 365.25, 1) AS average_age FROM players;", 
    "SELECT ROUND(AVG(julianday('2023-08-12') - julianday(dob)) / 365.25, 1) AS average_age FROM players;"),

  make(44, 'sports', 'medium', ['topic:Group By', 'Having', 'company:SkySports'], 
    "Identify teams that have conceded more than 10 total goals in matches they played AT HOME. Return team_id and home_goals_conceded.", 
    "Group by home_team_id in matches.", "Sum away_score. Use HAVING sum > 10.", 
    "SELECT home_team_id as team_id, SUM(away_score) AS home_goals_conceded FROM matches GROUP BY home_team_id HAVING SUM(away_score) > 10;", 
    "SELECT home_team_id as team_id, SUM(away_score) AS home_goals_conceded FROM matches GROUP BY home_team_id HAVING SUM(away_score) > 10;"),

  make(45, 'sports', 'medium', ['topic:Joins', 'Data Analysis', 'company:Opta'], 
    "List the team that has the most 'Forwards'. Return team name and forward_count.", 
    "Join teams and players.", "Filter for position = 'Forward', group by team, sort desc, limit 1.", 
    "SELECT t.name, COUNT(p.player_id) as forward_count FROM teams t JOIN players p ON t.team_id = p.team_id WHERE p.position = 'Forward' GROUP BY t.team_id ORDER BY forward_count DESC LIMIT 1;", 
    "SELECT t.name, COUNT(p.player_id) as forward_count FROM teams t JOIN players p ON t.team_id = p.team_id WHERE p.position = 'Forward' GROUP BY t.team_id ORDER BY forward_count DESC LIMIT 1;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(46, 'sports', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:BBCSport'], 
    "Analyze 'City FC' (team_id=1) home form. Find the difference in goals they scored at home between consecutive home matches. Return match_date, home_score, and goal_diff_from_prev_home_match.", 
    "Use LAG(home_score) OVER(ORDER BY match_date).", "Filter home_team = 1.", 
    "WITH HomeMatches AS (SELECT match_date, home_score, LAG(home_score) OVER(ORDER BY match_date) as prev_score FROM matches WHERE home_team_id = 1) SELECT match_date, home_score, home_score - prev_score as goal_diff_from_prev_home_match FROM HomeMatches WHERE prev_score IS NOT NULL;", 
    "WITH HomeMatches AS (SELECT match_date, home_score, LAG(home_score) OVER(ORDER BY match_date) as prev_score FROM matches WHERE home_team_id = 1) SELECT match_date, home_score, home_score - prev_score as goal_diff_from_prev_home_match FROM HomeMatches WHERE prev_score IS NOT NULL;"),

  make(47, 'sports', 'hard', ['topic:Window Functions', 'Rank', 'company:TheAthletic'], 
    "Rank the teams within each division based on their total historical points across all seasons. Return division, team name, total_points, and rank (1 being highest).", 
    "Use DENSE_RANK() OVER(PARTITION BY division ORDER BY sum(points) DESC).", "Join tables.", 
    "WITH TeamPoints AS (SELECT t.division, t.name, SUM(s.points) as total_points FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.team_id) SELECT division, name, total_points, DENSE_RANK() OVER(PARTITION BY division ORDER BY total_points DESC) as rank FROM TeamPoints;", 
    "WITH TeamPoints AS (SELECT t.division, t.name, SUM(s.points) as total_points FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.team_id) SELECT division, name, total_points, DENSE_RANK() OVER(PARTITION BY division ORDER BY total_points DESC) as rank FROM TeamPoints;"),

  make(48, 'sports', 'hard', ['topic:CTEs', 'Window Functions', 'company:DAZN'], 
    "Calculate the cumulative total goals scored by 'Erling Haaland' (player_id=1) over his career, ordered by match_date. Return match_date and running_total_goals. Ignore own goals.", 
    "Join goals and matches.", "Use SUM() OVER(ORDER BY match_date ROWS UNBOUNDED PRECEDING).", 
    "WITH HaalandGoals AS (SELECT m.match_date, COUNT(g.goal_id) as goals_in_match FROM goals g JOIN matches m ON g.match_id = m.match_id WHERE g.player_id = 1 AND g.is_own_goal = 0 GROUP BY m.match_id, m.match_date) SELECT match_date, SUM(goals_in_match) OVER(ORDER BY match_date) as running_total_goals FROM HaalandGoals;", 
    "WITH HaalandGoals AS (SELECT m.match_date, COUNT(g.goal_id) as goals_in_match FROM goals g JOIN matches m ON g.match_id = m.match_id WHERE g.player_id = 1 AND g.is_own_goal = 0 GROUP BY m.match_id, m.match_date) SELECT match_date, SUM(goals_in_match) OVER(ORDER BY match_date) as running_total_goals FROM HaalandGoals;"),

  make(49, 'sports', 'hard', ['topic:Window Functions', 'Partition By', 'company:ESPN'], 
    "Identify 'Top Performers'. Find players whose total goals are strictly greater than the average goals of all players IN THEIR SAME POSITION. Return position, player name, goals, and pos_avg_goals.", 
    "Calculate AVG(goals) OVER(PARTITION BY position).", "Filter.", 
    "WITH PlayerGoals AS (SELECT p.position, p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as total_goals FROM players p LEFT JOIN goals g ON p.player_id = g.player_id AND g.is_own_goal = 0 GROUP BY p.player_id), PosAvg AS (SELECT position, name, total_goals, AVG(total_goals) OVER(PARTITION BY position) as p_avg FROM PlayerGoals) SELECT position, name, total_goals, ROUND(p_avg, 2) as pos_avg_goals FROM PosAvg WHERE total_goals > p_avg;", 
    "WITH PlayerGoals AS (SELECT p.position, p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as total_goals FROM players p LEFT JOIN goals g ON p.player_id = g.player_id AND g.is_own_goal = 0 GROUP BY p.player_id), PosAvg AS (SELECT position, name, total_goals, AVG(total_goals) OVER(PARTITION BY position) as p_avg FROM PlayerGoals) SELECT position, name, total_goals, ROUND(p_avg, 2) as pos_avg_goals FROM PosAvg WHERE total_goals > p_avg;"),

  make(50, 'sports', 'hard', ['topic:CTEs', 'Self Join', 'company:SkySports'], 
    "Detect 'Revenge Matches'. Find pairs of teams that played each other twice in the SAME season, where team A won the first match, but team B won the second match. Return season_id, teamA_id, teamB_id.", 
    "Join matches to itself.", "Check same season, swapped home/away, different winners.", 
    "WITH MatchResults AS (SELECT match_id, season_id, match_date, home_team_id, away_team_id, CASE WHEN home_score > away_score THEN home_team_id WHEN away_score > home_score THEN away_team_id ELSE NULL END as winner FROM matches) SELECT r1.season_id, r1.winner as teamA_id, r2.winner as teamB_id FROM MatchResults r1 JOIN MatchResults r2 ON r1.season_id = r2.season_id AND r1.home_team_id = r2.away_team_id AND r1.away_team_id = r2.home_team_id WHERE r1.match_date < r2.match_date AND r1.winner IS NOT NULL AND r2.winner IS NOT NULL AND r1.winner != r2.winner;", 
    "WITH MatchResults AS (SELECT match_id, season_id, match_date, home_team_id, away_team_id, CASE WHEN home_score > away_score THEN home_team_id WHEN away_score > home_score THEN away_team_id ELSE NULL END as winner FROM matches) SELECT r1.season_id, r1.winner as teamA_id, r2.winner as teamB_id FROM MatchResults r1 JOIN MatchResults r2 ON r1.season_id = r2.season_id AND r1.home_team_id = r2.away_team_id AND r1.away_team_id = r2.home_team_id WHERE r1.match_date < r2.match_date AND r1.winner IS NOT NULL AND r2.winner IS NOT NULL AND r1.winner != r2.winner;"),

  make(51, 'sports', 'hard', ['topic:Window Functions', 'Math', 'company:Opta'], 
    "Calculate the percentage of total points accumulated by each team across all their seasons. Return team name and percentage rounded to 2 decimals.", 
    "Sum points per team.", "Divide by SUM(points) OVER().", 
    "WITH TeamTotalPoints AS (SELECT t.name, SUM(s.points) as team_pts FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.team_id) SELECT name, ROUND(team_pts * 100.0 / SUM(team_pts) OVER(), 2) as points_percentage FROM TeamTotalPoints;", 
    "WITH TeamTotalPoints AS (SELECT t.name, SUM(s.points) as team_pts FROM teams t JOIN standings s ON t.team_id = s.team_id GROUP BY t.team_id) SELECT name, ROUND(team_pts * 100.0 / SUM(team_pts) OVER(), 2) as points_percentage FROM TeamTotalPoints;"),

  make(52, 'sports', 'hard', ['topic:CTEs', 'Data Analysis', 'company:BBCSport'], 
    "Identify 'Invincible Home Teams'. Teams that did NOT lose a single home match in season 3. Return team name.", 
    "Find teams where home_score < away_score for season 3.", "Exclude them.", 
    "SELECT name FROM teams WHERE team_id IN (SELECT home_team_id FROM matches WHERE season_id = 3) AND team_id NOT IN (SELECT home_team_id FROM matches WHERE season_id = 3 AND home_score < away_score);", 
    "SELECT name FROM teams WHERE team_id IN (SELECT home_team_id FROM matches WHERE season_id = 3) AND team_id NOT IN (SELECT home_team_id FROM matches WHERE season_id = 3 AND home_score < away_score);"),

  make(53, 'sports', 'hard', ['topic:Window Functions', 'Ntile', 'company:TheAthletic'], 
    "Create a 'Player Goal Tier'. Divide players who have scored at least 1 goal into 3 tiers based on total goals (1 being highest scorers). Return player name, total_goals, and tier.", 
    "Use NTILE(3) OVER(ORDER BY total_goals DESC).", "Count goals per player.", 
    "WITH PlayerStats AS (SELECT p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as total_goals FROM players p JOIN goals g ON p.player_id = g.player_id WHERE g.is_own_goal = 0 GROUP BY p.player_id) SELECT name, total_goals, NTILE(3) OVER(ORDER BY total_goals DESC) as tier FROM PlayerStats;", 
    "WITH PlayerStats AS (SELECT p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as total_goals FROM players p JOIN goals g ON p.player_id = g.player_id WHERE g.is_own_goal = 0 GROUP BY p.player_id) SELECT name, total_goals, NTILE(3) OVER(ORDER BY total_goals DESC) as tier FROM PlayerStats;"),

  make(54, 'sports', 'hard', ['topic:CTEs', 'Self Join', 'company:DAZN'], 
    "Find 'Late Drama'. Matches where BOTH teams scored a goal in the 80th minute or later. Return match_id.", 
    "Join goals to itself.", "Check same match_id, different team_ids, both minute >= 80.", 
    "WITH LateGoals AS (SELECT g.match_id, p.team_id FROM goals g JOIN players p ON g.player_id = p.player_id WHERE g.minute >= 80 AND g.is_own_goal = 0) SELECT DISTINCT l1.match_id FROM LateGoals l1 JOIN LateGoals l2 ON l1.match_id = l2.match_id AND l1.team_id != l2.team_id;", 
    "WITH LateGoals AS (SELECT g.match_id, p.team_id FROM goals g JOIN players p ON g.player_id = p.player_id WHERE g.minute >= 80 AND g.is_own_goal = 0) SELECT DISTINCT l1.match_id FROM LateGoals l1 JOIN LateGoals l2 ON l1.match_id = l2.match_id AND l1.team_id != l2.team_id;"),

  make(55, 'sports', 'hard', ['topic:CTEs', 'Data Analysis', 'company:ESPN'], 
    "Calculate the 'Golden Boot Winner'. For season 3, find the player with the most goals. Return player name, goals, and their team name.", 
    "Join goals, matches, players, teams.", "Count goals, rank/order desc limit 1.", 
    "SELECT p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as goals, t.name as team_name FROM players p JOIN teams t ON p.team_id = t.team_id JOIN goals g ON p.player_id = g.player_id JOIN matches m ON g.match_id = m.match_id WHERE m.season_id = 3 AND g.is_own_goal = 0 GROUP BY p.player_id ORDER BY goals DESC LIMIT 1;", 
    "SELECT p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as goals, t.name as team_name FROM players p JOIN teams t ON p.team_id = t.team_id JOIN goals g ON p.player_id = g.player_id JOIN matches m ON g.match_id = m.match_id WHERE m.season_id = 3 AND g.is_own_goal = 0 GROUP BY p.player_id ORDER BY goals DESC LIMIT 1;"),

  make(56, 'sports', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:SkySports'], 
    "For the 2023-24 season (season_id=3), find matches where the home team scored FEWER goals than they did in their previous home match. Return match_date, home_team name, and current home_score.", 
    "Use LAG() OVER(PARTITION BY home_team_id ORDER BY match_date).", "Filter.", 
    "WITH HomeForm AS (SELECT m.match_date, t.name as home_team, m.home_score, LAG(m.home_score) OVER(PARTITION BY m.home_team_id ORDER BY m.match_date) as prev_score FROM matches m JOIN teams t ON m.home_team_id = t.team_id WHERE m.season_id = 3) SELECT match_date, home_team, home_score FROM HomeForm WHERE home_score < prev_score;", 
    "WITH HomeForm AS (SELECT m.match_date, t.name as home_team, m.home_score, LAG(m.home_score) OVER(PARTITION BY m.home_team_id ORDER BY m.match_date) as prev_score FROM matches m JOIN teams t ON m.home_team_id = t.team_id WHERE m.season_id = 3) SELECT match_date, home_team, home_score FROM HomeForm WHERE home_score < prev_score;"),

  make(57, 'sports', 'hard', ['topic:CTEs', 'Null Handling', 'company:Opta'], 
    "Identify 'Boring Teams'. Teams that have played matches but have NEVER had a single goal scored in ANY of their matches (0-0 for every match they are in). Return team name.", 
    "Sum total goals for matches involving the team.", "Check if sum is 0.", 
    "WITH TeamMatches AS (SELECT team_id, name FROM teams WHERE team_id IN (SELECT home_team_id FROM matches UNION SELECT away_team_id FROM matches)) SELECT tm.name FROM TeamMatches tm LEFT JOIN matches m ON tm.team_id = m.home_team_id OR tm.team_id = m.away_team_id GROUP BY tm.team_id HAVING SUM(m.home_score + m.away_score) = 0;", 
    "WITH TeamMatches AS (SELECT team_id, name FROM teams WHERE team_id IN (SELECT home_team_id FROM matches UNION SELECT away_team_id FROM matches)) SELECT tm.name FROM TeamMatches tm LEFT JOIN matches m ON tm.team_id = m.home_team_id OR tm.team_id = m.away_team_id GROUP BY tm.team_id HAVING SUM(m.home_score + m.away_score) = 0;"),

  make(58, 'sports', 'hard', ['topic:Window Functions', 'Rank', 'company:BBCSport'], 
    "Who is the top scoring player for each nationality? Return nationality, player name, goal_count, and rank (must be 1).", 
    "Join players, goals.", "ROW_NUMBER() OVER(PARTITION BY nationality ORDER BY count DESC).", 
    "WITH NatScorers AS (SELECT p.nationality, p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as goal_count, ROW_NUMBER() OVER(PARTITION BY p.nationality ORDER BY COUNT(g.goal_id) DESC) as rn FROM players p JOIN goals g ON p.player_id = g.player_id WHERE g.is_own_goal = 0 GROUP BY p.player_id) SELECT nationality, name, goal_count FROM NatScorers WHERE rn = 1;", 
    "WITH NatScorers AS (SELECT p.nationality, p.first_name || ' ' || p.last_name as name, COUNT(g.goal_id) as goal_count, ROW_NUMBER() OVER(PARTITION BY p.nationality ORDER BY COUNT(g.goal_id) DESC) as rn FROM players p JOIN goals g ON p.player_id = g.player_id WHERE g.is_own_goal = 0 GROUP BY p.player_id) SELECT nationality, name, goal_count FROM NatScorers WHERE rn = 1;"),

  make(59, 'sports', 'hard', ['topic:Math', 'Data Analysis', 'company:TheAthletic'], 
    "Calculate the 'Home Advantage'. What percentage of all matches were won by the Home team? Return as home_win_percentage rounded to 2 decimals.", 
    "Count home wins / total matches.", "Cast to REAL.", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM matches WHERE home_score > away_score) AS REAL) * 100.0 / (SELECT COUNT(*) FROM matches), 2) AS home_win_percentage;", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM matches WHERE home_score > away_score) AS REAL) * 100.0 / (SELECT COUNT(*) FROM matches), 2) AS home_win_percentage;"),

  make(60, 'sports', 'hard', ['topic:CTEs', 'Data Analysis', 'company:DAZN'], 
    "Identify 'Comeback Wins'. A match where a team conceded an own goal, but their team STILL WON the match. Return match_id and the winning team's name.", 
    "Find matches with own goals.", "Find the winner of that match.", "Check if the own-goal scorer's team matches the winner.", 
    "WITH MatchWinners AS (SELECT match_id, CASE WHEN home_score > away_score THEN home_team_id WHEN away_score > home_score THEN away_team_id ELSE NULL END as winner_id FROM matches), OwnGoals AS (SELECT g.match_id, p.team_id as conceding_team FROM goals g JOIN players p ON g.player_id = p.player_id WHERE g.is_own_goal = 1) SELECT DISTINCT o.match_id, t.name as winning_team FROM OwnGoals o JOIN MatchWinners m ON o.match_id = m.match_id JOIN teams t ON m.winner_id = t.team_id WHERE o.conceding_team = m.winner_id;", 
    "WITH MatchWinners AS (SELECT match_id, CASE WHEN home_score > away_score THEN home_team_id WHEN away_score > home_score THEN away_team_id ELSE NULL END as winner_id FROM matches), OwnGoals AS (SELECT g.match_id, p.team_id as conceding_team FROM goals g JOIN players p ON g.player_id = p.player_id WHERE g.is_own_goal = 1) SELECT DISTINCT o.match_id, t.name as winning_team FROM OwnGoals o JOIN MatchWinners m ON o.match_id = m.match_id JOIN teams t ON m.winner_id = t.team_id WHERE o.conceding_team = m.winner_id;")
];
