import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createBilling,
  deleteBilling,
  getAllBillings,
  getBillingById,
  getBillingByBooking,
  getBillingsByGuest,
  getBillingsByStatus,
  updateBilling,
} from "../controller/billingController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("billing", "create"),
  auditLog,
  createBilling,
);

router.get(
  "/get",
  protect,
  checkPermission("billing", "read"),
  auditLog,
  getAllBillings,
);

router.get(
  "/get/booking/:bookingId",
  protect,
  checkPermission("billing", "read"),
  auditLog,
  getBillingByBooking,
);

router.get(
  "/get/guest/:guestId",
  protect,
  checkPermission("billing", "read"),
  auditLog,
  getBillingsByGuest,
);

router.get(
  "/get/status/:status",
  protect,
  checkPermission("billing", "read"),
  auditLog,
  getBillingsByStatus,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("billing", "read"),
  auditLog,
  getBillingById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("billing", "update"),
  auditLog,
  updateBilling,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("billing", "delete"),
  auditLog,
  deleteBilling,
);

export default router;
