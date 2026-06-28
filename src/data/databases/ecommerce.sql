-- ============================================================
-- DATABASE: E-Commerce
-- Tables: 8 | Rows: ~500 total
-- ============================================================
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  category_id       INTEGER PRIMARY KEY,
  name              TEXT NOT NULL,
  parent_category_id INTEGER REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id    INTEGER PRIMARY KEY,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  city           TEXT,
  country        TEXT,
  registered_at  DATE
);


CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INTEGER PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  country TEXT
);

CREATE TABLE IF NOT EXISTS products (
  product_id   INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  price        REAL NOT NULL,
  stock_qty    INTEGER DEFAULT 0,
  category_id  INTEGER REFERENCES categories(category_id),
  supplier_id  INTEGER REFERENCES suppliers(supplier_id)
);

CREATE TABLE IF NOT EXISTS orders (
  order_id         INTEGER PRIMARY KEY,
  customer_id      INTEGER NOT NULL REFERENCES customers(customer_id),
  order_date       DATE NOT NULL,
  status           TEXT CHECK(status IN ('Pending','Processing','Completed','Cancelled','Refunded')),
  shipping_address TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  item_id    INTEGER PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(order_id),
  product_id INTEGER NOT NULL REFERENCES products(product_id),
  quantity   INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id INTEGER PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(order_id),
  amount     REAL NOT NULL,
  method     TEXT CHECK(method IN ('Credit Card','Debit Card','PayPal','Bank Transfer','Crypto')),
  paid_at    DATETIME,
  status     TEXT CHECK(status IN ('Pending','Completed','Failed','Refunded'))
);

CREATE TABLE IF NOT EXISTS reviews (
  review_id   INTEGER PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(product_id),
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
  rating      INTEGER CHECK(rating BETWEEN 1 AND 5),
  body        TEXT,
  reviewed_at DATE
);

CREATE TABLE IF NOT EXISTS shipping (
  shipment_id  INTEGER PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(order_id),
  carrier      TEXT,
  tracking_no  TEXT,
  shipped_at   DATETIME,
  delivered_at DATETIME
);

-- SEED DATA
INSERT INTO categories VALUES
  (1,'Electronics',NULL),(2,'Clothing',NULL),(3,'Books',NULL),
  (4,'Home & Garden',NULL),(5,'Sports',NULL),(6,'Toys',NULL),
  (7,'Laptops',1),(8,'Smartphones',1),(9,'Cameras',1),
  (10,'Men''s Clothing',2),(11,'Women''s Clothing',2),(12,'Children''s Clothing',2),
  (13,'Fiction',3),(14,'Non-Fiction',3),(15,'Science',3);

