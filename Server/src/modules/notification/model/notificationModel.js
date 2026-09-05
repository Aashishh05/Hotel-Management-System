import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      minlength: [2, "Notification title must be at least 2 characters"],
      maxlength: [200, "Notification title cannot exceed 200 characters"],
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Notification message cannot exceed 1000 characters"],
    },

    type: {
      type: String,
      enum: {
        values: [
          "info",
          "success",
          "warning",
          "error",
          "booking",
          "payment",
          "maintenance",
          "housekeeping",
          "restaurant",
          "system",
        ],
        message: "Invalid notification type",
      },
      default: "info",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    targetModule: {
      type: String,
      trim: true,
      maxlength: [100, "Target module cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
