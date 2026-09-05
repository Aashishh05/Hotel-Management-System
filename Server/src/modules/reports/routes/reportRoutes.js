import express from "express";


import { getDashboardReport } from "../controller/reportController.js";
import protect from "../../../middleware/authMiddleware.js"
import checkPermission from "../../../middleware/permissionMiddleware.js"
import auditLog from "../../../middleware/auditLogMiddleware.js"

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  checkPermission("reports", "read"),
  auditLog,
getDashboardReport
);

export default router;