import express from "express";
import authRoutes from "../modules/auth/routes/authRoutes.js";  
import roleRoutes from "../modules/role/routes/roleRoutes.js"

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/role",roleRoutes);

export default router;