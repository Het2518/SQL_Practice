-- DATABASE: Movies / IMDb | 6 tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS directors (
  director_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT,
  nationality TEXT, birth_year INTEGER
);
CREATE TABLE IF NOT EXISTS genres (
  genre_id INTEGER PRIMARY KEY, name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS movies (
  movie_id INTEGER PRIMARY KEY, title TEXT NOT NULL, release_year INTEGER,
  duration_mins INTEGER, budget REAL, box_office REAL, rating REAL,
  director_id INTEGER REFERENCES directors(director_id)
);
CREATE TABLE IF NOT EXISTS actors (
  actor_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT,
  birth_year INTEGER, nationality TEXT
);
CREATE TABLE IF NOT EXISTS movie_actors (
  id INTEGER PRIMARY KEY, movie_id INTEGER REFERENCES movies(movie_id),
  actor_id INTEGER REFERENCES actors(actor_id), role TEXT
);
CREATE TABLE IF NOT EXISTS movie_genres (
  id INTEGER PRIMARY KEY, movie_id INTEGER REFERENCES movies(movie_id),
  genre_id INTEGER REFERENCES genres(genre_id)
);

INSERT INTO directors VALUES
  (1,'Christopher','Nolan','British',1970),(2,'Steven','Spielberg','American',1946),
  (3,'Martin','Scorsese','American',1942),(4,'Quentin','Tarantino','American',1963),
  (5,'James','Cameron','Canadian',1954),(6,'David','Fincher','American',1962),
  (7,'Ridley','Scott','British',1937),(8,'Denis','Villeneuve','Canadian',1967),
  (9,'Alfonso','Cuaron','Mexican',1961),(10,'Bong','Joon-ho','South Korean',1969),
  (11,'Francis','Coppola','American',1939),(12,'Darren','Aronofsky','American',1969),
  (13,'Paul','Thomas Anderson','American',1970),(14,'Wes','Anderson','American',1969),
  (15,'Coen Brothers','Brothers','American',1954);

INSERT INTO genres VALUES
  (1,'Action'),(2,'Drama'),(3,'Thriller'),(4,'Science Fiction'),
  (5,'Comedy'),(6,'Horror'),(7,'Romance'),(8,'Adventure'),
  (9,'Crime'),(10,'Animation'),(11,'Documentary'),(12,'Fantasy'),
  (13,'Mystery'),(14,'War'),(15,'Biography');

INSERT INTO movies VALUES
  (1,'Inception',2010,148,160000000,836848102,8.8,1),
  (2,'The Dark Knight',2008,152,185000000,1004558444,9.0,1),
  (3,'Interstellar',2014,169,165000000,701729206,8.6,1),
  (4,'Schindler''s List',1993,195,22000000,321306305,8.9,2),
  (5,'Jaws',1975,124,9000000,470654000,7.9,2),
  (6,'E.T.',1982,115,10500000,793000000,7.9,2),
  (7,'Goodfellas',1990,146,25000000,46836000,8.7,3),
  (8,'The Departed',2006,151,90000000,289847354,8.5,3),
  (9,'Pulp Fiction',1994,154,8000000,213928762,8.9,4),
  (10,'Django Unchained',2012,165,100000000,425368238,8.4,4),
  (11,'Titanic',1997,194,200000000,2187463944,7.9,5),
  (12,'Avatar',2009,162,237000000,2923706026,7.8,5),
  (13,'Fight Club',1999,139,63000000,100853753,8.8,6),
  (14,'Se7en',1995,127,33000000,327311859,8.6,6),
  (15,'Gladiator',2000,155,103000000,460583960,8.5,7),
  (16,'Blade Runner 2049',2017,164,150000000,259239658,8.0,8),
  (17,'Dune',2021,155,165000000,401771623,8.0,8),
  (18,'Roma',2018,135,15000000,NULL,7.7,9),
  (19,'Parasite',2019,132,11400000,258710732,8.6,10),
  (20,'The Godfather',1972,175,6000000,245066411,9.2,11),
  (21,'Black Swan',2010,108,13000000,329398046,8.0,12),
  (22,'There Will Be Blood',2007,158,25000000,76217184,8.2,13),
  (23,'The Grand Budapest Hotel',2014,99,25000000,174787189,8.1,14),
  (24,'Fargo',1996,98,7000000,60611357,8.1,15),
  (25,'Tenet',2020,150,200000000,363700000,7.4,1),
  (26,'The Wolf of Wall Street',2013,180,100000000,392000694,8.2,3),
  (27,'Inglourious Basterds',2009,153,70000000,321455689,8.3,4),
  (28,'The Revenant',2015,156,135000000,533036825,8.0,7),
  (29,'Arrival',2016,116,47000000,203387485,7.9,8),
  (30,'Birdman',2014,119,18000000,103215094,7.7,9);

INSERT INTO actors VALUES
  (1,'Leonardo','DiCaprio','American',1974),(2,'Christian','Bale','British',1974),
  (3,'Tom','Hanks','American',1956),(4,'Meryl','Streep','American',1949),
  (5,'Brad','Pitt','American',1963),(6,'Morgan','Freeman','American',1937),
  (7,'Cate','Blanchett','Australian',1969),(8,'Natalie','Portman','Israeli-American',1981),
  (9,'Robert','De Niro','American',1943),(10,'Al','Pacino','American',1940),
  (11,'Matt','Damon','American',1970),(12,'Julia','Roberts','American',1967),
  (13,'Scarlett','Johansson','American',1984),(14,'Ryan','Gosling','Canadian',1980),
  (15,'Joaquin','Phoenix','American',1974),(16,'Emma','Stone','American',1988),
  (17,'Charlize','Theron','South African',1975),(18,'Anthony','Hopkins','British',1937),
  (19,'Kate','Winslet','British',1975),(20,'Timothee','Chalamet','American',2000),
  (21,'Tom','Hardy','British',1977),(22,'Cillian','Murphy','Irish',1976),
  (23,'Anne','Hathaway','American',1982),(24,'Amy','Adams','American',1974),
  (25,'Mark','Ruffalo','American',1967);

INSERT INTO movie_actors VALUES
  (1,1,1,'Cobb'),(2,1,23,'Ariadne'),(3,2,2,'Batman'),
  (4,3,1,'Cooper'),(5,3,23,'Murph'),(6,4,3,'Oskar Schindler'),
  (7,7,9,'Henry Hill'),(8,8,11,'Billy Costigan'),(9,9,5,'Vincent Vega'),
  (10,10,1,'Django'),(11,11,1,'Jack'),(12,11,19,'Rose'),
  (13,12,NULL,NULL),(14,13,5,'The Narrator'),(15,14,6,'Somerset'),
  (16,15,NULL,NULL),(17,16,14,'K'),(18,17,20,'Paul Atreides'),
  (19,18,NULL,NULL),(20,19,NULL,NULL),(21,20,10,'Michael Corleone'),
  (22,20,9,'Vito Corleone'),(23,21,8,'Nina'),(24,22,NULL,NULL),
  (25,23,NULL,NULL),(26,24,NULL,NULL),(27,25,22,'Neil'),
  (28,26,1,'Jordan Belfort'),(29,27,5,'Lt. Aldo Raine'),
  (30,28,1,'Hugh Glass'),(31,29,24,'Louise Banks'),(32,30,15,'Riggan');

INSERT INTO movie_genres VALUES
  (1,1,3),(2,1,4),(3,2,1),(4,2,9),(5,2,3),(6,3,4),(7,3,2),
  (8,4,2),(9,4,15),(10,5,6),(11,5,1),(12,6,4),(13,6,8),
  (14,7,9),(15,7,2),(16,8,9),(17,8,3),(18,9,9),(19,9,3),
  (20,10,2),(21,10,9),(22,11,2),(23,11,7),(24,12,4),(25,12,8),
  (26,13,3),(27,14,9),(28,14,3),(29,15,1),(30,15,2),(31,15,8),
  (32,16,4),(33,16,3),(34,17,4),(35,17,8),(36,18,2),(37,19,9),
  (38,19,3),(39,19,2),(40,20,9),(41,20,2),(42,21,3),(43,21,6),
  (44,22,2),(45,23,5),(46,23,2),(47,24,9),(48,24,3),(49,25,4),
  (50,25,1),(51,26,9),(52,26,2),(53,27,2),(54,27,14),(55,28,8),
  (56,28,2),(57,29,4),(58,30,5),(59,30,2);
