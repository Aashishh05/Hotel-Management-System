import mongoose, { Schema } from "mongoose";

const modulePermissionSchema = new mongoose.Schema({
  read: {
    type: Boolean,
    default: false,
  },
  create: {
    type: Boolean,
    default: false,
  },
  update: {
    type: Boolean,
    default: false,
  },
  delete: {
    type: Boolean,
    default: false,
  },
});

const PermissionSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: [true, "Role is required"],
    unique: true,
  },
  modules: {
    type: Map,
    of: modulePermissionSchema,
    default: {},
  },
});

const Permission = mongoose.model("Permission", PermissionSchema);

export default Permission;
