-- run 'psql -f example_database_code/examples.sql' in terminal to seed example database
DROP DATABASE IF EXISTS example_database;
CREATE DATABASE example_database;
\c example_database;


CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INTEGER REFERENCES artists(id),
    album_id INTEGER REFERENCES albums(id),
    release_date DATE,
    link VARCHAR(500)
);

-- Insert Artists
INSERT INTO artists (id, name) VALUES
(1, 'The Midnight Riders'),
(2, 'Luna Park'),
(3, 'Digital Dreams'),
(4, 'Acoustic Soul'),
(5, 'Electric Avenue');

-- Insert Albums
INSERT INTO albums (id, name) VALUES
(1, 'Highway Chronicles'),
(2, 'Moonlit Melodies'),
(3, 'Binary Beats'),
(4, 'Unplugged Sessions'),
(5, 'Neon Nights');

-- Insert Songs
INSERT INTO songs (id, title, artist_id, album_id, release_date, link) VALUES
(1, 'Road to Nowhere', 1, 1, '2023-03-15', 'https://example.com/songs/road-to-nowhere'),
(2, 'Sunset Drive', 1, 1, '2023-03-15', 'https://example.com/songs/sunset-drive'),
(3, 'Midnight Blues', 1, 1, '2023-03-15', 'https://example.com/songs/midnight-blues'),
(4, 'Starlight', 2, 2, '2023-06-20', 'https://example.com/songs/starlight'),
(5, 'Dancing in the Dark', 2, 2, '2023-06-20', 'https://example.com/songs/dancing-dark'),
(6, 'Moonbeam', 2, 2, '2023-06-20', 'https://example.com/songs/moonbeam'),
(7, 'Pixel Paradise', 3, 3, '2024-01-10', 'https://example.com/songs/pixel-paradise'),
(8, 'Code Red', 3, 3, '2024-01-10', 'https://example.com/songs/code-red'),
(9, 'Virtual Reality', 3, 3, '2024-01-10', 'https://example.com/songs/virtual-reality'),
(10, 'Whisper', 4, 4, '2023-09-05', 'https://example.com/songs/whisper'),
(11, 'Coffee Shop Serenade', 4, 4, '2023-09-05', 'https://example.com/songs/coffee-shop'),
(12, 'Rainy Day', 4, 4, '2023-09-05', 'https://example.com/songs/rainy-day'),
(13, 'Neon Lights', 5, 5, '2024-02-14', 'https://example.com/songs/neon-lights'),
(14, 'Electric Heart', 5, 5, '2024-02-14', 'https://example.com/songs/electric-heart'),
(15, 'Thunder Road', 5, 5, '2024-02-14', 'https://example.com/songs/thunder-road'),
(16, 'Summer Breeze', 1, 1, '2023-07-01', 'https://example.com/songs/summer-breeze'),
(17, 'City Lights', 2, 2, '2023-08-12', 'https://example.com/songs/city-lights'),
(18, 'Digital Love', 3, 3, '2024-03-01', 'https://example.com/songs/digital-love'),
(19, 'Acoustic Dreams', 4, 4, '2023-10-20', 'https://example.com/songs/acoustic-dreams'),
(20, 'Voltage', 5, 5, '2024-04-05', 'https://example.com/songs/voltage');