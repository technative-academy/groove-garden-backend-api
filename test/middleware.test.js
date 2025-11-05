import express from "express";
import request from "supertest";
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import authenticateToken from "../src/middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

describe("authenticateToken middleware", () => {
  let app;
  let jwtVerifyStub;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // A simple route to test the middleware
    app.get("/protected", authenticateToken, (req, res) => {
      res.status(200).json({ message: "Protected content", user: req.user });
    });

    // Stub jwt.verify
    jwtVerifyStub = sinon.stub(jwt, "verify");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).to.equal(401);
  });

  it("should return 403 if token is invalid", async () => {
    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(new Error("Invalid token"), null);
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).to.equal(403);
  });

  it("should call next() and set req.user if token is valid", async () => {
    const mockUser = { id: 1, name: "Test User" };
    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(null, mockUser);
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer validtoken");

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      message: "Protected content",
      user: mockUser,
    });
  });
});
