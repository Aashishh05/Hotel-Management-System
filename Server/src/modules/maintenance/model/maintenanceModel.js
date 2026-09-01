import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    issue: {
      type: String,
      required: [true, "Maintenance issue is required"],
      trim: true,
      minlength: [3, "Issue must be at least 3 characters"],
      maxlength: [1000, "Issue cannot exceed 1000 characters"],
    },

    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Invalid maintenance priority",
      },
      default: "medium",
    },

    status: {
      type: String,
      enum: {
        values: ["open", "in-progress", "resolved", "closed"],
        message: "Invalid maintenance status",
      },
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

maintenanceSchema.index({ room: 1 });
maintenanceSchema.index({ assignedTo: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ createdAt: -1 });

const MaintenanceRequest = mongoose.model(
  "MaintenanceRequest",
  maintenanceSchema,
);

export default MaintenanceRequest;
