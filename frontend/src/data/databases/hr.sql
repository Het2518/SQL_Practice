-- DATABASE: HR / Employees | 6 tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
  department_id INTEGER PRIMARY KEY, name TEXT, location TEXT, budget REAL
);
CREATE TABLE IF NOT EXISTS employees (
  employee_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT,
  department_id INTEGER REFERENCES departments(department_id),
  job_title TEXT, salary REAL, hire_date DATE,
  manager_id INTEGER REFERENCES employees(employee_id)
);
CREATE TABLE IF NOT EXISTS salaries (
  salary_id INTEGER PRIMARY KEY, employee_id INTEGER REFERENCES employees(employee_id),
  amount REAL, effective_from DATE, effective_to DATE
);
CREATE TABLE IF NOT EXISTS performance_reviews (
  review_id INTEGER PRIMARY KEY, employee_id INTEGER REFERENCES employees(employee_id),
  review_date DATE, score INTEGER CHECK(score BETWEEN 1 AND 5),
  reviewer_id INTEGER REFERENCES employees(employee_id)
);
CREATE TABLE IF NOT EXISTS leaves (
  leave_id INTEGER PRIMARY KEY, employee_id INTEGER REFERENCES employees(employee_id),
  type TEXT CHECK(type IN ('Annual','Sick','Maternity','Paternity','Unpaid')),
  start_date DATE, end_date DATE, approved INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS job_history (
  history_id INTEGER PRIMARY KEY, employee_id INTEGER REFERENCES employees(employee_id),
  department_id INTEGER REFERENCES departments(department_id),
  job_title TEXT, start_date DATE, end_date DATE
);

INSERT INTO departments VALUES
  (1,'Engineering','New York',2000000),(2,'Sales','Chicago',1500000),
  (3,'Marketing','Los Angeles',800000),(4,'Finance','New York',1200000),
  (5,'HR','New York',600000),(6,'Operations','Dallas',900000),
  (7,'Legal','New York',700000),(8,'Customer Support','Phoenix',500000),
  (9,'Product','San Francisco',1800000),(10,'Data Science','New York',1100000);

INSERT INTO employees VALUES
  (1,'James','Wilson','j.wilson@corp.com',1,'VP Engineering',150000,'2015-03-01',NULL),
  (2,'Sarah','Johnson','s.johnson@corp.com',1,'Senior Engineer',120000,'2017-06-15',1),
  (3,'Mike','Brown','m.brown@corp.com',1,'Engineer',85000,'2019-09-10',2),
  (4,'Emily','Davis','e.davis@corp.com',1,'Engineer',88000,'2020-01-05',2),
  (5,'Robert','Smith','r.smith@corp.com',2,'VP Sales',140000,'2016-04-20',NULL),
  (6,'Linda','Williams','l.williams@corp.com',2,'Sales Manager',95000,'2018-02-14',5),
  (7,'David','Jones','d.jones@corp.com',2,'Sales Rep',70000,'2020-07-01',6),
  (8,'Susan','Garcia','s.garcia@corp.com',2,'Sales Rep',68000,'2021-03-15',6),
  (9,'Charles','Miller','c.miller@corp.com',3,'Marketing Director',110000,'2017-08-20',NULL),
  (10,'Karen','Wilson','k.wilson@corp.com',3,'Marketing Manager',85000,'2019-11-01',9),
  (11,'Michael','Moore','m.moore@corp.com',4,'CFO',180000,'2014-05-10',NULL),
  (12,'Jessica','Taylor','j.taylor@corp.com',4,'Finance Manager',100000,'2018-09-01',11),
  (13,'Richard','Anderson','r.anderson@corp.com',4,'Analyst',72000,'2021-06-15',12),
  (14,'Barbara','Thomas','b.thomas@corp.com',5,'HR Director',105000,'2016-01-15',NULL),
  (15,'William','Jackson','w.jackson@corp.com',5,'HR Manager',80000,'2019-04-01',14),
  (16,'Patricia','White','p.white@corp.com',6,'Operations Manager',90000,'2017-10-20',NULL),
  (17,'Mark','Harris','m.harris@corp.com',6,'Operations Lead',75000,'2020-02-28',16),
  (18,'Helen','Martin','h.martin@corp.com',7,'General Counsel',130000,'2016-07-01',NULL),
  (19,'Donald','Thompson','d.thompson@corp.com',8,'Support Manager',70000,'2018-12-10',NULL),
  (20,'Lisa','Garcia','l.garcia@corp.com',9,'VP Product',145000,'2015-11-05',NULL),
  (21,'Kevin','Lee','k.lee@corp.com',9,'Product Manager',105000,'2018-08-01',20),
  (22,'Nancy','Walker','n.walker@corp.com',10,'Head of Data Science',125000,'2017-03-15',NULL),
  (23,'Matthew','Hall','m.hall@corp.com',10,'Data Scientist',98000,'2019-07-10',22),
  (24,'Betty','Allen','b.allen@corp.com',10,'Data Scientist',95000,'2020-05-20',22),
  (25,'George','Young','g.young@corp.com',1,'Junior Engineer',75000,'2022-01-10',3);

INSERT INTO salaries VALUES
  (1,1,130000,'2015-03-01','2018-12-31'),(2,1,145000,'2019-01-01','2021-12-31'),
  (3,1,150000,'2022-01-01',NULL),(4,2,100000,'2017-06-15','2019-12-31'),
  (5,2,115000,'2020-01-01','2022-12-31'),(6,2,120000,'2023-01-01',NULL),
  (7,3,75000,'2019-09-10','2021-12-31'),(8,3,85000,'2022-01-01',NULL),
  (9,5,125000,'2016-04-20','2019-12-31'),(10,5,140000,'2020-01-01',NULL),
  (11,11,160000,'2014-05-10','2019-12-31'),(12,11,180000,'2020-01-01',NULL),
  (13,22,110000,'2017-03-15','2021-12-31'),(14,22,125000,'2022-01-01',NULL);

INSERT INTO performance_reviews VALUES
  (1,3,'2020-12-15',4,2),(2,3,'2021-12-15',4,2),(3,3,'2022-12-15',5,2),
  (4,4,'2021-12-15',3,2),(5,4,'2022-12-15',4,2),(6,4,'2023-12-15',4,2),
  (7,7,'2021-12-15',4,6),(8,7,'2022-12-15',3,6),(9,7,'2023-12-15',5,6),
  (10,8,'2022-12-15',4,6),(11,8,'2023-12-15',4,6),
  (12,2,'2020-12-15',5,1),(13,2,'2021-12-15',5,1),(14,2,'2022-12-15',5,1),
  (15,23,'2020-12-15',4,22),(16,23,'2021-12-15',4,22),(17,23,'2022-12-15',5,22),
  (18,24,'2021-12-15',3,22),(19,24,'2022-12-15',4,22),(20,24,'2023-12-15',4,22),
  (21,13,'2022-12-15',3,12),(22,13,'2023-12-15',4,12),(23,25,'2023-12-15',3,3);

INSERT INTO leaves VALUES
  (1,3,'Annual','2022-07-01','2022-07-14',1),(2,3,'Sick','2021-03-10','2021-03-12',1),
  (3,4,'Maternity','2022-03-01','2022-05-31',1),(4,7,'Annual','2022-08-01','2022-08-07',1),
  (5,8,'Sick','2023-01-15','2023-01-16',1),(6,2,'Annual','2021-12-27','2022-01-07',1),
  (7,23,'Sick','2022-11-01','2022-11-03',1),(8,24,'Annual','2022-06-15','2022-06-28',1),
  (9,13,'Unpaid','2023-05-01','2023-05-05',1),(10,25,'Sick','2023-02-20','2023-02-21',1);

INSERT INTO job_history VALUES
  (1,2,1,'Junior Engineer','2017-06-15','2019-12-31'),
  (2,2,1,'Senior Engineer','2020-01-01',NULL),
  (3,7,2,'Junior Sales Rep','2020-07-01','2021-12-31'),
  (4,7,2,'Sales Rep','2022-01-01',NULL),
  (5,1,9,'Senior Engineer','2013-01-01','2015-02-28'),
  (6,1,1,'VP Engineering','2015-03-01',NULL),
  (7,11,4,'Finance Director','2014-05-10','2019-12-31'),
  (8,11,4,'CFO','2020-01-01',NULL),
  (9,5,2,'Sales Manager','2014-01-01','2016-04-19'),
  (10,5,2,'VP Sales','2016-04-20',NULL);
