import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^(97|98)\d{8}$/, "Please provide a valid phone number"],
    },

    avatar: {
      type: String,
      trim: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

export default User;
