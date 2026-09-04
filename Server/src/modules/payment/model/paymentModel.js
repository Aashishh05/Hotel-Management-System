import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    billing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
      required: [true, "Billing is required"],
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Payment amount cannot be negative"],
    },

    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["cash", "card", "bank-transfer", "online"],
        message: "Payment method must be cash, card, bank-transfer, or online",
      },
    },

    transactionId: {
      type: String,
      trim: true,
      maxlength: [100, "Transaction ID cannot exceed 100 characters"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message:
          "Payment status must be pending, completed, failed, or refunded",
      },
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ billing: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
