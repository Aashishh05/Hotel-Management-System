import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getAvailableMenuItems,
  getMenuItemById,
  getMenuItemsByCategory,
  updateMenuItem,
} from "../controller/menuController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("menu", "create"),
  auditLog,
  createMenuItem,
);

router.get(
  "/get",
  protect,
  checkPermission("menu", "read"),
  auditLog,
  getAllMenuItems,
);

router.get(
  "/get/available",
  protect,
  checkPermission("menu", "read"),
  auditLog,
  getAvailableMenuItems,
);

router.get(
  "/get/category/:category",
  protect,
  checkPermission("menu", "read"),
  auditLog,
  getMenuItemsByCategory,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("menu", "read"),
  auditLog,
  getMenuItemById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("menu", "update"),
  auditLog,
  updateMenuItem,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("menu", "delete"),
  auditLog,
  deleteMenuItem,
);

export default router;
