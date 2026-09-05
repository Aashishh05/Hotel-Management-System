import express from "express";
import authRoutes from "../modules/auth/routes/authRoutes.js";
import roleRoutes from "../modules/role/routes/roleRoutes.js";
import permissionRoutes from "../modules/permission/routes/permissionRoutes.js";
import userRoutes from "../modules/user/routes/userRoutes.js";
import roomRoutes from "../modules/room/routes/roomRoutes.js";
import guestRoutes from "../modules/guest/routes/guestRoutes.js";
import bookingRoutes from "../modules/booking/routes/bookingRoutes.js";
import houseKeepingRoutes from "../modules/houseKeeping/routes/houseKeepingRoutes.js";
import maintenanceRoutes from "../modules/maintenance/routes/maintenanceRoutes.js";
import billingRoutes from "../modules/billing/routes/billingRoutes.js";
import paymentRoutes from "../modules/payment/routes/paymentRoutes.js";
import resturantOrderRoutes from "../modules/resturantOrder/routes/resturantOrderRoutes.js";
import menuRoutes from "../modules/menu/routes/menuRoutes.js";
import reportRoutes from "../modules/reports/routes/reportRoutes.js";
import auditLogRoutes from "../modules/auditlog/routes/auditLogRoutes.js";
import notificationRoutes from "../modules/notification/routes/notificationRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/role", roleRoutes);
router.use("/permission", permissionRoutes);
router.use("/user", userRoutes);
router.use("/room", roomRoutes);
router.use("/guest", guestRoutes);
router.use("/bookings", bookingRoutes);
router.use("/houseKeeping", houseKeepingRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/billing", billingRoutes);
router.use("/payment", paymentRoutes);
router.use("/resturant", resturantOrderRoutes);
router.use("/menu", menuRoutes);
router.use("/reports", reportRoutes);
router.use("/auditLog", auditLogRoutes);
router.use("/notification", notificationRoutes);

export default router;
