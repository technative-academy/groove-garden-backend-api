-- run 'psql -f example_database_code/examples.sql' in terminal to seed example database
DROP DATABASE IF EXISTS example_database;
CREATE DATABASE example_database;
\c example_database;


CREATE TABLE artists (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE albums (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE songs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INTEGER REFERENCES artists(id),
    album_id INTEGER REFERENCES albums(id),
    release_date DATE,
    link VARCHAR(500)
);

-- Insert Artists
INSERT INTO artists (id, name) VALUES
('The Midnight Riders'),
('Luna Park'),
('Digital Dreams'),
('Acoustic Soul'),
('Electric Avenue');

-- Insert Albums
INSERT INTO albums (id, name) VALUES
('Highway Chronicles'),
('Moonlit Melodies'),
('Binary Beats'),
('Unplugged Sessions'),
('Neon Nights');

-- Insert Songs
INSERT INTO songs (id, title, artist_id, album_id, release_date, link) VALUES
('Road to Nowhere', 1, 1, '2023-03-15', 'https://example.com/songs/road-to-nowhere'),
('Sunset Drive', 1, 1, '2023-03-15', 'https://example.com/songs/sunset-drive'),
('Midnight Blues', 1, 1, '2023-03-15', 'https://example.com/songs/midnight-blues'),
('Starlight', 2, 2, '2023-06-20', 'https://example.com/songs/starlight'),
('Dancing in the Dark', 2, 2, '2023-06-20', 'https://example.com/songs/dancing-dark'),
('Moonbeam', 2, 2, '2023-06-20', 'https://example.com/songs/moonbeam'),
('Pixel Paradise', 3, 3, '2024-01-10', 'https://example.com/songs/pixel-paradise'),
('Code Red', 3, 3, '2024-01-10', 'https://example.com/songs/code-red'),
('Virtual Reality', 3, 3, '2024-01-10', 'https://example.com/songs/virtual-reality'),
('Whisper', 4, 4, '2023-09-05', 'https://example.com/songs/whisper'),
('Coffee Shop Serenade', 4, 4, '2023-09-05', 'https://example.com/songs/coffee-shop'),
('Rainy Day', 4, 4, '2023-09-05', 'https://example.com/songs/rainy-day'),
('Neon Lights', 5, 5, '2024-02-14', 'https://example.com/songs/neon-lights'),
('Electric Heart', 5, 5, '2024-02-14', 'https://example.com/songs/electric-heart'),
('Thunder Road', 5, 5, '2024-02-14', 'https://example.com/songs/thunder-road'),
('Summer Breeze', 1, 1, '2023-07-01', 'https://example.com/songs/summer-breeze'),
('City Lights', 2, 2, '2023-08-12', 'https://example.com/songs/city-lights'),
('Digital Love', 3, 3, '2024-03-01', 'https://example.com/songs/digital-love'),
('Acoustic Dreams', 4, 4, '2023-10-20', 'https://example.com/songs/acoustic-dreams'),
('Voltage', 5, 5, '2024-04-05', 'https://example.com/songs/voltage');