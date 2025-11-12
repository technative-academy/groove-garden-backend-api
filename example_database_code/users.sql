DROP table if exists users CASCADE;
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Insert Test Users
INSERT INTO users (username, email, password, created_at) VALUES
('john_doe','testemail@email.com', 'password123', NOW())

