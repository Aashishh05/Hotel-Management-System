import express from "express";

import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";
import protect from "../../../middleware/authMiddleware.js";
import {
  createPermission,
  deletePermissionByRole,
  getAllPermissions,
  getMyPermissions,
  getPermissionById,
  getPermissionByRole,
  updatePermissionByRole,
} from "../controller/permissionController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("permissions", "create"),
  auditLog,
  createPermission,
);
router.get(
  "/get",
  protect,
  checkPermission("permissions", "read"),
  auditLog,
  getAllPermissions,
);
router.get("/my-permissions", protect, auditLog, getMyPermissions);
router.get(
  "/get/:id",
  protect,
  checkPermission("permissions", "read"),
  auditLog,
  getPermissionById,
);
router.get(
  "/get/:roleId",
  protect,
  checkPermission("permissions", "read"),
  auditLog,
  getPermissionByRole,
);
router.put(
  "/update/:roleId",
  protect,
  checkPermission("permissions", "update"),
  auditLog,
  updatePermissionByRole,
);
router.delete(
  "/delete/:roleId",
  protect,
  checkPermission("permissions", "delete"),
  auditLog,
  deletePermissionByRole,
);
export default router;
