-- DATABASE: Music Streaming | 7 tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS artists (
  artist_id INTEGER PRIMARY KEY, name TEXT, genre TEXT, country TEXT, formed_year INTEGER
);
CREATE TABLE IF NOT EXISTS albums (
  album_id INTEGER PRIMARY KEY, title TEXT, artist_id INTEGER REFERENCES artists(artist_id),
  release_year INTEGER, genre TEXT
);
CREATE TABLE IF NOT EXISTS tracks (
  track_id INTEGER PRIMARY KEY, title TEXT, album_id INTEGER REFERENCES albums(album_id),
  duration_secs INTEGER, bpm INTEGER, track_number INTEGER
);
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY, username TEXT, email TEXT, country TEXT, joined_at DATE
);
CREATE TABLE IF NOT EXISTS plays (
  play_id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(user_id),
  track_id INTEGER REFERENCES tracks(track_id), played_at DATETIME, play_duration_secs INTEGER
);
CREATE TABLE IF NOT EXISTS playlists (
  playlist_id INTEGER PRIMARY KEY, name TEXT, user_id INTEGER REFERENCES users(user_id),
  created_at DATE, is_public INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id INTEGER PRIMARY KEY, playlist_id INTEGER REFERENCES playlists(playlist_id),
  track_id INTEGER REFERENCES tracks(track_id), added_at DATE, position INTEGER
);

INSERT INTO artists VALUES
  (1,'The Beatles','Rock','UK',1960),(2,'Taylor Swift','Pop','USA',2003),
  (3,'Kendrick Lamar','Hip-Hop','USA',2003),(4,'Adele','Pop/Soul','UK',2004),
  (5,'Radiohead','Alternative','UK',1985),(6,'Beyoncé','Pop/R&B','USA',1997),
  (7,'Drake','Hip-Hop','Canada',2001),(8,'Ed Sheeran','Pop','UK',2009),
  (9,'Billie Eilish','Pop/Alternative','USA',2015),(10,'The Weeknd','R&B','Canada',2009);

INSERT INTO albums VALUES
  (1,'Abbey Road',1,1969,'Rock'),(2,'Let It Be',1,1970,'Rock'),
  (3,'1989',2,2014,'Pop'),(4,'Folklore',2,2020,'Indie Pop'),
  (5,'Midnights',2,2022,'Pop'),(6,'To Pimp a Butterfly',3,2015,'Hip-Hop'),
  (7,'DAMN.',3,2017,'Hip-Hop'),(8,'25',4,2015,'Pop/Soul'),
  (9,'30',4,2021,'Pop/Soul'),(10,'OK Computer',5,1997,'Alternative'),
  (11,'In Rainbows',5,2007,'Alternative'),(12,'Lemonade',6,2016,'Pop/R&B'),
  (13,'Certified Lover Boy',7,2021,'Hip-Hop'),(14,'÷ (Divide)',8,2017,'Pop'),
  (15,'= (Equals)',8,2021,'Pop'),(16,'When We All Fall Asleep',9,2019,'Pop'),
  (17,'Happier Than Ever',9,2021,'Pop'),(18,'After Hours',10,2020,'R&B'),
  (19,'Dawn FM',10,2022,'R&B'),(20,'Blonde',1,2016,'Rock');

INSERT INTO tracks VALUES
  (1,'Come Together',1,260,100,1),(2,'Something',1,182,76,2),
  (3,'Here Comes the Sun',1,185,129,7),(4,'Let It Be',2,243,72,6),
  (5,'Shake It Off',3,219,160,6),(6,'Blank Space',3,231,96,2),
  (7,'cardigan',4,239,95,1),(8,'exile',4,264,75,4),
  (9,'Anti-Hero',5,200,135,1),(10,'Lavender Haze',5,202,129,2),
  (11,'King Kunta',6,234,91,5),(12,'Alright',6,218,97,7),
  (13,'HUMBLE.',7,177,150,8),(14,'DNA.',7,185,142,3),
  (15,'Hello',8,295,79,1),(16,'Rolling in the Deep',8,228,105,1),
  (17,'Easy On Me',9,224,58,1),(18,'Someone Like You',8,285,67,2),
  (19,'Paranoid Android',10,387,104,2),(20,'Karma Police',10,265,78,3),
  (21,'Fake Plastic Trees',10,238,93,4),(22,'All I Need',11,227,69,4),
  (23,'Crazy in Love',12,236,100,1),(24,'Formation',12,213,136,12),
  (25,'Peaches',13,198,90,1),(26,'Shape of You',14,234,96,4),
  (27,'Perfect',14,263,61,5),(28,'Bad Habits',15,231,126,1),
  (29,'bad guy',16,194,135,2),(30,'Therefore I Am',17,174,150,2),
  (31,'Blinding Lights',18,200,171,2),(32,'Save Your Tears',18,215,119,5),
  (33,'Sacrifice',19,190,104,1),(34,'Is There Someone Else?',19,183,110,5);

