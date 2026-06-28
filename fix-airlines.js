import fs from 'fs';
import path from 'path';

const file = path.join('src/data/databases', 'airlines.sql');
let c = fs.readFileSync(file, 'utf-8');

// 1. Alter crew table
c = c.replace(/employee_id INTEGER,/g, 'employee_id INTEGER REFERENCES employees(employee_id),');

// 2. Add employees table BEFORE crew table
const employeesTable = `
CREATE TABLE IF NOT EXISTS employees (
  employee_id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT
);
`;
c = c.replace(/CREATE TABLE IF NOT EXISTS crew/, employeesTable + '\nCREATE TABLE IF NOT EXISTS crew');

// 3. Add seed data for employees (IDs 101 to 125) before INSERT INTO crew
const employeesSeed = `INSERT INTO employees VALUES
  (101,'John','Doe','Pilot'),(102,'Jane','Smith','Co-Pilot'),(103,'Alice','Johnson','Flight Attendant'),
  (104,'Bob','Brown','Pilot'),(105,'Charlie','Davis','Co-Pilot'),(106,'Diana','Evans','Flight Attendant'),
  (107,'Ethan','Ford','Pilot'),(108,'Fiona','Green','Flight Attendant'),(109,'George','Harris','Pilot'),
  (110,'Hannah','Irwin','Co-Pilot'),(111,'Ian','Jones','Co-Pilot'),(112,'Julia','King','Flight Attendant'),
  (113,'Kevin','Lee','Pilot'),(114,'Laura','Moore','Co-Pilot'),(115,'Michael','Nelson','Flight Attendant'),
  (116,'Nina','Owen','Flight Attendant'),(117,'Oscar','Perez','Pilot'),(118,'Paula','Quinn','Co-Pilot'),
  (119,'Rick','Ross','Flight Attendant'),(120,'Sarah','Stone','Flight Attendant'),
  (121,'Tom','Taylor','Pilot'),(122,'Uma','Upton','Co-Pilot'),(123,'Victor','Vance','Flight Attendant'),
  (124,'Wendy','White','Flight Attendant'),(125,'Xavier','Xiong','Pilot');
`;
c = c.replace(/INSERT INTO crew VALUES/, employeesSeed + '\nINSERT INTO crew VALUES');

fs.writeFileSync(file, c);
console.log('Fixed airlines.sql');
