# DB

## Create database

Create database:

```sql
CREATE DATABASE yourdatabase;
```

Switch to database:

```sql
\c yourdatabase;
```

Create user table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  bio TEXT
);
```

Create things table:

```sql
CREATE TABLE things (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
```

Create tags table:

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);
```

Create tags-things join table:

```sql
CREATE TABLE tags_things (
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  thing_id INTEGER REFERENCES things(id) ON DELETE CASCADE,
  PRIMARY KEY (tag_id, thing_id)
);
```

## Populate database

Insert a User:

```sql
INSERT INTO users (name, email, password, bio) VALUES ('John Doe', 'john@example.com', 'hashedpassword', 'This is my bio');
```

Insert a Thing:

```sql
INSERT INTO things (name, description, user_id) VALUES ('My Thing', 'This is a description', 1);
```

Insert a Tag:

```sql
INSERT INTO tags (name) VALUES ('Tag1');
```

Associate a Tag with a Thing:

```sql
INSERT INTO tags_things (tag_id, thing_id) VALUES (1, 1);
```

## Add indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_things_user_id ON things(user_id);
```

---

SQL:

```sql
-- Create database
CREATE DATABASE yourdatabase;

-- Switch to database
\c yourdatabase;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  bio TEXT
);

-- Create things table
CREATE TABLE things (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Create tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Create tags-things join table
CREATE TABLE tags_things (
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  thing_id INTEGER REFERENCES things(id) ON DELETE CASCADE,
  PRIMARY KEY (tag_id, thing_id)
);

-- Populate database
-- Insert a User
INSERT INTO users (name, email, password, bio) VALUES ('John Doe', 'john@example.com', 'hashedpassword', 'This is my bio');

-- Insert a Thing
INSERT INTO things (name, description, user_id) VALUES ('My Thing', 'This is a description', 1);

-- Insert a Tag
INSERT INTO tags (name) VALUES ('Tag1');

-- Associate a Tag with a Thing
INSERT INTO tags_things (tag_id, thing_id) VALUES (1, 1);

-- Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_things_user_id ON things(user_id);
```