-- Run manually:
-- DROP DATABASE IF EXISTS example_database;
-- CREATE DATABASE example_database;
-- Connect to the database before running this part:
-- \c example_database;

-- Create users table FIRST (no dependencies)
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create artists table (depends on users)
CREATE TABLE artists (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- Create albums table (depends on users and artists)
CREATE TABLE albums (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    release_date DATE,
    artist_id INT REFERENCES artists(id) ON DELETE SET NULL,
    posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- Create songs table (depends on users, artists, and albums)
CREATE TABLE songs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INT REFERENCES artists(id) ON DELETE SET NULL,
    album_id INT REFERENCES albums(id) ON DELETE SET NULL,
    release_date DATE,
    link VARCHAR(500),
    posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- Create playlists table (depends on users)
CREATE TABLE playlists (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) DEFAULT 'None',
    created_by_user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create playlist_song junction table (depends on playlists and songs)
CREATE TABLE playlist_song (
    playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    PRIMARY KEY (playlist_id, song_id)
);

-- Insert test user (note: password should be hashed in production)
INSERT INTO users (username, email, password, created_at)
VALUES ('john_doe', 'testemail@email.com', 'password123', NOW());

-- Insert test artist
INSERT INTO artists (name, posted_by_user_id) 
VALUES ('The Midnight Riders', 1);

-- Insert test album
INSERT INTO albums (name, artist_id, release_date, posted_by_user_id) 
VALUES ('Highway Chronicles', 1, '2023-01-01', 1);

-- Insert test song
INSERT INTO songs (title, artist_id, album_id, release_date, link, posted_by_user_id) 
VALUES ('Road to Nowhere', 1, 1, '2023-03-15', 'https://example.com/songs/road-to-nowhere', 1);

CREATE INDEX idx_songs_artist_id ON songs(artist_id);
   CREATE INDEX idx_songs_album_id ON songs(album_id);
   CREATE INDEX idx_albums_artist_id ON albums(artist_id);