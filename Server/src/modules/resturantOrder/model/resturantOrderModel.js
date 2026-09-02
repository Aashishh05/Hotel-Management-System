import mongoose from "mongoose";

const restaurantOrderSchema = new mongoose.Schema(
  {
    guest: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: [true, "Guest is required"],
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },

    items: {
      type: [
        {
          menuItem: {
            type: Schema.Types.ObjectId,
            ref: "MenuItem",
            required: [true, "Menu item is required"],
          },

          quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
          },

          price: {
            type: Number,
            required: [true, "Item price is required"],
            min: [0, "Price cannot be negative"],
          },
        },
      ],
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "preparing", "served", "cancelled"],
        message: "Invalid restaurant order status",
      },
      default: "pending",
    },

    takenBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order taken by user is required"],
    },
  },
  {
    timestamps: true,
  }
);

const RestaurantOrder = mongoose.model(
  "RestaurantOrder",
  restaurantOrderSchema
);

export default RestaurantOrder;