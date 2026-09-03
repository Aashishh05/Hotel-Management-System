import express from "express";
import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  getRoomsByStatus,
  updateRoom,
} from "../controller/roomController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("rooms", "create"),
  auditLog,
  createRoom,
);

router.get(
  "/get",
  protect,
  checkPermission("rooms", "read"),
  auditLog,
  getAllRooms,
);

router.get(
  "/get/available",
  protect,
  checkPermission("rooms", "read"),
  auditLog,
  getAvailableRooms,
);

router.get(
  "/get/:status",
  protect,
  checkPermission("rooms", "read"),
  auditLog,
  getRoomsByStatus,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("rooms", "read"),
  auditLog,
  getRoomById,
);

router.put(
  "update/:id",
  protect,
  checkPermission("rooms", "update"),
  auditLog,
  updateRoom,
);

router.delete(
  "delete/:id",
  protect,
  checkPermission("rooms", "delete"),
  auditLog,
  deleteRoom,
);

export default router;
