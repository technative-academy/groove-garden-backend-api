-- run 'psql -f example_database_code/examples.sql' in terminal to seed example database
DROP DATABASE IF EXISTS example_database;
CREATE DATABASE example_database;
\c example_database;

:
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
INSERT INTO artists (name) VALUES
('The Midnight Riders'),


-- Insert Albums
INSERT INTO albums (name) VALUES
('Highway Chronicles'),

-- Insert Songs
INSERT INTO songs (title, artist_id, album_id, release_date, link) VALUES
('Road to Nowhere', 1, 1, '2023-03-15', 'https://example.com/songs/road-to-nowhere'),


DROP table if exists users;
-- Create Users Table
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert Test Users
INSERT INTO users (username, email, password, created_at)
VALUES ('john_doe', 'testemail@email.com', 'password123', NOW());

-- Create Playlists Table
CREATE TABLE playlists (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) DEFAULT 'None',
    created_by_user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
