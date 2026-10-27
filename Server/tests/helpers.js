import bcrypt from "bcrypt";
import request from "supertest";

import Role from "../src/modules/role/model/roleModel.js";
import Permission from "../src/modules/permission/model/permissionModel.js";
import User from "../src/modules/user/model/userModel.js";
import Room from "../src/modules/room/model/roomModel.js";
import Guest from "../src/modules/guest/model/guestModel.js";
import Booking from "../src/modules/booking/model/bookingModel.js";
import Notification from "../src/modules/notification/model/notificationModel.js";
import AuditLog from "../src/modules/auditlog/model/auditlogModel.js";

import app from "../app.js";
import {
  createDefaultPermissions,
  rolePermissions,
} from "../src/seed/permissionSeed.js";

const MODEL_PATHS = [
  Role,
  Permission,
  User,
  Room,
  Guest,
  Booking,
  Notification,
  AuditLog,
];

const clearDatabase = async () => {
  for (const model of MODEL_PATHS) {
    await model.deleteMany({});
  }
};

const seedRole = async (name, overrides) => {
  const role = await Role.create({
    name,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    description: `${name} role`,
  });

  const modules = createDefaultPermissions();

  if (overrides) {
    Object.assign(modules, overrides);
  }

  await Permission.create({ role: role._id, modules });

  return role;
};

// bcrypt cost 4 keeps test logins fast while still exercising the same flow.
const createUser = async ({ name, email, password, roleName }) => {
  const role = await Role.findOne({ name: roleName });

  const hashed = await bcrypt.hash(password, 4);

  return await User.create({
    name,
    email,
    password: hashed,
    role: role._id,
  });
};

const requestAgent = request(app);

const login = async (email, password) => {
  const res = await requestAgent.post("/api/auth/login").send({ email, password });

  return res;
};

// Pull the two cookie values out of a login/refresh response and turn them
// into a single "Cookie" header value for follow-up requests.
const cookieHeaderFrom = (res) => {
  const setCookies = res.headers["set-cookie"] || [];

  const values = setCookies.map((entry) => entry.split(";")[0]);

  return values.join("; ");
};

export {
  clearDatabase,
  seedRole,
  createUser,
  login,
  cookieHeaderFrom,
  requestAgent,
};
