-- ============================================================
-- DATABASE: University
-- Tables: 8 | Rows: ~400 total
-- ============================================================
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
  department_id    INTEGER PRIMARY KEY,
  name             TEXT NOT NULL,
  building         TEXT,
  head_professor_id INTEGER
);

CREATE TABLE IF NOT EXISTS professors (
  professor_id  INTEGER PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  department_id INTEGER REFERENCES departments(department_id),
  tenure        INTEGER DEFAULT 0,
  hired_at      DATE
);

CREATE TABLE IF NOT EXISTS students (
  student_id     INTEGER PRIMARY KEY,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT,
  dob            DATE,
  major          TEXT,
  advisor_id     INTEGER REFERENCES professors(professor_id),
  enrolled_since DATE
);

CREATE TABLE IF NOT EXISTS semesters (
  semester_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  start_date  DATE,
  end_date    DATE,
  is_current  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS courses (
  course_id       INTEGER PRIMARY KEY,
  title           TEXT NOT NULL,
  credit_hours    INTEGER DEFAULT 3,
  department_id   INTEGER REFERENCES departments(department_id),
  prereq_course_id INTEGER REFERENCES courses(course_id)
);

CREATE TABLE IF NOT EXISTS classrooms (
  classroom_id  INTEGER PRIMARY KEY,
  building      TEXT,
  room_number   TEXT,
  capacity      INTEGER,
  has_projector INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id INTEGER PRIMARY KEY,
  student_id    INTEGER NOT NULL REFERENCES students(student_id),
  course_id     INTEGER NOT NULL REFERENCES courses(course_id),
  semester_id   INTEGER NOT NULL REFERENCES semesters(semester_id),
  section       TEXT DEFAULT 'A'
);

CREATE TABLE IF NOT EXISTS grades (
  grade_id       INTEGER PRIMARY KEY,
  enrollment_id  INTEGER NOT NULL REFERENCES enrollments(enrollment_id),
  midterm_score  REAL,
  final_score    REAL,
  letter_grade   TEXT CHECK(letter_grade IN ('A','B','C','D','F'))
);

-- SEED
INSERT INTO departments VALUES
  (1,'Computer Science','Tech Hall',NULL),
  (2,'Mathematics','Science Building',NULL),
  (3,'Physics','Science Building',NULL),
  (4,'English','Arts Building',NULL),
  (5,'History','Arts Building',NULL),
  (6,'Biology','Life Sciences',NULL),
  (7,'Chemistry','Life Sciences',NULL),
  (8,'Business','Business School',NULL);

INSERT INTO professors VALUES
  (1,'Alice','Chen','a.chen@uni.edu',1,1,'2010-08-15'),
  (2,'Bob','Kumar','b.kumar@uni.edu',1,1,'2008-09-01'),
  (3,'Carol','Smith','c.smith@uni.edu',2,1,'2012-01-10'),
  (4,'David','Jones','d.jones@uni.edu',3,0,'2015-08-20'),
  (5,'Eva','Williams','e.williams@uni.edu',4,1,'2005-09-01'),
  (6,'Frank','Brown','f.brown@uni.edu',5,1,'2007-08-15'),
  (7,'Grace','Davis','g.davis@uni.edu',6,0,'2018-01-05'),
  (8,'Henry','Miller','h.miller@uni.edu',7,1,'2009-09-01'),
  (9,'Iris','Wilson','i.wilson@uni.edu',8,1,'2011-08-20'),
  (10,'James','Moore','j.moore@uni.edu',1,0,'2019-01-15'),
  (11,'Karen','Taylor','k.taylor@uni.edu',2,1,'2006-09-01'),
  (12,'Leo','Anderson','l.anderson@uni.edu',3,0,'2017-08-15'),
  (13,'Maya','Thomas','m.thomas@uni.edu',4,1,'2004-09-01'),
  (14,'Nick','Jackson','n.jackson@uni.edu',5,0,'2020-01-10'),
  (15,'Olivia','White','o.white@uni.edu',6,1,'2013-08-20');

UPDATE departments SET head_professor_id=1 WHERE department_id=1;
UPDATE departments SET head_professor_id=3 WHERE department_id=2;
UPDATE departments SET head_professor_id=4 WHERE department_id=3;
UPDATE departments SET head_professor_id=5 WHERE department_id=4;
UPDATE departments SET head_professor_id=6 WHERE department_id=5;
UPDATE departments SET head_professor_id=7 WHERE department_id=6;
UPDATE departments SET head_professor_id=8 WHERE department_id=7;
UPDATE departments SET head_professor_id=9 WHERE department_id=8;

INSERT INTO semesters VALUES
  (1,'Fall 2022','2022-09-01','2022-12-15',0),
  (2,'Spring 2023','2023-01-15','2023-05-10',0),
  (3,'Fall 2023','2023-09-01','2023-12-15',0),
  (4,'Spring 2024','2024-01-15','2024-05-10',0),
  (5,'Fall 2024','2024-09-01','2024-12-15',1),
  (6,'Summer 2023','2023-06-01','2023-08-15',0);

INSERT INTO courses VALUES
  (1,'Introduction to Programming',3,1,NULL),
  (2,'Data Structures',3,1,1),
  (3,'Algorithms',4,1,2),
  (4,'Database Systems',3,1,2),
  (5,'Calculus I',4,2,NULL),
  (6,'Calculus II',4,2,5),
  (7,'Linear Algebra',3,2,5),
  (8,'Classical Mechanics',4,3,5),
  (9,'English Composition',3,4,NULL),
  (10,'World Literature',3,4,9),
  (11,'American History',3,5,NULL),
  (12,'World History',3,5,NULL),
  (13,'Cell Biology',4,6,NULL),
  (14,'Genetics',4,6,13),
  (15,'Organic Chemistry',4,7,NULL),
  (16,'Advanced SQL',3,1,4),
  (17,'Machine Learning',3,1,3),
  (18,'Statistics',3,2,6),
  (19,'Business Analytics',3,8,18),
  (20,'Marketing',3,8,NULL);

INSERT INTO classrooms VALUES
  (1,'Tech Hall','101',30,1),(2,'Tech Hall','102',40,1),
  (3,'Science Building','201',50,1),(4,'Science Building','202',60,1),
  (5,'Arts Building','301',35,0),(6,'Arts Building','302',45,1),
  (7,'Life Sciences','401',55,1),(8,'Business School','501',80,1),
  (9,'Tech Hall','103',25,1),(10,'Science Building','203',70,1);

INSERT INTO students VALUES
  (1,'Emma','Wilson','e.wilson@student.edu','2001-03-15','Computer Science',1,'2022-09-01'),
  (2,'Liam','Johnson','l.johnson@student.edu','2000-07-22','Mathematics',3,'2021-09-01'),
  (3,'Olivia','Brown','o.brown@student.edu','2002-01-10','Biology',7,'2022-09-01'),
  (4,'Noah','Davis','n.davis@student.edu','2001-11-05','Business',9,'2022-09-01'),
  (5,'Ava','Garcia','a.garcia@student.edu','2000-05-18','Computer Science',1,'2021-09-01'),
  (6,'William','Martinez','w.martinez@student.edu','2002-09-30','History',6,'2023-01-15'),
  (7,'Sophia','Hernandez','s.hernandez@student.edu','2001-04-12','English',5,'2022-09-01'),
  (8,'James','Lopez','j.lopez@student.edu','1999-12-03','Physics',4,'2020-09-01'),
  (9,'Isabella','Gonzalez','i.gonzalez@student.edu','2002-06-25','Chemistry',8,'2022-09-01'),
  (10,'Oliver','Wilson','o.wilson2@student.edu','2001-08-14','Computer Science',2,'2022-09-01'),
  (11,'Mia','Anderson','m.anderson@student.edu','2000-02-28','Mathematics',11,'2021-09-01'),
  (12,'Elijah','Thomas','e.thomas@student.edu','2002-10-17','Biology',NULL,'2023-01-15'),
  (13,'Charlotte','Taylor','c.taylor@student.edu','2001-06-09','Business',9,'2022-09-01'),
  (14,'Aiden','Moore','a.moore@student.edu','1999-03-20','Computer Science',1,'2020-09-01'),
  (15,'Amelia','Jackson','a.jackson@student.edu','2002-12-01','English',5,'2023-01-15'),
  (16,'Lucas','White','l.white@student.edu','2001-07-15','Physics',4,'2022-09-01'),
  (17,'Harper','Harris','h.harris@student.edu','2000-04-08','Mathematics',3,'2021-09-01'),
  (18,'Mason','Martin','m.martin@student.edu','2002-02-22','Chemistry',8,'2023-01-15'),
  (19,'Evelyn','Garcia','e.garcia@student.edu','2001-09-13','History',6,'2022-09-01'),
  (20,'Logan','Davis','l.davis@student.edu','1999-05-30','Computer Science',2,'2020-09-01'),
  (21,'Abigail','Rodriguez','a.rodriguez@student.edu','2002-11-25','Biology',7,'2023-01-15'),
  (22,'Ethan','Lee','e.lee@student.edu','2000-08-19','Business',9,'2021-09-01'),
  (23,'Emily','Walker','e.walker@student.edu','2001-03-04','Computer Science',1,'2022-09-01'),
  (24,'Alexander','Hall','a.hall@student.edu','2002-07-16','Mathematics',11,'2023-01-15'),
  (25,'Madison','Allen','m.allen@student.edu','2000-01-11','English',5,'2021-09-01');

INSERT INTO enrollments VALUES
  (1,1,1,1,'A'),(2,1,5,1,'B'),(3,1,9,1,'A'),
  (4,2,5,1,'A'),(5,2,6,2,'A'),(6,2,7,2,'B'),
  (7,3,13,1,'A'),(8,3,15,2,'B'),(9,3,14,3,'A'),
  (10,4,19,1,'A'),(11,4,20,2,'A'),(12,4,9,3,'B'),
  (13,5,1,1,'B'),(14,5,2,2,'A'),(15,5,3,3,'A'),
  (16,5,4,4,'A'),(17,6,11,2,'A'),(18,6,12,3,'B'),
  (19,7,9,1,'A'),(20,7,10,2,'B'),(21,7,5,3,'C'),
  (22,8,8,1,'A'),(23,8,5,2,'B'),(24,8,6,3,'A'),
  (25,9,15,1,'A'),(26,9,13,2,'B'),(27,9,14,4,'A'),
  (28,10,1,1,'C'),(29,10,2,2,'B'),(30,10,4,3,'A'),
  (31,11,5,1,'A'),(32,11,6,2,'A'),(33,11,7,3,'A'),
  (34,12,13,2,'B'),(35,12,14,3,'A'),(36,13,19,2,'B'),
  (37,13,20,3,'A'),(38,14,1,1,'A'),(39,14,2,2,'A'),
  (40,14,3,3,'A'),(41,14,4,4,'A'),(42,14,16,5,'A'),
  (43,15,9,2,'A'),(44,15,10,3,'B'),(45,16,8,1,'B'),
  (46,16,5,2,'A'),(47,17,5,1,'A'),(48,17,6,2,'A'),
  (49,18,15,2,'A'),(50,19,11,1,'A'),(51,19,12,2,'B'),
  (52,20,1,1,'B'),(53,20,2,2,'A'),(54,20,3,3,'B'),
  (55,20,4,4,'A'),(56,21,13,2,'A'),(57,22,19,1,'B'),
  (58,22,20,2,'A'),(59,23,1,2,'A'),(60,23,2,3,'A'),
  (61,24,5,3,'B'),(62,24,6,4,'A'),(63,25,9,2,'A');

INSERT INTO grades VALUES
  (1,1,85,88,'A'),(2,2,72,75,'B'),(3,3,90,92,'A'),
  (4,4,88,91,'A'),(5,5,92,95,'A'),(6,6,85,82,'B'),
  (7,7,78,80,'B'),(8,8,70,73,'C'),(9,9,88,90,'A'),
  (10,10,75,78,'B'),(11,11,82,85,'A'),(12,12,68,70,'C'),
  (13,13,79,81,'B'),(14,14,91,93,'A'),(15,15,95,97,'A'),
  (16,16,88,90,'A'),(17,17,74,76,'B'),(18,18,81,83,'B'),
  (19,19,87,89,'A'),(20,20,72,74,'C'),(21,21,65,67,'D'),
  (22,22,83,85,'A'),(23,23,77,79,'B'),(24,24,90,92,'A'),
  (25,25,82,84,'A'),(26,26,75,77,'B'),(27,27,91,93,'A'),
  (28,28,60,62,'D'),(29,29,73,75,'B'),(30,30,85,88,'A'),
  (31,31,90,92,'A'),(32,32,88,90,'A'),(33,33,86,88,'A'),
  (34,34,79,81,'B'),(35,35,84,86,'A'),(36,36,71,73,'C'),
  (37,37,85,87,'A'),(38,38,93,95,'A'),(39,39,90,92,'A'),
  (40,40,88,90,'A'),(41,41,92,94,'A'),(42,42,95,97,'A'),
  (43,43,88,90,'A'),(44,44,75,77,'B'),(45,45,76,78,'B'),
  (46,46,89,91,'A'),(47,47,92,94,'A'),(48,48,88,90,'A'),
  (49,49,81,83,'B'),(50,50,77,79,'B'),(51,51,83,85,'A'),
  (52,52,71,73,'C'),(53,53,84,86,'A'),(54,54,78,80,'B'),
  (55,55,89,91,'A'),(56,56,86,88,'A'),(57,57,73,75,'B'),
  (58,58,88,90,'A'),(59,59,91,93,'A'),(60,60,93,95,'A'),
  (61,61,82,84,'A'),(62,62,90,92,'A'),(63,63,87,89,'A');
