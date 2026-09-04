import express from "express";

import protect from "../../../middleware/authMiddleware.js";
import checkPermission from "../../../middleware/permissionMiddleware.js";
import auditLog from "../../../middleware/auditLogMiddleware.js";

import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTasksByRoom,
  getTasksByEmployee,
  getTasksByStatus,
  updateTask,
  startTask,
  completeTask,
} from "../controller/houseKeepingController.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  checkPermission("housekeeping", "create"),
  auditLog,
  createTask,
);

router.get(
  "/get",
  protect,
  checkPermission("housekeeping", "read"),
  auditLog,
  getAllTasks,
);

router.get(
  "/get/room/:roomId",
  protect,
  checkPermission("housekeeping", "read"),
  auditLog,
  getTasksByRoom,
);

router.get(
  "/get/employee/:employeeId",
  protect,
  checkPermission("housekeeping", "read"),
  auditLog,
  getTasksByEmployee,
);

router.get(
  "/get/status/:status",
  protect,
  checkPermission("housekeeping", "read"),
  auditLog,
  getTasksByStatus,
);

router.get(
  "/get/:id",
  protect,
  checkPermission("housekeeping", "read"),
  auditLog,
  getTaskById,
);

router.put(
  "/update/:id",
  protect,
  checkPermission("housekeeping", "update"),
  auditLog,
  updateTask,
);

router.put(
  "/start/:id",
  protect,
  checkPermission("housekeeping", "update"),
  auditLog,
  startTask,
);

router.put(
  "/complete/:id",
  protect,
  checkPermission("housekeeping", "update"),
  auditLog,
  completeTask,
);

router.delete(
  "/delete/:id",
  protect,
  checkPermission("housekeeping", "delete"),
  auditLog,
  deleteTask,
);

export default router;
