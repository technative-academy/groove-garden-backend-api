DROP table if exists users;
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Insert Test Users
INSERT INTO users (username, password, created_at) VALUES
('john_doe', 'password123', NOW()),
('jane_smith', 'securepass456', NOW()),
('music_lover', 'melody2024', NOW()),
('dj_master', 'beats4life', NOW()),
('playlist_pro', 'tunes789', NOW()),
('rock_fan', 'guitar2023', NOW()),
('jazz_enthusiast', 'smooth_jazz', NOW()),
('pop_star', 'hitmaker', NOW()),
('indie_kid', 'underground', NOW()),
('classical_buff', 'symphony99', NOW());

