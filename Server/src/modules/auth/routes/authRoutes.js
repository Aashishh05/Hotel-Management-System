import express from "express";
import {
  register,
  login,
  logout,
  getMe,
} from "../controller/authController.js";
import { validate } from "../../../middleware/validateMiddleware.js";
import { body } from "express-validator";
import protect from "../../../middleware/authMiddleware.js";
import { loginRateLimiter } from "../../../middleware/rateLimiter.js";

const router = express.Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["buyer", "seller"])
    .withMessage("Role must be buyer or seller"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginRateLimiter, loginValidation, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
