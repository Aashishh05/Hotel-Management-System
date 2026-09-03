import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: [true, "Guest is required"],
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },

    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },

    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
    },

    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "checked-in",
          "checked-out",
          "cancelled",
        ],
        message: "Invalid booking status",
      },
      default: "pending",
    },

    actualCheckIn: {
      type: Date,
    },

    actualCheckOut: {
      type: Date,
    },

    totalAmount: {
      type: Number,
      min: [0, "Total amount cannot be negative"],
      default: 0,
    },

    specialRequests: {
      type: String,
      trim: true,
      maxlength: [1000, "Special requests cannot exceed 1000 characters"],
    },

    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre("validate", function (next) {
  if (
    this.checkInDate &&
    this.checkOutDate &&
    this.checkOutDate <= this.checkInDate
  ) {
    return next(new Error("Check-out date must be after check-in date"));
  }

  next();
});

bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ guest: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
