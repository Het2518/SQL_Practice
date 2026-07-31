-- DATABASE: Library | 6 tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS branches (
  branch_id INTEGER PRIMARY KEY, name TEXT, location TEXT
);
CREATE TABLE IF NOT EXISTS authors (
  author_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT,
  nationality TEXT, birth_year INTEGER
);
CREATE TABLE IF NOT EXISTS books (
  book_id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(author_id),
  isbn TEXT, genre TEXT, published_year INTEGER, pages INTEGER
);
CREATE TABLE IF NOT EXISTS members (
  member_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT,
  joined_date DATE, branch_id INTEGER REFERENCES branches(branch_id)
);
CREATE TABLE IF NOT EXISTS loans (
  loan_id INTEGER PRIMARY KEY, book_id INTEGER REFERENCES books(book_id),
  member_id INTEGER REFERENCES members(member_id),
  loan_date DATE, due_date DATE, return_date DATE
);
CREATE TABLE IF NOT EXISTS fines (
  fine_id INTEGER PRIMARY KEY, loan_id INTEGER REFERENCES loans(loan_id),
  amount REAL, paid_date DATE
);

INSERT INTO branches VALUES
  (1,'Central Library','123 Main St'),
  (2,'North Branch','456 Oak Ave'),
  (3,'South Branch','789 Pine Rd'),
  (4,'East Branch','321 Elm St'),
  (5,'West Branch','654 Maple Dr');

INSERT INTO authors VALUES
  (1,'George','Orwell','British',1903),(2,'Jane','Austen','British',1775),
  (3,'Fyodor','Dostoevsky','Russian',1821),(4,'Ernest','Hemingway','American',1899),
  (5,'Virginia','Woolf','British',1882),(6,'James','Joyce','Irish',1882),
  (7,'Franz','Kafka','Czech',1883),(8,'Leo','Tolstoy','Russian',1828),
  (9,'Gabriel','Garcia Marquez','Colombian',1927),(10,'Toni','Morrison','American',1931),
  (11,'F. Scott','Fitzgerald','American',1896),(12,'Albert','Camus','French',1913),
  (13,'J.R.R.','Tolkien','British',1892),(14,'J.K.','Rowling','British',1965),
  (15,'Agatha','Christie','British',1890);

INSERT INTO books VALUES
  (1,'1984',1,'978-0451524935','Dystopian',1949,328),
  (2,'Animal Farm',1,'978-0451526342','Satire',1945,112),
  (3,'Pride and Prejudice',2,'978-0141439518','Romance',1813,432),
  (4,'Sense and Sensibility',2,'978-0141439662','Romance',1811,370),
  (5,'Crime and Punishment',3,'978-0486415871','Classic',1866,544),
  (6,'The Brothers Karamazov',3,'978-0374528379','Classic',1880,824),
  (7,'The Old Man and the Sea',4,'978-0684801469','Classic',1952,128),
  (8,'A Farewell to Arms',4,'978-0684801469','War',1929,332),
  (9,'Mrs Dalloway',5,'978-0156628709','Classic',1925,194),
  (10,'Ulysses',6,'978-0199535521','Classic',1922,736),
  (11,'The Trial',7,'978-0805209990','Classic',1925,192),
  (12,'War and Peace',8,'978-0073523231','Historical',1869,1296),
  (13,'Anna Karenina',8,'978-0140449174','Classic',1877,864),
  (14,'One Hundred Years of Solitude',9,'978-0060929527','Magic Realism',1967,417),
  (15,'Beloved',10,'978-1400033416','Historical',1987,321),
  (16,'The Great Gatsby',11,'978-0743273565','Classic',1925,180),
  (17,'The Stranger',12,'978-0679720201','Existential',1942,123),
  (18,'The Lord of the Rings',13,'978-0618640157','Fantasy',1954,1178),
  (19,'The Hobbit',13,'978-0547928227','Fantasy',1937,310),
  (20,'Harry Potter and the Sorcerer''s Stone',14,'978-0439708180','Fantasy',1997,309),
  (21,'Murder on the Orient Express',15,'978-0062693662','Mystery',1934,256),
  (22,'And Then There Were None',15,'978-0062073488','Mystery',1939,272),
  (23,'Harry Potter and the Chamber of Secrets',14,'978-0439064873','Fantasy',1998,341),
  (24,'The Two Towers',13,'978-0547928203','Fantasy',1954,448),
  (25,'The Return of the King',13,'978-0547928197','Fantasy',1955,512);

