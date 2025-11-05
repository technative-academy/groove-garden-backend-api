import express from "express";
import request from "supertest";
import { expect } from "chai";
import sinon from "sinon";
import bcrypt from "bcryptjs";
import authRouter from "../../src/routes/auth.js";
import pool from "../../src/db.js";
import { initTestDb } from "../init-db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

describe("Auth API", () => {
  let app;
  let refreshToken;

  before(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Reset the test database before each test
    await pool.query("TRUNCATE things, users RESTART IDENTITY CASCADE");

    // Insert mock user with hashed password
    const hashedPassword = await bcrypt.hash("password123", 10);
    await pool.query(
      `
      INSERT INTO users (name, email, password, bio)
      VALUES ('John Doe', 'johndoe@example.com', $1, 'Loves collecting things.');
    `,
      [hashedPassword]
    );

    app.use("/api/auth", authRouter);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Jane Doe",
        email: "janedoe@example.com",
        password: "password123",
        bio: "Loves collecting other things.",
      });
      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        name: "Jane Doe",
        email: "janedoe@example.com",
      });
    });

    it("should return 400 if email already exists", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
        bio: "Loves collecting things.",
      });
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "Email already exists" });
    });
  });

  describe("POST /api/auth/login", () => {
    it("should log in a user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });
      expect(res.status).to.equal(200);
      expect(res.body).to.include({ name: "John Doe" });
      expect(res.body).to.have.property("accessToken");
      expect(res.headers["set-cookie"]).to.exist;

      const cookie = res.headers["set-cookie"][0];
      refreshToken = cookie.split(";")[0].split("=")[1];
    });

    it("should return 400 for invalid email or password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "johndoe@example.com",
        password: "wrongpassword",
      });
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "Invalid email or password" });
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    beforeEach(async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });
      refreshToken = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
    });

    it("should refresh the access token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token/")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .send({});
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("accessToken");
    });

    it("should return 401 if refresh token is missing", async () => {
      const res = await request(app).post("/api/auth/refresh-token").send({});
      expect(res.status).to.equal(401);
    });

    it("should return 403 if refresh token is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .set("Cookie", "refreshToken=invalidtoken")
        .send({});
      expect(res.status).to.equal(403);
      expect(res.body).to.deep.equal({ error: "Invalid refresh token" });
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should log out a user", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Logged out" });
    });
  });
});
