import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";

import {
  createGuest,
  deleteGuest,
  getAllGuests,
  getGuestById,
  updateGuest,
} from "../controller/guestController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("guests", "create"),
  auditLog,
  createGuest,
);

router.get(
  "/get",
  protect,
  checkPermission("guests", "read"),
  auditLog,
  getAllGuests,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("guests", "read"),
  auditLog,
  getGuestById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("guests", "update"),
  auditLog,
  updateGuest,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("guests", "delete"),
  auditLog,
  deleteGuest,
);

export default router;
