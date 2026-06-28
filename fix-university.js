import fs from 'fs';
import path from 'path';

const file = path.join('src/data/databases', 'university.sql');
let c = fs.readFileSync(file, 'utf-8');

// 1. departments.head_professor_id
c = c.replace(/head_professor_id INTEGER/g, 'head_professor_id INTEGER REFERENCES professors(professor_id)');

// 2. classrooms - add department_id
c = c.replace(
  /CREATE TABLE IF NOT EXISTS classrooms \([\s\S]*?has_projector INTEGER DEFAULT 1\s*\);/,
  `CREATE TABLE IF NOT EXISTS classrooms (
  classroom_id  INTEGER PRIMARY KEY,
  building      TEXT,
  room_number   TEXT,
  capacity      INTEGER,
  has_projector INTEGER DEFAULT 1,
  department_id INTEGER REFERENCES departments(department_id)
);`
);

// update classrooms insert to include department_id (10 rows)
// The existing insert:
// INSERT INTO classrooms VALUES
//   (1,'Tech Hall','101',30,1),(2,'Tech Hall','102',40,1),
//   (3,'Science Building','201',50,1),(4,'Science Building','202',60,1),
//   (5,'Arts Building','301',35,0),(6,'Arts Building','302',45,1),
//   (7,'Life Sciences','401',55,1),(8,'Business School','501',80,1),
//   (9,'Tech Hall','103',25,1),(10,'Science Building','203',70,1);

// We will map building to department_id based on departments table:
// Tech Hall = 1 (Computer Science)
// Science Building = 2 (Math)
// Arts Building = 4 (English)
// Life Sciences = 6 (Biology)
// Business School = 8 (Business)

c = c.replace(
  /INSERT INTO classrooms VALUES\s*\([\s\S]*?;\s*/,
  `INSERT INTO classrooms VALUES
  (1,'Tech Hall','101',30,1,1),
  (2,'Tech Hall','102',40,1,1),
  (3,'Science Building','201',50,1,2),
  (4,'Science Building','202',60,1,2),
  (5,'Arts Building','301',35,0,4),
  (6,'Arts Building','302',45,1,4),
  (7,'Life Sciences','401',55,1,6),
  (8,'Business School','501',80,1,8),
  (9,'Tech Hall','103',25,1,1),
  (10,'Science Building','203',70,1,2);
`
);

fs.writeFileSync(file, c);
console.log('Fixed university.sql');
