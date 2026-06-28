const fs = require('fs');

async function testJoins() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  db.run(`
    CREATE TABLE t1 (id INT, val1 TEXT);
    CREATE TABLE t2 (id INT, val2 TEXT);
    INSERT INTO t1 VALUES (1, 'A'), (2, 'B');
    INSERT INTO t2 VALUES (2, 'X'), (3, 'Y');
  `);
  
  console.log("---- INNER JOIN ----");
  const resInner = db.exec(`SELECT * FROM t1 JOIN t2 ON t1.id = t2.id`);
  console.log(JSON.stringify(resInner, null, 2));

  console.log("---- LEFT JOIN ----");
  const resLeft = db.exec(`SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id`);
  console.log(JSON.stringify(resLeft, null, 2));
  
  console.log("---- RIGHT JOIN ----");
  try {
    const resRight = db.exec(`SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.id`);
    console.log(JSON.stringify(resRight, null, 2));
  } catch (err) {
    console.error("RIGHT JOIN FAILED:", err.message);
  }
  
  console.log("---- FULL OUTER JOIN ----");
  try {
    const resFull = db.exec(`SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.id = t2.id`);
    console.log(JSON.stringify(resFull, null, 2));
  } catch (err) {
    console.error("FULL OUTER JOIN FAILED:", err.message);
  }
}

testJoins();
