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

export default router;
