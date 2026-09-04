import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getOrdersByGuest,
  getOrdersByRoom,
  getOrdersByStatus,
  updateOrder,
} from "../controller/resturantOrderController.js"

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("restaurant", "create"),
  auditLog,
  createOrder,
);

router.get(
  "/get",
  protect,
  checkPermission("restaurant", "read"),
  auditLog,
  getAllOrders,
);

router.get(
  "/get/guest/:guestId",
  protect,
  checkPermission("restaurant", "read"),
  auditLog,
  getOrdersByGuest,
);

router.get(
  "/get/room/:roomId",
  protect,
  checkPermission("restaurant", "read"),
  auditLog,
  getOrdersByRoom,
);

router.get(
  "/get/status/:status",
  protect,
  checkPermission("restaurant", "read"),
  auditLog,
  getOrdersByStatus,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("restaurant", "read"),
  auditLog,
  getOrderById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("restaurant", "update"),
  auditLog,
  updateOrder,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("restaurant", "delete"),
  auditLog,
  deleteOrder,
);

export default router;
