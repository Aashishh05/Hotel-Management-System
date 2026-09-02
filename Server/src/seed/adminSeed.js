import bcrypt from "bcryptjs";

import User from "../modules/user/model/userModel.js";
import Role from "../modules/role/model/roleModel.js";

const seedAdmin = async () => {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required");
  }

  const superAdminRole = await Role.findOne({
    name: "superadmin",
  });

  if (!superAdminRole) {
    throw new Error("SuperAdmin role not found");
  }

  const existingAdmin = await User.findOne({
    email,
  });

  if (existingAdmin) {
    console.log("SuperAdmin already exists");
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await User.create({
    name: "Super Admin",
    email,
    password: hashedPassword,
    role: superAdminRole._id,
  });

  console.log("Default SuperAdmin created");

  return admin;
};

export default seedAdmin;
