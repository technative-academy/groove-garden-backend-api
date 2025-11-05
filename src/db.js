import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;

dotenv.config();

const isTestEnv = process.env.NODE_ENV === "test";

// Create a new pool instance for managing database connections
// Use different environment variables depending on whether it's a test environment
const pool = new Pool({
  user: isTestEnv ? process.env.TEST_DB_USER : process.env.DB_USER,
  host: isTestEnv ? process.env.TEST_DB_HOST : process.env.DB_HOST,
  database: isTestEnv ? process.env.TEST_DB_NAME : process.env.DB_NAME,
  password: isTestEnv ? process.env.TEST_DB_PW : process.env.DB_PW,
  port: isTestEnv ? process.env.TEST_DB_PORT : process.env.DB_PORT,
});

export default pool;
