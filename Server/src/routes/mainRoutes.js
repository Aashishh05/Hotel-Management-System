import express from "express";
import authRoutes from "../modules/auth/routes/authRoutes.js";
import roleRoutes from "../modules/role/routes/roleRoutes.js";
import permissionRoutes from "../modules/permission/routes/permissionRoutes.js";
import userRoutes from "../modules/user/routes/userRoutes.js";
import roomRoutes from "../modules/room/routes/roomRoutes.js";
import guestRoutes from "../modules/guest/routes/guestRoutes.js";
import bookingRoutes from "../modules/booking/routes/bookingRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/role", roleRoutes);
router.use("/permission", permissionRoutes);
router.use("/user", userRoutes);
router.use("/room", roomRoutes);
router.use("/guest", guestRoutes);
router.use("/bookings", bookingRoutes);

export default router;
