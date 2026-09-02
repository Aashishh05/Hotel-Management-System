import express from "express";
import { body } from "express-validator";

import {
  register,
  login,
  logout,
  getMe,
} from "../controller/authController.js";

import { validate } from "../../../middleware/validateMiddleware.js";
import protect from "../../../middleware/authMiddleware.js";
import { loginRateLimiter } from "../../../middleware/rateLimiter.js";

const router = express.Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role").notEmpty().withMessage("Role is required"),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginRateLimiter, loginValidation, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
