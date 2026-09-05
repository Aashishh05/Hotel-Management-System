import express from "express";

import {
  createNotification,
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controller/notificationController.js";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/create",
  checkPermission("notifications", "create"),
  auditLog,
  createNotification,
);

router.get("/get", checkPermission("notifications", "read"), getNotifications);

router.get(
  "/get/:id",
  checkPermission("notifications", "read"),
  getNotificationById,
);

router.put(
  "/update/:id/read",
  checkPermission("notifications", "update"),
  markNotificationAsRead,
);

router.put(
  "/read-all",
  checkPermission("notifications", "update"),
  markAllNotificationsAsRead,
);

router.delete(
  "/delete/:id",
  checkPermission("notifications", "delete"),
  auditLog,
  deleteNotification,
);

export default router;
