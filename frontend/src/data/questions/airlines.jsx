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

// AIRLINES QUESTIONS (IDs 181-240)
export const airlinesQuestions = [
  // ==========================================
  // EASY: 20 Questions
  // Focus: Basic Filtering, String/Date Math, Simple Aggregations
  // ==========================================
  
  make(181, 'airlines', 'easy', ['topic:Data Cleaning', 'Where', 'company:Delta'], 
    "The operations team suspects data entry errors in the flight logs. Find all flights where the actual arrival time was recorded before the actual departure time. Return the flight_no, actual_dep, and actual_arr.", 
    "Look for logical inconsistencies in the timestamps.", "Use a WHERE clause to compare actual_arr and actual_dep.", 
    "SELECT flight_no, actual_dep, actual_arr FROM flights WHERE actual_arr < actual_dep;", 
    "SELECT flight_no, actual_dep, actual_arr FROM flights WHERE actual_arr < actual_dep;"),

  make(182, 'airlines', 'easy', ['topic:Basic SQL', 'String Functions', 'company:Airbnb'], 
    "Marketing wants to run a campaign targeting young passengers. Retrieve the full names (first and last separated by a space as 'full_name') and ages in years of all passengers born after January 1, 1995. Assume the current year is 2024.", 
    "Concatenate first and last names.", "Subtract the birth year from 2024.", 
    "SELECT first_name || ' ' || last_name AS full_name, 2024 - CAST(strftime('%Y', dob) AS INTEGER) AS age FROM passengers WHERE dob > '1995-01-01';", 
    "SELECT first_name || ' ' || last_name AS full_name, 2024 - CAST(strftime('%Y', dob) AS INTEGER) AS age FROM passengers WHERE dob > '1995-01-01';"),

  make(183, 'airlines', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:Uber'], 
    "Analyze booking patterns by cabin class. Calculate the total revenue generated from 'Business' and 'First' class bookings. Group the result by cabin_class.", 
    "Filter for the specific cabin classes.", "Group by cabin_class and sum the price.", 
    "SELECT cabin_class, SUM(price) AS total_revenue FROM bookings WHERE cabin_class IN ('Business', 'First') GROUP BY cabin_class;", 
    "SELECT cabin_class, SUM(price) AS total_revenue FROM bookings WHERE cabin_class IN ('Business', 'First') GROUP BY cabin_class;"),

  make(184, 'airlines', 'easy', ['topic:Data Analysis', 'Distinct', 'company:Amazon'], 
    "The airline wants to understand its international reach. Find the total number of unique nationalities represented among our passengers. Return a single column named 'unique_nationalities'.", 
    "Use the DISTINCT keyword inside an aggregate function.", "COUNT(DISTINCT nationality)", 
    "SELECT COUNT(DISTINCT nationality) AS unique_nationalities FROM passengers;", 
    "SELECT COUNT(DISTINCT nationality) AS unique_nationalities FROM passengers;"),

  make(185, 'airlines', 'easy', ['topic:Basic SQL', 'Null Handling', 'company:Netflix'], 
    "Identify incomplete booking records. Find the booking IDs and passenger IDs for all bookings that have been checked in (checked_in = 1) but have not yet been assigned a seat_no.", 
    "Check if seat_no IS NULL.", "Ensure checked_in is true.", 
    "SELECT booking_id, passenger_id FROM bookings WHERE checked_in = 1 AND seat_no IS NULL;", 
    "SELECT booking_id, passenger_id FROM bookings WHERE checked_in = 1 AND seat_no IS NULL;"),

  make(186, 'airlines', 'easy', ['topic:Date Functions', 'Where', 'company:Apple'], 
    "Find all flights scheduled to depart on Valentine's Day (February 14, 2024). Return the flight_no and destination_id. Be careful with datetime formats.", 
    "Use the DATE() function to extract just the date part of the timestamp.", "Filter for '2024-02-14'.", 
    "SELECT flight_no, destination_id FROM flights WHERE DATE(scheduled_dep) = '2024-02-14';", 
    "SELECT flight_no, destination_id FROM flights WHERE DATE(scheduled_dep) = '2024-02-14';"),

  make(187, 'airlines', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Stripe'], 
    "Calculate the average flight duration in hours for all routes in the database. Return the value rounded to two decimal places as 'avg_duration_hours'.", 
    "Convert avg_duration_mins to hours.", "Use AVG() and ROUND().", 
    "SELECT ROUND(AVG(avg_duration_mins) / 60.0, 2) AS avg_duration_hours FROM routes;", 
    "SELECT ROUND(AVG(avg_duration_mins) / 60.0, 2) AS avg_duration_hours FROM routes;"),

  make(188, 'airlines', 'easy', ['topic:Data Analysis', 'Limit', 'company:Meta'], 
    "Find the top 3 most senior employees by employee ID who hold the role of 'Captain'. Return their first and last names.", 
    "Sort by employee_id ascending to find the oldest records.", "Filter for role = 'Captain'.", 
    "SELECT first_name, last_name FROM employees WHERE role = 'Captain' ORDER BY employee_id ASC LIMIT 3;", 
    "SELECT first_name, last_name FROM employees WHERE role = 'Captain' ORDER BY employee_id ASC LIMIT 3;"),

  make(189, 'airlines', 'easy', ['topic:Basic SQL', 'In', 'company:Databricks'], 
    "Identify which aircraft models we have from Boeing that were manufactured between 2015 and 2020 inclusive. Return the model and year_manufactured.", 
    "Use BETWEEN for the years.", "Filter for manufacturer 'Boeing'.", 
    "SELECT model, year_manufactured FROM aircraft WHERE manufacturer = 'Boeing' AND year_manufactured BETWEEN 2015 AND 2020;", 
    "SELECT model, year_manufactured FROM aircraft WHERE manufacturer = 'Boeing' AND year_manufactured BETWEEN 2015 AND 2020;"),

  make(190, 'airlines', 'easy', ['topic:Basic SQL', 'Like', 'company:Snowflake'], 
    "Customer service needs to locate a passenger whose last name ends with 'son' and who is of British nationality. Return their full name and passport number.", 
    "Use LIKE '%son'", "Filter for British nationality.", 
    "SELECT first_name, last_name, passport_no FROM passengers WHERE last_name LIKE '%son' AND nationality = 'British';", 
    "SELECT first_name, last_name, passport_no FROM passengers WHERE last_name LIKE '%son' AND nationality = 'British';"),

  make(191, 'airlines', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:Google'], 
    "How many active flights exist for each status? Return the status and the count of flights, ordered from highest count to lowest.", 
    "Group by status.", "Count the rows and order by count descending.", 
    "SELECT status, COUNT(*) AS flight_count FROM flights GROUP BY status ORDER BY flight_count DESC;", 
    "SELECT status, COUNT(*) AS flight_count FROM flights GROUP BY status ORDER BY flight_count DESC;"),

  make(192, 'airlines', 'easy', ['topic:String Functions', 'Basic SQL', 'company:Microsoft'], 
    "Standardize the display format for airports. Return a single column named 'location_string' in the format: 'City, Country (IATA)'. Only include airports in the USA.", 
    "Concatenate city, country, and iata_code.", "Use literal strings like ', ' and ' ('.", 
    "SELECT city || ', ' || country || ' (' || iata_code || ')' AS location_string FROM airports WHERE country = 'USA';", 
    "SELECT city || ', ' || country || ' (' || iata_code || ')' AS location_string FROM airports WHERE country = 'USA';"),

  make(193, 'airlines', 'easy', ['topic:Aggregate Functions', 'Math', 'company:Tesla'], 
    "Calculate the total potential seating capacity if all 'Airbus' aircraft in our fleet were fully booked. Return as 'total_airbus_capacity'.", 
    "Sum the seating_capacity.", "Filter for Airbus.", 
    "SELECT SUM(seating_capacity) AS total_airbus_capacity FROM aircraft WHERE manufacturer = 'Airbus';", 
    "SELECT SUM(seating_capacity) AS total_airbus_capacity FROM aircraft WHERE manufacturer = 'Airbus';"),

  make(194, 'airlines', 'easy', ['topic:Basic SQL', 'Where', 'company:Oracle'], 
    "Find flights that are 'Delayed' and were scheduled to depart before March 1, 2024. Return flight_no and scheduled_dep.", 
    "Filter by status and scheduled_dep.", "Ensure date format matches '2024-03-01'.", 
    "SELECT flight_no, scheduled_dep FROM flights WHERE status = 'Delayed' AND scheduled_dep < '2024-03-01';", 
    "SELECT flight_no, scheduled_dep FROM flights WHERE status = 'Delayed' AND scheduled_dep < '2024-03-01';"),

  make(195, 'airlines', 'easy', ['topic:Aggregate Functions', 'Group By', 'company:Salesforce'], 
    "Determine the minimum, maximum, and average price paid for an 'Economy' ticket. Return as min_price, max_price, and avg_price.", 
    "Use MIN(), MAX(), and AVG() functions.", "Filter for cabin_class = 'Economy'.", 
    "SELECT MIN(price) AS min_price, MAX(price) AS max_price, ROUND(AVG(price), 2) AS avg_price FROM bookings WHERE cabin_class = 'Economy';", 
    "SELECT MIN(price) AS min_price, MAX(price) AS max_price, ROUND(AVG(price), 2) AS avg_price FROM bookings WHERE cabin_class = 'Economy';"),

  make(196, 'airlines', 'easy', ['topic:Data Analysis', 'Group By', 'company:Netflix'], 
    "Which country has the most airports in our database? Return the country and the number of airports, ordered highest to lowest, limit 1.", 
    "Group by country.", "Count the airports, order desc, limit 1.", 
    "SELECT country, COUNT(*) as airport_count FROM airports GROUP BY country ORDER BY airport_count DESC LIMIT 1;", 
    "SELECT country, COUNT(*) as airport_count FROM airports GROUP BY country ORDER BY airport_count DESC LIMIT 1;"),

  make(197, 'airlines', 'easy', ['topic:Basic SQL', 'Where', 'company:Uber'], 
    "Find all bookings where the price is exactly $420.00. Return booking_id, passenger_id, and flight_id.", 
    "Use WHERE price = 420.00.", "No tricks, just direct filtering.", 
    "SELECT booking_id, passenger_id, flight_id FROM bookings WHERE price = 420.00;", 
    "SELECT booking_id, passenger_id, flight_id FROM bookings WHERE price = 420.00;"),

  make(198, 'airlines', 'easy', ['topic:Aggregate Functions', 'Distinct', 'company:Meta'], 
    "How many unique aircraft models do we have in our fleet? Return as unique_models.", 
    "Use COUNT(DISTINCT model).", "Look in the aircraft table.", 
    "SELECT COUNT(DISTINCT model) AS unique_models FROM aircraft;", 
    "SELECT COUNT(DISTINCT model) AS unique_models FROM aircraft;"),

  make(199, 'airlines', 'easy', ['topic:String Functions', 'Like', 'company:Apple'], 
    "Find all airports where the city name starts with 'S' and the country is 'USA'. Return name and city.", 
    "Use LIKE 'S%'.", "Filter for country 'USA'.", 
    "SELECT name, city FROM airports WHERE city LIKE 'S%' AND country = 'USA';", 
    "SELECT name, city FROM airports WHERE city LIKE 'S%' AND country = 'USA';"),

  make(200, 'airlines', 'easy', ['topic:Math', 'Aggregate Functions', 'company:Amazon'], 
    "Calculate the total distance (in km) of all routes that have an average duration strictly less than 120 minutes.", 
    "Sum distance_km.", "Filter for avg_duration_mins < 120.", 
    "SELECT SUM(distance_km) AS total_short_distance FROM routes WHERE avg_duration_mins < 120;", 
    "SELECT SUM(distance_km) AS total_short_distance FROM routes WHERE avg_duration_mins < 120;"),

  // ==========================================
  // MEDIUM: 25 Questions
  // Focus: Multi-table Joins, Subqueries, Case, Complex Logic
  // ==========================================

  make(201, 'airlines', 'medium', ['topic:Joins', 'Math', 'company:Airbnb'], 
    "The scheduling team wants to know if any flight took significantly longer than its historical average route duration. Find flights where the actual duration (in minutes) was at least 30 minutes longer than the average duration for that route. Return flight_no, actual duration, and the route avg_duration_mins.", 
    "Join flights to routes on origin and destination IDs.", "Calculate actual duration using julianday() difference * 1440.", 
    "SELECT f.flight_no, ROUND((julianday(f.actual_arr) - julianday(f.actual_dep)) * 1440) AS actual_duration, r.avg_duration_mins FROM flights f JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id WHERE actual_duration >= r.avg_duration_mins + 30;", 
    "SELECT f.flight_no, ROUND((julianday(f.actual_arr) - julianday(f.actual_dep)) * 1440) AS actual_duration, r.avg_duration_mins FROM flights f JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id WHERE ROUND((julianday(f.actual_arr) - julianday(f.actual_dep)) * 1440) >= r.avg_duration_mins + 30;"),

  make(202, 'airlines', 'medium', ['topic:Joins', 'Aggregate Functions', 'company:Uber'], 
    "Identify our most valuable aircraft. Calculate the total revenue generated by each specific aircraft (using its ID and model). Return aircraft_id, model, and total_revenue. Only include aircraft that have generated more than $10,000.", 
    "Join aircraft to flights to bookings.", "Group by aircraft and use HAVING for the revenue threshold.", 
    "SELECT a.aircraft_id, a.model, SUM(b.price) AS total_revenue FROM aircraft a JOIN flights f ON a.aircraft_id = f.aircraft_id JOIN bookings b ON f.flight_id = b.flight_id GROUP BY a.aircraft_id, a.model HAVING total_revenue > 10000;", 
    "SELECT a.aircraft_id, a.model, SUM(b.price) AS total_revenue FROM aircraft a JOIN flights f ON a.aircraft_id = f.aircraft_id JOIN bookings b ON f.flight_id = b.flight_id GROUP BY a.aircraft_id, a.model HAVING total_revenue > 10000;"),

  make(203, 'airlines', 'medium', ['topic:Subqueries', 'Data Analysis', 'company:Meta'], 
    "Find the passengers who paid above the overall average ticket price for their bookings. Return their first and last names, and the price they paid. Order by price descending.", 
    "Use a subquery in the WHERE clause to calculate the overall average price.", "Join passengers and bookings.", 
    "SELECT p.first_name, p.last_name, b.price FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id WHERE b.price > (SELECT AVG(price) FROM bookings) ORDER BY b.price DESC;", 
    "SELECT p.first_name, p.last_name, b.price FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id WHERE b.price > (SELECT AVG(price) FROM bookings) ORDER BY b.price DESC;"),

  make(204, 'airlines', 'medium', ['topic:Joins', 'Group By', 'company:Databricks'], 
    "Analyze airport traffic. Which origin airport has had the highest number of cancelled flights? Return the airport name and the count of cancelled flights.", 
    "Join flights and airports.", "Filter for 'Cancelled' status, group by airport, sort, and limit to 1.", 
    "SELECT a.name, COUNT(f.flight_id) AS cancelled_count FROM airports a JOIN flights f ON a.airport_id = f.origin_id WHERE f.status = 'Cancelled' GROUP BY a.airport_id ORDER BY cancelled_count DESC LIMIT 1;", 
    "SELECT a.name, COUNT(f.flight_id) AS cancelled_count FROM airports a JOIN flights f ON a.airport_id = f.origin_id WHERE f.status = 'Cancelled' GROUP BY a.airport_id ORDER BY cancelled_count DESC LIMIT 1;"),

  make(205, 'airlines', 'medium', ['topic:Case Statements', 'Data Analysis', 'company:Amazon'], 
    "Create a flight duration category. For all routes, categorize them as 'Short' (<= 2 hours), 'Medium' (> 2 and <= 6 hours), or 'Long' (> 6 hours) based on avg_duration_mins. Count how many routes fall into each category.", 
    "Use a CASE statement inside a SELECT clause, then group by it.", "Remember to convert hours to minutes for the comparison.", 
    "SELECT CASE WHEN avg_duration_mins <= 120 THEN 'Short' WHEN avg_duration_mins <= 360 THEN 'Medium' ELSE 'Long' END AS category, COUNT(*) AS route_count FROM routes GROUP BY category;", 
    "SELECT CASE WHEN avg_duration_mins <= 120 THEN 'Short' WHEN avg_duration_mins <= 360 THEN 'Medium' ELSE 'Long' END AS category, COUNT(*) AS route_count FROM routes GROUP BY category;"),

  make(206, 'airlines', 'medium', ['topic:Joins', 'Null Handling', 'company:Snowflake'], 
    "Marketing wants a list of airports that we fly INTO but never fly OUT OF. Return the IATA code and city of these destination-only airports.", 
    "Find airports that appear in destination_id but NOT in origin_id.", "Use a LEFT JOIN or EXCEPT/NOT IN.", 
    "SELECT DISTINCT a.iata_code, a.city FROM flights f JOIN airports a ON f.destination_id = a.airport_id WHERE a.airport_id NOT IN (SELECT origin_id FROM flights);", 
    "SELECT DISTINCT a.iata_code, a.city FROM flights f JOIN airports a ON f.destination_id = a.airport_id WHERE a.airport_id NOT IN (SELECT origin_id FROM flights);"),

  make(207, 'airlines', 'medium', ['topic:Aggregate Functions', 'Math', 'company:Stripe'], 
    "Calculate the Load Factor (percentage of seats booked) for flight 'AA101'. The formula is: (Total Bookings / Seating Capacity) * 100. Return the flight_no and load_factor as a percentage rounded to 1 decimal place.", 
    "Join flights, aircraft, and bookings.", "Ensure floating point division by multiplying by 100.0.", 
    "SELECT f.flight_no, ROUND(COUNT(b.booking_id) * 100.0 / MAX(a.seating_capacity), 1) AS load_factor FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id LEFT JOIN bookings b ON f.flight_id = b.flight_id WHERE f.flight_no = 'AA101' GROUP BY f.flight_id;", 
    "SELECT f.flight_no, ROUND(COUNT(b.booking_id) * 100.0 / MAX(a.seating_capacity), 1) AS load_factor FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id LEFT JOIN bookings b ON f.flight_id = b.flight_id WHERE f.flight_no = 'AA101' GROUP BY f.flight_id;"),

  make(208, 'airlines', 'medium', ['topic:Joins', 'Self Join', 'company:Google'], 
    "Find pairs of passengers who share the exact same last name and nationality. Return their first names, shared last name, and nationality. Ensure pairs are unique (e.g. A-B, not B-A).", 
    "Self join the passengers table.", "Join on last_name and nationality, and use p1.passenger_id < p2.passenger_id to avoid duplicates.", 
    "SELECT p1.first_name AS pax1, p2.first_name AS pax2, p1.last_name, p1.nationality FROM passengers p1 JOIN passengers p2 ON p1.last_name = p2.last_name AND p1.nationality = p2.nationality AND p1.passenger_id < p2.passenger_id;", 
    "SELECT p1.first_name AS pax1, p2.first_name AS pax2, p1.last_name, p1.nationality FROM passengers p1 JOIN passengers p2 ON p1.last_name = p2.last_name AND p1.nationality = p2.nationality AND p1.passenger_id < p2.passenger_id;"),

  make(209, 'airlines', 'medium', ['topic:Date Functions', 'Aggregate Functions', 'company:Netflix'], 
    "We need to audit our on-time performance for Q1 2024. Calculate the average arrival delay (actual_arr - scheduled_arr) in minutes for all arrived flights that were scheduled between January 1, 2024, and March 31, 2024.", 
    "Use julianday() to find the difference.", "Filter for status = 'Arrived' and the specific date range.", 
    "SELECT ROUND(AVG((julianday(actual_arr) - julianday(scheduled_arr)) * 1440), 2) AS avg_arrival_delay_mins FROM flights WHERE status = 'Arrived' AND scheduled_dep >= '2024-01-01' AND scheduled_dep <= '2024-03-31 23:59:59';", 
    "SELECT ROUND(AVG((julianday(actual_arr) - julianday(scheduled_arr)) * 1440), 2) AS avg_arrival_delay_mins FROM flights WHERE status = 'Arrived' AND scheduled_dep >= '2024-01-01' AND scheduled_dep <= '2024-03-31 23:59:59';"),

  make(210, 'airlines', 'medium', ['topic:Joins', 'Group By', 'company:Apple'], 
    "Crew logistics needs to know which employee has worked on the most delayed flights. Find the employee (first_name, last_name, role) who was crew on the highest number of flights with status 'Delayed'.", 
    "Join employees, crew, and flights.", "Count delayed flights, sort descending, limit 1.", 
    "SELECT e.first_name, e.last_name, e.role, COUNT(f.flight_id) AS delayed_flights FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id WHERE f.status = 'Delayed' GROUP BY e.employee_id ORDER BY delayed_flights DESC LIMIT 1;", 
    "SELECT e.first_name, e.last_name, e.role, COUNT(f.flight_id) AS delayed_flights FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id WHERE f.status = 'Delayed' GROUP BY e.employee_id ORDER BY delayed_flights DESC LIMIT 1;"),

  make(211, 'airlines', 'medium', ['topic:Subqueries', 'Having', 'company:Microsoft'], 
    "Identify highly sought-after flights. Find the flight numbers of flights where the average price of its bookings is at least 50% higher than the global average booking price across all flights.", 
    "Calculate the global average in a subquery.", "Use HAVING AVG(b.price) >= 1.5 * global_avg.", 
    "SELECT f.flight_no FROM flights f JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id HAVING AVG(b.price) >= 1.5 * (SELECT AVG(price) FROM bookings);", 
    "SELECT f.flight_no FROM flights f JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id HAVING AVG(b.price) >= 1.5 * (SELECT AVG(price) FROM bookings);"),

  make(212, 'airlines', 'medium', ['topic:Joins', 'Date Functions', 'company:Tesla'], 
    "A passenger wants to know if they have time for a layover. Find any instances where the same passenger booked two flights, and the second flight departs less than 12 hours after the first flight arrives. Return passenger_id, flight1_no, and flight2_no.", 
    "Self join bookings on passenger_id.", "Join flights for both bookings and compare actual_arr of flight 1 with actual_dep of flight 2.", 
    "SELECT b1.passenger_id, f1.flight_no AS flight1, f2.flight_no AS flight2 FROM bookings b1 JOIN bookings b2 ON b1.passenger_id = b2.passenger_id AND b1.booking_id != b2.booking_id JOIN flights f1 ON b1.flight_id = f1.flight_id JOIN flights f2 ON b2.flight_id = f2.flight_id WHERE f1.actual_arr < f2.actual_dep AND (julianday(f2.actual_dep) - julianday(f1.actual_arr)) * 24 < 12;", 
    "SELECT b1.passenger_id, f1.flight_no AS flight1, f2.flight_no AS flight2 FROM bookings b1 JOIN bookings b2 ON b1.passenger_id = b2.passenger_id AND b1.booking_id != b2.booking_id JOIN flights f1 ON b1.flight_id = f1.flight_id JOIN flights f2 ON b2.flight_id = f2.flight_id WHERE f1.actual_arr < f2.actual_dep AND (julianday(f2.actual_dep) - julianday(f1.actual_arr)) * 24 < 12;"),

  make(213, 'airlines', 'medium', ['topic:Joins', 'Group By', 'company:Salesforce'], 
    "Determine the most frequent destination country for passengers of 'American' nationality. Return the destination country and the number of visits.", 
    "Join passengers, bookings, flights, and airports.", "Group by destination country, filter for American, sort and limit.", 
    "SELECT a.country AS destination_country, COUNT(*) AS visits FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id JOIN flights f ON b.flight_id = f.flight_id JOIN airports a ON f.destination_id = a.airport_id WHERE p.nationality = 'American' GROUP BY a.country ORDER BY visits DESC LIMIT 1;", 
    "SELECT a.country AS destination_country, COUNT(*) AS visits FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id JOIN flights f ON b.flight_id = f.flight_id JOIN airports a ON f.destination_id = a.airport_id WHERE p.nationality = 'American' GROUP BY a.country ORDER BY visits DESC LIMIT 1;"),

  make(214, 'airlines', 'medium', ['topic:Case Statements', 'Math', 'company:Airbnb'], 
    "The finance team needs to calculate net revenue after applying a refund policy. If a flight was 'Cancelled', refund 100%. If 'Delayed', refund 20%. Otherwise, 0% refund. Calculate the total net revenue kept by the airline.", 
    "Use a CASE statement inside a SUM to multiply price by 0, 0.8, or 1 based on status.", "Join flights and bookings.", 
    "SELECT SUM(CASE WHEN f.status = 'Cancelled' THEN 0 WHEN f.status = 'Delayed' THEN b.price * 0.8 ELSE b.price END) AS net_revenue FROM bookings b JOIN flights f ON b.flight_id = f.flight_id;", 
    "SELECT SUM(CASE WHEN f.status = 'Cancelled' THEN 0 WHEN f.status = 'Delayed' THEN b.price * 0.8 ELSE b.price END) AS net_revenue FROM bookings b JOIN flights f ON b.flight_id = f.flight_id;"),

  make(215, 'airlines', 'medium', ['topic:Subqueries', 'In', 'company:Oracle'], 
    "Find all passengers who have booked flights on aircraft older than 15 years (relative to 2024). Return distinct first and last names.", 
    "Find aircraft where 2024 - year_manufactured > 15.", "Use IN or JOINs to link to passengers.", 
    "SELECT DISTINCT p.first_name, p.last_name FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id JOIN flights f ON b.flight_id = f.flight_id JOIN aircraft a ON f.aircraft_id = a.aircraft_id WHERE (2024 - a.year_manufactured) > 15;", 
    "SELECT DISTINCT p.first_name, p.last_name FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id JOIN flights f ON b.flight_id = f.flight_id JOIN aircraft a ON f.aircraft_id = a.aircraft_id WHERE (2024 - a.year_manufactured) > 15;"),

  make(216, 'airlines', 'medium', ['topic:CTEs', 'Data Analysis', 'company:Amazon'], 
    "Using a Common Table Expression (CTE), calculate the total number of flights per day in February 2024. Then query the CTE to find the day(s) with the maximum number of flights.", 
    "CTE to count flights group by DATE(scheduled_dep).", "Main query selects from CTE where count equals the MAX of the count.", 
    "WITH DailyFlights AS (SELECT DATE(scheduled_dep) as flight_date, COUNT(*) as flight_count FROM flights WHERE scheduled_dep LIKE '2024-02%' GROUP BY flight_date) SELECT flight_date FROM DailyFlights WHERE flight_count = (SELECT MAX(flight_count) FROM DailyFlights);", 
    "WITH DailyFlights AS (SELECT DATE(scheduled_dep) as flight_date, COUNT(*) as flight_count FROM flights WHERE scheduled_dep LIKE '2024-02%' GROUP BY flight_date) SELECT flight_date FROM DailyFlights WHERE flight_count = (SELECT MAX(flight_count) FROM DailyFlights);"),

  make(217, 'airlines', 'medium', ['topic:Joins', 'Aggregate Functions', 'company:Uber'], 
    "Find the crew member who has flown the longest total distance across all their assigned flights. Return their first name, last name, and total distance in kilometers.", 
    "Join employees, crew, flights, and routes.", "Sum distance_km, sort descending, limit 1.", 
    "SELECT e.first_name, e.last_name, SUM(r.distance_km) AS total_distance FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id GROUP BY e.employee_id ORDER BY total_distance DESC LIMIT 1;", 
    "SELECT e.first_name, e.last_name, SUM(r.distance_km) AS total_distance FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id GROUP BY e.employee_id ORDER BY total_distance DESC LIMIT 1;"),

  make(218, 'airlines', 'medium', ['topic:Set Operations', 'Data Analysis', 'company:Databricks'], 
    "Identify versatile crew members. Find employees who have worked on flights originating from both 'JFK' and 'LHR'. Use an INTERSECT or logic equivalent. Return their employee IDs.", 
    "Use INTERSECT between two subqueries.", "Or use COUNT(DISTINCT) with a HAVING clause.", 
    "SELECT c.employee_id FROM crew c JOIN flights f ON c.flight_id = f.flight_id JOIN airports a ON f.origin_id = a.airport_id WHERE a.iata_code = 'JFK' INTERSECT SELECT c.employee_id FROM crew c JOIN flights f ON c.flight_id = f.flight_id JOIN airports a ON f.origin_id = a.airport_id WHERE a.iata_code = 'LHR';", 
    "SELECT c.employee_id FROM crew c JOIN flights f ON c.flight_id = f.flight_id JOIN airports a ON f.origin_id = a.airport_id WHERE a.iata_code = 'JFK' INTERSECT SELECT c.employee_id FROM crew c JOIN flights f ON c.flight_id = f.flight_id JOIN airports a ON f.origin_id = a.airport_id WHERE a.iata_code = 'LHR';"),

  make(219, 'airlines', 'medium', ['topic:Subqueries', 'Null Handling', 'company:Apple'], 
    "The airline suspects some fake accounts. Find passengers who exist in the system but have never made a booking. Return their passenger_id and full name.", 
    "Use a LEFT JOIN and check for NULL.", "Or use NOT IN (SELECT passenger_id FROM bookings).", 
    "SELECT passenger_id, first_name || ' ' || last_name AS full_name FROM passengers WHERE passenger_id NOT IN (SELECT passenger_id FROM bookings);", 
    "SELECT passenger_id, first_name || ' ' || last_name AS full_name FROM passengers WHERE passenger_id NOT IN (SELECT passenger_id FROM bookings);"),

  make(220, 'airlines', 'medium', ['topic:Math', 'Group By', 'company:Stripe'], 
    "Calculate the 'no-show' rate for each flight. A no-show is someone who booked a ticket but did not check in (checked_in = 0). Return flight_no and no_show_rate as a percentage. Only show flights with at least 1 booking.", 
    "Calculate (Total no-shows / Total bookings) * 100.", "Group by flight.", 
    "SELECT f.flight_no, ROUND(SUM(CASE WHEN b.checked_in = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(b.booking_id), 2) AS no_show_rate FROM flights f JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id HAVING COUNT(b.booking_id) > 0;", 
    "SELECT f.flight_no, ROUND(SUM(CASE WHEN b.checked_in = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(b.booking_id), 2) AS no_show_rate FROM flights f JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id HAVING COUNT(b.booking_id) > 0;"),

  make(221, 'airlines', 'medium', ['topic:Data Analysis', 'Group By', 'company:Airbnb'], 
    "Determine the most profitable booking day of the week (Monday=1, Sunday=0 using strftime('%w')). Return the day number and total revenue.", 
    "Extract the day of the week from booked_at.", "Group by this value, sum price, and sort descending.", 
    "SELECT strftime('%w', booked_at) AS day_of_week, SUM(price) AS total_revenue FROM bookings GROUP BY day_of_week ORDER BY total_revenue DESC LIMIT 1;", 
    "SELECT strftime('%w', booked_at) AS day_of_week, SUM(price) AS total_revenue FROM bookings GROUP BY day_of_week ORDER BY total_revenue DESC LIMIT 1;"),

  make(222, 'airlines', 'medium', ['topic:Joins', 'Aggregate Functions', 'company:Netflix'], 
    "Find the 'hub' airport for Boeing aircraft. Which origin airport has the highest number of departing flights using a Boeing aircraft? Return the airport name and flight count.", 
    "Join airports, flights, and aircraft.", "Filter for Boeing, group by origin airport.", 
    "SELECT a.name, COUNT(f.flight_id) as flight_count FROM airports a JOIN flights f ON a.airport_id = f.origin_id JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id WHERE ac.manufacturer = 'Boeing' GROUP BY a.airport_id ORDER BY flight_count DESC LIMIT 1;", 
    "SELECT a.name, COUNT(f.flight_id) as flight_count FROM airports a JOIN flights f ON a.airport_id = f.origin_id JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id WHERE ac.manufacturer = 'Boeing' GROUP BY a.airport_id ORDER BY flight_count DESC LIMIT 1;"),

  make(223, 'airlines', 'medium', ['topic:Date Functions', 'CTEs', 'company:Meta'], 
    "List all flights that experienced a 'tarmac delay'. A tarmac delay is defined as the time between actual_dep and scheduled_dep being greater than 60 minutes. Return flight_no and the delay in minutes.", 
    "Use julianday difference between actual_dep and scheduled_dep.", "Filter for difference > 60.", 
    "SELECT flight_no, ROUND((julianday(actual_dep) - julianday(scheduled_dep)) * 1440) AS tarmac_delay_mins FROM flights WHERE actual_dep IS NOT NULL AND (julianday(actual_dep) - julianday(scheduled_dep)) * 1440 > 60;", 
    "SELECT flight_no, ROUND((julianday(actual_dep) - julianday(scheduled_dep)) * 1440) AS tarmac_delay_mins FROM flights WHERE actual_dep IS NOT NULL AND (julianday(actual_dep) - julianday(scheduled_dep)) * 1440 > 60;"),

  make(224, 'airlines', 'medium', ['topic:String Functions', 'Basic SQL', 'company:Google'], 
    "Generate a boarding pass string for all checked-in passengers on flight 'AA101'. The format must be: 'PASSENGER: [LAST_NAME], [FIRST_NAME] | SEAT: [SEAT_NO]'.", 
    "Join passengers, bookings, and flights.", "Use string concatenation.", 
    "SELECT 'PASSENGER: ' || p.last_name || ', ' || p.first_name || ' | SEAT: ' || b.seat_no AS boarding_pass FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id JOIN flights f ON b.flight_id = f.flight_id WHERE f.flight_no = 'AA101' AND b.checked_in = 1;", 
    "SELECT 'PASSENGER: ' || p.last_name || ', ' || p.first_name || ' | SEAT: ' || b.seat_no AS boarding_pass FROM passengers p JOIN bookings b ON p.passenger_id = b.passenger_id JOIN flights f ON b.flight_id = f.flight_id WHERE f.flight_no = 'AA101' AND b.checked_in = 1;"),

  make(225, 'airlines', 'medium', ['topic:Group By', 'Having', 'company:Salesforce'], 
    "Identify co-pilots who might be ready for promotion. Find employees with the role of 'Co-Pilot' who have flown on more than 3 flights that successfully 'Arrived'. Return employee_id and flight count.", 
    "Join employees, crew, and flights.", "Filter for Co-Pilot and Arrived, then group and use HAVING.", 
    "SELECT e.employee_id, COUNT(f.flight_id) AS arrived_flights FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id WHERE e.role = 'Co-Pilot' AND f.status = 'Arrived' GROUP BY e.employee_id HAVING arrived_flights > 3;", 
    "SELECT e.employee_id, COUNT(f.flight_id) AS arrived_flights FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id WHERE e.role = 'Co-Pilot' AND f.status = 'Arrived' GROUP BY e.employee_id HAVING arrived_flights > 3;"),

  // ==========================================
  // HARD: 15 Questions
  // Focus: Window Functions, CTEs, Complex Scenarios
  // ==========================================

  make(226, 'airlines', 'hard', ['topic:Window Functions', 'Lead/Lag', 'company:Netflix'], 
    "Identify 'loyal but unlucky' customers for a compensation campaign. Find passengers who have experienced at least two *consecutive* flight cancellations based on their chronological booking timeline. Return their passenger_id.", 
    "Use the LAG() function over a partition of passenger_id ordered by booked_at.", "Check if current status is 'Cancelled' and lag status is 'Cancelled'.", 
    "WITH OrderedBookings AS (SELECT b.passenger_id, f.status, LAG(f.status) OVER(PARTITION BY b.passenger_id ORDER BY b.booked_at) as prev_status FROM bookings b JOIN flights f ON b.flight_id = f.flight_id) SELECT DISTINCT passenger_id FROM OrderedBookings WHERE status = 'Cancelled' AND prev_status = 'Cancelled';", 
    "WITH OrderedBookings AS (SELECT b.passenger_id, f.status, LAG(f.status) OVER(PARTITION BY b.passenger_id ORDER BY b.booked_at) as prev_status FROM bookings b JOIN flights f ON b.flight_id = f.flight_id) SELECT DISTINCT passenger_id FROM OrderedBookings WHERE status = 'Cancelled' AND prev_status = 'Cancelled';"),

  make(227, 'airlines', 'hard', ['topic:Window Functions', 'CTEs', 'company:Meta'], 
    "Calculate the Revenue per Available Seat Kilometer (RASK) rolling 3-day average for the airline. Group flights by their DATE(scheduled_dep). RASK = Total Revenue / (Total Seats * Total Distance). Return date and rolling RASK.", 
    "First, calculate daily revenue, seats, and distance.", "Then apply a window function ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.", 
    "WITH DailyStats AS (SELECT DATE(f.scheduled_dep) as f_date, SUM(b.price) as rev, SUM(a.seating_capacity * r.distance_km) as capacity FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id LEFT JOIN bookings b ON f.flight_id = b.flight_id GROUP BY DATE(f.scheduled_dep)) SELECT f_date, ROUND(AVG(rev/capacity) OVER(ORDER BY f_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 5) as rolling_rask FROM DailyStats;", 
    "WITH DailyStats AS (SELECT DATE(f.scheduled_dep) as f_date, SUM(b.price) as rev, SUM(a.seating_capacity * r.distance_km) as capacity FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id LEFT JOIN bookings b ON f.flight_id = b.flight_id GROUP BY DATE(f.scheduled_dep)) SELECT f_date, ROUND(AVG(rev/capacity) OVER(ORDER BY f_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 5) as rolling_rask FROM DailyStats;"),

  make(228, 'airlines', 'hard', ['topic:Window Functions', 'Data Analysis', 'company:Amazon'], 
    "Detect 'hidden city' ticketing anomalies. A hidden city violation happens when a passenger checks into the first leg of a multi-leg journey but fails to check in for the next chronological leg within 24 hours. Return passenger IDs who did this.", 
    "Use LEAD() to check the next flight's check-in status for the passenger.", "Check time difference between flights.", 
    "WITH Journey AS (SELECT passenger_id, checked_in, scheduled_dep, LEAD(checked_in) OVER(PARTITION BY passenger_id ORDER BY scheduled_dep) as next_checked_in, LEAD(scheduled_dep) OVER(PARTITION BY passenger_id ORDER BY scheduled_dep) as next_dep FROM bookings b JOIN flights f ON b.flight_id = f.flight_id) SELECT DISTINCT passenger_id FROM Journey WHERE checked_in = 1 AND next_checked_in = 0 AND (julianday(next_dep) - julianday(scheduled_dep)) * 24 <= 24;", 
    "WITH Journey AS (SELECT passenger_id, checked_in, scheduled_dep, LEAD(checked_in) OVER(PARTITION BY passenger_id ORDER BY scheduled_dep) as next_checked_in, LEAD(scheduled_dep) OVER(PARTITION BY passenger_id ORDER BY scheduled_dep) as next_dep FROM bookings b JOIN flights f ON b.flight_id = f.flight_id) SELECT DISTINCT passenger_id FROM Journey WHERE checked_in = 1 AND next_checked_in = 0 AND (julianday(next_dep) - julianday(scheduled_dep)) * 24 <= 24;"),

  make(229, 'airlines', 'hard', ['topic:Window Functions', 'Rank', 'company:Google'], 
    "For each continent (assume USA/Canada/Mexico = 'North America', others = 'Rest of World' for simplicity), rank the airports by total departing passenger traffic. Return Region, Airport Name, Traffic, and Rank (1 being highest).", 
    "Use a CASE statement for regions.", "Use DENSE_RANK() partitioned by region ordered by traffic.", 
    "WITH Traffic AS (SELECT CASE WHEN a.country IN ('USA', 'Canada', 'Mexico') THEN 'North America' ELSE 'Rest of World' END AS region, a.name, COUNT(b.booking_id) as traffic FROM airports a JOIN flights f ON a.airport_id = f.origin_id JOIN bookings b ON f.flight_id = b.flight_id GROUP BY region, a.name) SELECT region, name, traffic, DENSE_RANK() OVER(PARTITION BY region ORDER BY traffic DESC) as rank FROM Traffic;", 
    "WITH Traffic AS (SELECT CASE WHEN a.country IN ('USA', 'Canada', 'Mexico') THEN 'North America' ELSE 'Rest of World' END AS region, a.name, COUNT(b.booking_id) as traffic FROM airports a JOIN flights f ON a.airport_id = f.origin_id JOIN bookings b ON f.flight_id = b.flight_id GROUP BY region, a.name) SELECT region, name, traffic, DENSE_RANK() OVER(PARTITION BY region ORDER BY traffic DESC) as rank FROM Traffic;"),

  make(230, 'airlines', 'hard', ['topic:Window Functions', 'Math', 'company:Stripe'], 
    "Calculate the Month-over-Month (MoM) revenue growth percentage for the airline. Return the month (YYYY-MM) and the growth percentage rounded to 2 decimal places.", 
    "Extract month, sum revenue.", "Use LAG() to get previous month's revenue. Growth = (Current - Prev) / Prev * 100.", 
    "WITH Monthly AS (SELECT strftime('%Y-%m', booked_at) as mth, SUM(price) as rev FROM bookings GROUP BY mth), MoM AS (SELECT mth, rev, LAG(rev) OVER(ORDER BY mth) as prev_rev FROM Monthly) SELECT mth, ROUND((rev - prev_rev) * 100.0 / prev_rev, 2) as mom_growth FROM MoM WHERE prev_rev IS NOT NULL;", 
    "WITH Monthly AS (SELECT strftime('%Y-%m', booked_at) as mth, SUM(price) as rev FROM bookings GROUP BY mth), MoM AS (SELECT mth, rev, LAG(rev) OVER(ORDER BY mth) as prev_rev FROM Monthly) SELECT mth, ROUND((rev - prev_rev) * 100.0 / prev_rev, 2) as mom_growth FROM MoM WHERE prev_rev IS NOT NULL;"),

  make(231, 'airlines', 'hard', ['topic:CTEs', 'Window Functions', 'company:Airbnb'], 
    "Identify 'Turnaround Bottlenecks'. Find aircraft that had a turnaround time (time between actual_arr of flight A and actual_dep of subsequent flight B) of less than 60 minutes. Return aircraft_id and the bottleneck turnaround time in minutes.", 
    "Use LEAD() on actual_dep partitioned by aircraft_id ordered by scheduled time.", "Calculate difference in minutes.", 
    "WITH Turnarounds AS (SELECT aircraft_id, actual_arr, LEAD(actual_dep) OVER(PARTITION BY aircraft_id ORDER BY scheduled_dep) as next_dep FROM flights WHERE status IN ('Arrived', 'Departed')) SELECT DISTINCT aircraft_id, ROUND((julianday(next_dep) - julianday(actual_arr)) * 1440) AS turnaround_mins FROM Turnarounds WHERE turnaround_mins < 60 AND turnaround_mins > 0;", 
    "WITH Turnarounds AS (SELECT aircraft_id, actual_arr, LEAD(actual_dep) OVER(PARTITION BY aircraft_id ORDER BY scheduled_dep) as next_dep FROM flights WHERE status IN ('Arrived', 'Departed')) SELECT DISTINCT aircraft_id, ROUND((julianday(next_dep) - julianday(actual_arr)) * 1440) AS turnaround_mins FROM Turnarounds WHERE turnaround_mins < 60 AND turnaround_mins > 0;"),

  make(232, 'airlines', 'hard', ['topic:Window Functions', 'Ntile', 'company:Apple'], 
    "Create a passenger tier system. Group all passengers who have made at least one booking into 4 tiers (quartiles) based on their total lifetime spend. Return passenger_id, total_spend, and their tier (1 being highest spenders, 4 being lowest).", 
    "Sum price per passenger.", "Use NTILE(4) ordered by total_spend descending.", 
    "WITH Spend AS (SELECT passenger_id, SUM(price) as total_spend FROM bookings GROUP BY passenger_id) SELECT passenger_id, total_spend, NTILE(4) OVER(ORDER BY total_spend DESC) AS tier FROM Spend;", 
    "WITH Spend AS (SELECT passenger_id, SUM(price) as total_spend FROM bookings GROUP BY passenger_id) SELECT passenger_id, total_spend, NTILE(4) OVER(ORDER BY total_spend DESC) AS tier FROM Spend;"),

  make(233, 'airlines', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Uber'], 
    "Identify 'ghost flights' - flights that operated (Departed or Arrived) but had a load factor of less than 10%. Return the flight_no, actual load factor, and the total financial loss (assume operating cost is $50 per km of the route).", 
    "Calculate load factor. Join to routes to get distance.", "Loss = (distance * 50) - total_revenue.", 
    "WITH FlightStats AS (SELECT f.flight_no, r.distance_km, a.seating_capacity, COALESCE(SUM(b.price), 0) as revenue, COUNT(b.booking_id) as pax FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id LEFT JOIN bookings b ON f.flight_id = b.flight_id WHERE f.status IN ('Departed', 'Arrived') GROUP BY f.flight_id) SELECT flight_no, (pax * 100.0 / seating_capacity) AS load_factor, ((distance_km * 50) - revenue) AS financial_loss FROM FlightStats WHERE (pax * 100.0 / seating_capacity) < 10;", 
    "WITH FlightStats AS (SELECT f.flight_no, r.distance_km, a.seating_capacity, COALESCE(SUM(b.price), 0) as revenue, COUNT(b.booking_id) as pax FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id JOIN routes r ON f.origin_id = r.origin_id AND f.destination_id = r.destination_id LEFT JOIN bookings b ON f.flight_id = b.flight_id WHERE f.status IN ('Departed', 'Arrived') GROUP BY f.flight_id) SELECT flight_no, (pax * 100.0 / seating_capacity) AS load_factor, ((distance_km * 50) - revenue) AS financial_loss FROM FlightStats WHERE (pax * 100.0 / seating_capacity) < 10;"),

  make(234, 'airlines', 'hard', ['topic:Window Functions', 'Partition By', 'company:Salesforce'], 
    "For each aircraft model, find the single flight that generated the highest revenue. Return model, flight_no, and revenue. Resolve ties by picking the earliest scheduled flight.", 
    "Calculate revenue per flight.", "Use ROW_NUMBER() partitioned by model ordered by revenue DESC, scheduled_dep ASC.", 
    "WITH FlightRev AS (SELECT a.model, f.flight_no, f.scheduled_dep, SUM(b.price) as rev FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id), Ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY model ORDER BY rev DESC, scheduled_dep ASC) as rn FROM FlightRev) SELECT model, flight_no, rev FROM Ranked WHERE rn = 1;", 
    "WITH FlightRev AS (SELECT a.model, f.flight_no, f.scheduled_dep, SUM(b.price) as rev FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id), Ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY model ORDER BY rev DESC, scheduled_dep ASC) as rn FROM FlightRev) SELECT model, flight_no, rev FROM Ranked WHERE rn = 1;"),

  make(235, 'airlines', 'hard', ['topic:CTEs', 'Self Join', 'company:Databricks'], 
    "The airline wants to create new 'connecting' routes. Find all valid 1-stop connections from 'JFK' to 'LHR'. A valid connection means Flight 1 arrives at a layover airport at least 1 hour before Flight 2 departs, but no more than 6 hours before. Return Flight1_no, Layover_Airport_IATA, Flight2_no.", 
    "Join flights to itself where f1.destination_id = f2.origin_id.", "Check time constraints using julianday().", 
    "SELECT f1.flight_no as flight1, a.iata_code as layover, f2.flight_no as flight2 FROM flights f1 JOIN flights f2 ON f1.destination_id = f2.origin_id JOIN airports a ON f1.destination_id = a.airport_id JOIN airports a_orig ON f1.origin_id = a_orig.airport_id JOIN airports a_dest ON f2.destination_id = a_dest.airport_id WHERE a_orig.iata_code = 'JFK' AND a_dest.iata_code = 'LHR' AND (julianday(f2.scheduled_dep) - julianday(f1.scheduled_arr))*24 BETWEEN 1 AND 6;", 
    "SELECT f1.flight_no as flight1, a.iata_code as layover, f2.flight_no as flight2 FROM flights f1 JOIN flights f2 ON f1.destination_id = f2.origin_id JOIN airports a ON f1.destination_id = a.airport_id JOIN airports a_orig ON f1.origin_id = a_orig.airport_id JOIN airports a_dest ON f2.destination_id = a_dest.airport_id WHERE a_orig.iata_code = 'JFK' AND a_dest.iata_code = 'LHR' AND (julianday(f2.scheduled_dep) - julianday(f1.scheduled_arr))*24 BETWEEN 1 AND 6;"),

  make(236, 'airlines', 'hard', ['topic:Window Functions', 'Row Number', 'company:Netflix'], 
    "Identify the first ever flight operated by each Captain. Return the employee's full name, the flight_no, and the date of departure.", 
    "Use ROW_NUMBER() partitioned by employee ordered by scheduled_dep.", "Filter for role 'Captain'.", 
    "WITH Career AS (SELECT e.first_name || ' ' || e.last_name as name, f.flight_no, DATE(f.scheduled_dep) as dep_date, ROW_NUMBER() OVER(PARTITION BY e.employee_id ORDER BY f.scheduled_dep) as rn FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id WHERE c.role = 'Captain') SELECT name, flight_no, dep_date FROM Career WHERE rn = 1;", 
    "WITH Career AS (SELECT e.first_name || ' ' || e.last_name as name, f.flight_no, DATE(f.scheduled_dep) as dep_date, ROW_NUMBER() OVER(PARTITION BY e.employee_id ORDER BY f.scheduled_dep) as rn FROM employees e JOIN crew c ON e.employee_id = c.employee_id JOIN flights f ON c.flight_id = f.flight_id WHERE c.role = 'Captain') SELECT name, flight_no, dep_date FROM Career WHERE rn = 1;"),

  make(237, 'airlines', 'hard', ['topic:CTEs', 'Data Analysis', 'company:Snowflake'], 
    "Which pair of airports has the highest volume of bi-directional passenger traffic? Calculate the total passengers flying A->B plus B->A. Return airport1_iata, airport2_iata (alphabetical order to prevent duplicates), and total_passengers.", 
    "Create a CTE that ensures alphabetical ordering of the two IATA codes.", "Group by the pair and sum bookings.", 
    "WITH Routes AS (SELECT CASE WHEN a1.iata_code < a2.iata_code THEN a1.iata_code ELSE a2.iata_code END AS apt1, CASE WHEN a1.iata_code < a2.iata_code THEN a2.iata_code ELSE a1.iata_code END AS apt2, COUNT(b.booking_id) as pax FROM flights f JOIN bookings b ON f.flight_id = b.flight_id JOIN airports a1 ON f.origin_id = a1.airport_id JOIN airports a2 ON f.destination_id = a2.airport_id GROUP BY f.origin_id, f.destination_id) SELECT apt1, apt2, SUM(pax) as total_passengers FROM Routes GROUP BY apt1, apt2 ORDER BY total_passengers DESC LIMIT 1;", 
    "WITH Routes AS (SELECT CASE WHEN a1.iata_code < a2.iata_code THEN a1.iata_code ELSE a2.iata_code END AS apt1, CASE WHEN a1.iata_code < a2.iata_code THEN a2.iata_code ELSE a1.iata_code END AS apt2, COUNT(b.booking_id) as pax FROM flights f JOIN bookings b ON f.flight_id = b.flight_id JOIN airports a1 ON f.origin_id = a1.airport_id JOIN airports a2 ON f.destination_id = a2.airport_id GROUP BY f.origin_id, f.destination_id) SELECT apt1, apt2, SUM(pax) as total_passengers FROM Routes GROUP BY apt1, apt2 ORDER BY total_passengers DESC LIMIT 1;"),

  make(238, 'airlines', 'hard', ['topic:Window Functions', 'Data Analysis', 'company:Microsoft'], 
    "Calculate the percentage of total daily revenue that each flight represents. Return date, flight_no, flight_revenue, and percentage_of_daily_rev rounded to 2 decimals.", 
    "Use SUM() OVER(PARTITION BY DATE(scheduled_dep)).", "Divide flight revenue by daily revenue.", 
    "WITH FlightRev AS (SELECT DATE(scheduled_dep) as f_date, flight_no, SUM(price) as rev FROM flights f JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id) SELECT f_date, flight_no, rev, ROUND(rev * 100.0 / SUM(rev) OVER(PARTITION BY f_date), 2) as percentage_of_daily_rev FROM FlightRev;", 
    "WITH FlightRev AS (SELECT DATE(scheduled_dep) as f_date, flight_no, SUM(price) as rev FROM flights f JOIN bookings b ON f.flight_id = b.flight_id GROUP BY f.flight_id) SELECT f_date, flight_no, rev, ROUND(rev * 100.0 / SUM(rev) OVER(PARTITION BY f_date), 2) as percentage_of_daily_rev FROM FlightRev;"),

  make(239, 'airlines', 'hard', ['topic:CTEs', 'Null Handling', 'company:Oracle'], 
    "Find 'phantom bookings'. A booking is a phantom if the seat_no is assigned, but the aircraft does not actually have that seat (assume flights where total bookings exceed seating capacity). Find flights where total bookings > seating capacity.", 
    "Count bookings per flight, compare to aircraft seating capacity.", "Filter for count > capacity.", 
    "SELECT f.flight_no, COUNT(b.booking_id) as overbooked_count, a.seating_capacity FROM flights f JOIN bookings b ON f.flight_id = b.flight_id JOIN aircraft a ON f.aircraft_id = a.aircraft_id GROUP BY f.flight_id HAVING COUNT(b.booking_id) > a.seating_capacity;", 
    "SELECT f.flight_no, COUNT(b.booking_id) as overbooked_count, a.seating_capacity FROM flights f JOIN bookings b ON f.flight_id = b.flight_id JOIN aircraft a ON f.aircraft_id = a.aircraft_id GROUP BY f.flight_id HAVING COUNT(b.booking_id) > a.seating_capacity;"),

  make(240, 'airlines', 'hard', ['topic:Data Analysis', 'Group By', 'company:Amazon'], 
    "Generate a complete flight scorecard. For every arrived flight, calculate its Delay (minutes), Revenue, Load Factor (%), and an overall 'Performance Score' (Score = Load Factor % - (Delay Minutes / 10)). Return the top 3 flights by Performance Score.", 
    "Combine several metrics.", "Be careful with NULLs in delay.", 
    "WITH Scorecard AS (SELECT f.flight_no, COALESCE(ROUND((julianday(f.actual_arr) - julianday(f.scheduled_arr))*1440), 0) as delay, COALESCE(SUM(b.price), 0) as rev, (COUNT(b.booking_id) * 100.0 / a.seating_capacity) as load_factor FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id LEFT JOIN bookings b ON f.flight_id = b.flight_id WHERE f.status = 'Arrived' GROUP BY f.flight_id) SELECT flight_no, delay, rev, ROUND(load_factor, 1) as load_factor, ROUND(load_factor - (delay/10.0), 2) as perf_score FROM Scorecard ORDER BY perf_score DESC LIMIT 3;", 
    "WITH Scorecard AS (SELECT f.flight_no, COALESCE(ROUND((julianday(f.actual_arr) - julianday(f.scheduled_arr))*1440), 0) as delay, COALESCE(SUM(b.price), 0) as rev, (COUNT(b.booking_id) * 100.0 / MAX(a.seating_capacity)) as load_factor FROM flights f JOIN aircraft a ON f.aircraft_id = a.aircraft_id LEFT JOIN bookings b ON f.flight_id = b.flight_id WHERE f.status = 'Arrived' GROUP BY f.flight_id) SELECT flight_no, delay, rev, ROUND(load_factor, 1) as load_factor, ROUND(load_factor - (delay/10.0), 2) as perf_score FROM Scorecard ORDER BY perf_score DESC LIMIT 3;")
];
