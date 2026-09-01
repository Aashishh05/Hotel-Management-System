import mongoose from "mongoose";


const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      maxlength: [100, "Action cannot exceed 100 characters"],
    },

    module: {
      type: String,
      trim: true,
      maxlength: [100, "Module cannot exceed 100 characters"],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    ipAddress: {
      type: String,
      trim: true,
      maxlength: [100, "IP address cannot exceed 100 characters"],
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },

    status: {
      type: String,
      enum: {
        values: ["success", "failed"],
        message: "Status must be success or failed",
      },
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;