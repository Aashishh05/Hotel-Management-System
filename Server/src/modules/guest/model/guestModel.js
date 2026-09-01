import mongoose from "mongoose";


const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
      minlength: [2, "Guest name must be at least 2 characters"],
      maxlength: [100, "Guest name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [
        /^[0-9+\-\s()]{7,20}$/,
        "Please provide a valid phone number",
      ],
    },

    idType: {
      type: String,
      enum: {
        values: ["passport", "national-id", "drivers-license"],
        message: "Invalid ID type",
      },
    },

    idNumber: {
      type: String,
      trim: true,
      maxlength: [50, "ID number cannot exceed 50 characters"],
    },

    nationality: {
      type: String,
      trim: true,
      maxlength: [100, "Nationality cannot exceed 100 characters"],
    },

    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

guestSchema.index({ email: 1 });
guestSchema.index({ phone: 1 });

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;