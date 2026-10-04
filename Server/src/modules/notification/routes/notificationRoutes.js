import express from "express";

import {
  createNotification,
  getNotifications,
  getUnreadCount,
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

// Everything below is scoped to req.user._id inside the repository, so a signed
// in user can always read and dismiss their own notifications regardless of
// the role permission matrix. Keep these above "/get/:id".

router.get("/get", getNotifications);

router.get("/unread-count", getUnreadCount);

router.get("/get/:id", getNotificationById);

router.put("/update/:id/read", markNotificationAsRead);

router.put("/read-all", markAllNotificationsAsRead);

router.delete("/delete/:id", auditLog, deleteNotification);

export default router;