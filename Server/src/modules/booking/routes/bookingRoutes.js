import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  getBookingsByGuest,
  getBookingsByRoom,
  getBookingsByStatus,
  updateBooking,
  checkInBooking,
  checkOutBooking,
} from "../controller/bookingController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("bookings", "create"),
  auditLog,
  createBooking,
);

router.get(
  "/get",
  protect,
  checkPermission("bookings", "read"),
  auditLog,
  getAllBookings,
);

router.get(
  "/get/guest/:guestId",
  protect,
  checkPermission("bookings", "read"),
  auditLog,
  getBookingsByGuest,
);

router.get(
  "/get/room/:roomId",
  protect,
  checkPermission("bookings", "read"),
  auditLog,
  getBookingsByRoom,
);

router.get(
  "/get/status/:status",
  protect,
  checkPermission("bookings", "read"),
  auditLog,
  getBookingsByStatus,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("bookings", "read"),
  auditLog,
  getBookingById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("bookings", "update"),
  auditLog,
  updateBooking,
);

router.patch(
  "/check-in/:id",
  protect,
  checkPermission("bookings", "update"),
  auditLog,
  checkInBooking,
);

router.patch(
  "/check-out/:id",
  protect,
  checkPermission("bookings", "update"),
  auditLog,
  checkOutBooking,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("bookings", "delete"),
  auditLog,
  deleteBooking,
);

export default router;
