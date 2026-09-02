import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
      minlength: [2, "Menu item name must be at least 2 characters"],
      maxlength: [100, "Menu item name cannot exceed 100 characters"],
    },

    category: {
      type: String,
      required: [true, "Menu item category is required"],
      enum: {
        values: ["starter", "main", "dessert", "drinks", "snacks"],
        message: "Invalid menu item category",
      },
      lowercase: true,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Menu item price is required"],
      min: [0, "Price cannot be negative"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
