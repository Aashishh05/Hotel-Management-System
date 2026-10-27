import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

import {
  clearDatabase,
  seedRole,
  createUser,
  login,
  cookieHeaderFrom,
  requestAgent,
} from "./helpers.js";
import { rolePermissions } from "../src/seed/permissionSeed.js";

const MANAGER = {
  name: "Mona Manager",
  email: "manager@test.example",
  password: "password123",
};

const MANAGER_ROLE = "hoteladmin";

beforeAll(async () => {
  await clearDatabase();
  await seedRole(MANAGER_ROLE, rolePermissions[MANAGER_ROLE]);
  await createUser({ ...MANAGER, roleName: MANAGER_ROLE });
});

describe("POST /api/auth/login", () => {
  it("returns 200 and sets short access + long refresh cookies", async () => {
    const res = await login(MANAGER.email, MANAGER.password);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const setCookies = res.headers["set-cookie"];

    const accessTokenCookie = setCookies.find((entry) =>
      entry.startsWith("token="),
    );
    const refreshTokenCookie = setCookies.find((entry) =>
      entry.startsWith("refreshToken="),
    );

    expect(accessTokenCookie).toBeTruthy();
    expect(refreshTokenCookie).toBeTruthy();

    const accessMaxAge = Number(
      accessTokenCookie.split("Max-Age=")[1]?.split(";")[0],
    );
    const refreshMaxAge = Number(
      refreshTokenCookie.split("Max-Age=")[1]?.split(";")[0],
    );

    expect(accessMaxAge).toBe(15 * 60);
    expect(refreshMaxAge).toBe(7 * 24 * 60 * 60);
    expect(accessTokenCookie).toContain("HttpOnly");
    expect(refreshTokenCookie).toContain("HttpOnly");
  });

  it("rejects a wrong password with 401 and no cookies", async () => {
    const res = await login(MANAGER.email, "wrong-password");

    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects an unknown email with 401 and same generic message", async () => {
    const res = await login("ghost@test.example", MANAGER.password);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the logged-in user with role name", async () => {
    const loginRes = await login(MANAGER.email, MANAGER.password);

    const res = await requestAgent
      .get("/api/auth/me")
      .set("Cookie", cookieHeaderFrom(loginRes));

    expect(res.status).toBe(200);
    expect(res.body.data.role.name).toBe(MANAGER_ROLE);
    expect(res.body.data.email).toBe(MANAGER.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it("answers 200 with null data when no token is present", async () => {
    const res = await requestAgent.get("/api/auth/me");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it("answers 401 when the access token is garbage so the client refresh path kicks in", async () => {
    const res = await requestAgent
      .get("/api/auth/me")
      .set("Cookie", "token=not-a-real.jwt");

    expect(res.status).toBe(401);
  });

  it("answers 401 when the access token is expired", async () => {
    const expired = jwt.sign(
      { id: "000000000000000000000000" },
      process.env.JWT_SECRET,
      { expiresIn: "-10s" },
    );

    const res = await requestAgent
      .get("/api/auth/me")
      .set("Cookie", `token=${expired}`);

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/refresh", () => {
  it("rotates both cookies when the refresh token is valid", async () => {
    const loginRes = await login(MANAGER.email, MANAGER.password);
    const cookies = cookieHeaderFrom(loginRes);

    const refreshToken = cookies
      .split("; ")
      .find((entry) => entry.startsWith("refreshToken="))
      ?.split("=")[1];

    const res = await requestAgent
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(MANAGER.email);

    const setCookies = res.headers["set-cookie"];

    expect(setCookies.some((c) => c.startsWith("token="))).toBe(true);
    expect(setCookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  it("answers 401 without a refresh token", async () => {
    const res = await requestAgent.post("/api/auth/refresh");

    expect(res.status).toBe(401);
  });

  it("answers 401 for a tampered refresh token", async () => {
    const res = await requestAgent
      .post("/api/auth/refresh")
      .set("Cookie", "refreshToken=tampered.token.value");

    expect(res.status).toBe(401);
  });

  it("refuses an access token replayed at the refresh endpoint", async () => {
    const loginRes = await login(MANAGER.email, MANAGER.password);
    const cookies = cookieHeaderFrom(loginRes);

    const accessToken = cookies
      .split("; ")
      .find((entry) => entry.startsWith("token="))
      ?.split("=")[1];

    const res = await requestAgent
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${accessToken}`);

    expect(res.status).toBe(401);
  });

  it("refuses a refresh token signed with the wrong secret", async () => {
    const fake = jwt.sign(
      { id: "000000000000000000000000", type: "refresh" },
      "wrong-secret",
      { expiresIn: "1h" },
    );

    const res = await requestAgent
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${fake}`);

    expect(res.status).toBe(401);
  });
});

describe("protected endpoints", () => {
  it("rejects /api/room/get without any token", async () => {
    const res = await requestAgent.get("/api/room/get");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
