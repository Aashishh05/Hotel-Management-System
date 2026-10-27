import { describe, it, expect, beforeAll } from "vitest";

import Room from "../src/modules/room/model/roomModel.js";

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
  name: "Rose Frontdesk",
  email: "rooms-manager@test.example",
  password: "password123",
};

const MANAGER_ROLE = "hoteladmin";

const roomPayload = (number) => ({
  number,
  type: "double",
  floor: 2,
  pricePerNight: 120,
  amenities: ["Free Wi-Fi"],
  description: `Double room ${number}`,
});

beforeAll(async () => {
  await clearDatabase();
  await seedRole(MANAGER_ROLE, rolePermissions[MANAGER_ROLE]);
  await createUser({ ...MANAGER, roleName: MANAGER_ROLE });
});

describe("POST /api/room/create", () => {
  it("creates a room without images when the role has permission", async () => {
    const loginRes = await login(MANAGER.email, MANAGER.password);

    const res = await requestAgent
      .post("/api/room/create")
      .set("Cookie", cookieHeaderFrom(loginRes))
      .field("number", "101")
      .field("type", "double")
      .field("floor", "2")
      .field("pricePerNight", "120");

    expect(res.status).toBe(201);
    expect(res.body.room.number).toBe("101");
    expect(res.body.room.status).toBe("available");
  });

  it("rejects an unauthenticated create", async () => {
    const res = await requestAgent
      .post("/api/room/create")
      .field("number", "102")
      .field("type", "double")
      .field("pricePerNight", "120");

    expect(res.status).toBe(401);
  });

  it("rejects a guest role without rooms.create permission", async () => {
    const guestRole = await seedRole("guest", rolePermissions.guest);
    const guest = await createUser({
      name: "Grace Guest",
      email: "room-guest@test.example",
      password: "password123",
      roleName: guestRole.name,
    });

    const loginRes = await login(guest.email, "password123");

    const res = await requestAgent
      .post("/api/room/create")
      .set("Cookie", cookieHeaderFrom(loginRes))
      .field("number", "103")
      .field("type", "double")
      .field("pricePerNight", "90");

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe("room lifecycle", () => {
  it("updates then deletes a room; deleted room answers 404", async () => {
    const loginRes = await login(MANAGER.email, MANAGER.password);
    const cookies = cookieHeaderFrom(loginRes);

    const createRes = await requestAgent
      .post("/api/room/create")
      .set("Cookie", cookies)
      .field("number", "201")
      .field("type", "suite")
      .field("floor", "3")
      .field("pricePerNight", "260");

    const roomId = createRes.body.room._id;

    const updateRes = await requestAgent
      .put(`/api/room/update/${roomId}`)
      .set("Cookie", cookies)
      .field("pricePerNight", "290");

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.room.pricePerNight).toBe(290);

    const deleteRes = await requestAgent
      .delete(`/api/room/delete/${roomId}`)
      .set("Cookie", cookies);

    expect(deleteRes.status).toBe(200);

    const getRes = await requestAgent
      .get(`/api/room/get/${roomId}`)
      .set("Cookie", cookies);

    expect(getRes.status).toBe(404);
  });

  it("answers 404 for an unknown room id", async () => {
    const loginRes = await login(MANAGER.email, MANAGER.password);

    const res = await requestAgent
      .get("/api/room/get/000000000000000000000000")
      .set("Cookie", cookieHeaderFrom(loginRes));

    expect(res.status).toBe(404);
  });
});

describe("GET /api/room/public pagination", () => {
  beforeAll(async () => {
    await Room.deleteMany({});

    const rooms = Array.from({ length: 15 }, (_, i) =>
      roomPayload(String(100 + i)),
    );

    await Room.insertMany(rooms);
  });

  it("returns every room when no params are passed", async () => {
    const res = await requestAgent.get("/api/room/public");

    expect(res.status).toBe(200);
    expect(res.body.rooms).toHaveLength(15);
    expect(res.body.total).toBeUndefined();
  });

  it("returns a page with total and totalPages", async () => {
    const res = await requestAgent.get("/api/room/public?page=2&limit=5");

    expect(res.status).toBe(200);
    expect(res.body.rooms).toHaveLength(5);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(2);
    expect(res.body.totalPages).toBe(3);
  });

  it("rejects invalid pagination", async () => {
    const bad = await requestAgent.get("/api/room/public?page=abc&limit=5");
    const oversized = await requestAgent.get(
      "/api/room/public?page=1&limit=999",
    );

    expect(bad.status).toBe(400);
    expect(oversized.status).toBe(400);
  });
});
