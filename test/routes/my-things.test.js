import express from "express";
import request from "supertest";
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import myThingsRouter from "../../src/routes/my-things.js";
import pool from "../../src/db.js";
import { initTestDb } from "../init-db.js";
import dotenv from "dotenv";

dotenv.config();

describe("My Things API", () => {
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

    // Generate a valid token
    const user = { id: 1, email: "johndoe@example.com" };
    token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    app.use("/api/my-things", myThingsRouter);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GET /api/my-things", () => {
    it("should return all things for the authenticated user", async () => {
      // Insert mock things for the authenticated user
      await pool.query(`
        INSERT INTO things (name, description, user_id)
        VALUES
        ('Thing 1', 'Description 1', (SELECT id FROM users WHERE email = 'johndoe@example.com')),
        ('Thing 2', 'Description 2', (SELECT id FROM users WHERE email = 'johndoe@example.com'));
      `);

      const res = await request(app)
        .get("/api/my-things")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
    });
  });

  describe("POST /api/my-things", () => {
    it("should add a new thing for the authenticated user", async () => {
      const newThing = { name: "New Thing", description: "New Description" };
      const res = await request(app)
        .post("/api/my-things")
        .set("Authorization", `Bearer ${token}`)
        .send(newThing);
      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        name: "New Thing",
        description: "New Description",
      });
    });
  });

  describe("PUT /api/my-things/:id", () => {
    beforeEach(async () => {
      // Insert a mock thing for the authenticated user
      await pool.query(`
        INSERT INTO things (name, description, user_id)
        VALUES ('Thing 1', 'Description 1', (SELECT id FROM users WHERE email = 'johndoe@example.com'));
      `);
    });

    it("should update a thing for the authenticated user", async () => {
      const updatedThing = {
        name: "Updated Thing",
        description: "Updated Description",
      };
      const res = await request(app)
        .put("/api/my-things/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedThing);
      expect(res.status).to.equal(200);
      expect(res.body).to.include({
        name: "Updated Thing",
        description: "Updated Description",
      });
    });

    it("should return 404 if the thing is not found", async () => {
      const updatedThing = {
        name: "Updated Thing",
        description: "Updated Description",
      };
      const res = await request(app)
        .put("/api/my-things/999")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedThing);
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Thing not found" });
    });
  });

  describe("DELETE /api/my-things/:id", () => {
    beforeEach(async () => {
      // Insert a mock thing for the authenticated user
      await pool.query(`
        INSERT INTO things (name, description, user_id)
        VALUES ('Thing 1', 'Description 1', (SELECT id FROM users WHERE email = 'johndoe@example.com'));
      `);
    });

    it("should delete a thing for the authenticated user", async () => {
      const res = await request(app)
        .delete("/api/my-things/1")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(204);
    });

    it("should return 404 if the thing is not found", async () => {
      const res = await request(app)
        .delete("/api/my-things/999")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Thing not found" });
    });
  });
});