INSERT INTO customers VALUES
  (1,'Alice','Smith','alice.smith@gmail.com','+1-555-0101','New York','USA','2022-01-15'),
  (2,'Bob','Johnson','bob.johnson@yahoo.com',NULL,'Toronto','Canada','2022-02-20'),
  (3,'Carol','Williams','carol.w@gmail.com','+44-20-5555','London','UK','2022-03-10'),
  (4,'David','Brown','david.brown@hotmail.com','+1-555-0104','Los Angeles','USA','2022-04-05'),
  (5,'Emma','Jones','emma.jones@gmail.com',NULL,'Sydney','Australia','2022-05-18'),
  (6,'Frank','Davis','frank.d@company.com','+1-555-0106','Chicago','USA','2022-06-22'),
  (7,'Grace','Miller','grace.miller@gmail.com','+61-2-5555','Melbourne','Australia','2022-07-14'),
  (8,'Henry','Wilson','henry.w@yahoo.com','+1-555-0108','Toronto','Canada','2022-08-30'),
  (9,'Iris','Moore','iris.moore@gmail.com',NULL,'Berlin','Germany','2022-09-12'),
  (10,'Jack','Taylor','jack.t@hotmail.com','+1-555-0110','New York','USA','2022-10-25'),
  (11,'Karen','Anderson','karen.a@gmail.com','+1-555-0111','Houston','USA','2023-01-08'),
  (12,'Leo','Thomas','leo.thomas@yahoo.com',NULL,'Paris','France','2023-01-20'),
  (13,'Mia','Jackson','mia.j@gmail.com','+1-555-0113','Vancouver','Canada','2023-02-14'),
  (14,'Nathan','White','n.white@company.com','+1-555-0114','Dallas','USA','2023-03-05'),
  (15,'Olivia','Harris','olivia.h@gmail.com',NULL,'Madrid','Spain','2023-03-18'),
  (16,'Paul','Martin','paul.m@hotmail.com','+1-555-0116','Boston','USA','2023-04-22'),
  (17,'Quinn','Garcia','quinn.g@gmail.com','+1-555-0117','Phoenix','USA','2023-05-10'),
  (18,'Rose','Martinez','rose.m@yahoo.com',NULL,'Mexico City','Mexico','2023-06-01'),
  (19,'Sam','Robinson','sam.r@gmail.com','+1-555-0119','Seattle','USA','2023-07-15'),
  (20,'Tina','Clark','tina.c@company.com','+1-555-0120','Miami','USA','2023-08-28'),
  (21,'Uma','Rodriguez','uma.r@gmail.com',NULL,'São Paulo','Brazil','2023-09-05'),
  (22,'Victor','Lewis','victor.l@yahoo.com','+1-555-0122','Denver','USA','2023-10-12'),
  (23,'Wendy','Lee','wendy.lee@gmail.com','+82-2-5555','Seoul','South Korea','2023-11-20'),
  (24,'Xavier','Walker','x.walker@hotmail.com',NULL,'Toronto','Canada','2023-12-01'),
  (25,'Yara','Hall','yara.h@gmail.com','+1-555-0125','Atlanta','USA','2024-01-10'),
  (26,'Zack','Allen','zack.a@company.com','+1-555-0126','Portland','USA','2024-01-25'),
  (27,'Amy','Young','amy.young@gmail.com',NULL,'Amsterdam','Netherlands','2024-02-08'),
  (28,'Ben','Hernandez','ben.h@yahoo.com','+1-555-0128','San Diego','USA','2024-02-20'),
  (29,'Cleo','King','cleo.k@gmail.com','+1-555-0129','Toronto','Canada','2024-03-05'),
  (30,'Dan','Wright','dan.w@hotmail.com',NULL,'London','UK','2024-03-18');

INSERT INTO suppliers VALUES
  (1,'TechElectro','contact@techelectro.com','USA'),
  (2,'GlobalGadgets','sales@globalgadgets.com','UK'),
  (3,'MobiTech','info@mobitech.com','China'),
  (4,'PhotoWorld','support@photoworld.com','Japan'),
  (5,'HomeEssentials','hello@homeessentials.com','USA'),
  (6,'FashionHub','style@fashionhub.com','France'),
  (7,'SportsGear','team@sportsgear.com','Germany'),
  (8,'BookDepot','orders@bookdepot.com','Canada'),
  (9,'ToyUniverse','fun@toyuniverse.com','USA'),
  (10,'AutoParts','service@autoparts.com','Japan'),
  (11,'KitchenPro','chef@kitchenpro.com','Italy'),
  (12,'BeautyCo','glow@beautyco.com','South Korea'),
  (13,'PetSupplies','woof@petsupplies.com','UK'),
  (14,'GardenCare','plants@gardencare.com','Netherlands'),
  (15,'MusicWorld','play@musicworld.com','USA');

