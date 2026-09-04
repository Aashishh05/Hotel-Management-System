import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createPayment,
  deletePayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByBilling,
  getPaymentsByStatus,
  updatePayment,
} from "../controller/paymentController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("payment", "create"),
  auditLog,
  createPayment,
);

router.get(
  "/get",
  protect,
  checkPermission("payment", "read"),
  auditLog,
  getAllPayments,
);

router.get(
  "/get/billing/:billingId",
  protect,
  checkPermission("payment", "read"),
  auditLog,
  getPaymentsByBilling,
);

router.get(
  "/get/status/:status",
  protect,
  checkPermission("payment", "read"),
  auditLog,
  getPaymentsByStatus,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("payment", "read"),
  auditLog,
  getPaymentById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("payment", "update"),
  auditLog,
  updatePayment,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("payment", "delete"),
  auditLog,
  deletePayment,
);

export default router;
