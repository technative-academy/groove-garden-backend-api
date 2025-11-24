-- Run manually:
-- DROP DATABASE IF EXISTS example_database;
-- CREATE DATABASE example_database;
-- Connect to the database before running this part:
-- \c example_database;

CREATE TABLE artists (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL
    posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE albums (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    release_date DATE,
    artist_id INT REFERENCES artists(id)
    posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE songs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INT REFERENCES artists(id),
    album_id INT REFERENCES albums(id),
    release_date DATE,
    link VARCHAR(500)
    posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Playlists Table
CREATE TABLE playlists (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) DEFAULT 'None',
    created_by_user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Create Playlist_song Table
CREATE TABLE playlist_song (
  playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  PRIMARY KEY (playlist_id, song_id)
);

-- Insert Test Users
INSERT INTO users (username, email, password, created_at, posted_by_user_id)
VALUES ('john_doe', 'testemail@email.com', 'password123', NOW()), 1;
-- Insert Artists
INSERT INTO artists (name, posted_by_user_id) VALUES
('The Midnight Riders', 1);
-- Insert Albums
INSERT INTO albums (name, artist_id, release_date, posted_by_user_id) VALUES
('Highway Chronicles', 1, '2023-01-01', 1);
-- Insert Songs
INSERT INTO songs (title, artist_id, album_id, release_date, link, posted_by_user_id) VALUES
('Road to Nowhere', 1, 1, '2023-03-15', 'https://example.com/songs/road-to-nowhere', 1);
-- Drop users table if exists