INSERT INTO products VALUES
  (1,'MacBook Pro 14"',NULL,1999.99,15,7,1),
  (2,'iPhone 15 Pro','Latest Apple flagship',999.99,50,8,2),
  (3,'Samsung Galaxy S24','Top Android phone',899.99,30,8,3),
  (4,'Canon EOS R50','Mirrorless camera',749.99,20,9,4),
  (5,'Dell XPS 13','Ultrabook laptop',1299.99,25,7,1),
  (6,'Sony WH-1000XM5','Noise cancelling headphones',349.99,40,1,5),
  (7,'iPad Air 5th Gen','Apple tablet',749.99,35,1,2),
  (8,'Nike Running Shoes','Athletic footwear',129.99,100,5,6),
  (9,'Levi''s 501 Jeans','Classic denim jeans',79.99,200,10,7),
  (10,'Python Programming','Beginner programming book',39.99,150,15,8),
  (11,'JavaScript Guide','Complete JS reference',44.99,120,13,8),
  (12,'Garden Hose','50ft garden hose',49.99,80,4,9),
  (13,'LEGO Star Wars Set','2000 piece set',149.99,45,6,10),
  (14,'Yoga Mat','Non-slip exercise mat',39.99,90,5,6),
  (15,'Coffee Maker','12-cup drip machine',89.99,60,4,11),
  (16,'Mechanical Keyboard','RGB gaming keyboard',159.99,55,1,12),
  (17,'Monitor 27" 4K','Ultra-HD display',599.99,20,1,1),
  (18,'Women''s Dress','Casual summer dress',69.99,150,11,7),
  (19,'Children''s Backpack','School backpack',34.99,120,12,10),
  (20,'Data Science Book',NULL,54.99,80,15,8),
  (21,'Wireless Mouse','Ergonomic mouse',39.99,200,1,12),
  (22,'USB-C Hub','7-in-1 hub',59.99,100,1,5),
  (23,'Basketball','Official size 7',29.99,75,5,6),
  (24,'Men''s T-Shirt','100% cotton',24.99,300,10,7),
  (25,'Smart Watch','Fitness tracker',299.99,60,1,2),
  (26,'Portable SSD 1TB','Fast external storage',109.99,70,1,5),
  (27,'Fiction Novel A','Bestselling thriller',18.99,200,13,8),
  (28,'Blender','High-speed blender',79.99,40,4,11),
  (29,'Sunglasses','UV400 protection',89.99,80,2,13),
  (30,'Table Tennis Set','Paddles and balls',44.99,50,5,6);

INSERT INTO orders VALUES
  (1,1,'2023-01-10','Completed','123 Main St, New York'),
  (2,1,'2023-06-15','Completed','123 Main St, New York'),
  (3,2,'2023-02-20','Completed','456 Queen St, Toronto'),
  (4,3,'2023-03-12','Completed','789 Baker St, London'),
  (5,4,'2023-04-05','Completed','321 Sunset Blvd, LA'),
  (6,5,'2023-05-01','Completed','100 George St, Sydney'),
  (7,6,'2023-05-20','Completed','200 Wacker Dr, Chicago'),
  (8,7,'2023-06-08','Completed','300 Collins St, Melbourne'),
  (9,8,'2023-07-14','Cancelled','400 Yonge St, Toronto'),
  (10,1,'2023-08-22','Completed','123 Main St, New York'),
  (11,9,'2023-09-05','Completed','500 Unter den Linden, Berlin'),
  (12,10,'2023-10-10','Completed','600 5th Ave, New York'),
  (13,11,'2023-11-01','Completed','700 Main St, Houston'),
  (14,2,'2023-11-20','Completed','456 Queen St, Toronto'),
  (15,12,'2023-12-05','Cancelled','800 Champs Elysees, Paris'),
  (16,13,'2024-01-15','Processing','900 Granville St, Vancouver'),
  (17,14,'2024-01-28','Completed','1000 Main St, Dallas'),
  (18,15,'2024-02-10','Completed','1100 Gran Via, Madrid'),
  (19,16,'2024-02-25','Completed','1200 Boylston St, Boston'),
  (20,17,'2024-03-10','Completed','1300 Central Ave, Phoenix'),
  (21,3,'2024-03-20','Completed','789 Baker St, London'),
  (22,18,'2024-04-01','Pending','1400 Paseo, Mexico City'),
  (23,19,'2024-04-15','Completed','1500 Pike St, Seattle'),
  (24,20,'2024-04-28','Completed','1600 Brickell Ave, Miami'),
  (25,4,'2024-05-10','Completed','321 Sunset Blvd, LA'),
  (26,21,'2024-05-20','Completed','1700 Paulista, São Paulo'),
  (27,22,'2024-06-01','Completed','1800 Lawrence St, Denver'),
  (28,5,'2024-06-10','Cancelled','100 George St, Sydney'),
  (29,23,'2024-06-20','Completed','1900 Gangnam, Seoul'),
  (30,24,'2024-07-01','Completed','400 Yonge St, Toronto');

