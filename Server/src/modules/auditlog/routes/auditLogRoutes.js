import express from "express";

import {
  getAuditLogs,
  getActivityStats,
  getAuditLogById,
} from "../controller/auditLogController.js";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  checkPermission("audit-logs", "read"),
  auditLog,
  getAuditLogs,
);

// Keep this above "/:id" so "stats" is not treated as an id.
router.get(
  "/stats",
  protect,
  checkPermission("audit-logs", "read"),
  getActivityStats,
);

router.get(
  "/:id",
  protect,
  checkPermission("audit-logs", "read"),
  auditLog,
  getAuditLogById,
);

export default router;