INSERT INTO members VALUES
  (1,'Alice','Smith','alice@email.com','2020-01-15',1),
  (2,'Bob','Johnson','bob@email.com','2019-06-10',2),
  (3,'Carol','Williams','carol@email.com','2021-03-22',1),
  (4,'David','Brown','david@email.com','2018-11-05',3),
  (5,'Emma','Davis','emma@email.com','2022-07-18',2),
  (6,'Frank','Jones','frank@email.com','2020-09-14',4),
  (7,'Grace','Garcia','grace@email.com','2021-12-01',1),
  (8,'Henry','Wilson','henry@email.com','2019-04-28',5),
  (9,'Iris','Moore','iris@email.com','2022-02-10',3),
  (10,'Jack','Taylor','jack@email.com','2018-08-20',1),
  (11,'Karen','Anderson','karen@email.com','2020-05-07',2),
  (12,'Leo','Thomas','leo@email.com','2021-10-16',4),
  (13,'Mia','Jackson','mia@email.com','2023-01-04',1),
  (14,'Nathan','White','nathan@email.com','2019-03-19',3),
  (15,'Olivia','Harris','olivia@email.com','2022-11-30',5);

INSERT INTO loans VALUES
  (1,1,1,'2024-01-05','2024-01-19','2024-01-18'),
  (2,3,1,'2024-02-01','2024-02-15','2024-02-20'),
  (3,16,2,'2024-01-10','2024-01-24','2024-01-23'),
  (4,18,2,'2024-02-05','2024-02-19',NULL),
  (5,20,3,'2024-01-15','2024-01-29','2024-01-29'),
  (6,20,3,'2024-03-01','2024-03-15',NULL),
  (7,5,4,'2024-01-08','2024-01-22','2024-02-05'),
  (8,12,4,'2024-02-10','2024-02-24','2024-02-22'),
  (9,1,5,'2024-01-20','2024-02-03','2024-02-10'),
  (10,21,5,'2024-02-15','2024-03-01',NULL),
  (11,19,6,'2024-01-05','2024-01-19','2024-01-18'),
  (12,2,6,'2024-03-01','2024-03-15','2024-03-14'),
  (13,14,7,'2024-01-12','2024-01-26','2024-01-25'),
  (14,17,8,'2024-02-01','2024-02-15','2024-03-01'),
  (15,22,9,'2024-01-18','2024-02-01','2024-02-01'),
  (16,7,10,'2024-02-20','2024-03-06',NULL),
  (17,16,10,'2023-12-01','2023-12-15','2023-12-14'),
  (18,3,11,'2024-01-25','2024-02-08','2024-02-08'),
  (19,20,12,'2024-02-28','2024-03-13',NULL),
  (20,1,13,'2024-03-05','2024-03-19',NULL),
  (21,21,1,'2023-10-10','2023-10-24','2023-10-23'),
  (22,22,1,'2023-11-15','2023-11-29','2023-12-10'),
  (23,5,2,'2023-09-01','2023-09-15','2023-09-20'),
  (24,3,4,'2023-08-15','2023-08-29','2023-09-15');

INSERT INTO fines VALUES
  (1,2,2.50,'2024-02-25'),
  (2,7,6.50,NULL),
  (3,9,3.50,'2024-02-15'),
  (4,14,7.00,NULL),
  (5,22,5.50,NULL),
  (6,23,2.50,'2023-09-22'),
  (7,24,8.50,NULL);
