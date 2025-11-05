import express from "express";
import request from "supertest";
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import usersRouter from "../../src/routes/users.js";
import pool from "../../src/db.js";
import { initTestDb } from "../init-db.js";
import dotenv from "dotenv";

dotenv.config();

describe("Users API", () => {
  let app;
  let token;

  before(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    // Reset the test database before each test
    await pool.query("TRUNCATE things, users RESTART IDENTITY CASCADE");

    // Insert mock users
    await pool.query(`
      INSERT INTO users (name, email, password, bio)
      VALUES
      ('John Doe', 'johndoe@example.com', 'password123', 'Loves collecting things.'),
      ('Jane Doe', 'janedoe@example.com', 'password123', 'Loves collecting other things.');
    `);

    // Insert mock things
    await pool.query(`
      INSERT INTO things (name, description, user_id)
      VALUES
      ('Thing 1', 'Description 1', (SELECT id FROM users WHERE email = 'johndoe@example.com')),
      ('Thing 2', 'Description 2', (SELECT id FROM users WHERE email = 'johndoe@example.com')),
      ('Thing 3', 'Description 3', (SELECT id FROM users WHERE email = 'janedoe@example.com'));
    `);

    app.use("/api/users", usersRouter);

    // Generate a valid token
    const user = { id: 1, email: "johndoe@example.com" };
    token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a specific user", async () => {
      const res = await request(app)
        .get("/api/users/1")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.include({ id: 1, name: "John Doe" });
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app)
        .get("/api/users/999")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "User not found" });
    });
  });

  describe("GET /api/users/:id/things", () => {
    it("should return things for a specific user", async () => {
      const res = await request(app)
        .get("/api/users/1/things")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
    });
  });
});
