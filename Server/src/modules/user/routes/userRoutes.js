import express from "express";

import protect from "../../../middleware/authMiddleware.js"
import checkPermission from "../../../middleware/permissionMiddleware.js"
import auditLog from "../../../middleware/auditLogMiddleware.js"
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUser,
} from "../controller/userController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("users", "create"),
  auditLog,
  createUser,
);

router.get(
  "/get",
  protect,
  checkPermission("users", "read"),
  auditLog,
  getAllUsers,
);

router.get(
  "/get/:roleId",
  protect,
  checkPermission("users", "read"),
  auditLog,
  getUsersByRole,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("users", "read"),
  auditLog,
  getUserById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("users", "update"),
  auditLog,
  updateUser,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("users", "delete"),
  auditLog,
  deleteUser,
);

export default router;
