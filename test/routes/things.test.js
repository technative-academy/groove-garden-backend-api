import express from "express";
import request from "supertest";
import { expect } from "chai";
import sinon from "sinon";
import thingsRouter from "../../src/routes/things.js";
import pool from "../../src/db.js";
import { initTestDb } from "../init-db.js";
import dotenv from "dotenv";

dotenv.config();

describe("Things API", () => {
  let app;

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
    const things = await pool.query(`
      INSERT INTO things (name, description, user_id)
      VALUES
      ('Thing 1', 'Description 1', (SELECT id FROM users WHERE email = 'johndoe@example.com')),
      ('Thing 2', 'Description 2', (SELECT id FROM users WHERE email = 'johndoe@example.com')),
      ('Thing 3', 'Description 3', (SELECT id FROM users WHERE email = 'janedoe@example.com'))
      RETURNING *;
    `);

    app.use("/api/things", thingsRouter);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GET /api/things", () => {
    it("should return all things", async () => {
      const res = await request(app).get("/api/things");
      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(3);
    });
  });

  describe("GET /api/things/:id", () => {
    it("should return a specific thing", async () => {
      const res = await request(app).get("/api/things/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.include({ id: 1, name: "Thing 1" });
    });

    it("should return 404 if thing not found", async () => {
      const res = await request(app).get("/api/things/999");
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Thing not found" });
    });
  });
});
