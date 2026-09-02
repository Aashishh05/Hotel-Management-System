import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import Role from "../modules/role/model/roleModel.js";
import Permission from "../modules/permission/model/permissionModel.js";

import roles from "./rolesSeed.js";
import { createDefaultPermissions, rolePermissions } from "./permissionSeed.js";

import seedAdmin from "./adminSeed.js";


const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    // Seed roles
    for (const roleData of roles) {
      await Role.findOneAndUpdate({ name: roleData.name }, roleData, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
    }

    console.log("Roles seeded successfully");

    // Seed permissions
    for (const roleData of roles) {
      const role = await Role.findOne({
        name: roleData.name,
      });

      if (!role) {
        throw new Error(`Role not found: ${roleData.name}`);
      }

      const permissions = createDefaultPermissions();

      if (rolePermissions[role.name]) {
        Object.assign(permissions, rolePermissions[role.name]);
      }

      await Permission.findOneAndUpdate(
        { role: role._id },
        {
          role: role._id,
          permissions,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    console.log("Permissions seeded successfully");

    // Seed SuperAdmin
    await seedAdmin();

    console.log("Data seeding completed successfully");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedDatabase();
