-- DATABASE: Airlines | 7 tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS airports (
  airport_id INTEGER PRIMARY KEY, iata_code TEXT NOT NULL, name TEXT,
  city TEXT, country TEXT, latitude REAL, longitude REAL
);
CREATE TABLE IF NOT EXISTS aircraft (
  aircraft_id INTEGER PRIMARY KEY, model TEXT, manufacturer TEXT,
  seating_capacity INTEGER, year_manufactured INTEGER
);
CREATE TABLE IF NOT EXISTS flights (
  flight_id INTEGER PRIMARY KEY, flight_no TEXT, aircraft_id INTEGER REFERENCES aircraft(aircraft_id),
  origin_id INTEGER REFERENCES airports(airport_id), destination_id INTEGER REFERENCES airports(airport_id),
  scheduled_dep DATETIME, scheduled_arr DATETIME, actual_dep DATETIME, actual_arr DATETIME,
  status TEXT CHECK(status IN ('Scheduled','Departed','Arrived','Delayed','Cancelled'))
);
CREATE TABLE IF NOT EXISTS passengers (
  passenger_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT,
  passport_no TEXT, nationality TEXT, dob DATE
);
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INTEGER PRIMARY KEY, passenger_id INTEGER REFERENCES passengers(passenger_id),
  flight_id INTEGER REFERENCES flights(flight_id), seat_no TEXT, cabin_class TEXT,
  price REAL, booked_at DATETIME, checked_in INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS crew (
  crew_id INTEGER PRIMARY KEY, flight_id INTEGER REFERENCES flights(flight_id),
  employee_id INTEGER REFERENCES employees(employee_id), role TEXT
);
CREATE TABLE IF NOT EXISTS routes (
  route_id INTEGER PRIMARY KEY, origin_id INTEGER REFERENCES airports(airport_id),
  destination_id INTEGER REFERENCES airports(airport_id), distance_km REAL, avg_duration_mins INTEGER
);

INSERT INTO airports VALUES
  (1,'JFK','John F. Kennedy International','New York','USA',40.6413,-73.7781),
  (2,'LHR','London Heathrow','London','UK',51.4700,-0.4543),
  (3,'DXB','Dubai International','Dubai','UAE',25.2528,55.3644),
  (4,'CDG','Paris Charles de Gaulle','Paris','France',49.0097,2.5479),
  (5,'SIN','Singapore Changi','Singapore','Singapore',1.3644,103.9915),
  (6,'HND','Tokyo Haneda','Tokyo','Japan',35.5494,139.7798),
  (7,'SYD','Sydney Kingsford Smith','Sydney','Australia',-33.9399,151.1753),
  (8,'LAX','Los Angeles International','Los Angeles','USA',33.9425,-118.4081),
  (9,'FRA','Frankfurt Airport','Frankfurt','Germany',50.0379,8.5622),
  (10,'AMS','Amsterdam Schiphol','Amsterdam','Netherlands',52.3086,4.7639),
  (11,'ICN','Incheon International','Seoul','South Korea',37.4602,126.4407),
  (12,'PEK','Beijing Capital International','Beijing','China',40.0799,116.6031),
  (13,'ORD','O''Hare International','Chicago','USA',41.9742,-87.9073),
  (14,'DFW','Dallas Fort Worth','Dallas','USA',32.8998,-97.0403),
  (15,'YYZ','Toronto Pearson','Toronto','Canada',43.6777,-79.6248);

INSERT INTO aircraft VALUES
  (1,'Boeing 737-800','Boeing',189,2015),
  (2,'Airbus A320','Airbus',180,2017),
  (3,'Boeing 777-300ER','Boeing',396,2012),
  (4,'Airbus A380','Airbus',555,2010),
  (5,'Boeing 787-9','Boeing',296,2018),
  (6,'Airbus A350-900','Airbus',325,2019),
  (7,'Embraer E190','Embraer',100,2016),
  (8,'Boeing 737 MAX 8','Boeing',178,2021),
  (9,'Airbus A321neo','Airbus',244,2020),
  (10,'Boeing 767-300ER','Boeing',269,2008);