INSERT INTO order_items VALUES
  (1,1,1,1,1999.99),(2,1,6,1,349.99),
  (3,2,2,1,999.99),(4,2,21,1,39.99),
  (5,3,3,1,899.99),(6,3,26,1,109.99),
  (7,4,4,1,749.99),(8,4,22,2,59.99),
  (9,5,5,1,1299.99),(10,5,16,1,159.99),
  (11,6,8,2,129.99),(12,6,14,1,39.99),
  (13,7,17,1,599.99),(14,7,21,1,39.99),
  (15,8,25,1,299.99),(16,8,7,1,749.99),
  (17,9,10,3,39.99),(18,10,2,1,999.99),
  (19,10,7,1,749.99),(20,10,25,1,299.99),
  (21,11,15,1,89.99),(22,11,28,1,79.99),
  (23,12,1,1,1999.99),(24,13,9,2,79.99),
  (25,13,24,3,24.99),(26,14,3,1,899.99),
  (27,15,11,2,44.99),(28,16,20,1,54.99),
  (29,17,17,1,599.99),(30,18,18,2,69.99),
  (31,19,19,2,34.99),(32,20,8,1,129.99),
  (33,21,4,1,749.99),(34,22,30,1,44.99),
  (35,23,23,2,29.99),(36,24,29,1,89.99),
  (37,25,5,1,1299.99),(38,26,27,3,18.99),
  (39,27,6,1,349.99),(40,28,14,1,39.99),
  (41,29,2,1,999.99),(42,30,3,1,899.99);

INSERT INTO payments VALUES
  (1,1,2349.98,'Credit Card','2023-01-10 10:30:00','Completed'),
  (2,2,1039.98,'PayPal','2023-06-15 14:20:00','Completed'),
  (3,3,1009.98,'Credit Card','2023-02-20 09:15:00','Completed'),
  (4,4,869.97,'Debit Card','2023-03-12 16:45:00','Completed'),
  (5,5,1459.98,'Credit Card','2023-04-05 11:30:00','Completed'),
  (6,6,299.97,'PayPal','2023-05-01 13:00:00','Completed'),
  (7,7,639.98,'Credit Card','2023-05-20 10:00:00','Completed'),
  (8,8,1049.98,'Credit Card','2023-06-08 15:30:00','Completed'),
  -- order 9 has no payment (abandoned/cancelled)
  (10,10,2048.97,'Credit Card','2023-08-22 12:00:00','Completed'),
  (11,11,169.98,'PayPal','2023-09-05 09:30:00','Completed'),
  (12,12,1999.99,'Credit Card','2023-10-10 14:00:00','Completed'),
  (13,13,234.95,'Debit Card','2023-11-01 11:15:00','Completed'),
  (14,14,899.99,'Credit Card','2023-11-20 16:00:00','Completed'),
  -- order 15 cancelled, no payment
  (16,16,54.99,'PayPal','2024-01-15 10:00:00','Completed'),
  (17,17,599.99,'Credit Card','2024-01-28 13:30:00','Completed'),
  (18,18,139.98,'PayPal','2024-02-10 09:00:00','Completed'),
  (19,19,69.98,'Credit Card','2024-02-25 14:45:00','Completed'),
  (20,20,129.99,'Debit Card','2024-03-10 11:00:00','Completed'),
  (21,21,749.99,'Credit Card','2024-03-20 10:30:00','Completed'),
  -- order 22 pending
  (23,23,59.98,'PayPal','2024-04-15 12:00:00','Completed'),
  (24,24,89.99,'Credit Card','2024-04-28 15:00:00','Completed'),
  (25,25,1299.99,'Bank Transfer','2024-05-10 09:45:00','Completed'),
  (26,26,56.97,'PayPal','2024-05-20 14:00:00','Completed'),
  (27,27,349.99,'Credit Card','2024-06-01 11:30:00','Completed'),
  -- order 28 cancelled
  (29,29,999.99,'Credit Card','2024-06-20 10:00:00','Completed'),
  (30,30,899.99,'Credit Card','2024-07-01 13:15:00','Completed');

