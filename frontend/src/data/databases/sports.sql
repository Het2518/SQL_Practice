-- DATABASE: Sports League | 6 tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS seasons (
  season_id INTEGER PRIMARY KEY, name TEXT, start_date DATE, end_date DATE
);
CREATE TABLE IF NOT EXISTS teams (
  team_id INTEGER PRIMARY KEY, name TEXT, city TEXT, founded_year INTEGER, division TEXT
);
CREATE TABLE IF NOT EXISTS players (
  player_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT,
  team_id INTEGER REFERENCES teams(team_id), position TEXT, dob DATE, nationality TEXT
);
CREATE TABLE IF NOT EXISTS matches (
  match_id INTEGER PRIMARY KEY, home_team_id INTEGER REFERENCES teams(team_id),
  away_team_id INTEGER REFERENCES teams(team_id), match_date DATE,
  season_id INTEGER REFERENCES seasons(season_id),
  home_score INTEGER, away_score INTEGER, matchday INTEGER
);
CREATE TABLE IF NOT EXISTS goals (
  goal_id INTEGER PRIMARY KEY, match_id INTEGER REFERENCES matches(match_id),
  player_id INTEGER REFERENCES players(player_id), minute INTEGER, is_own_goal INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS standings (
  standing_id INTEGER PRIMARY KEY, season_id INTEGER REFERENCES seasons(season_id),
  team_id INTEGER REFERENCES teams(team_id),
  played INTEGER, won INTEGER, drawn INTEGER, lost INTEGER, points INTEGER
);

INSERT INTO seasons VALUES
  (1,'2021-22','2021-08-14','2022-05-22'),
  (2,'2022-23','2022-08-06','2023-05-28'),
  (3,'2023-24','2023-08-12','2024-05-19'),
  (4,'2020-21','2020-09-12','2021-05-23'),
  (5,'2019-20','2019-08-09','2020-07-26');

INSERT INTO teams VALUES
  (1,'City FC','Manchester',1880,'Premier'),
  (2,'United FC','Manchester',1878,'Premier'),
  (3,'Arsenal FC','London',1886,'Premier'),
  (4,'Chelsea FC','London',1905,'Premier'),
  (5,'Liverpool FC','Liverpool',1892,'Premier'),
  (6,'Tottenham FC','London',1882,'Premier'),
  (7,'Everton FC','Liverpool',1878,'Championship'),
  (8,'West Ham FC','London',1895,'Premier'),
  (9,'Newcastle FC','Newcastle',1892,'Premier'),
  (10,'Brighton FC','Brighton',1901,'Premier');

INSERT INTO players VALUES
  (1,'Erling','Haaland',1,'Forward','2000-07-21','Norwegian'),
  (2,'Kevin','De Bruyne',1,'Midfielder','1991-06-28','Belgian'),
  (3,'Marcus','Rashford',2,'Forward','1997-10-31','English'),
  (4,'Bruno','Fernandes',2,'Midfielder','1994-09-08','Portuguese'),
  (5,'Martin','Odegaard',3,'Midfielder','1998-12-17','Norwegian'),
  (6,'Gabriel','Martinelli',3,'Forward','2001-06-18','Brazilian'),
  (7,'Cole','Palmer',4,'Midfielder','2002-05-06','English'),
  (8,'Nicolas','Jackson',4,'Forward','2001-06-20','Senegalese'),
  (9,'Mohamed','Salah',5,'Forward','1992-06-15','Egyptian'),
  (10,'Virgil','van Dijk',5,'Defender','1991-07-08','Dutch'),
  (11,'Heung-min','Son',6,'Forward','1992-07-08','South Korean'),
  (12,'James','Maddison',6,'Midfielder','1996-11-23','English'),
  (13,'Jarrod','Bowen',8,'Forward','1996-12-20','English'),
  (14,'Bruno','Guimaraes',9,'Midfielder','1997-11-16','Brazilian'),
  (15,'Joao','Pedro',10,'Forward','2001-09-26','Brazilian');

INSERT INTO matches VALUES
  (1,1,2,'2023-10-29',3,3,0,10),
  (2,5,3,'2023-11-12',3,4,1,12),
  (3,2,4,'2023-11-19',3,0,1,13),
  (4,1,5,'2023-12-16',3,1,0,18),
  (5,3,1,'2024-01-01',3,0,2,20),
  (6,4,5,'2024-01-14',3,1,1,22),
  (7,6,2,'2024-01-19',3,0,2,23),
  (8,1,4,'2024-02-17',3,1,0,26),
  (9,5,2,'2024-03-17',3,0,2,29),
  (10,1,3,'2024-04-28',3,1,0,35),
  (11,1,5,'2022-10-15',2,1,0,11),
  (12,2,3,'2022-09-04',2,3,1,6),
  (13,5,4,'2022-10-01',2,2,0,9),
  (14,3,1,'2023-02-15',2,1,3,25),
  (15,1,6,'2023-04-20',2,4,1,33),
  (16,1,2,'2022-01-05',1,0,0,23),
  (17,5,3,'2022-02-19',1,2,0,27),
  (18,4,1,'2022-03-12',1,1,2,30),
  (19,2,5,'2021-09-25',1,0,5,8),
  (20,3,4,'2022-04-30',1,4,2,35);

INSERT INTO goals VALUES
  (1,1,1,12,0),(2,1,1,35,0),(3,1,2,55,0),
  (4,2,9,8,0),(5,2,9,67,0),(6,2,6,45,0),(7,2,5,82,0),
  (8,3,8,33,0),
  (9,4,1,71,0),
  (10,5,5,14,0),(11,5,6,58,0),
  (12,6,7,22,0),(13,6,9,78,0),
  (14,7,4,45,0),(15,7,4,89,0),
  (16,8,1,50,0),
  (17,9,4,63,0),(18,9,3,71,0),
  (19,10,1,33,0),
  (20,11,1,45,0),
  (21,12,4,11,0),(22,12,3,55,0),(23,12,6,77,0),
  (24,13,9,20,0),(25,13,9,45,0),
  (26,14,5,30,0),
  (27,15,1,15,0),(28,15,2,28,0),(29,15,1,60,0),(30,15,11,80,0),
  (31,16,10,25,1),
  (32,17,9,33,0),(33,17,9,67,0),
  (34,18,1,44,0),
  (35,19,9,12,0),(36,19,9,23,0),(37,19,9,55,0),(38,19,9,78,0),(39,19,11,89,0),
  (40,20,5,10,0),(41,20,6,22,0),(42,20,5,45,0),(43,20,5,67,0);

INSERT INTO standings VALUES
  (1,3,1,38,28,5,5,89),(2,3,5,38,24,8,6,80),
  (3,3,3,38,28,5,5,89),(4,3,4,38,18,9,11,63),
  (5,3,2,38,14,8,16,50),(6,3,6,38,16,6,16,54),
  (7,2,5,38,19,10,9,67),(8,2,1,38,28,5,5,89),
  (9,2,3,38,26,6,6,84),(10,2,4,38,11,11,16,44);
