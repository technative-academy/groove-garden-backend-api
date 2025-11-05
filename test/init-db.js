import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.TEST_DB_USER,
  host: process.env.TEST_DB_HOST,
  database: process.env.TEST_DB_NAME,
  password: process.env.TEST_DB_PW,
  port: process.env.TEST_DB_PORT,
});

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(100),
      bio TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS things (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      description TEXT,
      user_id INTEGER REFERENCES users(id)
    );
  `);
};

const dropTables = async () => {
  await pool.query("DROP TABLE IF EXISTS things;");
  await pool.query("DROP TABLE IF EXISTS users;");
};

export const initTestDb = async () => {
  await dropTables();
  await createTables();
};

export const closePool = async () => {
  await pool.end();
};