INSERT INTO flights VALUES
  (1,'AA101',1,1,2,'2024-01-10 09:00:00','2024-01-10 21:00:00','2024-01-10 09:15:00','2024-01-10 21:30:00','Arrived'),
  (2,'BA202',2,2,1,'2024-01-11 10:00:00','2024-01-11 13:00:00','2024-01-11 10:00:00','2024-01-11 13:05:00','Arrived'),
  (3,'EK303',4,3,5,'2024-01-12 14:00:00','2024-01-12 23:00:00','2024-01-12 14:30:00','2024-01-12 23:40:00','Arrived'),
  (4,'SQ404',6,5,6,'2024-01-13 08:00:00','2024-01-13 16:00:00','2024-01-13 08:00:00','2024-01-13 16:00:00','Arrived'),
  (5,'AF505',3,4,8,'2024-01-14 11:00:00','2024-01-14 14:00:00',NULL,NULL,'Cancelled'),
  (6,'LH606',5,9,1,'2024-01-15 07:00:00','2024-01-15 10:00:00','2024-01-15 07:40:00','2024-01-15 10:45:00','Arrived'),
  (7,'QF707',7,7,5,'2024-01-16 23:00:00','2024-01-17 06:00:00','2024-01-16 23:00:00','2024-01-17 06:15:00','Arrived'),
  (8,'KE808',3,11,1,'2024-01-17 15:00:00','2024-01-17 18:00:00','2024-01-17 15:20:00','2024-01-17 18:25:00','Arrived'),
  (9,'AA109',1,1,13,'2024-01-18 08:30:00','2024-01-18 10:30:00','2024-01-18 08:30:00','2024-01-18 10:35:00','Arrived'),
  (10,'UA210',8,8,1,'2024-01-19 12:00:00','2024-01-19 20:00:00',NULL,NULL,'Delayed'),
  (11,'BA211',2,2,3,'2024-01-20 09:00:00','2024-01-20 20:00:00','2024-01-20 09:00:00','2024-01-20 20:30:00','Arrived'),
  (12,'EK312',4,3,7,'2024-01-21 02:00:00','2024-01-21 20:00:00','2024-01-21 02:30:00','2024-01-21 20:45:00','Arrived'),
  (13,'SQ413',6,5,11,'2024-01-22 10:00:00','2024-01-22 18:00:00','2024-01-22 10:00:00','2024-01-22 18:10:00','Arrived'),
  (14,'AF514',3,4,2,'2024-01-23 15:00:00','2024-01-23 15:45:00','2024-01-23 15:00:00','2024-01-23 15:45:00','Arrived'),
  (15,'LH615',5,9,2,'2024-01-24 11:00:00','2024-01-24 12:30:00','2024-01-24 11:15:00','2024-01-24 12:50:00','Arrived'),
  (16,'AA116',1,1,14,'2024-02-01 07:00:00','2024-02-01 10:00:00','2024-02-01 07:00:00','2024-02-01 10:05:00','Arrived'),
  (17,'BA217',2,2,10,'2024-02-02 14:00:00','2024-02-02 16:00:00','2024-02-02 14:20:00','2024-02-02 16:25:00','Arrived'),
  (18,'QF818',7,7,2,'2024-02-03 22:00:00','2024-02-04 10:00:00','2024-02-03 22:00:00','2024-02-04 10:30:00','Arrived'),
  (19,'KE919',3,11,3,'2024-02-04 13:00:00','2024-02-04 17:00:00',NULL,NULL,'Scheduled'),
  (20,'UA020',8,8,15,'2024-02-05 09:00:00','2024-02-05 12:00:00','2024-02-05 09:30:00','2024-02-05 12:40:00','Arrived');

INSERT INTO passengers VALUES
  (1,'James','Smith','P001234567','American','1985-06-15'),
  (2,'Emma','Johnson','P002345678','British','1990-03-22'),
  (3,'Liam','Williams','P003456789','Australian','1978-11-08'),
  (4,'Olivia','Brown','P004567890','Canadian','1995-07-14'),
  (5,'Noah','Jones','P005678901','American','1982-04-30'),
  (6,'Sophia','Garcia','P006789012','Spanish','1988-09-05'),
  (7,'William','Martinez','P007890123','Mexican','1975-01-20'),
  (8,'Isabella','Davis','P008901234','American','1998-12-10'),
  (9,'James','Miller','P009012345','Irish','1965-05-25'),
  (10,'Mia','Wilson','P010123456','New Zealander','1992-08-18'),
  (11,'Oliver','Moore','P011234567','British','1980-02-14'),
  (12,'Charlotte','Taylor','P012345678','Australian','1997-10-02'),
  (13,'Elijah','Anderson','P013456789','American','1973-07-29'),
  (14,'Amelia','Thomas','P014567890','French','1986-04-16'),
  (15,'Logan','Jackson','P015678901','American','1991-11-03'),
  (16,'Harper','White','P016789012','Canadian','1984-08-22'),
  (17,'Mason','Harris','P017890123','American','1977-03-09'),
  (18,'Evelyn','Martin','P018901234','German','1993-06-28'),
  (19,'Aiden','Thompson','P019012345','American','1969-01-15'),
  (20,'Abigail','Garcia','P020123456','Colombian','1996-09-04');