INSERT INTO users VALUES
  (1,'music_fan1','fan1@email.com','USA','2021-03-15'),
  (2,'beatles_lover','beatles@email.com','UK','2020-06-10'),
  (3,'hiphop_head','hiphop@email.com','USA','2022-01-20'),
  (4,'poplover','pop@email.com','Canada','2021-09-05'),
  (5,'indie_fan','indie@email.com','Australia','2022-04-18'),
  (6,'rnb_vibes','rnb@email.com','USA','2020-12-01'),
  (7,'classic_rock','classic@email.com','UK','2021-07-22'),
  (8,'new_user','newuser@email.com','Germany','2024-01-10'),
  (9,'alt_music','alt@email.com','France','2021-05-08'),
  (10,'weekend_listener','weekend@email.com','Japan','2022-08-14');

INSERT INTO plays VALUES
  (1,1,9,'2024-01-05 08:30:00',200),(2,1,31,'2024-01-05 10:15:00',200),
  (3,1,5,'2024-01-06 14:00:00',219),(4,1,29,'2024-01-07 16:30:00',194),
  (5,2,1,'2024-01-05 09:00:00',260),(6,2,3,'2024-01-05 09:45:00',185),
  (7,2,2,'2024-01-06 11:00:00',182),(8,2,4,'2024-01-07 13:30:00',243),
  (9,3,13,'2024-01-05 12:00:00',177),(10,3,14,'2024-01-05 12:30:00',185),
  (11,3,11,'2024-01-06 15:00:00',234),(12,3,12,'2024-01-07 17:00:00',218),
  (13,4,6,'2024-01-05 18:00:00',231),(14,4,5,'2024-01-05 18:45:00',219),
  (15,4,9,'2024-01-06 20:00:00',200),(16,4,10,'2024-01-07 21:00:00',202),
  (17,5,7,'2024-01-05 22:00:00',239),(18,5,8,'2024-01-05 22:45:00',264),
  (19,6,23,'2024-01-06 14:00:00',236),(20,6,24,'2024-01-06 14:45:00',213),
  (21,6,31,'2024-01-07 20:00:00',200),(22,6,32,'2024-01-08 21:00:00',215),
  (23,1,9,'2024-02-05 08:30:00',200),(24,1,31,'2024-02-06 10:00:00',200),
  (25,2,1,'2024-02-01 09:00:00',260),(26,2,3,'2024-02-02 09:45:00',185),
  (27,3,13,'2024-02-10 12:00:00',177),(28,3,14,'2024-02-11 12:30:00',185),
  (29,7,19,'2024-01-05 10:00:00',387),(30,7,20,'2024-01-05 11:00:00',265),
  (31,7,21,'2024-01-06 12:00:00',238),(32,9,22,'2024-01-05 14:00:00',227),
  (33,9,19,'2024-01-06 15:00:00',387),(34,10,31,'2024-01-05 20:00:00',200),
  (35,10,33,'2024-01-06 21:00:00',190),(36,10,34,'2024-01-07 22:00:00',183);

INSERT INTO playlists VALUES
  (1,'Morning Hits',1,'2024-01-01',1),(2,'Classic Rock',2,'2023-06-15',1),
  (3,'Hip-Hop Essentials',3,'2024-01-15',1),(4,'Pop Party',4,'2023-09-10',1),
  (5,'Chill Indie',5,'2023-12-01',1),(6,'Late Night R&B',6,'2024-01-20',0),
  (7,'Alt Classics',7,'2023-08-05',1),(8,'Private Mix',8,'2024-01-10',0);

INSERT INTO playlist_tracks VALUES
  (1,1,9,'2024-01-01',1),(2,1,31,'2024-01-01',2),(3,1,5,'2024-01-02',3),
  (4,2,1,'2023-06-15',1),(5,2,3,'2023-06-15',2),(6,2,2,'2023-06-15',3),
  (7,3,13,'2024-01-15',1),(8,3,14,'2024-01-15',2),(9,3,11,'2024-01-16',3),
  (10,4,6,'2023-09-10',1),(11,4,5,'2023-09-10',2),(12,4,9,'2023-09-11',3),
  (13,5,7,'2023-12-01',1),(14,5,8,'2023-12-01',2),(15,6,23,'2024-01-20',1),
  (16,6,31,'2024-01-20',2),(17,7,19,'2023-08-05',1),(18,7,20,'2023-08-05',2),
  (19,7,22,'2023-08-06',3),(20,8,29,'2024-01-10',1);
