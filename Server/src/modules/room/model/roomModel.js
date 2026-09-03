import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, "Room number cannot exceed 20 characters"],
    },

    type: {
      type: String,
      required: [true, "Room type is required"],
      enum: {
        values: ["single", "double", "suite", "deluxe"],
        message: "Room type must be single, double, suite, or deluxe",
      },
    },

    floor: {
      type: Number,
      min: [0, "Floor cannot be negative"],
      max: [200, "Floor cannot exceed 200"],
    },

    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["available", "occupied", "cleaning", "maintenance","reserved"],
        message: "Invalid room status",
      },
      default: "available",
    },

    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: function (amenities) {
          return amenities.every(
            (amenity) =>
              typeof amenity === "string" && amenity.trim().length > 0,
          );
        },
        message: "Amenities must contain valid strings",
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.index({ status: 1 });
roomSchema.index({ type: 1 });

const Room = mongoose.model("Room", roomSchema);

export default Room;
