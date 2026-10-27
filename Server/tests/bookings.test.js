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

const GUEST_ROLE = "guest";

const guestUser = {
  name: "Gilbert Guest",
  email: "booking-guest@test.example",
  password: "password123",
};

const iso = (date) => date.toISOString();

const range = (startDay, endDay) => ({
  checkInDate: iso(new Date(Date.UTC(2026, 0, startDay))),
  checkOutDate: iso(new Date(Date.UTC(2026, 0, endDay))),
});

const makeRoom = async (number) => {
  return await Room.create({
    number,
    type: "double",
    floor: 2,
    pricePerNight: 120,
    amenities: ["Free Wi-Fi"],
  });
};

let room;

beforeAll(async () => {
  await clearDatabase();
  await seedRole(GUEST_ROLE, rolePermissions[GUEST_ROLE]);
  await createUser({ ...guestUser, roleName: GUEST_ROLE });

  room = await makeRoom("501");
});

// Guests book "for themselves": the service resolves or creates a guest
// profile from the user's account and requires a phone number on it.
const bookingPayload = (dates, extra = {}) => ({
  room: room._id.toString(),
  totalAmount: 240,
  guestsCount: 2,
  guestPhone: "9841000000",
  ...dates,
  ...extra,
});

describe("POST /api/bookings/create (guest self-service)", () => {
  it("books a room as the guest role and answers 201 pending", async () => {
    const loginRes = await login(guestUser.email, guestUser.password);
    const cookies = cookieHeaderFrom(loginRes);

    const res = await requestAgent
      .post("/api/bookings/create")
      .set("Cookie", cookies)
      .send(bookingPayload(range(1, 4)));

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe("pending");
    expect(res.body.booking.guest).toBeTruthy();
  });

  it("requires a phone number", async () => {
    const loginRes = await login(guestUser.email, guestUser.password);

    const res = await requestAgent
      .post("/api/bookings/create")
      .set("Cookie", cookieHeaderFrom(loginRes))
      .send({
        ...bookingPayload(range(5, 7)),
        guestPhone: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("rejects an overlapping booking for the same room with 409", async () => {
    // First booking is the one from the earlier test (Jan 1-4).
    const loginRes = await login(guestUser.email, guestUser.password);
    const cookies = cookieHeaderFrom(loginRes);

    const res = await requestAgent
      .post("/api/bookings/create")
      .set("Cookie", cookies)
      .send(bookingPayload(range(2, 5)));

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Room is already booked for the selected dates");
  });

  it("allows a booking later that does not overlap", async () => {
    const loginRes = await login(guestUser.email, guestUser.password);
    const cookies = cookieHeaderFrom(loginRes);

    const res = await requestAgent
      .post("/api/bookings/create")
      .set("Cookie", cookies)
      .send(bookingPayload(range(10, 14)));

    expect(res.status).toBe(201);
  });

  it("rejects an unknown room", async () => {
    const loginRes = await login(guestUser.email, guestUser.password);
    const cookies = cookieHeaderFrom(loginRes);

    const res = await requestAgent
      .post("/api/bookings/create")
      .set("Cookie", cookies)
      .send({
        ...bookingPayload(range(20, 22)),
        room: "000000000000000000000000",
      });

    expect(res.status).toBe(404);
  });
});