INSERT INTO reviews VALUES
  (1,1,4,5,'Excellent laptop, very fast!','2023-02-01'),
  (2,2,1,5,'Best phone I''ve had','2023-07-10'),
  (3,3,4,4,'Great phone, slightly expensive','2023-03-15'),
  (4,6,6,4,'Very comfortable and good sound','2023-06-20'),
  (5,5,10,5,'Clear explanations, perfect for beginners','2023-11-15'),
  (6,5,1,3,'Average book, expected more','2023-09-01'),
  (7,8,6,5,'Best running shoes I''ve owned','2023-05-20'),
  (8,17,10,4,'Great monitor for the price','2023-11-05'),
  (9,2,10,5,'Love the new camera features','2023-11-10'),
  (10,3,4,2,'Battery life disappointing','2023-04-01'),
  (11,25,1,5,'Best smartwatch on the market','2023-09-15'),
  (12,15,11,4,'Makes great coffee','2023-12-01'),
  (13,4,4,5,'Amazing camera for the price','2023-04-10'),
  (14,9,13,3,'Jeans are OK, a bit stiff','2023-12-10'),
  (15,1,5,1,'Laptop had a defect','2023-05-01');

INSERT INTO shipping VALUES
  (1,1,'FedEx','FX123456','2023-01-11 08:00:00','2023-01-14 12:00:00'),
  (2,2,'UPS','UP234567','2023-06-16 09:00:00','2023-06-19 14:00:00'),
  (3,3,'DHL','DH345678','2023-02-21 10:00:00','2023-02-24 11:00:00'),
  (4,4,'Royal Mail','RM456789','2023-03-13 08:30:00','2023-03-17 15:00:00'),
  (5,5,'FedEx','FX567890','2023-04-06 09:00:00','2023-04-10 13:00:00'),
  (6,6,'Australia Post','AP678901',NULL,NULL),
  (7,7,'FedEx','FX789012','2023-05-21 10:00:00','2023-05-24 12:00:00'),
  (8,8,'AusPost','AU890123','2023-06-09 08:00:00','2023-06-14 14:00:00'),
  (10,10,'UPS','UP012345','2023-08-23 09:30:00','2023-08-26 11:00:00'),
  (11,11,'DHL','DH123456','2023-09-06 10:00:00','2023-09-09 13:00:00'),
  (12,12,'FedEx','FX234567','2023-10-11 08:00:00','2023-10-14 12:00:00'),
  (13,13,'USPS','US345678','2023-11-02 09:00:00','2023-11-05 14:00:00'),
  (14,14,'CanadaPost','CP456789','2023-11-21 10:00:00','2023-11-25 13:00:00'),
  (16,16,'CanadaPost','CP567890','2024-01-17 08:30:00','2024-01-22 12:00:00'),
  (17,17,'FedEx','FX678901','2024-01-29 09:00:00','2024-02-01 14:00:00'),
  (18,18,'DHL','DH789012','2024-02-11 10:00:00','2024-02-15 11:00:00'),
  (19,19,'UPS','UP890123','2024-02-26 08:00:00','2024-02-29 13:00:00'),
  (20,20,'FedEx','FX901234','2024-03-11 09:30:00','2024-03-14 15:00:00'),
  (21,21,'Royal Mail','RM012345','2024-03-21 10:00:00','2024-03-25 12:00:00'),
  (23,23,'FedEx','FX123460','2024-04-16 08:00:00','2024-04-19 14:00:00'),
  (24,24,'CJ Logistics','CJ234561','2024-04-29 09:00:00','2024-05-02 11:00:00'),
  (25,25,'FedEx','FX345672','2024-05-12 10:00:00','2024-05-15 13:00:00'),
  (26,26,'Correios','CO456783',NULL,NULL),
  (27,27,'UPS','UP567894','2024-06-02 09:30:00','2024-06-05 12:00:00'),
  (29,29,'Korea Post','KP678905','2024-06-21 10:00:00','2024-06-25 14:00:00'),
  (30,30,'CanadaPost','CP789016','2024-07-02 08:00:00','2024-07-05 13:00:00');
