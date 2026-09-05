import express from "express";

import {
  getAuditLogs,
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

router.get(
  "/:id",
  protect,
  checkPermission("audit-logs", "read"),
  auditLog,
  getAuditLogById,
);

export default router;
