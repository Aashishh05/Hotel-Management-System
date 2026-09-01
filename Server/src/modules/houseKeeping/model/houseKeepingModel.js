import mongoose from "mongoose";

const housekeepingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      required: [true, "Housekeeping task type is required"],
      enum: {
        values: ["cleaning", "turndown", "deep-clean"],
        message: "Invalid housekeeping task type",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "in-progress", "done"],
        message: "Invalid housekeeping task status",
      },
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    scheduledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

housekeepingSchema.index({ room: 1 });
housekeepingSchema.index({ assignedTo: 1 });
housekeepingSchema.index({ status: 1 });
housekeepingSchema.index({ scheduledAt: 1 });

const Housekeeping = mongoose.model("HousekeepingTask", housekeepingSchema);

export default Housekeeping;
