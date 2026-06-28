-- DATABASE: Banking | 8 tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS branches (
  branch_id INTEGER PRIMARY KEY, name TEXT, city TEXT, country TEXT, manager_employee_id INTEGER
);
CREATE TABLE IF NOT EXISTS customers (
  customer_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT,
  phone TEXT, dob DATE, national_id TEXT
);
CREATE TABLE IF NOT EXISTS employees (
  employee_id INTEGER PRIMARY KEY, branch_id INTEGER REFERENCES branches(branch_id),
  first_name TEXT, last_name TEXT, role TEXT, salary REAL, hired_at DATE,
  manager_id INTEGER REFERENCES employees(employee_id)
);
CREATE TABLE IF NOT EXISTS accounts (
  account_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id),
  branch_id INTEGER REFERENCES branches(branch_id), type TEXT, balance REAL,
  opened_at DATE, overdraft_limit REAL DEFAULT 0, is_active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS transactions (
  txn_id INTEGER PRIMARY KEY, account_id INTEGER REFERENCES accounts(account_id),
  type TEXT CHECK(type IN ('Deposit','Withdrawal','Transfer','Payment','Fee')),
  amount REAL, description TEXT, txn_date DATETIME, processed_by INTEGER
);
CREATE TABLE IF NOT EXISTS loans (
  loan_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id),
  branch_id INTEGER REFERENCES branches(branch_id), principal REAL, interest_rate REAL,
  term_months INTEGER, disbursed_at DATE, status TEXT
);
CREATE TABLE IF NOT EXISTS loan_payments (
  payment_id INTEGER PRIMARY KEY, loan_id INTEGER REFERENCES loans(loan_id),
  amount REAL, paid_at DATE, method TEXT, is_late INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS interest_rates (
  rate_id INTEGER PRIMARY KEY, account_type TEXT, annual_rate REAL,
  effective_from DATE, effective_to DATE
);

INSERT INTO branches VALUES
  (1,'Downtown Branch','New York','USA',NULL),
  (2,'Midtown Branch','New York','USA',NULL),
  (3,'London City Branch','London','UK',NULL),
  (4,'Toronto Main','Toronto','Canada',NULL),
  (5,'LA Branch','Los Angeles','USA',NULL);

INSERT INTO employees VALUES
  (1,1,'John','Anderson','Branch Manager',95000,'2010-03-15',NULL),
  (2,1,'Sarah','Williams','Loans Officer',62000,'2015-06-01',1),
  (3,1,'Mike','Johnson','Teller',45000,'2018-09-10',1),
  (4,2,'Emily','Brown','Branch Manager',92000,'2012-07-20',NULL),
  (5,2,'Chris','Davis','Loans Officer',60000,'2016-04-15',4),
  (6,2,'Amanda','Wilson','Teller',44000,'2019-02-28',4),
  (7,3,'James','Taylor','Branch Manager',88000,'2011-05-10',NULL),
  (8,3,'Laura','Moore','Loans Officer',58000,'2017-08-20',7),
  (9,4,'Robert','Garcia','Branch Manager',90000,'2013-11-05',NULL),
  (10,4,'Lisa','Martinez','Teller',43000,'2020-01-15',9),
  (11,5,'David','Harris','Branch Manager',91000,'2014-04-22',NULL),
  (12,5,'Susan','Thompson','Loans Officer',61000,'2016-07-10',11);

UPDATE branches SET manager_employee_id=1 WHERE branch_id=1;
UPDATE branches SET manager_employee_id=4 WHERE branch_id=2;
UPDATE branches SET manager_employee_id=7 WHERE branch_id=3;
UPDATE branches SET manager_employee_id=9 WHERE branch_id=4;
UPDATE branches SET manager_employee_id=11 WHERE branch_id=5;

INSERT INTO customers VALUES
  (1,'Alice','Smith','alice@email.com','+1-555-1001','1985-04-12','SSN001'),
  (2,'Bob','Johnson','bob@email.com',NULL,'1978-09-22','SSN002'),
  (3,'Carol','Williams','carol@email.com','+1-555-1003','1992-01-30','SSN003'),
  (4,'David','Brown','david@email.com','+44-20-1004','1965-07-15','SSN004'),
  (5,'Emma','Davis','emma@email.com',NULL,'1988-11-08','SSN005'),
  (6,'Frank','Jones','frank@email.com','+1-555-1006','1975-03-25','SSN006'),
  (7,'Grace','Garcia','grace@email.com','+1-555-1007','1995-06-14','SSN007'),
  (8,'Henry','Wilson','henry@email.com',NULL,'1960-12-03','SSN008'),
  (9,'Iris','Martinez','iris@email.com','+1-555-1009','1983-08-19','SSN009'),
  (10,'Jack','Taylor','jack@email.com','+1-555-1010','1970-02-28','SSN010'),
  (11,'Karen','Lee','karen@email.com','+1-555-1011','1990-05-07','SSN011'),
  (12,'Leo','Harris','leo@email.com',NULL,'1955-10-16','SSN012'),
  (13,'Mia','White','mia@email.com','+1-555-1013','1998-03-04','SSN013'),
  (14,'Nathan','Clark','nathan@email.com','+1-555-1014','1972-07-21','SSN014'),
  (15,'Olivia','Hall','olivia@email.com',NULL,'1987-11-10','SSN015'),
  (16,'Paul','Young','paul@email.com','+1-555-1016','1963-04-28','SSN016'),
  (17,'Quinn','Allen','quinn@email.com','+1-555-1017','1991-08-17','SSN017'),
  (18,'Rose','Hernandez','rose@email.com',NULL,'1979-01-06','SSN018'),
  (19,'Sam','King','sam@email.com','+1-555-1019','1984-05-23','SSN019'),
  (20,'Tina','Wright','tina@email.com','+1-555-1020','1969-09-12','SSN020');

INSERT INTO accounts VALUES
  (1,1,1,'Savings',15000.00,'2020-01-15',500,1),
  (2,1,1,'Checking',3200.00,'2020-01-15',1000,1),
  (3,2,2,'Savings',42000.00,'2018-06-10',0,1),
  (4,3,1,'Savings',8500.00,'2021-03-22',0,1),
  (5,4,3,'Savings',125000.00,'2015-11-05',2000,1),
  (6,5,2,'Checking',2100.00,'2022-07-18',500,1),
  (7,6,1,'Savings',67000.00,'2017-04-30',0,1),
  (8,7,4,'Savings',4200.00,'2023-01-10',0,1),
  (9,8,2,'Savings',0.00,'2010-08-25',0,0),
  (10,9,1,'Checking',11500.00,'2019-12-01',1000,1),
  (11,10,3,'Savings',89000.00,'2016-03-15',0,1),
  (12,11,5,'Checking',5600.00,'2022-09-20',500,1),
  (13,12,2,'Savings',234000.00,'2008-05-12',5000,1),
  (14,13,4,'Savings',1200.00,'2023-06-05',0,1),
  (15,14,1,'Savings',35000.00,'2018-10-18',1000,1),
  (16,15,5,'Checking',7800.00,'2021-02-28',500,1),
  (17,2,2,'Checking',6400.00,'2018-06-10',500,1),
  (18,5,3,'Savings',15600.00,'2022-07-18',0,1),
  (19,6,1,'Checking',4300.00,'2017-04-30',500,1),
  (20,9,5,'Savings',22000.00,'2019-12-01',0,1);

INSERT INTO transactions VALUES
  (1,1,'Deposit',5000.00,'Initial deposit','2020-01-15 09:00:00',3),
  (2,1,'Withdrawal',500.00,'ATM','2020-02-01 14:30:00',NULL),
  (3,1,'Deposit',2000.00,'Salary','2020-03-01 09:00:00',NULL),
  (4,2,'Deposit',3000.00,'Transfer in','2020-01-15 09:00:00',3),
  (5,2,'Payment',150.00,'Utility bill','2020-02-15 12:00:00',NULL),
  (6,3,'Deposit',10000.00,'Initial deposit','2018-06-10 10:00:00',6),
  (7,3,'Deposit',5000.00,'Monthly savings','2018-07-01 09:00:00',NULL),
  (8,3,'Withdrawal',1000.00,'Home repair','2018-08-15 14:00:00',NULL),
  (9,4,'Deposit',8000.00,'Initial deposit','2021-03-22 09:00:00',3),
  (10,4,'Withdrawal',200.00,'ATM','2021-04-10 16:00:00',NULL),
  (11,5,'Deposit',50000.00,'Property sale','2015-11-05 10:00:00',8),
  (12,5,'Withdrawal',5000.00,'Renovation','2016-01-20 11:00:00',NULL),
  (13,6,'Deposit',2000.00,'Initial deposit','2022-07-18 09:00:00',6),
  (14,6,'Withdrawal',100.00,'ATM','2022-08-01 15:00:00',NULL),
  (15,7,'Deposit',20000.00,'Bonus','2017-04-30 10:00:00',3),
  (16,7,'Deposit',5000.00,'Monthly savings','2017-05-30 09:00:00',NULL),
  (17,7,'Withdrawal',2000.00,'Vacation','2017-07-15 14:00:00',NULL),
  (18,10,'Deposit',10000.00,'Salary','2019-12-01 09:00:00',3),
  (19,10,'Withdrawal',500.00,'Shopping','2019-12-20 13:00:00',NULL),
  (20,10,'Deposit',5000.00,'Bonus','2020-01-15 09:00:00',NULL),
  (21,11,'Deposit',30000.00,'Investment return','2016-03-15 10:00:00',8),
  (22,11,'Withdrawal',5000.00,'Car payment','2016-06-01 11:00:00',NULL),
  (23,13,'Deposit',100000.00,'Inheritance','2008-05-12 10:00:00',6),
  (24,13,'Withdrawal',10000.00,'Real estate','2009-02-20 09:00:00',NULL),
  (25,1,'Deposit',3000.00,'Salary','2024-01-01 09:00:00',NULL),
  (26,1,'Withdrawal',200.00,'ATM','2024-01-15 14:00:00',NULL),
  (27,2,'Deposit',2500.00,'Transfer','2024-01-05 09:00:00',NULL),
  (28,10,'Withdrawal',11000.00,'Large transfer','2024-01-10 10:00:00',3),
  (29,10,'Withdrawal',1200.00,'Large transfer 2','2024-01-10 10:05:00',3),
  (30,10,'Deposit',12000.00,'Return','2024-01-10 10:10:00',3);

INSERT INTO loans VALUES
  (1,1,1,25000.00,5.5,60,'2021-03-01','Active'),
  (2,3,1,15000.00,6.0,48,'2022-01-15','Active'),
  (3,5,3,150000.00,3.8,360,'2016-06-01','Active'),
  (4,6,2,8000.00,7.5,24,'2023-05-01','Active'),
  (5,8,2,30000.00,5.0,84,'2015-09-01','Paid Off'),
  (6,10,1,20000.00,6.5,60,'2022-08-01','Active'),
  (7,12,3,50000.00,4.5,120,'2014-02-01','Active'),
  (8,14,1,10000.00,8.0,36,'2023-10-01','Defaulted'),
  (9,15,5,200000.00,3.5,360,'2021-07-01','Active'),
  (10,2,2,35000.00,5.8,72,'2020-04-01','Active');

INSERT INTO loan_payments VALUES
  (1,1,500.00,'2021-04-01','Bank Transfer',0),
  (2,1,500.00,'2021-05-01','Bank Transfer',0),
  (3,1,500.00,'2021-06-01','Bank Transfer',0),
  (4,2,380.00,'2022-02-15','Direct Debit',0),
  (5,2,380.00,'2022-03-15','Direct Debit',0),
  (6,3,850.00,'2016-07-01','Bank Transfer',0),
  (7,3,850.00,'2016-08-01','Bank Transfer',0),
  (8,3,850.00,'2016-09-01','Bank Transfer',0),
  (9,4,400.00,'2023-06-01','Direct Debit',0),
  (10,4,400.00,'2023-07-15','Direct Debit',1),
  (11,5,500.00,'2015-10-01','Bank Transfer',0),
  (12,6,420.00,'2022-09-01','Direct Debit',0),
  (13,6,420.00,'2022-10-01','Direct Debit',0),
  (14,7,580.00,'2014-03-01','Bank Transfer',0),
  (15,8,380.00,'2023-11-01','Direct Debit',0),
  (16,8,380.00,NULL,'Direct Debit',1),
  (17,9,1100.00,'2021-08-01','Bank Transfer',0),
  (18,9,1100.00,'2021-09-01','Bank Transfer',0),
  (19,10,620.00,'2020-05-01','Direct Debit',0),
  (20,10,620.00,'2020-06-01','Direct Debit',0);

INSERT INTO interest_rates VALUES
  (1,'Savings',2.5,'2020-01-01',NULL),
  (2,'Checking',0.5,'2020-01-01',NULL),
  (3,'Savings',2.0,'2018-01-01','2019-12-31'),
  (4,'Checking',0.25,'2018-01-01','2019-12-31'),
  (5,'Savings',3.0,'2023-01-01',NULL),
  (6,'Fixed Deposit',4.5,'2020-01-01',NULL);
