-- Create Playlists Table
DROP TABLE IF EXISTS playlist_song;
DROP TABLE IF EXISTS playlists;
CREATE TABLE playlists (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) DEFAULT 'None',
    created_by_user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE playlist_song (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    playlist_id INT REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INT REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE (playlist_id, song_id)  -- Prevent duplicate song entries in a playlist
);