INSERT INTO bookings VALUES
  (1,1,1,'12A','Business',1200.00,'2023-12-01 10:00:00',1),
  (2,2,1,'34B','Economy',450.00,'2023-12-05 14:00:00',1),
  (3,3,2,'15C','Economy',520.00,'2023-12-10 09:00:00',1),
  (4,4,3,'2A','First',2800.00,'2023-12-15 11:00:00',1),
  (5,5,3,'45D','Economy',620.00,'2023-12-20 16:00:00',1),
  (6,6,4,'10B','Business',1500.00,'2023-12-22 13:00:00',1),
  (7,7,5,'22A','Economy',890.00,'2023-12-25 08:00:00',0),
  (8,8,6,'8C','Business',1100.00,'2023-12-28 15:00:00',1),
  (9,9,7,'30D','Economy',780.00,'2024-01-02 10:00:00',1),
  (10,10,8,'5A','Economy',430.00,'2024-01-05 12:00:00',1),
  (11,1,9,'3B','Business',280.00,'2024-01-08 09:00:00',1),
  (12,2,10,NULL,'Economy',650.00,'2024-01-10 14:00:00',0),
  (13,11,11,'18A','Economy',580.00,'2024-01-12 11:00:00',1),
  (14,12,12,'7C','Business',1800.00,'2024-01-15 13:00:00',1),
  (15,13,13,'25D','Economy',720.00,'2024-01-18 16:00:00',1),
  (16,14,14,'1A','Business',950.00,'2024-01-20 08:00:00',1),
  (17,15,15,'40B','Economy',380.00,'2024-01-22 12:00:00',1),
  (18,16,16,'12C','Economy',340.00,'2024-01-25 09:00:00',1),
  (19,17,17,'6A','Business',820.00,'2024-01-28 14:00:00',1),
  (20,18,18,NULL,'Economy',1350.00,'2024-02-01 10:00:00',0),
  (21,3,1,'56E','Economy',450.00,'2023-12-05 15:00:00',1),
  (22,5,6,'20A','Business',1100.00,'2023-12-28 16:00:00',1),
  (23,7,9,'11B','Economy',420.00,'2024-01-02 11:00:00',1),
  (24,9,2,'22C','Business',680.00,'2023-12-10 10:00:00',1),
  (25,11,4,'33D','Economy',590.00,'2023-12-15 12:00:00',1),
  (26,13,7,'8A','Economy',760.00,'2024-01-02 12:00:00',1),
  (27,15,11,'27B','Business',560.00,'2024-01-12 12:00:00',1),
  (28,17,13,'14C','Economy',700.00,'2024-01-18 17:00:00',1),
  (29,19,16,'4D','Economy',330.00,'2024-01-25 10:00:00',1),
  (30,20,19,'9A','Economy',660.00,'2024-02-02 08:00:00',0);

INSERT INTO employees VALUES
  (101,'John','Doe','Pilot'),(102,'Jane','Smith','Co-Pilot'),(103,'Alice','Johnson','Flight Attendant'),
  (104,'Bob','Brown','Pilot'),(105,'Charlie','Davis','Co-Pilot'),(106,'Diana','Evans','Flight Attendant'),
  (107,'Ethan','Ford','Pilot'),(108,'Fiona','Green','Flight Attendant'),(109,'George','Harris','Pilot'),
  (110,'Hannah','Irwin','Co-Pilot'),(111,'Ian','Jones','Co-Pilot'),(112,'Julia','King','Flight Attendant'),
  (113,'Kevin','Lee','Pilot'),(114,'Laura','Moore','Co-Pilot'),(115,'Michael','Nelson','Flight Attendant'),
  (116,'Nina','Owen','Flight Attendant'),(117,'Oscar','Perez','Pilot'),(118,'Paula','Quinn','Co-Pilot'),
  (119,'Rick','Ross','Flight Attendant'),(120,'Sarah','Stone','Flight Attendant'),
  (121,'Tom','Taylor','Pilot'),(122,'Uma','Upton','Co-Pilot'),(123,'Victor','Vance','Flight Attendant'),
  (124,'Wendy','White','Flight Attendant'),(125,'Xavier','Xiong','Pilot');

INSERT INTO crew VALUES
  (1,1,101,'Captain'),(2,1,102,'Co-Pilot'),(3,1,103,'Flight Attendant'),
  (4,2,104,'Captain'),(5,2,105,'Co-Pilot'),(6,2,106,'Flight Attendant'),
  (7,3,107,'Captain'),(8,3,101,'Co-Pilot'),(9,3,108,'Flight Attendant'),
  (10,4,109,'Captain'),(11,4,110,'Co-Pilot'),(12,4,103,'Flight Attendant'),
  (13,5,104,'Captain'),(14,6,107,'Captain'),(15,6,111,'Co-Pilot'),
  (16,7,101,'Captain'),(17,7,112,'Co-Pilot'),(18,8,113,'Captain'),
  (19,9,104,'Captain'),(20,9,114,'Co-Pilot'),(21,10,109,'Captain'),
  (22,11,115,'Captain'),(23,12,107,'Captain'),(24,13,116,'Captain'),
  (25,14,104,'Captain'),(26,15,117,'Captain'),(27,16,101,'Captain'),
  (28,17,118,'Captain'),(29,18,109,'Captain'),(30,19,113,'Captain'),
  (31,20,107,'Captain');

INSERT INTO routes VALUES
  (1,1,2,5570,435),(2,2,1,5570,420),(3,3,5,5480,408),
  (4,5,6,5320,390),(5,4,8,9105,660),(6,9,1,6200,465),
  (7,7,5,6310,462),(8,11,1,11050,780),(9,1,13,1190,130),
  (10,8,1,2475,270),(11,2,3,5510,415),(12,3,7,11920,840),
  (13,5,11,4680,345),(14,4,2,346,55),(15,9,2,621,75),
  (16,1,14,2220,195),(17,2,10,357,50),(18,7,2,16993,1080),
  (19,11,3,9050,660),(20,8,15,3540,290);
