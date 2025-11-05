import { expect } from "chai";
import sinon from "sinon";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../src/db.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../src/services/auth.js";

describe("Auth functions", () => {
  let queryStub;
  let bcryptHashStub;
  let bcryptCompareStub;
  let jwtSignStub;
  let jwtVerifyStub;

  beforeEach(() => {
    queryStub = sinon.stub(pool, "query");
    bcryptHashStub = sinon.stub(bcrypt, "hash");
    bcryptCompareStub = sinon.stub(bcrypt, "compare");
    jwtSignStub = sinon.stub(jwt, "sign");
    jwtVerifyStub = sinon.stub(jwt, "verify");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("registerUser", () => {
    it("should throw an error if email already exists", async () => {
      queryStub.resolves({ rows: [{ email: "test@example.com" }] });

      try {
        await registerUser(
          "Test User",
          "test@example.com",
          "password123",
          "Bio"
        );
        expect.fail("Expected error not thrown");
      } catch (err) {
        expect(err.message).to.equal("Email already exists");
      }
    });

    it("should register a new user", async () => {
      queryStub.onFirstCall().resolves({ rows: [] });
      queryStub.onSecondCall().resolves({
        rows: [
          { id: 1, name: "Test User", email: "test@example.com", bio: "Bio" },
        ],
      });
      bcryptHashStub.resolves("hashedpassword");

      const user = await registerUser(
        "Test User",
        "test@example.com",
        "password123",
        "Bio"
      );

      expect(user).to.deep.equal({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        bio: "Bio",
      });
      expect(queryStub.calledTwice).to.be.true;
      expect(bcryptHashStub.calledOnce).to.be.true;
    });
  });

  describe("loginUser", () => {
    it("should throw an error for invalid email or password", async () => {
      queryStub.resolves({ rows: [] });

      try {
        await loginUser("test@example.com", "password123");
        expect.fail("Expected error not thrown");
      } catch (err) {
        expect(err.message).to.equal("Invalid email or password");
      }
    });

    it("should log in a user and return tokens", async () => {
      queryStub.resolves({
        rows: [
          {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            password: "hashedpassword",
          },
        ],
      });
      bcryptCompareStub.resolves(true);
      jwtSignStub.onFirstCall().returns("accesstoken");
      jwtSignStub.onSecondCall().returns("refreshtoken");

      const result = await loginUser("test@example.com", "password123");

      expect(result).to.deep.equal({
        id: 1,
        name: "Test User",
        accessToken: "accesstoken",
        refreshToken: "refreshtoken",
      });
      expect(queryStub.calledOnce).to.be.true;
      expect(bcryptCompareStub.calledOnce).to.be.true;
      expect(jwtSignStub.calledTwice).to.be.true;
    });
  });

  describe("refreshAccessToken", () => {
    it("should throw an error for invalid refresh token", async () => {
      jwtVerifyStub.throws(new Error("Invalid refresh token"));

      try {
        await refreshAccessToken("invalidtoken");
        expect.fail("Expected error not thrown");
      } catch (err) {
        expect(err.message).to.equal("Invalid refresh token");
      }
    });

    it("should generate a new access token", async () => {
      jwtVerifyStub.resolves({ id: 1, email: "test@example.com" });
      jwtSignStub.returns("newaccesstoken");

      const accessToken = await refreshAccessToken("validrefreshtoken");

      expect(accessToken).to.equal("newaccesstoken");
      expect(jwtVerifyStub.calledOnce).to.be.true;
      expect(jwtSignStub.calledOnce).to.be.true;
    });
  });
});
