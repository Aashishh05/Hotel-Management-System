import mongoose from "mongoose";

const { Schema } = mongoose;

const billingItemSchema = new Schema(
  {
    description: {
      type: String,
      required: [true, "Billing item description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    amount: {
      type: Number,
      required: [true, "Billing item amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  {
    _id: true,
  },
);

const billingSchema = new Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },

    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: [true, "Guest is required"],
    },

    items: {
      type: [billingItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: ["unpaid", "partial", "paid"],
        message: "Invalid billing status",
      },
      default: "unpaid",
    },

    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

billingSchema.pre("validate", function (next) {
  if (this.paidAmount > this.totalAmount) {
    return next(new Error("Paid amount cannot exceed total amount"));
  }

  next();
});

billingSchema.index({ booking: 1 });
billingSchema.index({ guest: 1 });
billingSchema.index({ status: 1 });

const Billing = mongoose.model("Billing", billingSchema);

export default Billing;
