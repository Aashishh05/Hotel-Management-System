import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createRequest,
  deleteRequest,
  getAllRequests,
  getRequestById,
  getRequestsByRoom,
  getRequestsByEmployee,
  getRequestsByStatus,
  getRequestsByPriority,
  updateRequest,
} from "../controller/maintenanceController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("maintenance", "create"),
  auditLog,
  createRequest,
);

router.get(
  "/get",
  protect,
  checkPermission("maintenance", "read"),
  auditLog,
  getAllRequests,
);

router.get(
  "/get/room/:roomId",
  protect,
  checkPermission("maintenance", "read"),
  auditLog,
  getRequestsByRoom,
);

router.get(
  "/get/employee/:employeeId",
  protect,
  checkPermission("maintenance", "read"),
  auditLog,
  getRequestsByEmployee,
);

router.get(
  "/get/status/:status",
  protect,
  checkPermission("maintenance", "read"),
  auditLog,
  getRequestsByStatus,
);

router.get(
  "/get/priority/:priority",
  protect,
  checkPermission("maintenance", "read"),
  auditLog,
  getRequestsByPriority,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("maintenance", "read"),
  auditLog,
  getRequestById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("maintenance", "update"),
  auditLog,
  updateRequest,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("maintenance", "delete"),
  auditLog,
  deleteRequest,
);

export default router;
