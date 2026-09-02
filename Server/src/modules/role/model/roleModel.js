import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Role name is required"],
    lowercase: true,
    unique: true,
    trim: true,
    minlength: [2, "Role name must be at least 2 characters"],
    maxlength: [20, "Role name cannot exceed 20 characters"],
    match: [
      /^[a-z0-9-]+$/,
      "Role name can only contain lowercase letters, numbers, and hyphens",
    ],
  },
  displayName: {
    type: String,
    trim: true,
    required: [true, "displayName is required"],
    maxlength: [50, "displayName cannot exceed 50 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [100, "description cannot exceed 100 characters "],
  },

  //   isSystem: true will later be checked in the service before allowing deletion.
  isSystem: {
    type: Boolean,
    default: false,
  },
},{timestamps:true});

const Role = mongoose.model("Role", roleSchema);
export default Role;
