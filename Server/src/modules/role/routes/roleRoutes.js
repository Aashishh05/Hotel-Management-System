import express from "express";
import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";
import {
  createRole,
  deleteRole,
  getAllRoles,
  updateRole,
} from "../controller/roleController.js";
import { getRoleById } from "../services/roleService.js";
const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("roles", "create"),
  auditLog,
  createRole,
);

router.get(
  "/get",
  protect,
  checkPermission("roles", "read"),
  auditLog,
  getAllRoles,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("roles", "read"),
  auditLog,
  getRoleById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("roles", "update"),
  auditLog,
  updateRole,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("roles", "delete", auditLog, deleteRole),
);

export default router;
