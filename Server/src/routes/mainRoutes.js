import authRoutes from "../modules/auth/routes/authRoutes.js";  
import express from "express";

const router = express.Router();

router.use("/auth", authRoutes);

export default router;