import Role from "../models/Role.js";
import User from "../models/User.js";

const seedAdmin = async () => {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required");
  }

  const superAdminRole = await Role.findOne({ name: "superadmin" });

  if (!superAdminRole) {
    throw new Error("Superadmin role not found");
  }

  existingAdmin = await User.findOne({ email: email });

  if (existingAdmin) {
    console.log("Superadmin already exists");
    return existingAdmin;
  }

  const hashedpassword = await User.hashPassword(password);

  const admin = await User.create({
    email: email,
    password: hashedpassword,
    role: superAdminRole._id,
  });

  console.log("Default SuperAdmin created");
  return admin;
};

export default seedAdmin;
