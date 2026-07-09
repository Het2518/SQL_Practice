import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.join(__dirname, '../src/data/questions/music.jsx');

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

// MUSIC QUESTIONS (IDs 1-60)
export const musicQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================

  make(1, 'music', 'easy', ['topic:Basic SQL', 'Where', 'company:Spotify'], 
    "Find all artists from the 'UK'. Return their name and formed_year.", 
    "Filter the artists table.", "Use WHERE country = 'UK'.", 
    "SELECT name, formed_year FROM artists WHERE country = 'UK';", 
    "SELECT name, formed_year FROM artists WHERE country = 'UK';"),

  make(2, 'music', 'easy', ['topic:String Functions', 'Basic SQL', 'company:AppleMusic'], 
    "Format the track titles for display. Return a single column 'track_info' with the format 'Title - BPM bpm'.", 
    "Concatenate title, ' - ', bpm, and ' bpm'.", "Use the || operator.", 
    "SELECT title || ' - ' || bpm || ' bpm' AS track_info FROM tracks;", 
    "SELECT title || ' - ' || bpm || ' bpm' AS track_info FROM tracks;"),

  make(3, 'music', 'easy', ['topic:Math', 'Aggregate Functions', 'company:SoundCloud'], 
    "Calculate the total listening time (in seconds) recorded in the database. Return as 'total_listening_time'.", 
    "Use SUM() on the play_duration_secs column.", "Query the plays table.", 
    "SELECT SUM(play_duration_secs) AS total_listening_time FROM plays;", 
    "SELECT SUM(play_duration_secs) AS total_listening_time FROM plays;"),

  make(4, 'music', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:Tidal'], 
    "Identify users who did NOT provide a country (country IS NULL). Return username and email.", 
    "Check if country is NULL.", "Use WHERE country IS NULL.", 
    "SELECT username, email FROM users WHERE country IS NULL;", 
    "SELECT username, email FROM users WHERE country IS NULL;"),

  make(5, 'music', 'easy', ['topic:Data Analysis', 'Group By', 'company:Pandora'], 
    "Count how many albums we have for each genre. Return genre and the count of albums.", 
    "Group by genre in the albums table.", "Use COUNT(*).", 
    "SELECT genre, COUNT(*) AS album_count FROM albums GROUP BY genre;", 
    "SELECT genre, COUNT(*) AS album_count FROM albums GROUP BY genre;"),

  make(6, 'music', 'easy', ['topic:Basic SQL', 'Where', 'company:AmazonMusic'], 
    "Find all tracks with a BPM strictly greater than 120. Return title and bpm.", 
    "Filter bpm using > 120.", "WHERE bpm > 120.", 
    "SELECT title, bpm FROM tracks WHERE bpm > 120;", 
    "SELECT title, bpm FROM tracks WHERE bpm > 120;"),

  make(7, 'music', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Spotify'], 
    "What is the longest track duration (in seconds) in the database? Return as 'max_duration'.", 
    "Use MAX(duration_secs).", "Query the tracks table.", 
    "SELECT MAX(duration_secs) AS max_duration FROM tracks;", 
    "SELECT MAX(duration_secs) AS max_duration FROM tracks;"),

  make(8, 'music', 'easy', ['topic:Basic SQL', 'Limit', 'company:AppleMusic'], 
    "List the 5 most recently formed artists. Return name and formed_year.", 
    "Sort by formed_year descending.", "Limit to 5.", 
    "SELECT name, formed_year FROM artists ORDER BY formed_year DESC LIMIT 5;", 
    "SELECT name, formed_year FROM artists ORDER BY formed_year DESC LIMIT 5;"),

  make(9, 'music', 'easy', ['topic:Basic SQL', 'In', 'company:SoundCloud'], 
    "Find all users from the 'USA' or 'Canada'. Return username, email, and country.", 
    "Use the IN operator on the country column.", "WHERE country IN ('USA', 'Canada').", 
    "SELECT username, email, country FROM users WHERE country IN ('USA', 'Canada');", 
    "SELECT username, email, country FROM users WHERE country IN ('USA', 'Canada');"),

  make(10, 'music', 'easy', ['topic:String Functions', 'Basic SQL', 'company:Tidal'], 
    "Find all playlists where the name starts with 'Chill'. Return playlist_id and name.", 
    "Use LIKE 'Chill%'.", "Filter on the name column.", 
    "SELECT playlist_id, name FROM playlists WHERE name LIKE 'Chill%';", 
    "SELECT playlist_id, name FROM playlists WHERE name LIKE 'Chill%';"),

  make(11, 'music', 'easy', ['topic:Data Analysis', 'Group By', 'company:Pandora'], 
    "How many tracks are on each album? Return album_id and the track_count.", 
    "Use COUNT(*).", "Group by album_id in the tracks table.", 
    "SELECT album_id, COUNT(*) AS track_count FROM tracks GROUP BY album_id;", 
    "SELECT album_id, COUNT(*) AS track_count FROM tracks GROUP BY album_id;"),

  make(12, 'music', 'easy', ['topic:Date Functions', 'String Functions', 'company:AmazonMusic'], 
    "Extract the year from the joined_at date for all users. Return user_id and joined_year.", 
    "Use substr() or strftime('%Y', joined_at).", "Query the users table.", 
    "SELECT user_id, strftime('%Y', joined_at) AS joined_year FROM users;", 
    "SELECT user_id, strftime('%Y', joined_at) AS joined_year FROM users;"),

  make(13, 'music', 'easy', ['topic:Basic SQL', 'Where', 'company:Spotify'], 
    "Find all playlists that are NOT public (is_public = 0). Return name and created_at.", 
    "Filter by is_public = 0.", "Check the playlists table.", 
    "SELECT name, created_at FROM playlists WHERE is_public = 0;", 
    "SELECT name, created_at FROM playlists WHERE is_public = 0;"),

  make(14, 'music', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:AppleMusic'], 
    "How many distinct countries are represented in the users table? Return the count as 'unique_countries'.", 
    "Use COUNT(DISTINCT country).", "Query the users table.", 
    "SELECT COUNT(DISTINCT country) AS unique_countries FROM users;", 
    "SELECT COUNT(DISTINCT country) AS unique_countries FROM users;"),

  make(15, 'music', 'easy', ['topic:Basic SQL', 'Math', 'company:SoundCloud'], 
    "List all plays where the play_duration was less than 30 seconds (skip rate). Return play_id and track_id.", 
    "Filter for play_duration_secs < 30.", "Look at the plays table.", 
    "SELECT play_id, track_id FROM plays WHERE play_duration_secs < 30;", 
    "SELECT play_id, track_id FROM plays WHERE play_duration_secs < 30;"),

  make(16, 'music', 'easy', ['topic:Data Cleaning', 'Like', 'company:Tidal'], 
    "Find all artists that have 'Pop' anywhere in their genre description. Return artist_id and name.", 
    "Use LIKE '%Pop%'.", "Query the artists table.", 
    "SELECT artist_id, name FROM artists WHERE genre LIKE '%Pop%';", 
    "SELECT artist_id, name FROM artists WHERE genre LIKE '%Pop%';"),

  make(17, 'music', 'easy', ['topic:Basic SQL', 'Where', 'company:Pandora'], 
    "Find all tracks that are track number 1 on their respective albums. Return title and album_id.", 
    "Check if track_number = 1.", "Query the tracks table.", 
    "SELECT title, album_id FROM tracks WHERE track_number = 1;", 
    "SELECT title, album_id FROM tracks WHERE track_number = 1;"),

  make(18, 'music', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:AmazonMusic'], 
    "Count the number of artists from each country. Return country and artist_count.", 
    "Group by country in the artists table.", "Use COUNT(*).", 
    "SELECT country, COUNT(*) AS artist_count FROM artists GROUP BY country;", 
    "SELECT country, COUNT(*) AS artist_count FROM artists GROUP BY country;"),

  make(19, 'music', 'easy', ['topic:Basic SQL', 'Order By', 'company:Spotify'], 
    "Find the 3 longest tracks based on duration_secs. Return title and duration_secs.", 
    "Order by duration_secs DESC.", "Limit to 3.", 
    "SELECT title, duration_secs FROM tracks ORDER BY duration_secs DESC LIMIT 3;", 
    "SELECT title, duration_secs FROM tracks ORDER BY duration_secs DESC LIMIT 3;"),

  make(20, 'music', 'easy', ['topic:Basic SQL', 'Math', 'company:AppleMusic'], 
    "Find the average duration of all tracks in the database. Return as 'avg_duration_secs' rounded to 0 decimals.", 
    "Use AVG() and ROUND().", "Query tracks.", 
    "SELECT ROUND(AVG(duration_secs), 0) AS avg_duration_secs FROM tracks;", 
    "SELECT ROUND(AVG(duration_secs), 0) AS avg_duration_secs FROM tracks;"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(21, 'music', 'medium', ['topic:Joins', 'Data Analysis', 'company:SoundCloud'], 
    "List all albums and the name of the artist who created them. Return album title and artist name.", 
    "Join albums and artists.", "Select the correct columns.", 
    "SELECT al.title, a.name FROM albums al JOIN artists a ON al.artist_id = a.artist_id;", 
    "SELECT al.title, a.name FROM albums al JOIN artists a ON al.artist_id = a.artist_id;"),

  make(22, 'music', 'medium', ['topic:Joins', 'Math', 'company:Tidal'], 
    "How many plays did each user generate? Return the username and the play_count.", 
    "Join plays and users.", "Group by username and count.", 
    "SELECT u.username, COUNT(p.play_id) AS play_count FROM users u LEFT JOIN plays p ON u.user_id = p.user_id GROUP BY u.username;", 
    "SELECT u.username, COUNT(p.play_id) AS play_count FROM users u LEFT JOIN plays p ON u.user_id = p.user_id GROUP BY u.username;"),

  make(23, 'music', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:Pandora'], 
    "Find all tracks from the album 'OK Computer'. Return track_id and title.", 
    "Join tracks and albums.", "Filter for title = 'OK Computer'.", 
    "SELECT t.track_id, t.title FROM tracks t JOIN albums a ON t.album_id = a.album_id WHERE a.title = 'OK Computer';", 
    "SELECT t.track_id, t.title FROM tracks t JOIN albums a ON t.album_id = a.album_id WHERE a.title = 'OK Computer';"),

  make(24, 'music', 'medium', ['topic:Joins', 'Group By', 'company:AmazonMusic'], 
    "Which track has been played the most times? Return track title and the play_count.", 
    "Join tracks and plays.", "Group by track_id, sort desc, limit 1.", 
    "SELECT t.title, COUNT(p.play_id) AS play_count FROM tracks t JOIN plays p ON t.track_id = p.track_id GROUP BY t.track_id ORDER BY play_count DESC LIMIT 1;", 
    "SELECT t.title, COUNT(p.play_id) AS play_count FROM tracks t JOIN plays p ON t.track_id = p.track_id GROUP BY t.track_id ORDER BY play_count DESC LIMIT 1;"),

  make(25, 'music', 'medium', ['topic:Case Statements', 'Math', 'company:Spotify'], 
    "Categorize tracks based on duration: 'Short' (< 180 secs), 'Medium' (180-300 secs), 'Long' (> 300 secs). Return category and count.", 
    "Use a CASE statement on duration_secs.", "Group by the CASE statement.", 
    "SELECT CASE WHEN duration_secs < 180 THEN 'Short' WHEN duration_secs <= 300 THEN 'Medium' ELSE 'Long' END AS length_category, COUNT(*) AS track_count FROM tracks GROUP BY length_category;", 
    "SELECT CASE WHEN duration_secs < 180 THEN 'Short' WHEN duration_secs <= 300 THEN 'Medium' ELSE 'Long' END AS length_category, COUNT(*) AS track_count FROM tracks GROUP BY length_category;"),

  make(26, 'music', 'medium', ['topic:Joins', 'Having', 'company:AppleMusic'], 
    "Find artists who have released more than 1 album. Return artist name and album_count.", 
    "Join artists and albums.", "Group by artist_id and use HAVING count > 1.", 
    "SELECT a.name, COUNT(al.album_id) AS album_count FROM artists a JOIN albums al ON a.artist_id = al.artist_id GROUP BY a.artist_id HAVING COUNT(al.album_id) > 1;", 
    "SELECT a.name, COUNT(al.album_id) AS album_count FROM artists a JOIN albums al ON a.artist_id = al.artist_id GROUP BY a.artist_id HAVING COUNT(al.album_id) > 1;"),

  make(27, 'music', 'medium', ['topic:Subqueries', 'Null Handling', 'company:SoundCloud'], 
    "Identify tracks that have NEVER been added to any playlist. Return their track_id and title.", 
    "Use a subquery for track_id NOT IN (playlist_tracks).", "Or use a LEFT JOIN.", 
    "SELECT track_id, title FROM tracks WHERE track_id NOT IN (SELECT track_id FROM playlist_tracks);", 
    "SELECT track_id, title FROM tracks WHERE track_id NOT IN (SELECT track_id FROM playlist_tracks);"),

  make(28, 'music', 'medium', ['topic:Math', 'Data Analysis', 'company:Tidal'], 
    "Calculate the 'Completion Rate' for each play. (play_duration_secs / actual track duration_secs) * 100. Return play_id and completion_percentage rounded to 2 decimals.", 
    "Join plays and tracks.", "Divide play_duration by track duration.", 
    "SELECT p.play_id, ROUND((CAST(p.play_duration_secs AS REAL) / t.duration_secs) * 100.0, 2) AS completion_percentage FROM plays p JOIN tracks t ON p.track_id = t.track_id;", 
    "SELECT p.play_id, ROUND((CAST(p.play_duration_secs AS REAL) / t.duration_secs) * 100.0, 2) AS completion_percentage FROM plays p JOIN tracks t ON p.track_id = t.track_id;"),

  make(29, 'music', 'medium', ['topic:Joins', 'Null Handling', 'company:Pandora'], 
    "List all users who currently have NO plays recorded. Return user_id and username.", 
    "Left join users to plays.", "Filter where play_id IS NULL.", 
    "SELECT u.user_id, u.username FROM users u LEFT JOIN plays p ON u.user_id = p.user_id WHERE p.play_id IS NULL;", 
    "SELECT u.user_id, u.username FROM users u LEFT JOIN plays p ON u.user_id = p.user_id WHERE p.play_id IS NULL;"),

  make(30, 'music', 'medium', ['topic:Joins', 'Data Analysis', 'company:AmazonMusic'], 
    "Which artist has the most tracks in the database? Return artist name and track_count.", 
    "Join artists, albums, tracks.", "Group by artist, order desc, limit 1.", 
    "SELECT a.name, COUNT(t.track_id) AS track_count FROM artists a JOIN albums al ON a.artist_id = al.artist_id JOIN tracks t ON al.album_id = t.album_id GROUP BY a.artist_id ORDER BY track_count DESC LIMIT 1;", 
    "SELECT a.name, COUNT(t.track_id) AS track_count FROM artists a JOIN albums al ON a.artist_id = al.artist_id JOIN tracks t ON al.album_id = t.album_id GROUP BY a.artist_id ORDER BY track_count DESC LIMIT 1;"),

  make(31, 'music', 'medium', ['topic:Subqueries', 'Math', 'company:Spotify'], 
    "Find tracks with a BPM strictly higher than the average BPM of all tracks. Return title and bpm.", 
    "Use a subquery to get AVG(bpm).", "Compare bpm to it.", 
    "SELECT title, bpm FROM tracks WHERE bpm > (SELECT AVG(bpm) FROM tracks);", 
    "SELECT title, bpm FROM tracks WHERE bpm > (SELECT AVG(bpm) FROM tracks);"),

  make(32, 'music', 'medium', ['topic:Joins', 'Group By', 'company:AppleMusic'], 
    "Find the total listening time (in seconds) for the artist 'Taylor Swift'. Return total_seconds.", 
    "Join artists, albums, tracks, plays.", "Filter for Taylor Swift, sum play_duration.", 
    "SELECT SUM(p.play_duration_secs) AS total_seconds FROM artists a JOIN albums al ON a.artist_id = al.artist_id JOIN tracks t ON al.album_id = t.album_id JOIN plays p ON t.track_id = p.track_id WHERE a.name = 'Taylor Swift';", 
    "SELECT SUM(p.play_duration_secs) AS total_seconds FROM artists a JOIN albums al ON a.artist_id = al.artist_id JOIN tracks t ON al.album_id = t.album_id JOIN plays p ON t.track_id = p.track_id WHERE a.name = 'Taylor Swift';"),

  make(33, 'music', 'medium', ['topic:Joins', 'Date Functions', 'company:SoundCloud'], 
    "Find all plays that occurred within the first 30 days of the user joining. Return username, played_at, and joined_at.", 
    "Join users and plays.", "Check if julianday(played_at) - julianday(joined_at) <= 30.", 
    "SELECT u.username, p.played_at, u.joined_at FROM users u JOIN plays p ON u.user_id = p.user_id WHERE (julianday(p.played_at) - julianday(u.joined_at)) <= 30;", 
    "SELECT u.username, p.played_at, u.joined_at FROM users u JOIN plays p ON u.user_id = p.user_id WHERE (julianday(p.played_at) - julianday(u.joined_at)) <= 30;"),

  make(34, 'music', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:Tidal'], 
    "Create an 'Engagement' column for playlists based on track count: 'Empty' (0 tracks), 'Small' (1-3 tracks), 'Large' (>3 tracks). Return playlist name and engagement.", 
    "Count tracks per playlist.", "Use CASE statement.", 
    "SELECT p.name, CASE WHEN COUNT(pt.track_id) = 0 THEN 'Empty' WHEN COUNT(pt.track_id) <= 3 THEN 'Small' ELSE 'Large' END AS engagement FROM playlists p LEFT JOIN playlist_tracks pt ON p.playlist_id = pt.playlist_id GROUP BY p.playlist_id;", 
    "SELECT p.name, CASE WHEN COUNT(pt.track_id) = 0 THEN 'Empty' WHEN COUNT(pt.track_id) <= 3 THEN 'Small' ELSE 'Large' END AS engagement FROM playlists p LEFT JOIN playlist_tracks pt ON p.playlist_id = pt.playlist_id GROUP BY p.playlist_id;"),

  make(35, 'music', 'medium', ['topic:CTEs', 'Data Analysis', 'company:Pandora'], 
    "Use a CTE to calculate the total duration (in seconds) of each album. Then find the album with the maximum total duration. Return album title and total_duration.", 
    "CTE sums duration_secs by album.", "Main query finds MAX.", 
    "WITH AlbumLengths AS (SELECT a.title, SUM(t.duration_secs) as total_duration FROM albums a JOIN tracks t ON a.album_id = t.album_id GROUP BY a.album_id) SELECT title, total_duration FROM AlbumLengths WHERE total_duration = (SELECT MAX(total_duration) FROM AlbumLengths);", 
    "WITH AlbumLengths AS (SELECT a.title, SUM(t.duration_secs) as total_duration FROM albums a JOIN tracks t ON a.album_id = t.album_id GROUP BY a.album_id) SELECT title, total_duration FROM AlbumLengths WHERE total_duration = (SELECT MAX(total_duration) FROM AlbumLengths);"),

  make(36, 'music', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:AmazonMusic'], 
    "Find users who have played BOTH a 'Rock' song AND a 'Hip-Hop' song. Return user_id.", 
    "Use INTERSECT.", "Query users, plays, tracks, albums.", 
    "SELECT p.user_id FROM plays p JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id WHERE a.genre = 'Rock' INTERSECT SELECT p.user_id FROM plays p JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id WHERE a.genre = 'Hip-Hop';", 
    "SELECT p.user_id FROM plays p JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id WHERE a.genre = 'Rock' INTERSECT SELECT p.user_id FROM plays p JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id WHERE a.genre = 'Hip-Hop';"),

  make(37, 'music', 'medium', ['topic:Joins', 'Self Join', 'company:Spotify'], 
    "Find pairs of users who joined on the exact same date. Return username1, username2, and joined_at. Ensure unique pairs (u1.user_id < u2.user_id).", 
    "Self join users on joined_at.", "Use u1.user_id < u2.user_id.", 
    "SELECT u1.username AS username1, u2.username AS username2, u1.joined_at FROM users u1 JOIN users u2 ON u1.joined_at = u2.joined_at AND u1.user_id < u2.user_id;", 
    "SELECT u1.username AS username1, u2.username AS username2, u1.joined_at FROM users u1 JOIN users u2 ON u1.joined_at = u2.joined_at AND u1.user_id < u2.user_id;"),

  make(38, 'music', 'medium', ['topic:Joins', 'Group By', 'company:AppleMusic'], 
    "Which country's users have the highest average listening time per play? Return country and avg_play_duration.", 
    "Group by country in users.", "Join to plays. Order by avg desc, limit 1.", 
    "SELECT u.country, AVG(p.play_duration_secs) as avg_play_duration FROM users u JOIN plays p ON u.user_id = p.user_id GROUP BY u.country ORDER BY avg_play_duration DESC LIMIT 1;", 
    "SELECT u.country, AVG(p.play_duration_secs) as avg_play_duration FROM users u JOIN plays p ON u.user_id = p.user_id GROUP BY u.country ORDER BY avg_play_duration DESC LIMIT 1;"),

  make(39, 'music', 'medium', ['topic:Joins', 'Math', 'company:SoundCloud'], 
    "Find all playlists that contain tracks from more than one unique genre. Return playlist name and unique_genre_count.", 
    "Join playlists, playlist_tracks, tracks, albums.", "Count distinct album genre.", "HAVING count > 1.", 
    "SELECT p.name, COUNT(DISTINCT a.genre) AS unique_genre_count FROM playlists p JOIN playlist_tracks pt ON p.playlist_id = pt.playlist_id JOIN tracks t ON pt.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id GROUP BY p.playlist_id HAVING COUNT(DISTINCT a.genre) > 1;", 
    "SELECT p.name, COUNT(DISTINCT a.genre) AS unique_genre_count FROM playlists p JOIN playlist_tracks pt ON p.playlist_id = pt.playlist_id JOIN tracks t ON pt.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id GROUP BY p.playlist_id HAVING COUNT(DISTINCT a.genre) > 1;"),

  make(40, 'music', 'medium', ['topic:Math', 'Data Analysis', 'company:Tidal'], 
    "Calculate the overall 'Skip Rate' across the platform. (Number of plays < 30 seconds / Total number of plays) * 100. Return as skip_rate_percentage rounded to 2 decimals.", 
    "Count short plays / total plays.", "Cast to REAL.", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM plays WHERE play_duration_secs < 30) AS REAL) * 100.0 / (SELECT COUNT(*) FROM plays), 2) AS skip_rate_percentage;", 
    "SELECT ROUND(CAST((SELECT COUNT(*) FROM plays WHERE play_duration_secs < 30) AS REAL) * 100.0 / (SELECT COUNT(*) FROM plays), 2) AS skip_rate_percentage;"),

  make(41, 'music', 'medium', ['topic:Joins', 'Null Handling', 'company:Pandora'], 
    "Find any artists that do NOT have any albums recorded in the database. Return artist name.", 
    "Left join artists to albums.", "Check for NULL album_id.", 
    "SELECT a.name FROM artists a LEFT JOIN albums al ON a.artist_id = al.artist_id WHERE al.album_id IS NULL;", 
    "SELECT a.name FROM artists a LEFT JOIN albums al ON a.artist_id = al.artist_id WHERE al.album_id IS NULL;"),

  make(42, 'music', 'medium', ['topic:String Functions', 'Basic SQL', 'company:AmazonMusic'], 
    "Generate an artist profile summary: 'ArtistName (Country) - Formed Year'. Return artist_id and summary.", 
    "Use || operator.", "Query artists.", 
    "SELECT artist_id, name || ' (' || country || ') - Formed ' || formed_year AS summary FROM artists;", 
    "SELECT artist_id, name || ' (' || country || ') - Formed ' || formed_year AS summary FROM artists;"),

  make(43, 'music', 'medium', ['topic:Math', 'Data Analysis', 'company:Spotify'], 
    "Calculate the average track duration (in seconds) for each album. Return album title and avg_duration rounded to 1 decimal.", 
    "Group by album in tracks.", "Use AVG() and ROUND().", 
    "SELECT a.title, ROUND(AVG(t.duration_secs), 1) AS avg_duration FROM albums a JOIN tracks t ON a.album_id = t.album_id GROUP BY a.album_id;", 
    "SELECT a.title, ROUND(AVG(t.duration_secs), 1) AS avg_duration FROM albums a JOIN tracks t ON a.album_id = t.album_id GROUP BY a.album_id;"),

  make(44, 'music', 'medium', ['topic:Group By', 'Having', 'company:AppleMusic'], 
    "Identify users who have created more than 1 public playlist (is_public = 1). Return username and public_playlist_count.", 
    "Group by user_id in playlists.", "Use HAVING count > 1.", 
    "SELECT u.username, COUNT(p.playlist_id) AS public_playlist_count FROM users u JOIN playlists p ON u.user_id = p.user_id WHERE p.is_public = 1 GROUP BY u.user_id HAVING COUNT(p.playlist_id) > 1;", 
    "SELECT u.username, COUNT(p.playlist_id) AS public_playlist_count FROM users u JOIN playlists p ON u.user_id = p.user_id WHERE p.is_public = 1 GROUP BY u.user_id HAVING COUNT(p.playlist_id) > 1;"),

  make(45, 'music', 'medium', ['topic:Joins', 'Data Analysis', 'company:SoundCloud'], 
    "List the most common genre listened to by user 'music_fan1'. Return genre and play_count.", 
    "Join users, plays, tracks, albums.", "Filter for user, group by genre, sort desc, limit 1.", 
    "SELECT a.genre, COUNT(p.play_id) as play_count FROM users u JOIN plays p ON u.user_id = p.user_id JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id WHERE u.username = 'music_fan1' GROUP BY a.genre ORDER BY play_count DESC LIMIT 1;", 
    "SELECT a.genre, COUNT(p.play_id) as play_count FROM users u JOIN plays p ON u.user_id = p.user_id JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id WHERE u.username = 'music_fan1' GROUP BY a.genre ORDER BY play_count DESC LIMIT 1;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(46, 'music', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:Tidal'], 
    "Analyze listening habits. For user_id 1, calculate the time gap (in minutes) between consecutive plays. Return played_at, and mins_since_last_play.", 
    "Use LAG(played_at) OVER(ORDER BY played_at).", "Calculate difference in minutes.", 
    "WITH UserPlays AS (SELECT played_at, LAG(played_at) OVER(ORDER BY played_at) as prev_play FROM plays WHERE user_id = 1) SELECT played_at, ROUND((julianday(played_at) - julianday(prev_play)) * 24 * 60) as mins_since_last_play FROM UserPlays WHERE prev_play IS NOT NULL;", 
    "WITH UserPlays AS (SELECT played_at, LAG(played_at) OVER(ORDER BY played_at) as prev_play FROM plays WHERE user_id = 1) SELECT played_at, ROUND((julianday(played_at) - julianday(prev_play)) * 24 * 60) as mins_since_last_play FROM UserPlays WHERE prev_play IS NOT NULL;"),

  make(47, 'music', 'hard', ['topic:Window Functions', 'Rank', 'company:Pandora'], 
    "Rank the tracks within each album by their BPM (highest to lowest). Return album title, track title, bpm, and rank.", 
    "Use DENSE_RANK() OVER(PARTITION BY album_id ORDER BY bpm DESC).", "Join tables.", 
    "WITH RankedTracks AS (SELECT a.title as album, t.title as track, t.bpm, DENSE_RANK() OVER(PARTITION BY a.album_id ORDER BY t.bpm DESC) as rank FROM albums a JOIN tracks t ON a.album_id = t.album_id) SELECT album, track, bpm, rank FROM RankedTracks;", 
    "WITH RankedTracks AS (SELECT a.title as album, t.title as track, t.bpm, DENSE_RANK() OVER(PARTITION BY a.album_id ORDER BY t.bpm DESC) as rank FROM albums a JOIN tracks t ON a.album_id = t.album_id) SELECT album, track, bpm, rank FROM RankedTracks;"),

  make(48, 'music', 'hard', ['topic:CTEs', 'Window Functions', 'company:AmazonMusic'], 
    "Calculate the cumulative total plays for the track 'Anti-Hero' over time (ordered by played_at). Return played_at and running_total_plays.", 
    "Count plays per time.", "Use COUNT() OVER(ORDER BY played_at ROWS UNBOUNDED PRECEDING).", 
    "WITH TrackPlays AS (SELECT p.played_at FROM plays p JOIN tracks t ON p.track_id = t.track_id WHERE t.title = 'Anti-Hero') SELECT played_at, COUNT(*) OVER(ORDER BY played_at ROWS UNBOUNDED PRECEDING) as running_total_plays FROM TrackPlays;", 
    "WITH TrackPlays AS (SELECT p.played_at FROM plays p JOIN tracks t ON p.track_id = t.track_id WHERE t.title = 'Anti-Hero') SELECT played_at, COUNT(*) OVER(ORDER BY played_at ROWS UNBOUNDED PRECEDING) as running_total_plays FROM TrackPlays;"),

  make(49, 'music', 'hard', ['topic:Window Functions', 'Partition By', 'company:Spotify'], 
    "Identify 'Long Tracks'. Find tracks whose duration is greater than the average duration of ALL tracks on the SAME album. Return album title, track title, duration_secs, and album_avg_duration.", 
    "Calculate AVG(duration_secs) OVER(PARTITION BY album_id).", "Filter.", 
    "WITH AlbumAvg AS (SELECT a.title as album, t.title as track, t.duration_secs, AVG(t.duration_secs) OVER(PARTITION BY a.album_id) as a_avg FROM albums a JOIN tracks t ON a.album_id = t.album_id) SELECT album, track, duration_secs, ROUND(a_avg, 1) as album_avg_duration FROM AlbumAvg WHERE duration_secs > a_avg;", 
    "WITH AlbumAvg AS (SELECT a.title as album, t.title as track, t.duration_secs, AVG(t.duration_secs) OVER(PARTITION BY a.album_id) as a_avg FROM albums a JOIN tracks t ON a.album_id = t.album_id) SELECT album, track, duration_secs, ROUND(a_avg, 1) as album_avg_duration FROM AlbumAvg WHERE duration_secs > a_avg;"),

  make(50, 'music', 'hard', ['topic:CTEs', 'Self Join', 'company:AppleMusic'], 
    "Detect 'Repeat Listeners'. Find users who played the EXACT SAME track multiple times on the SAME calendar day. Return user_id, track_id, and the play date.", 
    "Join plays to itself.", "Check same user, track, and date(played_at), but different play_id.", 
    "SELECT DISTINCT p1.user_id, p1.track_id, date(p1.played_at) as play_date FROM plays p1 JOIN plays p2 ON p1.user_id = p2.user_id AND p1.track_id = p2.track_id AND date(p1.played_at) = date(p2.played_at) AND p1.play_id != p2.play_id;", 
    "SELECT DISTINCT p1.user_id, p1.track_id, date(p1.played_at) as play_date FROM plays p1 JOIN plays p2 ON p1.user_id = p2.user_id AND p1.track_id = p2.track_id AND date(p1.played_at) = date(p2.played_at) AND p1.play_id != p2.play_id;"),

  make(51, 'music', 'hard', ['topic:Window Functions', 'Math', 'company:SoundCloud'], 
    "Calculate the percentage of total listening time generated by each country. Return country and percentage rounded to 2 decimals.", 
    "Sum listening time per country.", "Divide by SUM(listening_time) OVER().", 
    "WITH CountryTime AS (SELECT u.country, SUM(p.play_duration_secs) as total_time FROM users u JOIN plays p ON u.user_id = p.user_id GROUP BY u.country) SELECT country, ROUND(total_time * 100.0 / NULLIF(SUM(total_time) OVER(), 0), 2) as time_percentage FROM CountryTime;", 
    "WITH CountryTime AS (SELECT u.country, SUM(p.play_duration_secs) as total_time FROM users u JOIN plays p ON u.user_id = p.user_id GROUP BY u.country) SELECT country, ROUND(total_time * 100.0 / NULLIF(SUM(total_time) OVER(), 0), 2) as time_percentage FROM CountryTime;"),

  make(52, 'music', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Tidal'], 
    "Identify 'Eclectic Users'. Users who have listened to tracks from 4 OR MORE different genres. Return username and distinct_genre_count.", 
    "Count distinct genre per user.", "Use CTEs and filter.", 
    "WITH UserGenres AS (SELECT u.username, COUNT(DISTINCT a.genre) as genre_count FROM users u JOIN plays p ON u.user_id = p.user_id JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id GROUP BY u.user_id) SELECT username, genre_count FROM UserGenres WHERE genre_count >= 4;", 
    "WITH UserGenres AS (SELECT u.username, COUNT(DISTINCT a.genre) as genre_count FROM users u JOIN plays p ON u.user_id = p.user_id JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id GROUP BY u.user_id) SELECT username, genre_count FROM UserGenres WHERE genre_count >= 4;"),

  make(53, 'music', 'hard', ['topic:Window Functions', 'Ntile', 'company:Pandora'], 
    "Create a 'Track Popularity Tier'. Divide all tracks into 3 tiers based on total plays (1 being most played). Return track title, total_plays, and tier.", 
    "Use NTILE(3) OVER(ORDER BY total_plays DESC).", "Count plays per track.", 
    "WITH TrackPlays AS (SELECT t.title, COUNT(p.play_id) as total_plays FROM tracks t LEFT JOIN plays p ON t.track_id = p.track_id GROUP BY t.track_id) SELECT title, total_plays, NTILE(3) OVER(ORDER BY total_plays DESC) as tier FROM TrackPlays;", 
    "WITH TrackPlays AS (SELECT t.title, COUNT(p.play_id) as total_plays FROM tracks t LEFT JOIN plays p ON t.track_id = p.track_id GROUP BY t.track_id) SELECT title, total_plays, NTILE(3) OVER(ORDER BY total_plays DESC) as tier FROM TrackPlays;"),

  make(54, 'music', 'hard', ['topic:CTEs', 'Self Join', 'company:AmazonMusic'], 
    "Find 'Playlist Curators'. Users who have added the EXACT SAME track to multiple different playlists they own. Return username and track title.", 
    "Join playlist_tracks, playlists, users.", "Group by user and track, HAVING COUNT(distinct playlist_id) > 1.", 
    "SELECT u.username, t.title FROM users u JOIN playlists p ON u.user_id = p.user_id JOIN playlist_tracks pt ON p.playlist_id = pt.playlist_id JOIN tracks t ON pt.track_id = t.track_id GROUP BY u.user_id, t.track_id HAVING COUNT(DISTINCT p.playlist_id) > 1;", 
    "SELECT u.username, t.title FROM users u JOIN playlists p ON u.user_id = p.user_id JOIN playlist_tracks pt ON p.playlist_id = pt.playlist_id JOIN tracks t ON pt.track_id = t.track_id GROUP BY u.user_id, t.track_id HAVING COUNT(DISTINCT p.playlist_id) > 1;"),

  make(55, 'music', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Spotify'], 
    "Calculate 'Artist Dominance'. For the year 2024, what percentage of ALL plays were for the most played artist? Return artist name, total_artist_plays, total_platform_plays, and dominance_percentage.", 
    "Count total 2024 plays.", "Find MAX artist plays for 2024.", "Divide.", 
    "WITH ArtistPlays AS (SELECT ar.name, COUNT(p.play_id) as artist_total, SUM(COUNT(p.play_id)) OVER() as platform_total, ROW_NUMBER() OVER(ORDER BY COUNT(p.play_id) DESC) as rn FROM artists ar JOIN albums a ON ar.artist_id = a.artist_id JOIN tracks t ON a.album_id = t.album_id JOIN plays p ON t.track_id = p.track_id WHERE strftime('%Y', p.played_at) = '2024' GROUP BY ar.artist_id) SELECT name, artist_total, platform_total, ROUND((artist_total * 100.0) / platform_total, 2) as dominance_percentage FROM ArtistPlays WHERE rn = 1;", 
    "WITH ArtistPlays AS (SELECT ar.name, COUNT(p.play_id) as artist_total, SUM(COUNT(p.play_id)) OVER() as platform_total, ROW_NUMBER() OVER(ORDER BY COUNT(p.play_id) DESC) as rn FROM artists ar JOIN albums a ON ar.artist_id = a.artist_id JOIN tracks t ON a.album_id = t.album_id JOIN plays p ON t.track_id = p.track_id WHERE strftime('%Y', p.played_at) = '2024' GROUP BY ar.artist_id) SELECT name, artist_total, platform_total, ROUND((artist_total * 100.0) / platform_total, 2) as dominance_percentage FROM ArtistPlays WHERE rn = 1;"),

  make(56, 'music', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:AppleMusic'], 
    "For the user 'music_fan1', analyze their listening order. If they listened to a track, what was the NEXT track they listened to? Return played_at, current_track, and next_track.", 
    "Use LEAD() OVER(ORDER BY played_at).", "Filter for user.", 
    "WITH UserSequence AS (SELECT p.played_at, t.title as current_track, LEAD(t.title) OVER(ORDER BY p.played_at) as next_track FROM plays p JOIN tracks t ON p.track_id = t.track_id JOIN users u ON p.user_id = u.user_id WHERE u.username = 'music_fan1') SELECT played_at, current_track, next_track FROM UserSequence WHERE next_track IS NOT NULL;", 
    "WITH UserSequence AS (SELECT p.played_at, t.title as current_track, LEAD(t.title) OVER(ORDER BY p.played_at) as next_track FROM plays p JOIN tracks t ON p.track_id = t.track_id JOIN users u ON p.user_id = u.user_id WHERE u.username = 'music_fan1') SELECT played_at, current_track, next_track FROM UserSequence WHERE next_track IS NOT NULL;"),

  make(57, 'music', 'hard', ['topic:CTEs', 'Null Handling', 'company:SoundCloud'], 
    "Identify 'Dead Tracks'. Tracks that exist in the database but have absolutely NO plays recorded AND are not in ANY playlists. Return track title.", 
    "Left join tracks to plays and playlist_tracks.", "Check for NULLs in both.", 
    "SELECT t.title FROM tracks t LEFT JOIN plays p ON t.track_id = p.track_id LEFT JOIN playlist_tracks pt ON t.track_id = pt.track_id WHERE p.play_id IS NULL AND pt.id IS NULL;", 
    "SELECT t.title FROM tracks t LEFT JOIN plays p ON t.track_id = p.track_id LEFT JOIN playlist_tracks pt ON t.track_id = pt.track_id WHERE p.play_id IS NULL AND pt.id IS NULL;"),

  make(58, 'music', 'hard', ['topic:Window Functions', 'Rank', 'company:Tidal'], 
    "Who is the most popular artist in each country based on play counts? Return country, artist name, play_count, and rank (must be 1).", 
    "Join users, plays, tracks, albums, artists.", "ROW_NUMBER() OVER(PARTITION BY country ORDER BY count DESC).", 
    "WITH RankedArtists AS (SELECT u.country, ar.name as artist, COUNT(p.play_id) as play_count, ROW_NUMBER() OVER(PARTITION BY u.country ORDER BY COUNT(p.play_id) DESC) as rn FROM users u JOIN plays p ON u.user_id = p.user_id JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id JOIN artists ar ON a.artist_id = ar.artist_id GROUP BY u.country, ar.artist_id) SELECT country, artist, play_count FROM RankedArtists WHERE rn = 1;", 
    "WITH RankedArtists AS (SELECT u.country, ar.name as artist, COUNT(p.play_id) as play_count, ROW_NUMBER() OVER(PARTITION BY u.country ORDER BY COUNT(p.play_id) DESC) as rn FROM users u JOIN plays p ON u.user_id = p.user_id JOIN tracks t ON p.track_id = t.track_id JOIN albums a ON t.album_id = a.album_id JOIN artists ar ON a.artist_id = ar.artist_id GROUP BY u.country, ar.artist_id) SELECT country, artist, play_count FROM RankedArtists WHERE rn = 1;"),

  make(59, 'music', 'hard', ['topic:Math', 'Data Analysis', 'company:Pandora'], 
    "Calculate the 'Album Engagement Score' for each album. (Total plays of its tracks * Average completion rate of those plays). Return album title and score rounded to 2 decimals.", 
    "Calculate total plays.", "Calculate AVG(play_duration / track_duration).", "Multiply.", 
    "WITH AlbumStats AS (SELECT a.title, COUNT(p.play_id) as total_plays, AVG(CAST(p.play_duration_secs AS REAL) / t.duration_secs) as avg_completion FROM albums a JOIN tracks t ON a.album_id = t.album_id JOIN plays p ON t.track_id = p.track_id GROUP BY a.album_id) SELECT title, ROUND(total_plays * avg_completion, 2) as engagement_score FROM AlbumStats;", 
    "WITH AlbumStats AS (SELECT a.title, COUNT(p.play_id) as total_plays, AVG(CAST(p.play_duration_secs AS REAL) / t.duration_secs) as avg_completion FROM albums a JOIN tracks t ON a.album_id = t.album_id JOIN plays p ON t.track_id = p.track_id GROUP BY a.album_id) SELECT title, ROUND(total_plays * avg_completion, 2) as engagement_score FROM AlbumStats;"),

  make(60, 'music', 'hard', ['topic:CTEs', 'Data Analysis', 'company:AmazonMusic'], 
    "Identify 'Crossover Tracks'. Tracks that have been added to BOTH a 'public' playlist (is_public=1) AND a 'private' playlist (is_public=0). Return track_id and title.", 
    "Join tracks, playlist_tracks, playlists.", "Filter public, INTERSECT private.", 
    "SELECT t.track_id, t.title FROM tracks t JOIN playlist_tracks pt ON t.track_id = pt.track_id JOIN playlists p ON pt.playlist_id = p.playlist_id WHERE p.is_public = 1 INTERSECT SELECT t.track_id, t.title FROM tracks t JOIN playlist_tracks pt ON t.track_id = pt.track_id JOIN playlists p ON pt.playlist_id = p.playlist_id WHERE p.is_public = 0;", 
    "SELECT t.track_id, t.title FROM tracks t JOIN playlist_tracks pt ON t.track_id = pt.track_id JOIN playlists p ON pt.playlist_id = p.playlist_id WHERE p.is_public = 1 INTERSECT SELECT t.track_id, t.title FROM tracks t JOIN playlist_tracks pt ON t.track_id = pt.track_id JOIN playlists p ON pt.playlist_id = p.playlist_id WHERE p.is_public = 0;")
];
`;

fs.writeFileSync(targetFile, code);
console.log('Successfully generated the PERFECT music questions!');
